import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 23: Monitoring & Performance Analytics System
 * Überwacht API-Performance, Fehlerquoten und triggert Alerts
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,                    // 'record_metric', 'get_metrics', 'check_thresholds', 'get_alerts', 'acknowledge_alert', 'analyze_performance'
            organization_id,
            metric_type,
            endpoint,
            value,
            unit,
            time_range_hours = 24,
            alert_id,
            endpoint_filter,
            metric_filter
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'record_metric') {
            // Record performance metric
            if (!metric_type || value === undefined || !unit) {
                return Response.json({ error: 'metric_type, value, unit required' }, { status: 400 });
            }

            // Determine threshold status
            const thresholds = getThresholds(metric_type);
            let thresholdStatus = 'normal';
            
            if (thresholds.warning && value > thresholds.warning) {
                thresholdStatus = 'warning';
            }
            if (thresholds.critical && value > thresholds.critical) {
                thresholdStatus = 'critical';
            }

            const metric = await base44.asServiceRole.entities.PerformanceMetric.create({
                organization_id: organization_id,
                metric_type: metric_type,
                endpoint: endpoint || 'system',
                value: value,
                unit: unit,
                threshold_status: thresholdStatus,
                threshold_warning: thresholds.warning,
                threshold_critical: thresholds.critical,
                timestamp: new Date().toISOString(),
                metadata: {}
            });

            // Check if threshold exceeded and create alert
            if (thresholdStatus === 'critical') {
                await createAlert(base44, organization_id, metric_type, value, thresholds.critical, endpoint);
            }

            return Response.json({
                recorded: true,
                metric: metric,
                threshold_status: thresholdStatus
            });

        } else if (action === 'get_metrics') {
            // Get metrics for time range
            const hoursAgo = new Date();
            hoursAgo.setHours(hoursAgo.getHours() - time_range_hours);

            let filter = {
                organization_id: organization_id,
                timestamp: { $gte: hoursAgo.toISOString() }
            };

            if (metric_filter) {
                filter.metric_type = metric_filter;
            }
            if (endpoint_filter) {
                filter.endpoint = endpoint_filter;
            }

            const metrics = await base44.asServiceRole.entities.PerformanceMetric.filter(
                filter,
                '-timestamp',
                500
            );

            // Aggregate metrics
            const aggregated = aggregateMetrics(metrics, metric_type);

            return Response.json({
                metrics: metrics,
                aggregated: aggregated,
                time_range_hours: time_range_hours
            });

        } else if (action === 'check_thresholds') {
            // Check current metrics against thresholds
            const oneHourAgo = new Date();
            oneHourAgo.setHours(oneHourAgo.getHours() - 1);

            const recentMetrics = await base44.asServiceRole.entities.PerformanceMetric.filter({
                organization_id: organization_id,
                timestamp: { $gte: oneHourAgo.toISOString() }
            }, '-timestamp', 100);

            const violations = [];
            const metricGroups = {};

            // Group by metric type
            recentMetrics.forEach(m => {
                if (!metricGroups[m.metric_type]) {
                    metricGroups[m.metric_type] = [];
                }
                metricGroups[m.metric_type].push(m);
            });

            // Check thresholds
            for (const [metricType, values] of Object.entries(metricGroups)) {
                const thresholds = getThresholds(metricType);
                const avgValue = values.reduce((sum, m) => sum + m.value, 0) / values.length;

                if (thresholds.critical && avgValue > thresholds.critical) {
                    violations.push({
                        metric: metricType,
                        average: avgValue,
                        threshold: thresholds.critical,
                        severity: 'critical'
                    });
                } else if (thresholds.warning && avgValue > thresholds.warning) {
                    violations.push({
                        metric: metricType,
                        average: avgValue,
                        threshold: thresholds.warning,
                        severity: 'warning'
                    });
                }
            }

            return Response.json({
                violations: violations,
                total_metrics_checked: recentMetrics.length
            });

        } else if (action === 'get_alerts') {
            // Get system alerts
            const alerts = await base44.asServiceRole.entities.SystemAlert.filter({
                organization_id: organization_id
            }, '-triggered_at', 100);

            const summary = {
                total: alerts.length,
                active: alerts.filter(a => a.status === 'active').length,
                critical: alerts.filter(a => a.severity === 'critical').length,
                warning: alerts.filter(a => a.severity === 'warning').length
            };

            return Response.json({
                alerts: alerts,
                summary: summary
            });

        } else if (action === 'acknowledge_alert') {
            // Acknowledge alert
            if (!alert_id || user.role !== 'admin') {
                return Response.json({ error: 'alert_id required and admin access needed' }, { status: 400 });
            }

            await base44.asServiceRole.entities.SystemAlert.update(alert_id, {
                status: 'acknowledged',
                acknowledged_at: new Date().toISOString(),
                acknowledged_by: user.id
            });

            return Response.json({ acknowledged: true });

        } else if (action === 'analyze_performance') {
            // Analyze performance over time
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const metrics = await base44.asServiceRole.entities.PerformanceMetric.filter({
                organization_id: organization_id,
                timestamp: { $gte: sevenDaysAgo.toISOString() }
            }, '-timestamp', 1000);

            // Analyze trends
            const analysis = {
                time_period: '7 days',
                total_metrics: metrics.length,
                by_type: {},
                trends: {},
                slowest_endpoints: [],
                highest_error_rates: []
            };

            // Group by metric type
            const grouped = {};
            metrics.forEach(m => {
                if (!grouped[m.metric_type]) {
                    grouped[m.metric_type] = [];
                }
                grouped[m.metric_type].push(m);
            });

            // Calculate stats per metric type
            for (const [type, values] of Object.entries(grouped)) {
                const sorted = values.sort((a, b) => a.value - b.value);
                analysis.by_type[type] = {
                    count: values.length,
                    min: sorted[0].value,
                    max: sorted[sorted.length - 1].value,
                    avg: values.reduce((sum, m) => sum + m.value, 0) / values.length,
                    p95: sorted[Math.floor(sorted.length * 0.95)].value,
                    p99: sorted[Math.floor(sorted.length * 0.99)].value
                };
            }

            // Find slowest endpoints
            const latencyMetrics = metrics.filter(m => m.metric_type === 'api_latency');
            const endpointStats = {};
            latencyMetrics.forEach(m => {
                if (!endpointStats[m.endpoint]) {
                    endpointStats[m.endpoint] = [];
                }
                endpointStats[m.endpoint].push(m.value);
            });

            for (const [endpoint, values] of Object.entries(endpointStats)) {
                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                analysis.slowest_endpoints.push({
                    endpoint: endpoint,
                    avg_latency: avg,
                    p95: values.sort((a, b) => a - b)[Math.floor(values.length * 0.95)]
                });
            }

            analysis.slowest_endpoints.sort((a, b) => b.avg_latency - a.avg_latency).slice(0, 5);

            return Response.json(analysis);
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Monitoring error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function getThresholds(metricType) {
    const thresholds = {
        api_latency: { warning: 500, critical: 2000 },           // ms
        database_query_time: { warning: 200, critical: 1000 },   // ms
        memory_usage: { warning: 70, critical: 90 },             // %
        cpu_usage: { warning: 70, critical: 90 },                // %
        error_rate: { warning: 1, critical: 5 },                 // %
        cache_hit_rate: { warning: 70, critical: 50 },           // %
        function_execution_time: { warning: 5000, critical: 30000 } // ms
    };
    return thresholds[metricType] || { warning: null, critical: null };
}

async function createAlert(base44, organizationId, metricType, value, threshold, endpoint) {
    const alertMessages = {
        api_latency: `API latency at ${endpoint} exceeded critical threshold: ${value}ms > ${threshold}ms`,
        database_query_time: `Database query time exceeded critical threshold: ${value}ms > ${threshold}ms`,
        error_rate: `Error rate exceeded critical threshold: ${value}% > ${threshold}%`,
        memory_usage: `Memory usage exceeded critical threshold: ${value}% > ${threshold}%`,
        cpu_usage: `CPU usage exceeded critical threshold: ${value}% > ${threshold}%`,
        cache_hit_rate: `Cache hit rate dropped below critical threshold: ${value}% < ${threshold}%`
    };

    await base44.asServiceRole.entities.SystemAlert.create({
        organization_id: organizationId,
        alert_type: mapMetricTypeToAlertType(metricType),
        severity: 'critical',
        metric_name: metricType,
        current_value: value,
        threshold: threshold,
        message: alertMessages[metricType] || `Metric ${metricType} exceeded threshold`,
        affected_endpoint: endpoint,
        triggered_at: new Date().toISOString()
    });
}

function mapMetricTypeToAlertType(metricType) {
    const mapping = {
        api_latency: 'high_latency',
        error_rate: 'high_error_rate',
        cache_hit_rate: 'low_cache_hit_rate',
        memory_usage: 'high_memory_usage',
        cpu_usage: 'high_cpu_usage',
        database_query_time: 'database_slow'
    };
    return mapping[metricType] || 'threshold_exceeded';
}

function aggregateMetrics(metrics, metricType) {
    if (metrics.length === 0) return null;

    const filtered = metricType ? metrics.filter(m => m.metric_type === metricType) : metrics;
    const values = filtered.map(m => m.value).sort((a, b) => a - b);

    return {
        count: values.length,
        min: values[0],
        max: values[values.length - 1],
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        p50: values[Math.floor(values.length * 0.50)],
        p95: values[Math.floor(values.length * 0.95)],
        p99: values[Math.floor(values.length * 0.99)]
    };
}