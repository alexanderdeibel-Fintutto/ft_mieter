import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 44: Advanced Analytics & Business Intelligence System
 * Verwaltet Custom Dashboards, KPIs und Analytics
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,
            organization_id,
            dashboard_id,
            dashboard_name,
            metric_key,
            metric_name
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'create_dashboard') {
            if (!dashboard_name) {
                return Response.json({ error: 'dashboard_name required' }, { status: 400 });
            }

            const { description, widgets } = await req.json();

            const dashboard = await base44.asServiceRole.entities.CustomDashboard.create({
                organization_id,
                dashboard_name,
                description: description || '',
                widgets: widgets || [],
                created_by: user.id
            });

            return Response.json({ dashboard_created: true, dashboard_id: dashboard.id });

        } else if (action === 'get_dashboards') {
            const dashboards = await base44.asServiceRole.entities.CustomDashboard.filter({
                organization_id
            }, '-created_date', 100);

            return Response.json({ dashboards });

        } else if (action === 'get_dashboard') {
            if (!dashboard_id) {
                return Response.json({ error: 'dashboard_id required' }, { status: 400 });
            }

            const dashboards = await base44.asServiceRole.entities.CustomDashboard.filter({
                id: dashboard_id
            });

            if (!dashboards || dashboards.length === 0) {
                return Response.json({ error: 'Dashboard not found' }, { status: 404 });
            }

            return Response.json({ dashboard: dashboards[0] });

        } else if (action === 'create_kpi') {
            if (!metric_name || !metric_key) {
                return Response.json({ error: 'metric_name, metric_key required' }, { status: 400 });
            }

            const { category, target_value, unit, calculation_method } = await req.json();

            const kpi = await base44.asServiceRole.entities.KPIMetric.create({
                organization_id,
                metric_name,
                metric_key,
                category: category || 'operational',
                target_value: target_value || 0,
                unit: unit || 'count',
                calculation_method: calculation_method || 'sum'
            });

            return Response.json({ kpi_created: true, kpi_id: kpi.id });

        } else if (action === 'get_kpis') {
            const kpis = await base44.asServiceRole.entities.KPIMetric.filter({
                organization_id
            }, '-created_date', 200);

            return Response.json({ kpis });

        } else if (action === 'update_kpi_value') {
            if (!metric_key) {
                return Response.json({ error: 'metric_key required' }, { status: 400 });
            }

            const { value } = await req.json();

            const kpis = await base44.asServiceRole.entities.KPIMetric.filter({
                organization_id,
                metric_key
            });

            if (!kpis || kpis.length === 0) {
                return Response.json({ error: 'KPI not found' }, { status: 404 });
            }

            const kpi = kpis[0];
            const oldValue = kpi.current_value || 0;
            let trend = 'stable';
            if (value > oldValue) trend = 'up';
            if (value < oldValue) trend = 'down';

            await base44.asServiceRole.entities.KPIMetric.update(kpi.id, {
                current_value: value,
                trend,
                last_updated: new Date().toISOString()
            });

            return Response.json({ kpi_updated: true, trend });

        } else if (action === 'create_snapshot') {
            const { period, metrics } = await req.json();

            const snapshot = await base44.asServiceRole.entities.AnalyticsSnapshot.create({
                organization_id,
                snapshot_date: new Date().toISOString().split('T')[0],
                period: period || 'daily',
                metrics: metrics || {}
            });

            return Response.json({ snapshot_created: true, snapshot_id: snapshot.id });

        } else if (action === 'get_snapshots') {
            const { period, start_date, end_date } = await req.json();

            let query = { organization_id };
            if (period) query.period = period;

            const snapshots = await base44.asServiceRole.entities.AnalyticsSnapshot.filter(
                query,
                '-snapshot_date',
                100
            );

            return Response.json({ snapshots });

        } else if (action === 'calculate_analytics') {
            // Simuliere Analytics-Berechnung
            const [kpis, snapshots] = await Promise.all([
                base44.asServiceRole.entities.KPIMetric.filter({ organization_id }),
                base44.asServiceRole.entities.AnalyticsSnapshot.filter({ organization_id })
            ]);

            const analytics = {
                total_kpis: kpis.length,
                active_kpis: kpis.filter(k => k.is_active).length,
                kpis_on_target: kpis.filter(k => (k.current_value || 0) >= (k.target_value || 0)).length,
                avg_performance: kpis.length > 0
                    ? (kpis.reduce((sum, k) => {
                        const target = k.target_value || 1;
                        const current = k.current_value || 0;
                        return sum + (current / target);
                    }, 0) / kpis.length * 100).toFixed(1)
                    : 0,
                total_snapshots: snapshots.length,
                by_category: {}
            };

            kpis.forEach(k => {
                analytics.by_category[k.category] = (analytics.by_category[k.category] || 0) + 1;
            });

            return Response.json({ analytics });

        } else if (action === 'get_dashboard_data') {
            const [dashboards, kpis, analytics] = await Promise.all([
                base44.asServiceRole.entities.CustomDashboard.filter({ organization_id }),
                base44.asServiceRole.entities.KPIMetric.filter({ organization_id }),
                base44.functions.invoke('analyticsEngine', {
                    action: 'calculate_analytics',
                    organization_id
                })
            ]);

            const stats = {
                total_dashboards: dashboards.length,
                public_dashboards: dashboards.filter(d => d.is_public).length,
                total_kpis: kpis.length,
                active_kpis: kpis.filter(k => k.is_active).length
            };

            return Response.json({
                dashboards,
                kpis,
                analytics: analytics.data.analytics,
                stats
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Analytics engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});