import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 37: Advanced Monitoring & Health Check System
 * Verwaltet System Health Checks, Performance Metrics und Uptime Tracking
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,                    // 'get_system_health', 'create_health_check', 'get_health_checks', 'run_health_check', 'get_performance_metrics', 'record_metric', 'get_dashboard_data', 'get_uptime_report'
            organization_id,
            check_id,
            check_name,
            check_type,
            target_url,
            metric_name,
            metric_type,
            metric_value,
            metric_unit
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'get_system_health') {
            // Get overall system health
            const health = await base44.asServiceRole.entities.SystemHealth.filter({
                organization_id: organization_id
            }, '-last_check_at', 50);

            const stats = {
                total_components: health.length,
                healthy: health.filter(h => h.status === 'healthy').length,
                degraded: health.filter(h => h.status === 'degraded').length,
                unhealthy: health.filter(h => h.status === 'unhealthy').length,
                offline: health.filter(h => h.status === 'offline').length,
                avg_uptime: calculateAverageUptime(health),
                avg_response_time: calculateAverageResponseTime(health)
            };

            return Response.json({
                health: health,
                stats: stats
            });

        } else if (action === 'create_health_check') {
            // Create new health check
            if (!check_name || !check_type) {
                return Response.json({ error: 'check_name, check_type required' }, { status: 400 });
            }

            const check = await base44.asServiceRole.entities.HealthCheck.create({
                organization_id: organization_id,
                check_name: check_name,
                check_type: check_type,
                target_url: target_url || null
            });

            return Response.json({
                check_created: true,
                check_id: check.id
            });

        } else if (action === 'get_health_checks') {
            // Get all health checks
            const checks = await base44.asServiceRole.entities.HealthCheck.filter({
                organization_id: organization_id
            }, '-last_checked_at', 100);

            const stats = {
                total: checks.length,
                active: checks.filter(c => c.is_active).length,
                healthy: checks.filter(c => c.status === 'healthy').length,
                degraded: checks.filter(c => c.status === 'degraded').length,
                unhealthy: checks.filter(c => c.status === 'unhealthy').length
            };

            return Response.json({
                checks: checks,
                stats: stats
            });

        } else if (action === 'run_health_check') {
            // Execute a health check
            if (!check_id) {
                return Response.json({ error: 'check_id required' }, { status: 400 });
            }

            const checks = await base44.asServiceRole.entities.HealthCheck.filter({
                id: check_id
            });

            if (!checks || checks.length === 0) {
                return Response.json({ error: 'Check not found' }, { status: 404 });
            }

            const check = checks[0];
            let status = 'healthy';
            let statusCode = 200;
            let responseTime = 0;
            let error = null;

            // Simulate health check
            if (check.check_type === 'http' && check.target_url) {
                try {
                    const start = Date.now();
                    const response = await fetch(check.target_url, {
                        signal: AbortSignal.timeout(check.timeout_seconds * 1000)
                    });
                    responseTime = Date.now() - start;
                    statusCode = response.status;

                    if (statusCode !== check.expected_status_code) {
                        status = 'unhealthy';
                        error = `Expected ${check.expected_status_code}, got ${statusCode}`;
                    }

                    // Check response time threshold
                    if (responseTime > (check.timeout_seconds * 1000 * 0.8)) {
                        status = 'degraded';
                    }
                } catch (e) {
                    status = 'unhealthy';
                    error = e.message;
                    responseTime = check.timeout_seconds * 1000;
                }
            }

            // Update check
            const consecutiveFailures = status === 'unhealthy' ? (check.consecutive_failures || 0) + 1 : 0;

            await base44.asServiceRole.entities.HealthCheck.update(check_id, {
                status: status,
                last_status_code: statusCode,
                last_response_time_ms: responseTime,
                last_error_message: error || null,
                consecutive_failures: consecutiveFailures,
                last_checked_at: new Date().toISOString()
            });

            // Record metric
            if (responseTime > 0) {
                await base44.asServiceRole.entities.PerformanceMetric.create({
                    organization_id: organization_id,
                    metric_name: `${check.check_name}_response_time`,
                    metric_type: 'response_time',
                    component_name: check.check_name,
                    value: responseTime,
                    unit: 'ms',
                    timestamp: new Date().toISOString()
                });
            }

            return Response.json({
                check_executed: true,
                status: status,
                response_time_ms: responseTime,
                error: error
            });

        } else if (action === 'get_performance_metrics') {
            // Get performance metrics
            const metrics = await base44.asServiceRole.entities.PerformanceMetric.filter({
                organization_id: organization_id
            }, '-timestamp', 500);

            // Group by metric type
            const byType = {};
            metrics.forEach(m => {
                if (!byType[m.metric_type]) {
                    byType[m.metric_type] = [];
                }
                byType[m.metric_type].push(m);
            });

            // Calculate averages
            const averages = {};
            Object.entries(byType).forEach(([type, values]) => {
                const avg = values.reduce((sum, v) => sum + v.value, 0) / values.length;
                averages[type] = avg.toFixed(2);
            });

            return Response.json({
                metrics: metrics.slice(0, 100),
                by_type: byType,
                averages: averages,
                total: metrics.length
            });

        } else if (action === 'record_metric') {
            // Record a performance metric
            if (!metric_name || !metric_type || metric_value === undefined) {
                return Response.json({ error: 'metric_name, metric_type, metric_value required' }, { status: 400 });
            }

            const metric = await base44.asServiceRole.entities.PerformanceMetric.create({
                organization_id: organization_id,
                metric_name: metric_name,
                metric_type: metric_type,
                value: metric_value,
                unit: metric_unit || 'ms',
                timestamp: new Date().toISOString()
            });

            return Response.json({
                metric_recorded: true,
                metric_id: metric.id
            });

        } else if (action === 'get_dashboard_data') {
            // Get all data for monitoring dashboard
            const health = await base44.asServiceRole.entities.SystemHealth.filter({
                organization_id: organization_id
            });

            const checks = await base44.asServiceRole.entities.HealthCheck.filter({
                organization_id: organization_id
            });

            const metrics = await base44.asServiceRole.entities.PerformanceMetric.filter({
                organization_id: organization_id
            }, '-timestamp', 200);

            return Response.json({
                health: health,
                checks: checks,
                metrics: metrics,
                stats: {
                    total_components: health.length,
                    healthy: health.filter(h => h.status === 'healthy').length,
                    issues: health.filter(h => h.status !== 'healthy').length,
                    avg_uptime: calculateAverageUptime(health),
                    total_checks: checks.length,
                    checks_healthy: checks.filter(c => c.status === 'healthy').length,
                    last_check: checks.length > 0 ? checks[0].last_checked_at : null
                }
            });

        } else if (action === 'get_uptime_report') {
            // Generate uptime report
            const health = await base44.asServiceRole.entities.SystemHealth.filter({
                organization_id: organization_id
            });

            const report = {
                period: 'last_24_hours',
                generated_at: new Date().toISOString(),
                components: health.map(h => ({
                    name: h.component_name,
                    status: h.status,
                    uptime: h.uptime_percentage,
                    response_time: h.response_time_ms,
                    error_rate: h.error_rate,
                    failures: h.failure_count
                })),
                summary: {
                    avg_uptime: calculateAverageUptime(health),
                    total_components: health.length,
                    healthy_components: health.filter(h => h.status === 'healthy').length,
                    degraded_components: health.filter(h => h.status === 'degraded').length,
                    unhealthy_components: health.filter(h => h.status === 'unhealthy').length
                }
            };

            return Response.json(report);
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Health monitoring error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function calculateAverageUptime(health) {
    if (health.length === 0) return 100;
    const sum = health.reduce((acc, h) => acc + (h.uptime_percentage || 100), 0);
    return (sum / health.length).toFixed(2);
}

function calculateAverageResponseTime(health) {
    const withTime = health.filter(h => h.response_time_ms);
    if (withTime.length === 0) return 0;
    const sum = withTime.reduce((acc, h) => acc + h.response_time_ms, 0);
    return (sum / withTime.length).toFixed(0);
}