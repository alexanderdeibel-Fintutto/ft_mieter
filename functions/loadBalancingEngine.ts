import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 55: Advanced Load Balancing & Auto-Scaling System
 * Verwaltet Load Balancer, Backend-Instanzen und Auto-Scaling Policies
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

        if (action === 'create_load_balancer') {
            const { balancer_name, balancer_type, listen_port, health_check_path } = await req.json();

            if (!balancer_name || !balancer_type || !listen_port) {
                return Response.json({ error: 'balancer_name, balancer_type, listen_port required' }, { status: 400 });
            }

            const balancer = await base44.asServiceRole.entities.LoadBalancer.create({
                organization_id,
                balancer_name,
                balancer_type,
                listen_port,
                health_check_path: health_check_path || '/health'
            });

            return Response.json({ balancer_created: true, balancer_id: balancer.id });

        } else if (action === 'get_load_balancers') {
            const balancers = await base44.asServiceRole.entities.LoadBalancer.filter({
                organization_id
            }, '-created_date');

            return Response.json({ balancers });

        } else if (action === 'add_backend_instance') {
            const { load_balancer_id, instance_name, host, port, weight } = await req.json();

            if (!load_balancer_id || !instance_name || !host || !port) {
                return Response.json({ error: 'load_balancer_id, instance_name, host, port required' }, { status: 400 });
            }

            const instance = await base44.asServiceRole.entities.BackendInstance.create({
                organization_id,
                load_balancer_id,
                instance_name,
                host,
                port,
                weight: weight || 1
            });

            return Response.json({ instance_added: true, instance_id: instance.id });

        } else if (action === 'get_instances') {
            const { load_balancer_id } = await req.json();

            let filter = { organization_id };
            if (load_balancer_id) filter.load_balancer_id = load_balancer_id;

            const instances = await base44.asServiceRole.entities.BackendInstance.filter(filter);

            return Response.json({ instances });

        } else if (action === 'update_instance_health') {
            const { instance_id, health_status, response_time_ms } = await req.json();

            if (!instance_id || !health_status) {
                return Response.json({ error: 'instance_id, health_status required' }, { status: 400 });
            }

            const updateData = {
                health_status,
                last_health_check: new Date().toISOString()
            };

            if (response_time_ms !== undefined) {
                updateData.response_time_ms = response_time_ms;
            }

            await base44.asServiceRole.entities.BackendInstance.update(instance_id, updateData);

            return Response.json({ health_updated: true });

        } else if (action === 'record_request') {
            const { load_balancer_id, instance_id, success } = await req.json();

            if (!load_balancer_id || !instance_id) {
                return Response.json({ error: 'load_balancer_id, instance_id required' }, { status: 400 });
            }

            // Update load balancer stats
            const balancers = await base44.asServiceRole.entities.LoadBalancer.filter({
                organization_id,
                id: load_balancer_id
            });

            if (balancers.length > 0) {
                const lb = balancers[0];
                await base44.asServiceRole.entities.LoadBalancer.update(load_balancer_id, {
                    total_requests: (lb.total_requests || 0) + 1,
                    failed_requests: success ? lb.failed_requests : (lb.failed_requests || 0) + 1
                });
            }

            // Update instance stats
            const instances = await base44.asServiceRole.entities.BackendInstance.filter({
                organization_id,
                id: instance_id
            });

            if (instances.length > 0) {
                const inst = instances[0];
                await base44.asServiceRole.entities.BackendInstance.update(instance_id, {
                    total_requests: (inst.total_requests || 0) + 1,
                    failed_requests: success ? inst.failed_requests : (inst.failed_requests || 0) + 1
                });
            }

            return Response.json({ request_recorded: true });

        } else if (action === 'create_autoscaling_policy') {
            const { policy_name, load_balancer_id, metric_type, scale_up_threshold, scale_down_threshold, min_instances, max_instances } = await req.json();

            if (!policy_name || !load_balancer_id || !metric_type || scale_up_threshold === undefined || scale_down_threshold === undefined) {
                return Response.json({ error: 'policy_name, load_balancer_id, metric_type, scale_up_threshold, scale_down_threshold required' }, { status: 400 });
            }

            const policy = await base44.asServiceRole.entities.AutoScalingPolicy.create({
                organization_id,
                policy_name,
                load_balancer_id,
                metric_type,
                scale_up_threshold,
                scale_down_threshold,
                min_instances: min_instances || 1,
                max_instances: max_instances || 10
            });

            return Response.json({ policy_created: true, policy_id: policy.id });

        } else if (action === 'get_scaling_policies') {
            const { load_balancer_id } = await req.json();

            let filter = { organization_id };
            if (load_balancer_id) filter.load_balancer_id = load_balancer_id;

            const policies = await base44.asServiceRole.entities.AutoScalingPolicy.filter(filter);

            return Response.json({ policies });

        } else if (action === 'evaluate_scaling') {
            const { policy_id, current_value } = await req.json();

            if (!policy_id || current_value === undefined) {
                return Response.json({ error: 'policy_id, current_value required' }, { status: 400 });
            }

            const policies = await base44.asServiceRole.entities.AutoScalingPolicy.filter({
                organization_id,
                id: policy_id
            });

            if (policies.length === 0) {
                return Response.json({ error: 'Policy not found' }, { status: 404 });
            }

            const policy = policies[0];

            if (!policy.is_active) {
                return Response.json({ scaling_needed: false, reason: 'Policy inactive' });
            }

            // Check cooldown
            if (policy.last_scale_action) {
                const lastAction = new Date(policy.last_scale_action);
                const now = new Date();
                const secondsSince = (now - lastAction) / 1000;

                if (secondsSince < policy.cooldown_seconds) {
                    return Response.json({ 
                        scaling_needed: false, 
                        reason: `Cooldown period (${Math.round(policy.cooldown_seconds - secondsSince)}s remaining)` 
                    });
                }
            }

            // Get current instances
            const instances = await base44.asServiceRole.entities.BackendInstance.filter({
                organization_id,
                load_balancer_id: policy.load_balancer_id
            });

            const currentCount = instances.filter(i => i.health_status === 'healthy').length;

            let scalingAction = null;

            if (current_value > policy.scale_up_threshold && currentCount < policy.max_instances) {
                scalingAction = 'scale_up';
                await base44.asServiceRole.entities.AutoScalingPolicy.update(policy_id, {
                    last_scale_action: new Date().toISOString(),
                    scale_up_count: (policy.scale_up_count || 0) + 1
                });
            } else if (current_value < policy.scale_down_threshold && currentCount > policy.min_instances) {
                scalingAction = 'scale_down';
                await base44.asServiceRole.entities.AutoScalingPolicy.update(policy_id, {
                    last_scale_action: new Date().toISOString(),
                    scale_down_count: (policy.scale_down_count || 0) + 1
                });
            }

            return Response.json({
                scaling_needed: scalingAction !== null,
                action: scalingAction,
                current_instances: currentCount,
                current_value,
                policy
            });

        } else if (action === 'get_dashboard_data') {
            const [balancers, instances, policies] = await Promise.all([
                base44.asServiceRole.entities.LoadBalancer.filter({ organization_id }),
                base44.asServiceRole.entities.BackendInstance.filter({ organization_id }),
                base44.asServiceRole.entities.AutoScalingPolicy.filter({ organization_id })
            ]);

            const instancesByBalancer = {};
            const instancesByHealth = {};

            instances.forEach(i => {
                instancesByBalancer[i.load_balancer_id] = (instancesByBalancer[i.load_balancer_id] || 0) + 1;
                instancesByHealth[i.health_status] = (instancesByHealth[i.health_status] || 0) + 1;
            });

            const stats = {
                total_balancers: balancers.length,
                active_balancers: balancers.filter(b => b.is_active).length,
                total_instances: instances.length,
                healthy_instances: instances.filter(i => i.health_status === 'healthy').length,
                unhealthy_instances: instances.filter(i => i.health_status === 'unhealthy').length,
                total_policies: policies.length,
                active_policies: policies.filter(p => p.is_active).length,
                total_requests: balancers.reduce((sum, b) => sum + (b.total_requests || 0), 0),
                failed_requests: balancers.reduce((sum, b) => sum + (b.failed_requests || 0), 0)
            };

            return Response.json({
                balancers,
                instances,
                policies,
                stats,
                instances_by_health: instancesByHealth
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Load balancing engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});