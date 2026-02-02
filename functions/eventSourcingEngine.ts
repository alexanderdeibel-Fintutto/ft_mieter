import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 95: Advanced Event Sourcing & CQRS Pattern System
 * Verwaltet Event Store, Commands und Queries
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

        if (action === 'append_event') {
            const { aggregate_id, aggregate_type, event_type, event_data, correlation_id } = await req.json();

            if (!aggregate_id || !aggregate_type || !event_type) {
                return Response.json({ error: 'aggregate_id, aggregate_type, event_type required' }, { status: 400 });
            }

            const events = await base44.asServiceRole.entities.EventStore.filter({
                organization_id,
                aggregate_id
            }, '-sequence_number', 1);

            const nextSequence = events.length > 0 ? (events[0].sequence_number || 0) + 1 : 1;
            const event_id = crypto.randomUUID();

            const event = await base44.asServiceRole.entities.EventStore.create({
                organization_id,
                event_id,
                aggregate_id,
                aggregate_type,
                event_type,
                sequence_number: nextSequence,
                event_data: event_data || {},
                user_id: user.id,
                correlation_id: correlation_id || crypto.randomUUID(),
                timestamp: new Date().toISOString()
            });

            return Response.json({ event_appended: true, event_id: event.id, sequence_number: nextSequence });

        } else if (action === 'create_command') {
            const { command_type, aggregate_id, aggregate_type, command_data, correlation_id } = await req.json();

            if (!command_type || !aggregate_id || !aggregate_type) {
                return Response.json({ error: 'command_type, aggregate_id, aggregate_type required' }, { status: 400 });
            }

            const command_id = crypto.randomUUID();

            const command = await base44.asServiceRole.entities.Command.create({
                organization_id,
                command_id,
                command_type,
                aggregate_id,
                aggregate_type,
                command_data: command_data || {},
                status: 'pending',
                user_id: user.id,
                correlation_id: correlation_id || crypto.randomUUID(),
                created_at: new Date().toISOString()
            });

            return Response.json({ command_created: true, command_id: command.id });

        } else if (action === 'process_command') {
            const { command_id } = await req.json();

            if (!command_id) {
                return Response.json({ error: 'command_id required' }, { status: 400 });
            }

            const commands = await base44.asServiceRole.entities.Command.filter({
                organization_id,
                id: command_id
            });

            if (commands.length === 0) {
                return Response.json({ error: 'Command not found' }, { status: 404 });
            }

            const command = commands[0];
            const startTime = Date.now();

            await base44.asServiceRole.entities.Command.update(command_id, {
                status: 'processing'
            });

            const event_id = crypto.randomUUID();
            await base44.asServiceRole.entities.EventStore.create({
                organization_id,
                event_id,
                aggregate_id: command.aggregate_id,
                aggregate_type: command.aggregate_type,
                event_type: `${command.command_type}_executed`,
                sequence_number: 1,
                event_data: command.command_data,
                user_id: command.user_id,
                correlation_id: command.correlation_id,
                timestamp: new Date().toISOString()
            });

            const processingTime = Date.now() - startTime;

            await base44.asServiceRole.entities.Command.update(command_id, {
                status: 'succeeded',
                processed_at: new Date().toISOString(),
                processing_time_ms: processingTime,
                events_generated: [event_id]
            });

            return Response.json({ command_processed: true });

        } else if (action === 'create_query') {
            const { query_type, query_name, query_params, read_model_name } = await req.json();

            if (!query_type || !query_name) {
                return Response.json({ error: 'query_type, query_name required' }, { status: 400 });
            }

            const query_id = crypto.randomUUID();

            const query = await base44.asServiceRole.entities.Query.create({
                organization_id,
                query_id,
                query_type,
                query_name,
                query_params: query_params || {},
                read_model_name: read_model_name || '',
                status: 'pending',
                user_id: user.id,
                created_at: new Date().toISOString()
            });

            return Response.json({ query_created: true, query_id: query.id });

        } else if (action === 'execute_query') {
            const { query_id } = await req.json();

            if (!query_id) {
                return Response.json({ error: 'query_id required' }, { status: 400 });
            }

            const queries = await base44.asServiceRole.entities.Query.filter({
                organization_id,
                id: query_id
            });

            if (queries.length === 0) {
                return Response.json({ error: 'Query not found' }, { status: 404 });
            }

            const startTime = Date.now();

            await base44.asServiceRole.entities.Query.update(query_id, {
                status: 'executing'
            });

            const executionTime = Date.now() - startTime;

            await base44.asServiceRole.entities.Query.update(query_id, {
                status: 'completed',
                execution_time_ms: executionTime,
                result_count: 0,
                completed_at: new Date().toISOString()
            });

            return Response.json({ query_executed: true });

        } else if (action === 'create_snapshot') {
            const { aggregate_id, aggregate_type, snapshot_data } = await req.json();

            if (!aggregate_id || !aggregate_type || !snapshot_data) {
                return Response.json({ error: 'aggregate_id, aggregate_type, snapshot_data required' }, { status: 400 });
            }

            const events = await base44.asServiceRole.entities.EventStore.filter({
                organization_id,
                aggregate_id
            }, '-sequence_number', 1);

            const lastSequence = events.length > 0 ? (events[0].sequence_number || 0) : 0;
            const event_id = crypto.randomUUID();

            await base44.asServiceRole.entities.EventStore.create({
                organization_id,
                event_id,
                aggregate_id,
                aggregate_type,
                event_type: 'snapshot',
                sequence_number: lastSequence + 1,
                is_snapshot: true,
                snapshot_data,
                timestamp: new Date().toISOString()
            });

            return Response.json({ snapshot_created: true });

        } else if (action === 'get_dashboard_data') {
            const [events, commands, queries] = await Promise.all([
                base44.asServiceRole.entities.EventStore.filter({ organization_id }, '-timestamp', 100),
                base44.asServiceRole.entities.Command.filter({ organization_id }, '-created_at', 50),
                base44.asServiceRole.entities.Query.filter({ organization_id }, '-created_at', 50)
            ]);

            const eventStats = {
                total_events: events.length,
                snapshots: events.filter(e => e.is_snapshot).length,
                processed_events: events.filter(e => e.processed).length,
                unprocessed_events: events.filter(e => !e.processed).length,
                by_aggregate_type: {},
                by_event_type: {}
            };

            events.forEach(e => {
                eventStats.by_aggregate_type[e.aggregate_type] = (eventStats.by_aggregate_type[e.aggregate_type] || 0) + 1;
                eventStats.by_event_type[e.event_type] = (eventStats.by_event_type[e.event_type] || 0) + 1;
            });

            const commandStats = {
                total_commands: commands.length,
                pending: commands.filter(c => c.status === 'pending').length,
                processing: commands.filter(c => c.status === 'processing').length,
                succeeded: commands.filter(c => c.status === 'succeeded').length,
                failed: commands.filter(c => c.status === 'failed').length,
                avg_processing_time_ms: commands.length > 0
                    ? Math.round(commands.reduce((sum, c) => sum + (c.processing_time_ms || 0), 0) / commands.length)
                    : 0
            };

            const queryStats = {
                total_queries: queries.length,
                pending: queries.filter(q => q.status === 'pending').length,
                executing: queries.filter(q => q.status === 'executing').length,
                completed: queries.filter(q => q.status === 'completed').length,
                failed: queries.filter(q => q.status === 'failed').length,
                cache_hits: queries.filter(q => q.cache_hit).length,
                avg_execution_time_ms: queries.length > 0
                    ? Math.round(queries.reduce((sum, q) => sum + (q.execution_time_ms || 0), 0) / queries.length)
                    : 0
            };

            return Response.json({
                events: events.slice(0, 40),
                commands: commands.slice(0, 30),
                queries: queries.slice(0, 30),
                event_stats: eventStats,
                command_stats: commandStats,
                query_stats: queryStats
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Event sourcing engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});