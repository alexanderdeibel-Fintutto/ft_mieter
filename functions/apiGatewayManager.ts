import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 39: Advanced API Gateway & Rate Limiting System
 * Verwaltet API-Routen, Rate Limiting und Usage-Tracking
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,                    // 'create_route', 'get_routes', 'update_route', 'delete_route', 'create_rate_limit', 'get_rate_limits', 'check_rate_limit', 'get_usage_logs', 'get_analytics', 'proxy_request'
            organization_id,
            route_id,
            route_name,
            path,
            method,
            target_url,
            rule_id,
            rule_name,
            max_requests,
            time_window_seconds,
            identifier
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'create_route') {
            // Create API route
            if (!route_name || !path || !method) {
                return Response.json({ error: 'route_name, path, method required' }, { status: 400 });
            }

            const route = await base44.asServiceRole.entities.APIGatewayRoute.create({
                organization_id: organization_id,
                route_name: route_name,
                path: path,
                method: method,
                target_url: target_url || null
            });

            return Response.json({
                route_created: true,
                route_id: route.id
            });

        } else if (action === 'get_routes') {
            // Get all routes
            const routes = await base44.asServiceRole.entities.APIGatewayRoute.filter({
                organization_id: organization_id
            }, '-created_date', 200);

            const stats = {
                total: routes.length,
                active: routes.filter(r => r.is_active).length,
                total_requests: routes.reduce((sum, r) => sum + (r.request_count || 0), 0),
                total_errors: routes.reduce((sum, r) => sum + (r.error_count || 0), 0)
            };

            return Response.json({
                routes: routes,
                stats: stats
            });

        } else if (action === 'update_route') {
            // Update route
            if (!route_id) {
                return Response.json({ error: 'route_id required' }, { status: 400 });
            }

            const updateData = {};
            if (route_name !== undefined) updateData.route_name = route_name;
            if (target_url !== undefined) updateData.target_url = target_url;
            if (path !== undefined) updateData.path = path;

            await base44.asServiceRole.entities.APIGatewayRoute.update(route_id, updateData);

            return Response.json({
                route_updated: true
            });

        } else if (action === 'delete_route') {
            // Delete route
            if (!route_id) {
                return Response.json({ error: 'route_id required' }, { status: 400 });
            }

            await base44.asServiceRole.entities.APIGatewayRoute.delete(route_id);

            return Response.json({
                route_deleted: true
            });

        } else if (action === 'create_rate_limit') {
            // Create rate limit rule
            if (!rule_name || !max_requests || !time_window_seconds) {
                return Response.json({ error: 'rule_name, max_requests, time_window_seconds required' }, { status: 400 });
            }

            const rule = await base44.asServiceRole.entities.RateLimitRule.create({
                organization_id: organization_id,
                rule_name: rule_name,
                max_requests: max_requests,
                time_window_seconds: time_window_seconds
            });

            return Response.json({
                rule_created: true,
                rule_id: rule.id
            });

        } else if (action === 'get_rate_limits') {
            // Get all rate limit rules
            const rules = await base44.asServiceRole.entities.RateLimitRule.filter({
                organization_id: organization_id
            }, '-priority', 100);

            return Response.json({
                rules: rules
            });

        } else if (action === 'check_rate_limit') {
            // Check if request is within rate limit
            if (!identifier) {
                return Response.json({ error: 'identifier required' }, { status: 400 });
            }

            // Get active rate limit rules
            const rules = await base44.asServiceRole.entities.RateLimitRule.filter({
                organization_id: organization_id,
                is_active: true
            }, '-priority');

            if (rules.length === 0) {
                return Response.json({ allowed: true });
            }

            // Check each rule
            for (const rule of rules) {
                // Check blacklist
                if (rule.blacklist && rule.blacklist.includes(identifier)) {
                    return Response.json({
                        allowed: false,
                        reason: 'Blacklisted',
                        rule_name: rule.rule_name
                    });
                }

                // Check whitelist
                if (rule.whitelist && rule.whitelist.length > 0 && rule.whitelist.includes(identifier)) {
                    continue; // Skip rate limit for whitelisted
                }

                // Get recent requests for identifier
                const timeWindow = new Date(Date.now() - (rule.time_window_seconds * 1000));
                const recentLogs = await base44.asServiceRole.entities.APIUsageLog.filter({
                    organization_id: organization_id,
                    user_id: identifier
                }, '-timestamp', 1000);

                const recentCount = recentLogs.filter(log => 
                    new Date(log.timestamp) >= timeWindow
                ).length;

                if (recentCount >= rule.max_requests) {
                    return Response.json({
                        allowed: false,
                        reason: 'Rate limit exceeded',
                        rule_name: rule.rule_name,
                        max_requests: rule.max_requests,
                        time_window: rule.time_window_seconds,
                        current_count: recentCount
                    });
                }
            }

            return Response.json({ allowed: true });

        } else if (action === 'get_usage_logs') {
            // Get API usage logs
            const logs = await base44.asServiceRole.entities.APIUsageLog.filter({
                organization_id: organization_id
            }, '-timestamp', 500);

            return Response.json({
                logs: logs,
                total: logs.length
            });

        } else if (action === 'get_analytics') {
            // Get API analytics
            const logs = await base44.asServiceRole.entities.APIUsageLog.filter({
                organization_id: organization_id
            }, '-timestamp', 1000);

            const routes = await base44.asServiceRole.entities.APIGatewayRoute.filter({
                organization_id: organization_id
            });

            // Calculate analytics
            const totalRequests = logs.length;
            const successfulRequests = logs.filter(l => l.status_code >= 200 && l.status_code < 300).length;
            const errorRequests = logs.filter(l => l.status_code >= 400).length;
            const avgResponseTime = logs.length > 0 
                ? logs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / logs.length 
                : 0;
            const rateLimitedRequests = logs.filter(l => l.rate_limited).length;

            // Group by path
            const byPath = {};
            logs.forEach(log => {
                if (!byPath[log.path]) {
                    byPath[log.path] = {
                        count: 0,
                        errors: 0,
                        avg_response_time: 0
                    };
                }
                byPath[log.path].count++;
                if (log.status_code >= 400) byPath[log.path].errors++;
            });

            // Group by status code
            const byStatusCode = {};
            logs.forEach(log => {
                const code = log.status_code;
                byStatusCode[code] = (byStatusCode[code] || 0) + 1;
            });

            return Response.json({
                summary: {
                    total_requests: totalRequests,
                    successful_requests: successfulRequests,
                    error_requests: errorRequests,
                    success_rate: totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(2) : 0,
                    avg_response_time_ms: avgResponseTime.toFixed(0),
                    rate_limited_requests: rateLimitedRequests,
                    total_routes: routes.length
                },
                by_path: byPath,
                by_status_code: byStatusCode,
                recent_logs: logs.slice(0, 20)
            });

        } else if (action === 'proxy_request') {
            // Proxy request through gateway
            if (!route_id) {
                return Response.json({ error: 'route_id required' }, { status: 400 });
            }

            const routes = await base44.asServiceRole.entities.APIGatewayRoute.filter({
                id: route_id
            });

            if (!routes || routes.length === 0) {
                return Response.json({ error: 'Route not found' }, { status: 404 });
            }

            const route = routes[0];

            if (!route.is_active) {
                return Response.json({ error: 'Route is inactive' }, { status: 503 });
            }

            // Check rate limit if rule attached
            if (route.rate_limit_rule_id) {
                const rateLimitCheck = await base44.functions.invoke('apiGatewayManager', {
                    action: 'check_rate_limit',
                    organization_id: organization_id,
                    identifier: user.id
                });

                if (!rateLimitCheck.data.allowed) {
                    // Log rate limited request
                    await base44.asServiceRole.entities.APIUsageLog.create({
                        organization_id: organization_id,
                        route_id: route_id,
                        user_id: user.id,
                        method: route.method,
                        path: route.path,
                        status_code: 429,
                        timestamp: new Date().toISOString(),
                        rate_limited: true
                    });

                    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
                }
            }

            // Make proxied request
            const startTime = Date.now();
            let statusCode = 200;
            let errorMessage = null;

            try {
                if (route.target_url) {
                    const response = await fetch(route.target_url, {
                        method: route.method,
                        signal: AbortSignal.timeout(route.timeout_ms)
                    });
                    statusCode = response.status;
                }
            } catch (error) {
                statusCode = 500;
                errorMessage = error.message;
            }

            const responseTime = Date.now() - startTime;

            // Log request
            await base44.asServiceRole.entities.APIUsageLog.create({
                organization_id: organization_id,
                route_id: route_id,
                user_id: user.id,
                method: route.method,
                path: route.path,
                status_code: statusCode,
                response_time_ms: responseTime,
                timestamp: new Date().toISOString(),
                error_message: errorMessage
            });

            // Update route statistics
            await base44.asServiceRole.entities.APIGatewayRoute.update(route_id, {
                request_count: (route.request_count || 0) + 1,
                error_count: statusCode >= 400 ? (route.error_count || 0) + 1 : route.error_count
            });

            return Response.json({
                proxied: true,
                status_code: statusCode,
                response_time_ms: responseTime
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('API Gateway error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});