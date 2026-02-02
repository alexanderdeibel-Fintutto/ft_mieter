import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 87: Advanced Caching & Performance Optimization System
 * Verwaltet Cache-Strategien, Performance-Optimierungen und Metriken
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

        if (action === 'create_cache_strategy') {
            const { strategy_name, cache_type, target_resource, ttl_seconds, max_size_mb, eviction_policy } = await req.json();

            if (!strategy_name || !cache_type || !target_resource) {
                return Response.json({ error: 'strategy_name, cache_type, target_resource required' }, { status: 400 });
            }

            const strategy_id = crypto.randomUUID();

            const strategy = await base44.asServiceRole.entities.CacheStrategy.create({
                organization_id,
                strategy_id,
                strategy_name,
                cache_type,
                target_resource,
                ttl_seconds: ttl_seconds || 3600,
                max_size_mb: max_size_mb || 100,
                eviction_policy: eviction_policy || 'lru',
                is_active: true,
                created_at: new Date().toISOString()
            });

            return Response.json({ strategy_created: true, strategy_id: strategy.id });

        } else if (action === 'record_cache_metric') {
            const { strategy_id, cache_type, total_requests, cache_hits, cache_misses, avg_response_time_ms, cache_size_mb } = await req.json();

            if (!strategy_id || !cache_type || total_requests === undefined) {
                return Response.json({ error: 'strategy_id, cache_type, total_requests required' }, { status: 400 });
            }

            const metric_id = crypto.randomUUID();
            const hit_rate = total_requests > 0 ? ((cache_hits / total_requests) * 100).toFixed(2) : 0;

            const metric = await base44.asServiceRole.entities.CacheMetric.create({
                organization_id,
                metric_id,
                strategy_id,
                cache_type,
                timestamp: new Date().toISOString(),
                total_requests,
                cache_hits: cache_hits || 0,
                cache_misses: cache_misses || 0,
                hit_rate: parseFloat(hit_rate),
                avg_response_time_ms: avg_response_time_ms || 0,
                cache_size_mb: cache_size_mb || 0
            });

            return Response.json({ metric_created: true, metric_id: metric.id });

        } else if (action === 'create_optimization') {
            const { optimization_name, optimization_type, target_entity, baseline_metric, expected_improvement_percent, estimated_effort_hours } = await req.json();

            if (!optimization_name || !optimization_type || !target_entity) {
                return Response.json({ error: 'optimization_name, optimization_type, target_entity required' }, { status: 400 });
            }

            const optimization_id = crypto.randomUUID();

            const optimization = await base44.asServiceRole.entities.PerformanceOptimization.create({
                organization_id,
                optimization_id,
                optimization_name,
                optimization_type,
                target_entity,
                status: 'proposed',
                baseline_metric: baseline_metric || 0,
                expected_improvement_percent: expected_improvement_percent || 0,
                estimated_effort_hours: estimated_effort_hours || 0,
                owner_id: user.id,
                created_at: new Date().toISOString()
            });

            return Response.json({ optimization_created: true, optimization_id: optimization.id });

        } else if (action === 'start_optimization') {
            const { optimization_id } = await req.json();

            if (!optimization_id) {
                return Response.json({ error: 'optimization_id required' }, { status: 400 });
            }

            const opts = await base44.asServiceRole.entities.PerformanceOptimization.filter({
                organization_id,
                id: optimization_id
            });

            if (opts.length === 0) {
                return Response.json({ error: 'Optimization not found' }, { status: 404 });
            }

            await base44.asServiceRole.entities.PerformanceOptimization.update(optimization_id, {
                status: 'in_progress',
                started_at: new Date().toISOString()
            });

            return Response.json({ optimization_started: true });

        } else if (action === 'complete_optimization') {
            const { optimization_id, actual_improvement_percent, actual_effort_hours, implementation_notes } = await req.json();

            if (!optimization_id) {
                return Response.json({ error: 'optimization_id required' }, { status: 400 });
            }

            const now = new Date().toISOString();

            const updateData = {
                status: 'completed',
                completed_at: now,
                actual_improvement_percent: actual_improvement_percent || 0,
                actual_effort_hours: actual_effort_hours || 0
            };

            if (implementation_notes) {
                updateData.implementation_notes = implementation_notes;
            }

            await base44.asServiceRole.entities.PerformanceOptimization.update(optimization_id, updateData);

            return Response.json({ optimization_completed: true });

        } else if (action === 'get_dashboard_data') {
            const [strategies, metrics, optimizations] = await Promise.all([
                base44.asServiceRole.entities.CacheStrategy.filter({ organization_id }, '-created_at', 50),
                base44.asServiceRole.entities.CacheMetric.filter({ organization_id }, '-timestamp', 100),
                base44.asServiceRole.entities.PerformanceOptimization.filter({ organization_id }, '-created_at', 50)
            ]);

            const strategyStats = {
                total_strategies: strategies.length,
                active_strategies: strategies.filter(s => s.is_active).length,
                by_type: {},
                by_priority: {}
            };

            strategies.forEach(s => {
                strategyStats.by_type[s.cache_type] = (strategyStats.by_type[s.cache_type] || 0) + 1;
                strategyStats.by_priority[s.priority] = (strategyStats.by_priority[s.priority] || 0) + 1;
            });

            const metricStats = {
                total_metrics: metrics.length,
                avg_hit_rate: metrics.length > 0
                    ? (metrics.reduce((sum, m) => sum + (m.hit_rate || 0), 0) / metrics.length).toFixed(2)
                    : 0,
                avg_response_time_ms: metrics.length > 0
                    ? (metrics.reduce((sum, m) => sum + (m.avg_response_time_ms || 0), 0) / metrics.length).toFixed(2)
                    : 0,
                total_bandwidth_saved_mb: metrics.reduce((sum, m) => sum + (m.bandwidth_saved_mb || 0), 0),
                cache_types: {}
            };

            metrics.forEach(m => {
                if (!metricStats.cache_types[m.cache_type]) {
                    metricStats.cache_types[m.cache_type] = {
                        count: 0,
                        avg_hit_rate: 0,
                        avg_response_time: 0
                    };
                }
                metricStats.cache_types[m.cache_type].count += 1;
                metricStats.cache_types[m.cache_type].avg_hit_rate += m.hit_rate || 0;
                metricStats.cache_types[m.cache_type].avg_response_time += m.avg_response_time_ms || 0;
            });

            Object.keys(metricStats.cache_types).forEach(type => {
                const data = metricStats.cache_types[type];
                data.avg_hit_rate = (data.avg_hit_rate / data.count).toFixed(2);
                data.avg_response_time = (data.avg_response_time / data.count).toFixed(2);
            });

            const optimizationStats = {
                total_optimizations: optimizations.length,
                proposed: optimizations.filter(o => o.status === 'proposed').length,
                in_progress: optimizations.filter(o => o.status === 'in_progress').length,
                completed: optimizations.filter(o => o.status === 'completed').length,
                rolled_back: optimizations.filter(o => o.status === 'rolled_back').length,
                by_type: {},
                total_actual_improvement: 0,
                total_estimated_effort: 0,
                total_actual_effort: 0
            };

            optimizations.forEach(o => {
                optimizationStats.by_type[o.optimization_type] = (optimizationStats.by_type[o.optimization_type] || 0) + 1;
                optimizationStats.total_actual_improvement += o.actual_improvement_percent || 0;
                optimizationStats.total_estimated_effort += o.estimated_effort_hours || 0;
                optimizationStats.total_actual_effort += o.actual_effort_hours || 0;
            });

            if (optimizations.filter(o => o.status === 'completed').length > 0) {
                optimizationStats.avg_actual_improvement = (optimizationStats.total_actual_improvement / optimizations.filter(o => o.status === 'completed').length).toFixed(2);
            }

            return Response.json({
                strategies: strategies.slice(0, 30),
                metrics: metrics.slice(0, 50),
                optimizations: optimizations.slice(0, 30),
                strategy_stats: strategyStats,
                metric_stats: metricStats,
                optimization_stats: optimizationStats
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Caching performance engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});