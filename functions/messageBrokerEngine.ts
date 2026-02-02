import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 59: Advanced Message Broker & Queue Management System
 * Verwaltet Message Brokers, Topics/Queues und Messages
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, organization_id } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'create_broker') {
            const { broker_name, broker_type, host, port, protocol } = await req.json();

            if (!broker_name || !broker_type) {
                return Response.json({ error: 'broker_name, broker_type required' }, { status: 400 });
            }

            const broker = await base44.asServiceRole.entities.MessageBroker.create({
                organization_id,
                broker_name,
                broker_type,
                host: host || '',
                port: port || 5672,
                protocol: protocol || 'amqp'
            });

            return Response.json({ broker_created: true, broker_id: broker.id });

        } else if (action === 'get_brokers') {
            const brokers = await base44.asServiceRole.entities.MessageBroker.filter({
                organization_id
            });

            return Response.json({ brokers });

        } else if (action === 'create_topic') {
            const { broker_id, topic_name, topic_type, durable, max_length, message_ttl_seconds } = await req.json();

            if (!broker_id || !topic_name) {
                return Response.json({ error: 'broker_id, topic_name required' }, { status: 400 });
            }

            const topic = await base44.asServiceRole.entities.MessageTopic.create({
                organization_id,
                broker_id,
                topic_name,
                topic_type: topic_type || 'queue',
                durable: durable !== undefined ? durable : true,
                max_length: max_length || 0,
                message_ttl_seconds: message_ttl_seconds || 0
            });

            return Response.json({ topic_created: true, topic_id: topic.id });

        } else if (action === 'get_topics') {
            const { broker_id } = await req.json();

            let filter = { organization_id };
            if (broker_id) filter.broker_id = broker_id;

            const topics = await base44.asServiceRole.entities.MessageTopic.filter(filter);

            return Response.json({ topics });

        } else if (action === 'publish_message') {
            const { broker_id, topic_id, payload, headers, routing_key, priority } = await req.json();

            if (!broker_id || !topic_id || !payload) {
                return Response.json({ error: 'broker_id, topic_id, payload required' }, { status: 400 });
            }

            const message_id = crypto.randomUUID();
            const message = await base44.asServiceRole.entities.BrokerMessage.create({
                organization_id,
                broker_id,
                topic_id,
                message_id,
                payload,
                headers: headers || {},
                routing_key: routing_key || '',
                priority: priority || 0,
                published_at: new Date().toISOString()
            });

            // Update broker stats
            const brokers = await base44.asServiceRole.entities.MessageBroker.filter({
                organization_id,
                id: broker_id
            });

            if (brokers.length > 0) {
                const broker = brokers[0];
                await base44.asServiceRole.entities.MessageBroker.update(broker_id, {
                    total_messages: (broker.total_messages || 0) + 1
                });
            }

            // Update topic stats
            const topics = await base44.asServiceRole.entities.MessageTopic.filter({
                organization_id,
                id: topic_id
            });

            if (topics.length > 0) {
                const topic = topics[0];
                await base44.asServiceRole.entities.MessageTopic.update(topic_id, {
                    message_count: (topic.message_count || 0) + 1,
                    messages_published: (topic.messages_published || 0) + 1
                });
            }

            return Response.json({ message_published: true, message_id: message.id });

        } else if (action === 'consume_message') {
            const { topic_id } = await req.json();

            if (!topic_id) {
                return Response.json({ error: 'topic_id required' }, { status: 400 });
            }

            const messages = await base44.asServiceRole.entities.BrokerMessage.filter({
                organization_id,
                topic_id,
                status: 'pending'
            }, '-priority', 1);

            if (messages.length === 0) {
                return Response.json({ message: null });
            }

            const message = messages[0];
            await base44.asServiceRole.entities.BrokerMessage.update(message.id, {
                status: 'processing',
                consumed_at: new Date().toISOString()
            });

            return Response.json({ message });

        } else if (action === 'ack_message') {
            const { message_id, success } = await req.json();

            if (!message_id || success === undefined) {
                return Response.json({ error: 'message_id, success required' }, { status: 400 });
            }

            const messages = await base44.asServiceRole.entities.BrokerMessage.filter({
                organization_id,
                id: message_id
            });

            if (messages.length === 0) {
                return Response.json({ error: 'Message not found' }, { status: 404 });
            }

            const message = messages[0];
            const updateData = {};

            if (success) {
                updateData.status = 'completed';

                // Update topic consumed count
                const topics = await base44.asServiceRole.entities.MessageTopic.filter({
                    organization_id,
                    id: message.topic_id
                });

                if (topics.length > 0) {
                    const topic = topics[0];
                    await base44.asServiceRole.entities.MessageTopic.update(message.topic_id, {
                        message_count: Math.max(0, (topic.message_count || 0) - 1),
                        messages_consumed: (topic.messages_consumed || 0) + 1
                    });
                }
            } else {
                updateData.retry_count = (message.retry_count || 0) + 1;

                if (updateData.retry_count >= message.max_retries) {
                    updateData.status = 'dead_letter';

                    // Update broker failed count
                    const brokers = await base44.asServiceRole.entities.MessageBroker.filter({
                        organization_id,
                        id: message.broker_id
                    });

                    if (brokers.length > 0) {
                        const broker = brokers[0];
                        await base44.asServiceRole.entities.MessageBroker.update(message.broker_id, {
                            failed_messages: (broker.failed_messages || 0) + 1
                        });
                    }
                } else {
                    updateData.status = 'pending';
                }
            }

            await base44.asServiceRole.entities.BrokerMessage.update(message_id, updateData);

            return Response.json({ message_acked: true, new_status: updateData.status });

        } else if (action === 'get_messages') {
            const { topic_id, status } = await req.json();

            let filter = { organization_id };
            if (topic_id) filter.topic_id = topic_id;
            if (status) filter.status = status;

            const messages = await base44.asServiceRole.entities.BrokerMessage.filter(filter, '-published_at', 50);

            return Response.json({ messages });

        } else if (action === 'get_dashboard_data') {
            const [brokers, topics, messages] = await Promise.all([
                base44.asServiceRole.entities.MessageBroker.filter({ organization_id }),
                base44.asServiceRole.entities.MessageTopic.filter({ organization_id }),
                base44.asServiceRole.entities.BrokerMessage.filter({ organization_id }, '-published_at', 100)
            ]);

            const topicsByType = {};
            topics.forEach(t => {
                topicsByType[t.topic_type] = (topicsByType[t.topic_type] || 0) + 1;
            });

            const messagesByStatus = {};
            messages.forEach(m => {
                messagesByStatus[m.status] = (messagesByStatus[m.status] || 0) + 1;
            });

            const stats = {
                total_brokers: brokers.length,
                active_brokers: brokers.filter(b => b.is_active).length,
                total_topics: topics.length,
                total_messages: brokers.reduce((sum, b) => sum + (b.total_messages || 0), 0),
                failed_messages: brokers.reduce((sum, b) => sum + (b.failed_messages || 0), 0),
                pending_messages: messages.filter(m => m.status === 'pending').length,
                processing_messages: messages.filter(m => m.status === 'processing').length,
                dead_letter_messages: messages.filter(m => m.status === 'dead_letter').length
            };

            return Response.json({
                brokers,
                topics,
                messages: messages.slice(0, 20),
                stats,
                topics_by_type: topicsByType,
                messages_by_status: messagesByStatus
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Message broker engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});