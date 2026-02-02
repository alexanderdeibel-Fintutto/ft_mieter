import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 58: Advanced API Gateway & Rate Limiting System
 * Verwaltet API Gateways, Routes und Rate Limiting Policies
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

        if (action === 'create_gateway') {
            const { gateway_name, base_url, port, protocol, authentication_type } = await req.json();

            if (!gateway_name || !base_url) {
                return Response.json({ error: 'gateway_name, base_url required' }, { status: 400 });
            }

            const gateway = await base44.asServiceRole.entities.APIGateway.create({
                organization_id,
                gateway_name,
                base_url,
                port: port || 8080,
                protocol: protocol || 'https',
                authentication_type: authentication_type || 'api_key'
            });

            return Response.json({ gateway_created: true, gateway_id: gateway.id });

        } else if (action === 'get_gateways') {
            const gateways = await base44.asServiceRole.entities.APIGateway.filter({
                organization_id
            });

            return Response.json({ gateways });

        } else if (action === 'create_route') {
            const { gateway_id, route_path, route_method, backend_url, timeout_ms, cache_enabled } = await req.json();

            if (!gateway_id || !route_path || !backend_url) {
                return Response.json({ error: 'gateway_id, route_path, backend_url required' }, { status: 400 });
            }

            const route = await base44.asServiceRole.entities.GatewayRoute.create({
                organization_id,
                gateway_id,
                route_path,
                route_method: route_method || 'GET',
                backend_url,
                timeout_ms: timeout_ms || 30000,
                cache_enabled: cache_enabled || false
            });

            return Response.json({ route_created: true, route_id: route.id });

        } else if (action === 'get_routes') {
            const { gateway_id } = await req.json();

            let filter = { organization_id };
            if (gateway_id) filter.gateway_id = gateway_id;

            const routes = await base44.asServiceRole.entities.GatewayRoute.filter(filter);

            return Response.json({ routes });

        } else if (action === 'record_request') {
            const { gateway_id, route_id, success } = await req.json();

            if (!gateway_id) {
                return Response.json({ error: 'gateway_id required' }, { status: 400 });
            }

            const gateways = await base44.asServiceRole.entities.APIGateway.filter({
                organization_id,
                id: gateway_id
            });

            if (gateways.length === 0) {
                return Response.json({ error: 'Gateway not found' }, { status: 404 });
            }

            const gateway = gateways[0];
            await base44.asServiceRole.entities.APIGateway.update(gateway_id, {
                total_requests: (gateway.total_requests || 0) + 1
            });

            if (route_id) {
                const routes = await base44.asServiceRole.entities.GatewayRoute.filter({
                    organization_id,
                    id: route_id
                });

                if (routes.length > 0) {
                    const route = routes[0];
                    const updateData = {
                        request_count: (route.request_count || 0) + 1
                    };

                    if (!success) {
                        updateData.error_count = (route.error_count || 0) + 1;
                    }

                    await base44.asServiceRole.entities.GatewayRoute.update(route_id, updateData);
                }
            }

            return Response.json({ request_recorded: true });

        } else if (action === 'create_rate_limit') {
            const { gateway_id, policy_name, route_pattern, limit_type, requests_per_minute, requests_per_hour } = await req.json();

            if (!gateway_id || !policy_name || !route_pattern) {
                return Response.json({ error: 'gateway_id, policy_name, route_pattern required' }, { status: 400 });
            }

            const policy = await base44.asServiceRole.entities.RateLimitPolicy.create({
                organization_id,
                gateway_id,
                policy_name,
                route_pattern,
                limit_type: limit_type || 'per_ip',
                requests_per_minute: requests_per_minute || 0,
                requests_per_hour: requests_per_hour || 0
            });

            return Response.json({ policy_created: true, policy_id: policy.id });

        } else if (action === 'get_rate_limits') {
            const { gateway_id } = await req.json();

            let filter = { organization_id };
            if (gateway_id) filter.gateway_id = gateway_id;

            const policies = await base44.asServiceRole.entities.RateLimitPolicy.filter(filter);

            return Response.json({ policies });

        } else if (action === 'check_rate_limit') {
            const { policy_id } = await req.json();

            if (!policy_id) {
                return Response.json({ error: 'policy_id required' }, { status: 400 });
            }

            const policies = await base44.asServiceRole.entities.RateLimitPolicy.filter({
                organization_id,
                id: policy_id
            });

            if (policies.length === 0) {
                return Response.json({ error: 'Policy not found' }, { status: 404 });
            }

            const policy = policies[0];

            // Simplified rate limit check (in production, use Redis or similar)
            const allowed = true; // Placeholder

            return Response.json({ allowed, policy_name: policy.policy_name });

        } else if (action === 'record_blocked_request') {
            const { gateway_id, policy_id } = await req.json();

            if (gateway_id) {
                const gateways = await base44.asServiceRole.entities.APIGateway.filter({
                    organization_id,
                    id: gateway_id
                });

                if (gateways.length > 0) {
                    const gateway = gateways[0];
                    await base44.asServiceRole.entities.APIGateway.update(gateway_id, {
                        blocked_requests: (gateway.blocked_requests || 0) + 1
                    });
                }
            }

            if (policy_id) {
                const policies = await base44.asServiceRole.entities.RateLimitPolicy.filter({
                    organization_id,
                    id: policy_id
                });

                if (policies.length > 0) {
                    const policy = policies[0];
                    await base44.asServiceRole.entities.RateLimitPolicy.update(policy_id, {
                        blocked_count: (policy.blocked_count || 0) + 1
                    });
                }
            }

            return Response.json({ blocked_recorded: true });

        } else if (action === 'get_dashboard_data') {
            const [gateways, routes, policies] = await Promise.all([
                base44.asServiceRole.entities.APIGateway.filter({ organization_id }),
                base44.asServiceRole.entities.GatewayRoute.filter({ organization_id }),
                base44.asServiceRole.entities.RateLimitPolicy.filter({ organization_id })
            ]);

            const routesByMethod = {};
            routes.forEach(r => {
                routesByMethod[r.route_method] = (routesByMethod[r.route_method] || 0) + 1;
            });

            const policiesByType = {};
            policies.forEach(p => {
                policiesByType[p.limit_type] = (policiesByType[p.limit_type] || 0) + 1;
            });

            const stats = {
                total_gateways: gateways.length,
                active_gateways: gateways.filter(g => g.is_active).length,
                total_routes: routes.length,
                active_routes: routes.filter(r => r.is_active).length,
                total_policies: policies.length,
                active_policies: policies.filter(p => p.is_active).length,
                total_requests: gateways.reduce((sum, g) => sum + (g.total_requests || 0), 0),
                blocked_requests: gateways.reduce((sum, g) => sum + (g.blocked_requests || 0), 0),
                total_errors: routes.reduce((sum, r) => sum + (r.error_count || 0), 0)
            };

            return Response.json({
                gateways,
                routes,
                policies,
                stats,
                routes_by_method: routesByMethod,
                policies_by_type: policiesByType
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('API Gateway engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});