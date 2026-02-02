import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 28: Usage Analytics & Metering System
 * Verwaltet Feature-Nutzung, Metering und Kostenberechnung
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,                    // 'record_event', 'get_metrics', 'get_usage_report', 'aggregate_usage', 'check_limits', 'get_cost_breakdown', 'get_forecasts'
            organization_id,
            feature_name,
            event_type,
            quantity = 1,
            unit,
            period = 'current_month'
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'record_event') {
            // Record meter event
            if (!feature_name || !event_type || !unit) {
                return Response.json({ error: 'feature_name, event_type, unit required' }, { status: 400 });
            }

            const costPerUnit = getCostPerUnit(feature_name);
            const cost = quantity * costPerUnit;

            const event = await base44.asServiceRole.entities.MeterEvent.create({
                organization_id: organization_id,
                feature_name: feature_name,
                event_type: event_type,
                quantity: quantity,
                unit: unit,
                cost: cost,
                user_id: user.id,
                source: 'api',
                status: 'pending',
                timestamp: new Date().toISOString()
            });

            // Update or create usage metric for current period
            const { periodStart, periodEnd } = getCurrentBillingPeriod();
            const metrics = await base44.asServiceRole.entities.UsageMetric.filter({
                organization_id: organization_id,
                feature_name: feature_name,
                period_start: periodStart,
                period_end: periodEnd
            });

            if (metrics && metrics.length > 0) {
                const metric = metrics[0];
                const newUsage = metric.usage_count + quantity;
                const newCost = metric.total_cost + cost;
                
                await base44.asServiceRole.entities.UsageMetric.update(metric.id, {
                    usage_count: newUsage,
                    total_cost: newCost,
                    usage_percentage: metric.usage_limit 
                        ? Math.round((newUsage / metric.usage_limit) * 100)
                        : 0,
                    daily_usage: updateDailyUsage(metric.daily_usage || [], quantity, cost)
                });
            }

            return Response.json({
                event_recorded: true,
                event_id: event.id,
                cost: cost
            });

        } else if (action === 'get_metrics') {
            // Get usage metrics for period
            const { periodStart, periodEnd } = getPeriodDates(period);

            const metrics = await base44.asServiceRole.entities.UsageMetric.filter({
                organization_id: organization_id,
                period_start: periodStart,
                period_end: periodEnd
            }, '-total_cost', 100);

            const stats = {
                total_cost: metrics.reduce((sum, m) => sum + m.total_cost, 0),
                total_usage_count: metrics.reduce((sum, m) => sum + m.usage_count, 0),
                features_used: metrics.filter(m => m.usage_count > 0).length,
                exceeded_limits: metrics.filter(m => m.status === 'exceeded').length
            };

            return Response.json({
                metrics: metrics,
                stats: stats
            });

        } else if (action === 'get_usage_report') {
            // Get detailed usage report
            const { periodStart, periodEnd } = getPeriodDates(period);

            const metrics = await base44.asServiceRole.entities.UsageMetric.filter({
                organization_id: organization_id,
                period_start: periodStart,
                period_end: periodEnd
            });

            const events = await base44.asServiceRole.entities.MeterEvent.filter({
                organization_id: organization_id,
                timestamp: { $gte: periodStart, $lte: periodEnd }
            }, '-timestamp', 1000);

            const report = {
                period: {
                    start: periodStart,
                    end: periodEnd
                },
                metrics: metrics,
                total_events: events.length,
                processed_events: events.filter(e => e.status === 'processed').length,
                failed_events: events.filter(e => e.status === 'failed').length,
                summary: {
                    total_cost: metrics.reduce((sum, m) => sum + m.total_cost, 0),
                    overage_cost: metrics.reduce((sum, m) => sum + m.overage_cost, 0),
                    included_usage: metrics.reduce((sum, m) => sum + m.included_quota, 0),
                    billable_usage: metrics.reduce((sum, m) => sum + m.overage_amount, 0)
                },
                by_category: groupMetricsByCategory(metrics)
            };

            return Response.json(report);

        } else if (action === 'aggregate_usage') {
            // Aggregate usage for multiple periods
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const events = await base44.asServiceRole.entities.MeterEvent.filter({
                organization_id: organization_id,
                timestamp: { $gte: thirtyDaysAgo.toISOString() }
            }, '-timestamp', 1000);

            const aggregated = {};
            events.forEach(event => {
                if (!aggregated[event.feature_name]) {
                    aggregated[event.feature_name] = {
                        feature_name: event.feature_name,
                        total_quantity: 0,
                        total_cost: 0,
                        event_count: 0,
                        unit: event.unit
                    };
                }
                aggregated[event.feature_name].total_quantity += event.quantity;
                aggregated[event.feature_name].total_cost += event.cost;
                aggregated[event.feature_name].event_count++;
            });

            return Response.json({
                period_days: 30,
                features: Object.values(aggregated),
                total_cost: Object.values(aggregated).reduce((sum, f) => sum + f.total_cost, 0),
                top_features: Object.values(aggregated)
                    .sort((a, b) => b.total_cost - a.total_cost)
                    .slice(0, 5)
            });

        } else if (action === 'check_limits') {
            // Check if organization exceeded limits
            const { periodStart, periodEnd } = getCurrentBillingPeriod();
            const metrics = await base44.asServiceRole.entities.UsageMetric.filter({
                organization_id: organization_id,
                period_start: periodStart,
                period_end: periodEnd
            });

            const exceeded = metrics.filter(m => 
                m.usage_limit && m.usage_count > m.usage_limit
            );

            const warnings = metrics.filter(m =>
                m.usage_limit && m.usage_count > (m.usage_limit * 0.8)
            );

            return Response.json({
                exceeded_limits: exceeded.map(m => ({
                    feature: m.feature_name,
                    limit: m.usage_limit,
                    current: m.usage_count,
                    overage: m.usage_count - m.usage_limit
                })),
                approaching_limits: warnings.filter(w => !exceeded.find(e => e.id === w.id))
            });

        } else if (action === 'get_cost_breakdown') {
            // Get cost breakdown by category
            const { periodStart, periodEnd } = getPeriodDates(period);
            const metrics = await base44.asServiceRole.entities.UsageMetric.filter({
                organization_id: organization_id,
                period_start: periodStart,
                period_end: periodEnd
            });

            const breakdown = {
                by_category: {},
                by_feature: {},
                total_cost: 0,
                included_cost: 0,
                overage_cost: 0
            };

            metrics.forEach(m => {
                if (!breakdown.by_category[m.feature_category]) {
                    breakdown.by_category[m.feature_category] = 0;
                }
                breakdown.by_category[m.feature_category] += m.total_cost;

                breakdown.by_feature[m.feature_name] = m.total_cost;

                breakdown.total_cost += m.total_cost;
                breakdown.included_cost += m.included_quota * getCostPerUnit(m.feature_name);
                breakdown.overage_cost += m.overage_cost;
            });

            return Response.json(breakdown);

        } else if (action === 'get_forecasts') {
            // Forecast usage and costs for next period
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const events = await base44.asServiceRole.entities.MeterEvent.filter({
                organization_id: organization_id,
                timestamp: { $gte: thirtyDaysAgo.toISOString() }
            });

            const aggregatedByFeature = {};
            events.forEach(e => {
                if (!aggregatedByFeature[e.feature_name]) {
                    aggregatedByFeature[e.feature_name] = { quantity: 0, cost: 0, count: 0 };
                }
                aggregatedByFeature[e.feature_name].quantity += e.quantity;
                aggregatedByFeature[e.feature_name].cost += e.cost;
                aggregatedByFeature[e.feature_name].count++;
            });

            const forecasts = Object.entries(aggregatedByFeature).map(([feature, data]) => ({
                feature_name: feature,
                daily_average: data.quantity / 30,
                predicted_monthly: Math.round((data.quantity / 30) * 30),
                predicted_cost: (data.cost / 30) * 30,
                trend: data.count > 0 ? 'stable' : 'unknown'
            }));

            return Response.json({
                forecast_period: 'next_30_days',
                forecasts: forecasts,
                predicted_total_cost: Math.round(
                    forecasts.reduce((sum, f) => sum + f.predicted_cost, 0)
                )
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Usage analytics error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function getCostPerUnit(featureName) {
    const costMap = {
        'api_calls': 0.001,
        'storage_gb': 0.1,
        'user_seat': 5,
        'compute_hours': 1,
        'bandwidth_gb': 0.05,
        'report_generation': 0.5,
        'integration': 0
    };
    return costMap[featureName] || 0.01;
}

function getCurrentBillingPeriod() {
    const today = new Date();
    const periodStart = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString().split('T')[0];
    const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        .toISOString().split('T')[0];
    return { periodStart, periodEnd };
}

function getPeriodDates(period) {
    const today = new Date();
    let periodStart, periodEnd;

    if (period === 'current_month') {
        periodStart = new Date(today.getFullYear(), today.getMonth(), 1)
            .toISOString().split('T')[0];
        periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
            .toISOString().split('T')[0];
    } else if (period === 'last_month') {
        periodStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
            .toISOString().split('T')[0];
        periodEnd = new Date(today.getFullYear(), today.getMonth(), 0)
            .toISOString().split('T')[0];
    } else if (period === 'last_30_days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        periodStart = thirtyDaysAgo.toISOString().split('T')[0];
        periodEnd = today.toISOString().split('T')[0];
    } else {
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        periodStart = sixtyDaysAgo.toISOString().split('T')[0];
        periodEnd = today.toISOString().split('T')[0];
    }

    return { periodStart, periodEnd };
}

function updateDailyUsage(dailyUsage, quantity, cost) {
    const today = new Date().toISOString().split('T')[0];
    const existing = dailyUsage.find(d => d.date === today);
    
    if (existing) {
        existing.usage += quantity;
        existing.cost += cost;
    } else {
        dailyUsage.push({ date: today, usage: quantity, cost: cost });
    }
    
    return dailyUsage.slice(-30); // Keep last 30 days
}

function groupMetricsByCategory(metrics) {
    const grouped = {};
    metrics.forEach(m => {
        if (!grouped[m.feature_category]) {
            grouped[m.feature_category] = {
                category: m.feature_category,
                total_cost: 0,
                total_usage: 0,
                features: []
            };
        }
        grouped[m.feature_category].total_cost += m.total_cost;
        grouped[m.feature_category].total_usage += m.usage_count;
        grouped[m.feature_category].features.push({
            name: m.feature_name,
            usage: m.usage_count,
            cost: m.total_cost
        });
    });
    return grouped;
}