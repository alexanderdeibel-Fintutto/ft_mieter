import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 88: Advanced Circuit Breaker & Resilience Patterns System
 * Verwaltet Circuit Breaker, Resilience Policies und Recovery Strategies
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

        if (action === 'create_circuit_breaker') {
            const { breaker_name, target_service, failure_threshold, reset_timeout_seconds } = await req.json();

            if (!breaker_name || !target_service) {
                return Response.json({ error: 'breaker_name, target_service required' }, { status: 400 });
            }

            const breaker_id = crypto.randomUUID();

            const breaker = await base44.asServiceRole.entities.CircuitBreaker.create({
                organization_id,
                breaker_id,
                breaker_name,
                target_service,
                state: 'closed',
                failure_threshold: failure_threshold || 5,
                failure_count: 0,
                success_threshold: 2,
                success_count: 0,
                reset_timeout_seconds: reset_timeout_seconds || 60,
                is_active: true,
                created_at: new Date().toISOString()
            });

            return Response.json({ breaker_created: true, breaker_id: breaker.id });

        } else if (action === 'record_circuit_event') {
            const { breaker_id, is_success, error_message } = await req.json();

            if (!breaker_id) {
                return Response.json({ error: 'breaker_id required' }, { status: 400 });
            }

            const breakers = await base44.asServiceRole.entities.CircuitBreaker.filter({
                organization_id,
                id: breaker_id
            });

            if (breakers.length === 0) {
                return Response.json({ error: 'Breaker not found' }, { status: 404 });
            }

            const breaker = breakers[0];
            const updateData = {
                total_requests: (breaker.total_requests || 0) + 1
            };

            let newState = breaker.state;

            if (is_success) {
                updateData.failure_count = 0;
                updateData.success_count = (breaker.success_count || 0) + 1;

                if (breaker.state === 'half_open' && updateData.success_count >= breaker.success_threshold) {
                    newState = 'closed';
                    updateData.state = 'closed';
                    updateData.last_state_change = new Date().toISOString();
                    updateData.success_count = 0;
                }
            } else {
                updateData.failure_count = (breaker.failure_count || 0) + 1;
                updateData.success_count = 0;
                updateData.last_failure_time = new Date().toISOString();

                if (breaker.state === 'closed' && updateData.failure_count >= breaker.failure_threshold) {
                    newState = 'open';
                    updateData.state = 'open';
                    updateData.last_state_change = new Date().toISOString();
                    updateData.rejected_requests = (breaker.rejected_requests || 0) + 1;
                }

                if (breaker.state === 'half_open') {
                    newState = 'open';
                    updateData.state = 'open';
                    updateData.last_state_change = new Date().toISOString();
                }
            }

            await base44.asServiceRole.entities.CircuitBreaker.update(breaker_id, updateData);

            // Record resilience event
            const event_id = crypto.randomUUID();
            const eventType = newState === 'open' ? 'circuit_open' : 
                            newState === 'closed' ? 'circuit_closed' : 'circuit_half_open';

            await base44.asServiceRole.entities.ResilienceEvent.create({
                organization_id,
                event_id,
                event_type: eventType,
                service_name: breaker.target_service,
                breaker_id,
                status: is_success ? 'resolved' : 'triggered',
                error_message: error_message || '',
                timestamp: new Date().toISOString()
            });

            return Response.json({ event_recorded: true, breaker_state: newState });

        } else if (action === 'create_resilience_policy') {
            const { policy_name, target_service, policy_type, retry_config, timeout_config, bulkhead_config, fallback_config } = await req.json();

            if (!policy_name || !target_service || !policy_type) {
                return Response.json({ error: 'policy_name, target_service, policy_type required' }, { status: 400 });
            }

            const policy_id = crypto.randomUUID();

            const policy = await base44.asServiceRole.entities.ResiliencePolicy.create({
                organization_id,
                policy_id,
                policy_name,
                target_service,
                policy_type,
                retry_config: retry_config || {},
                timeout_config: timeout_config || {},
                bulkhead_config: bulkhead_config || {},
                fallback_config: fallback_config || {},
                is_active: true,
                created_at: new Date().toISOString()
            });

            return Response.json({ policy_created: true, policy_id: policy.id });

        } else if (action === 'trigger_resilience_event') {
            const { event_type, service_name, policy_id, error_message, recovery_action } = await req.json();

            if (!event_type || !service_name) {
                return Response.json({ error: 'event_type, service_name required' }, { status: 400 });
            }

            const event_id = crypto.randomUUID();

            const event = await base44.asServiceRole.entities.ResilienceEvent.create({
                organization_id,
                event_id,
                event_type,
                service_name,
                policy_id: policy_id || '',
                status: 'triggered',
                error_message: error_message || '',
                recovery_action: recovery_action || '',
                timestamp: new Date().toISOString()
            });

            return Response.json({ event_triggered: true, event_id: event.id });

        } else if (action === 'reset_circuit_breaker') {
            const { breaker_id } = await req.json();

            if (!breaker_id) {
                return Response.json({ error: 'breaker_id required' }, { status: 400 });
            }

            const now = new Date().toISOString();

            await base44.asServiceRole.entities.CircuitBreaker.update(breaker_id, {
                state: 'half_open',
                failure_count: 0,
                success_count: 0,
                last_state_change: now
            });

            return Response.json({ breaker_reset: true });

        } else if (action === 'get_dashboard_data') {
            const [breakers, policies, events] = await Promise.all([
                base44.asServiceRole.entities.CircuitBreaker.filter({ organization_id }, '-last_state_change', 50),
                base44.asServiceRole.entities.ResiliencePolicy.filter({ organization_id }, '-created_at', 30),
                base44.asServiceRole.entities.ResilienceEvent.filter({ organization_id }, '-timestamp', 100)
            ]);

            const breakerStats = {
                total_breakers: breakers.length,
                closed_breakers: breakers.filter(b => b.state === 'closed').length,
                open_breakers: breakers.filter(b => b.state === 'open').length,
                half_open_breakers: breakers.filter(b => b.state === 'half_open').length,
                total_requests: breakers.reduce((sum, b) => sum + (b.total_requests || 0), 0),
                total_rejected: breakers.reduce((sum, b) => sum + (b.rejected_requests || 0), 0)
            };

            if (breakerStats.total_requests > 0) {
                breakerStats.rejection_rate = ((breakerStats.total_rejected / breakerStats.total_requests) * 100).toFixed(2);
            }

            const policyStats = {
                total_policies: policies.length,
                active_policies: policies.filter(p => p.is_active).length,
                by_type: {},
                by_priority: {}
            };

            policies.forEach(p => {
                policyStats.by_type[p.policy_type] = (policyStats.by_type[p.policy_type] || 0) + 1;
                policyStats.by_priority[p.priority] = (policyStats.by_priority[p.priority] || 0) + 1;
            });

            const eventStats = {
                total_events: events.length,
                circuit_opens: events.filter(e => e.event_type === 'circuit_open').length,
                circuit_closes: events.filter(e => e.event_type === 'circuit_closed').length,
                retries: events.filter(e => e.event_type === 'retry_attempt').length,
                fallbacks: events.filter(e => e.event_type === 'fallback_triggered').length,
                timeouts: events.filter(e => e.event_type === 'timeout').length,
                by_status: {}
            };

            events.forEach(e => {
                eventStats.by_status[e.status] = (eventStats.by_status[e.status] || 0) + 1;
            });

            return Response.json({
                breakers: breakers.slice(0, 30),
                policies: policies.slice(0, 20),
                events: events.slice(0, 50),
                breaker_stats: breakerStats,
                policy_stats: policyStats,
                event_stats: eventStats
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Resilience pattern engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});