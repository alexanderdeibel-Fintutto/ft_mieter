import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 60: Advanced Streaming & Real-time Data Processing System
 * Verwaltet Data Streams, Stream Processors und Events
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

        if (action === 'create_stream') {
            const { stream_name, stream_type, source, retention_hours, partition_count } = await req.json();

            if (!stream_name || !stream_type || !source) {
                return Response.json({ error: 'stream_name, stream_type, source required' }, { status: 400 });
            }

            const stream = await base44.asServiceRole.entities.DataStream.create({
                organization_id,
                stream_name,
                stream_type,
                source,
                retention_hours: retention_hours || 24,
                partition_count: partition_count || 1
            });

            return Response.json({ stream_created: true, stream_id: stream.id });

        } else if (action === 'get_streams') {
            const streams = await base44.asServiceRole.entities.DataStream.filter({
                organization_id
            });

            return Response.json({ streams });

        } else if (action === 'create_processor') {
            const { processor_name, stream_id, processor_type, configuration, window_size_seconds } = await req.json();

            if (!processor_name || !stream_id || !processor_type) {
                return Response.json({ error: 'processor_name, stream_id, processor_type required' }, { status: 400 });
            }

            const processor = await base44.asServiceRole.entities.StreamProcessor.create({
                organization_id,
                processor_name,
                stream_id,
                processor_type,
                configuration: configuration || {},
                window_size_seconds: window_size_seconds || 0
            });

            return Response.json({ processor_created: true, processor_id: processor.id });

        } else if (action === 'get_processors') {
            const { stream_id } = await req.json();

            let filter = { organization_id };
            if (stream_id) filter.stream_id = stream_id;

            const processors = await base44.asServiceRole.entities.StreamProcessor.filter(filter);

            return Response.json({ processors });

        } else if (action === 'publish_event') {
            const { stream_id, payload, metadata, partition_key } = await req.json();

            if (!stream_id || !payload) {
                return Response.json({ error: 'stream_id, payload required' }, { status: 400 });
            }

            const event_id = crypto.randomUUID();
            const size_bytes = JSON.stringify(payload).length;

            const streams = await base44.asServiceRole.entities.DataStream.filter({
                organization_id,
                id: stream_id
            });

            if (streams.length === 0) {
                return Response.json({ error: 'Stream not found' }, { status: 404 });
            }

            const stream = streams[0];
            const sequence_number = (stream.total_events || 0) + 1;

            const event = await base44.asServiceRole.entities.StreamEvent.create({
                organization_id,
                stream_id,
                event_id,
                partition_key: partition_key || 'default',
                payload,
                metadata: metadata || {},
                timestamp: new Date().toISOString(),
                sequence_number,
                size_bytes
            });

            await base44.asServiceRole.entities.DataStream.update(stream_id, {
                total_events: sequence_number,
                bytes_received: (stream.bytes_received || 0) + size_bytes
            });

            return Response.json({ event_published: true, event_id: event.id, sequence_number });

        } else if (action === 'process_events') {
            const { processor_id, batch_size } = await req.json();

            if (!processor_id) {
                return Response.json({ error: 'processor_id required' }, { status: 400 });
            }

            const processors = await base44.asServiceRole.entities.StreamProcessor.filter({
                organization_id,
                id: processor_id
            });

            if (processors.length === 0) {
                return Response.json({ error: 'Processor not found' }, { status: 404 });
            }

            const processor = processors[0];

            const events = await base44.asServiceRole.entities.StreamEvent.filter({
                organization_id,
                stream_id: processor.stream_id,
                is_processed: false
            }, 'sequence_number', batch_size || 10);

            let processed_count = 0;
            let filtered_count = 0;

            for (const event of events) {
                // Simulate processing
                let should_process = true;

                if (processor.processor_type === 'filter') {
                    // Apply filter logic
                    should_process = true; // Placeholder
                }

                if (should_process) {
                    await base44.asServiceRole.entities.StreamEvent.update(event.id, {
                        is_processed: true
                    });
                    processed_count++;
                } else {
                    filtered_count++;
                }
            }

            await base44.asServiceRole.entities.StreamProcessor.update(processor_id, {
                events_processed: (processor.events_processed || 0) + processed_count,
                events_filtered: (processor.events_filtered || 0) + filtered_count
            });

            return Response.json({ 
                processed: true, 
                processed_count, 
                filtered_count 
            });

        } else if (action === 'get_events') {
            const { stream_id, limit } = await req.json();

            if (!stream_id) {
                return Response.json({ error: 'stream_id required' }, { status: 400 });
            }

            const events = await base44.asServiceRole.entities.StreamEvent.filter({
                organization_id,
                stream_id
            }, '-sequence_number', limit || 20);

            return Response.json({ events });

        } else if (action === 'get_dashboard_data') {
            const [streams, processors, events] = await Promise.all([
                base44.asServiceRole.entities.DataStream.filter({ organization_id }),
                base44.asServiceRole.entities.StreamProcessor.filter({ organization_id }),
                base44.asServiceRole.entities.StreamEvent.filter({ organization_id }, '-timestamp', 50)
            ]);

            const streamsByType = {};
            streams.forEach(s => {
                streamsByType[s.stream_type] = (streamsByType[s.stream_type] || 0) + 1;
            });

            const processorsByType = {};
            processors.forEach(p => {
                processorsByType[p.processor_type] = (processorsByType[p.processor_type] || 0) + 1;
            });

            const stats = {
                total_streams: streams.length,
                active_streams: streams.filter(s => s.is_active).length,
                total_processors: processors.length,
                active_processors: processors.filter(p => p.is_active).length,
                total_events: streams.reduce((sum, s) => sum + (s.total_events || 0), 0),
                total_bytes: streams.reduce((sum, s) => sum + (s.bytes_received || 0), 0),
                processed_events: processors.reduce((sum, p) => sum + (p.events_processed || 0), 0),
                filtered_events: processors.reduce((sum, p) => sum + (p.events_filtered || 0), 0)
            };

            return Response.json({
                streams,
                processors,
                events: events.slice(0, 15),
                stats,
                streams_by_type: streamsByType,
                processors_by_type: processorsByType
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Stream processing engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});