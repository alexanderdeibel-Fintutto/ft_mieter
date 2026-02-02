import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 56: Advanced Service Mesh & Traffic Management System
 * Verwaltet Service Meshes, Traffic Rules und Circuit Breakers
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

        if (action === 'create_mesh') {
            const { mesh_name, mesh_type, namespace, mtls_enabled } = await req.json();

            if (!mesh_name || !mesh_type) {
                return Response.json({ error: 'mesh_name, mesh_type required' }, { status: 400 });
            }

            const mesh = await base44.asServiceRole.entities.ServiceMesh.create({
                organization_id,
                mesh_name,
                mesh_type,
                namespace: namespace || 'default',
                mtls_enabled: mtls_enabled !== undefined ? mtls_enabled : true
            });

            return Response.json({ mesh_created: true, mesh_id: mesh.id });

        } else if (action === 'get_meshes') {
            const meshes = await base44.asServiceRole.entities.ServiceMesh.filter({
                organization_id
            });

            return Response.json({ meshes });

        } else if (action === 'create_traffic_rule') {
            const { mesh_id, rule_name, rule_type, source_service, destination_service, weight, match_conditions, action_config } = await req.json();

            if (!mesh_id || !rule_name || !rule_type) {
                return Response.json({ error: 'mesh_id, rule_name, rule_type required' }, { status: 400 });
            }

            const rule = await base44.asServiceRole.entities.TrafficRule.create({
                organization_id,
                mesh_id,
                rule_name,
                rule_type,
                source_service: source_service || '',
                destination_service: destination_service || '',
                weight: weight || 100,
                match_conditions: match_conditions || {},
                action: action_config || {}
            });

            return Response.json({ rule_created: true, rule_id: rule.id });

        } else if (action === 'get_traffic_rules') {
            const { mesh_id } = await req.json();

            let filter = { organization_id };
            if (mesh_id) filter.mesh_id = mesh_id;

            const rules = await base44.asServiceRole.entities.TrafficRule.filter(filter, 'priority');

            return Response.json({ rules });

        } else if (action === 'apply_traffic_rule') {
            const { rule_id } = await req.json();

            if (!rule_id) {
                return Response.json({ error: 'rule_id required' }, { status: 400 });
            }

            const rules = await base44.asServiceRole.entities.TrafficRule.filter({
                organization_id,
                id: rule_id
            });

            if (rules.length === 0) {
                return Response.json({ error: 'Rule not found' }, { status: 404 });
            }

            const rule = rules[0];

            await base44.asServiceRole.entities.TrafficRule.update(rule_id, {
                applied_count: (rule.applied_count || 0) + 1
            });

            return Response.json({ rule_applied: true });

        } else if (action === 'create_circuit_breaker') {
            const { mesh_id, breaker_name, service_name, failure_threshold, timeout_ms } = await req.json();

            if (!mesh_id || !breaker_name || !service_name) {
                return Response.json({ error: 'mesh_id, breaker_name, service_name required' }, { status: 400 });
            }

            const breaker = await base44.asServiceRole.entities.CircuitBreaker.create({
                organization_id,
                mesh_id,
                breaker_name,
                service_name,
                failure_threshold: failure_threshold || 5,
                timeout_ms: timeout_ms || 3000
            });

            return Response.json({ breaker_created: true, breaker_id: breaker.id });

        } else if (action === 'get_circuit_breakers') {
            const { mesh_id } = await req.json();

            let filter = { organization_id };
            if (mesh_id) filter.mesh_id = mesh_id;

            const breakers = await base44.asServiceRole.entities.CircuitBreaker.filter(filter);

            return Response.json({ breakers });

        } else if (action === 'check_circuit_breaker') {
            const { breaker_id } = await req.json();

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

            // Check if circuit is open
            if (breaker.state === 'open') {
                const now = new Date();
                const lastFailure = new Date(breaker.last_failure_at);
                const secondsSince = (now - lastFailure) / 1000;

                if (secondsSince > breaker.reset_timeout_seconds) {
                    // Try half-open
                    await base44.asServiceRole.entities.CircuitBreaker.update(breaker_id, {
                        state: 'half_open'
                    });
                    return Response.json({ allow_request: true, state: 'half_open' });
                } else {
                    await base44.asServiceRole.entities.CircuitBreaker.update(breaker_id, {
                        rejected_requests: (breaker.rejected_requests || 0) + 1
                    });
                    return Response.json({ allow_request: false, state: 'open' });
                }
            }

            return Response.json({ allow_request: true, state: breaker.state });

        } else if (action === 'record_circuit_breaker_result') {
            const { breaker_id, success } = await req.json();

            if (!breaker_id || success === undefined) {
                return Response.json({ error: 'breaker_id, success required' }, { status: 400 });
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

            if (success) {
                // Success - reset failure count
                updateData.consecutive_failures = 0;
                if (breaker.state === 'half_open') {
                    updateData.state = 'closed';
                }
            } else {
                // Failure
                updateData.failed_requests = (breaker.failed_requests || 0) + 1;
                updateData.consecutive_failures = (breaker.consecutive_failures || 0) + 1;
                updateData.last_failure_at = new Date().toISOString();

                if (updateData.consecutive_failures >= breaker.failure_threshold) {
                    updateData.state = 'open';
                }
            }

            await base44.asServiceRole.entities.CircuitBreaker.update(breaker_id, updateData);

            return Response.json({ result_recorded: true, new_state: updateData.state || breaker.state });

        } else if (action === 'get_dashboard_data') {
            const [meshes, rules, breakers] = await Promise.all([
                base44.asServiceRole.entities.ServiceMesh.filter({ organization_id }),
                base44.asServiceRole.entities.TrafficRule.filter({ organization_id }),
                base44.asServiceRole.entities.CircuitBreaker.filter({ organization_id })
            ]);

            const rulesByType = {};
            rules.forEach(r => {
                rulesByType[r.rule_type] = (rulesByType[r.rule_type] || 0) + 1;
            });

            const breakersByState = {};
            breakers.forEach(b => {
                breakersByState[b.state] = (breakersByState[b.state] || 0) + 1;
            });

            const stats = {
                total_meshes: meshes.length,
                active_meshes: meshes.filter(m => m.is_active).length,
                total_rules: rules.length,
                active_rules: rules.filter(r => r.is_active).length,
                total_breakers: breakers.length,
                open_breakers: breakers.filter(b => b.state === 'open').length,
                total_requests: meshes.reduce((sum, m) => sum + (m.total_requests || 0), 0),
                total_rejected: breakers.reduce((sum, b) => sum + (b.rejected_requests || 0), 0)
            };

            return Response.json({
                meshes,
                rules,
                breakers,
                stats,
                rules_by_type: rulesByType,
                breakers_by_state: breakersByState
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Service mesh engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});