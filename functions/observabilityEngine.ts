import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 86: Advanced Observability & Monitoring System
 * Verwaltet Health Checks, System Metrics, Alerts und Monitoring
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

        if (action === 'create_health_check') {
            const { check_name, target_service, check_type, endpoint, interval_seconds, timeout_seconds } = await req.json();

            if (!check_name || !target_service || !endpoint) {
                return Response.json({ error: 'check_name, target_service, endpoint required' }, { status: 400 });
            }

            const check_id = crypto.randomUUID();

            const check = await base44.asServiceRole.entities.HealthCheck.create({
                organization_id,
                check_id,
                check_name,
                target_service,
                check_type: check_type || 'http',
                endpoint,
                interval_seconds: interval_seconds || 30,
                timeout_seconds: timeout_seconds || 10,
                status: 'unknown',
                created_at: new Date().toISOString()
            });

            return Response.json({ check_created: true, check_id: check.id });

        } else if (action === 'update_health_check_status') {
            const { check_id, status, response_time_ms, error_message } = await req.json();

            if (!check_id || !status) {
                return Response.json({ error: 'check_id, status required' }, { status: 400 });
            }

            const checks = await base44.asServiceRole.entities.HealthCheck.filter({
                organization_id,
                id: check_id
            });

            if (checks.length === 0) {
                return Response.json({ error: 'Check not found' }, { status: 404 });
            }

            const check = checks[0];
            const updateData = {
                status,
                last_check_time: new Date().toISOString(),
                response_time_ms: response_time_ms || 0
            };

            if (status === 'healthy') {
                updateData.success_count = (check.success_count || 0) + 1;
                updateData.consecutive_failures = 0;
            } else {
                updateData.failure_count = (check.failure_count || 0) + 1;
                updateData.consecutive_failures = (check.consecutive_failures || 0) + 1;
            }

            if (error_message) {
                updateData.error_message = error_message;
            }

            if (check.status !== status) {
                updateData.last_status_change = new Date().toISOString();
            }

            const total = (updateData.success_count || 0) + (updateData.failure_count || 0);
            if (total > 0) {
                updateData.uptime_percentage = ((updateData.success_count / total) * 100).toFixed(2);
            }

            await base44.asServiceRole.entities.HealthCheck.update(check_id, updateData);

            return Response.json({ check_updated: true });

        } else if (action === 'record_metric') {
            const { metric_name, metric_category, source, current_value, unit, threshold_warning, threshold_critical } = await req.json();

            if (!metric_name || !metric_category || !source || current_value === undefined) {
                return Response.json({ error: 'metric_name, metric_category, source, current_value required' }, { status: 400 });
            }

            const metric_id = crypto.randomUUID();
            const now = new Date().toISOString();

            let status = 'normal';
            if (threshold_critical && current_value >= threshold_critical) {
                status = 'critical';
            } else if (threshold_warning && current_value >= threshold_warning) {
                status = 'warning';
            }

            const metric = await base44.asServiceRole.entities.SystemMetric.create({
                organization_id,
                metric_id,
                metric_name,
                metric_category,
                source,
                current_value,
                unit: unit || '',
                threshold_warning: threshold_warning || 0,
                threshold_critical: threshold_critical || 0,
                status,
                timestamp: now
            });

            return Response.json({ metric_created: true, metric_id: metric.id });

        } else if (action === 'create_alert_config') {
            const { alert_name, alert_type, metric_name, metric_category, threshold_value, severity, notification_channels } = await req.json();

            if (!alert_name || !alert_type || !metric_name || !metric_category) {
                return Response.json({ error: 'alert_name, alert_type, metric_name, metric_category required' }, { status: 400 });
            }

            const alert_config_id = crypto.randomUUID();

            const config = await base44.asServiceRole.entities.AlertConfiguration.create({
                organization_id,
                alert_config_id,
                alert_name,
                alert_type,
                metric_name,
                metric_category,
                condition: `value > ${threshold_value}`,
                threshold_value: threshold_value || 80,
                severity: severity || 'warning',
                notification_channels: notification_channels || [],
                created_at: new Date().toISOString()
            });

            return Response.json({ config_created: true, config_id: config.id });

        } else if (action === 'trigger_alert') {
            const { alert_config_id, metric_value, threshold_value, alert_name, severity } = await req.json();

            if (!alert_config_id || metric_value === undefined) {
                return Response.json({ error: 'alert_config_id, metric_value required' }, { status: 400 });
            }

            const alert_id = crypto.randomUUID();
            const now = new Date().toISOString();

            const alert = await base44.asServiceRole.entities.AlertInstance.create({
                organization_id,
                alert_id,
                alert_config_id,
                alert_name: alert_name || 'Alert',
                severity: severity || 'warning',
                status: 'triggered',
                metric_value,
                threshold_value: threshold_value || 0,
                triggered_at: now,
                notifications_sent: 1
            });

            return Response.json({ alert_triggered: true, alert_id: alert.id });

        } else if (action === 'acknowledge_alert') {
            const { alert_id, acknowledged_by, notes } = await req.json();

            if (!alert_id) {
                return Response.json({ error: 'alert_id required' }, { status: 400 });
            }

            const alerts = await base44.asServiceRole.entities.AlertInstance.filter({
                organization_id,
                id: alert_id
            });

            if (alerts.length === 0) {
                return Response.json({ error: 'Alert not found' }, { status: 404 });
            }

            const now = new Date().toISOString();

            const updateData = {
                status: 'acknowledged',
                acknowledged_at: now,
                acknowledged_by: acknowledged_by || user.id,
                resolution_notes: notes || ''
            };

            await base44.asServiceRole.entities.AlertInstance.update(alert_id, updateData);

            return Response.json({ alert_acknowledged: true });

        } else if (action === 'resolve_alert') {
            const { alert_id, notes } = await req.json();

            if (!alert_id) {
                return Response.json({ error: 'alert_id required' }, { status: 400 });
            }

            const alerts = await base44.asServiceRole.entities.AlertInstance.filter({
                organization_id,
                id: alert_id
            });

            if (alerts.length === 0) {
                return Response.json({ error: 'Alert not found' }, { status: 404 });
            }

            const alert = alerts[0];
            const now = new Date().toISOString();
            const triggeredDate = new Date(alert.triggered_at);
            const durationMinutes = Math.round((new Date(now) - triggeredDate) / 60000);

            const updateData = {
                status: 'resolved',
                resolved_at: now,
                resolution_notes: notes || '',
                duration_minutes: durationMinutes
            };

            await base44.asServiceRole.entities.AlertInstance.update(alert_id, updateData);

            return Response.json({ alert_resolved: true });

        } else if (action === 'get_dashboard_data') {
            const [checks, metrics, configs, alerts] = await Promise.all([
                base44.asServiceRole.entities.HealthCheck.filter({ organization_id }, '-last_check_time', 50),
                base44.asServiceRole.entities.SystemMetric.filter({ organization_id }, '-timestamp', 100),
                base44.asServiceRole.entities.AlertConfiguration.filter({ organization_id }, '-created_at', 30),
                base44.asServiceRole.entities.AlertInstance.filter({ organization_id }, '-triggered_at', 50)
            ]);

            const checkStats = {
                total_checks: checks.length,
                healthy_checks: checks.filter(c => c.status === 'healthy').length,
                degraded_checks: checks.filter(c => c.status === 'degraded').length,
                unhealthy_checks: checks.filter(c => c.status === 'unhealthy').length,
                avg_uptime: checks.length > 0
                    ? (checks.reduce((sum, c) => sum + (c.uptime_percentage || 0), 0) / checks.length).toFixed(2)
                    : 100,
                avg_response_time_ms: checks.filter(c => c.response_time_ms > 0).length > 0
                    ? (checks.filter(c => c.response_time_ms > 0).reduce((sum, c) => sum + c.response_time_ms, 0) / checks.filter(c => c.response_time_ms > 0).length).toFixed(2)
                    : 0
            };

            const metricStats = {
                total_metrics: metrics.length,
                normal_metrics: metrics.filter(m => m.status === 'normal').length,
                warning_metrics: metrics.filter(m => m.status === 'warning').length,
                critical_metrics: metrics.filter(m => m.status === 'critical').length,
                by_category: {}
            };

            metrics.forEach(m => {
                metricStats.by_category[m.metric_category] = (metricStats.by_category[m.metric_category] || 0) + 1;
            });

            const alertStats = {
                total_configs: configs.length,
                active_configs: configs.filter(c => c.is_active).length,
                total_alerts: alerts.length,
                triggered_alerts: alerts.filter(a => a.status === 'triggered').length,
                acknowledged_alerts: alerts.filter(a => a.status === 'acknowledged').length,
                resolved_alerts: alerts.filter(a => a.status === 'resolved').length,
                by_severity: {}
            };

            alerts.forEach(a => {
                alertStats.by_severity[a.severity] = (alertStats.by_severity[a.severity] || 0) + 1;
            });

            return Response.json({
                checks: checks.slice(0, 30),
                metrics: metrics.slice(0, 50),
                configs: configs.slice(0, 20),
                alerts: alerts.slice(0, 30),
                check_stats: checkStats,
                metric_stats: metricStats,
                alert_stats: alertStats
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Observability engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});