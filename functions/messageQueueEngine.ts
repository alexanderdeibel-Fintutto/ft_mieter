import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 50: Advanced Message Queue & Event Bus System
 * Verwaltet Message Queues, Queue Messages und Event Bus
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

        if (action === 'create_queue') {
            const { queue_name, queue_type, visibility_timeout } = await req.json();

            if (!queue_name || !queue_type) {
                return Response.json({ error: 'queue_name, queue_type required' }, { status: 400 });
            }

            const queue = await base44.asServiceRole.entities.MessageQueue.create({
                organization_id,
                queue_name,
                queue_type,
                visibility_timeout: visibility_timeout || 30
            });

            return Response.json({ queue_created: true, queue_id: queue.id });

        } else if (action === 'get_queues') {
            const queues = await base44.asServiceRole.entities.MessageQueue.filter({
                organization_id
            }, '-created_date', 200);

            return Response.json({ queues });

        } else if (action === 'send_message') {
            const { queue_id, message_body, priority, delay_seconds } = await req.json();

            if (!queue_id || !message_body) {
                return Response.json({ error: 'queue_id, message_body required' }, { status: 400 });
            }

            // Generate unique message ID
            const messageId = crypto.randomUUID();

            const message = await base44.asServiceRole.entities.QueueMessage.create({
                organization_id,
                queue_id,
                message_id: messageId,
                message_body,
                priority: priority || 0,
                delay_seconds: delay_seconds || 0,
                status: 'pending',
                sent_timestamp: new Date().toISOString()
            });

            // Update queue stats
            const queues = await base44.asServiceRole.entities.MessageQueue.filter({ organization_id, id: queue_id });
            if (queues.length > 0) {
                await base44.asServiceRole.entities.MessageQueue.update(queue_id, {
                    messages_in_queue: (queues[0].messages_in_queue || 0) + 1
                });
            }

            return Response.json({ message_sent: true, message_id: messageId });

        } else if (action === 'receive_message') {
            const { queue_id } = await req.json();

            if (!queue_id) {
                return Response.json({ error: 'queue_id required' }, { status: 400 });
            }

            // Get pending messages sorted by priority
            const messages = await base44.asServiceRole.entities.QueueMessage.filter({
                organization_id,
                queue_id,
                status: 'pending'
            }, '-priority', 1);

            if (!messages || messages.length === 0) {
                return Response.json({ message: null });
            }

            const message = messages[0];

            // Update message status
            await base44.asServiceRole.entities.QueueMessage.update(message.id, {
                status: 'in_flight',
                receive_count: (message.receive_count || 0) + 1,
                first_received_at: message.first_received_at || new Date().toISOString()
            });

            return Response.json({ message });

        } else if (action === 'delete_message') {
            const { message_id } = await req.json();

            if (!message_id) {
                return Response.json({ error: 'message_id required' }, { status: 400 });
            }

            const messages = await base44.asServiceRole.entities.QueueMessage.filter({
                organization_id,
                message_id
            });

            if (messages.length > 0) {
                await base44.asServiceRole.entities.QueueMessage.update(messages[0].id, {
                    status: 'processed',
                    processed_at: new Date().toISOString()
                });
            }

            return Response.json({ message_deleted: true });

        } else if (action === 'move_to_dlq') {
            const { message_id, error_message } = await req.json();

            if (!message_id) {
                return Response.json({ error: 'message_id required' }, { status: 400 });
            }

            const messages = await base44.asServiceRole.entities.QueueMessage.filter({
                organization_id,
                message_id
            });

            if (messages.length > 0) {
                await base44.asServiceRole.entities.QueueMessage.update(messages[0].id, {
                    status: 'dead_letter',
                    error_message: error_message || 'Max retries exceeded'
                });
            }

            return Response.json({ moved_to_dlq: true });

        } else if (action === 'publish_event') {
            const { event_type, source, payload, topic } = await req.json();

            if (!event_type || !source) {
                return Response.json({ error: 'event_type, source required' }, { status: 400 });
            }

            const event = await base44.asServiceRole.entities.EventBus.create({
                organization_id,
                event_type,
                source,
                payload: payload || {},
                topic: topic || 'default',
                published_at: new Date().toISOString(),
                correlation_id: crypto.randomUUID()
            });

            return Response.json({ event_published: true, event_id: event.id });

        } else if (action === 'get_events') {
            const { topic, event_type } = await req.json();

            let filter = { organization_id };
            if (topic) filter.topic = topic;
            if (event_type) filter.event_type = event_type;

            const events = await base44.asServiceRole.entities.EventBus.filter(
                filter,
                '-published_at',
                200
            );

            return Response.json({ events });

        } else if (action === 'get_dashboard_data') {
            const [queues, messages, events] = await Promise.all([
                base44.asServiceRole.entities.MessageQueue.filter({ organization_id }),
                base44.asServiceRole.entities.QueueMessage.filter({ organization_id }, '-sent_timestamp', 500),
                base44.asServiceRole.entities.EventBus.filter({ organization_id }, '-published_at', 200)
            ]);

            const messagesByStatus = {};
            const messagesByQueue = {};
            const eventsByType = {};
            
            messages.forEach(m => {
                messagesByStatus[m.status] = (messagesByStatus[m.status] || 0) + 1;
                messagesByQueue[m.queue_id] = (messagesByQueue[m.queue_id] || 0) + 1;
            });

            events.forEach(e => {
                eventsByType[e.event_type] = (eventsByType[e.event_type] || 0) + 1;
            });

            const stats = {
                total_queues: queues.length,
                active_queues: queues.filter(q => q.is_active).length,
                total_messages: messages.length,
                pending_messages: messages.filter(m => m.status === 'pending').length,
                in_flight_messages: messages.filter(m => m.status === 'in_flight').length,
                processed_messages: messages.filter(m => m.status === 'processed').length,
                dead_letter_messages: messages.filter(m => m.status === 'dead_letter').length,
                total_events: events.length,
                processed_events: events.filter(e => e.is_processed).length
            };

            return Response.json({
                queues,
                messages: messages.slice(0, 100),
                events: events.slice(0, 50),
                stats,
                messages_by_status: messagesByStatus,
                events_by_type: eventsByType
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Message queue engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});