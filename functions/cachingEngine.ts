import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 41: Advanced Caching & Performance Optimization System
 * Verwaltet intelligentes Caching, Cache-Invalidierung und Performance-Optimierungen
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
            cache_key,
            cache_value,
            cache_type,
            ttl_seconds,
            tags,
            rule_id,
            pattern
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'get_cache') {
            if (!cache_key) {
                return Response.json({ error: 'cache_key required' }, { status: 400 });
            }

            const entries = await base44.asServiceRole.entities.CacheEntry.filter({
                organization_id,
                cache_key
            });

            if (!entries || entries.length === 0) {
                return Response.json({ cache_miss: true });
            }

            const entry = entries[0];
            const now = new Date();
            const expiresAt = new Date(entry.expires_at);

            if (now > expiresAt) {
                await base44.asServiceRole.entities.CacheEntry.delete(entry.id);
                return Response.json({ cache_miss: true, expired: true });
            }

            await base44.asServiceRole.entities.CacheEntry.update(entry.id, {
                hit_count: (entry.hit_count || 0) + 1,
                last_accessed_at: now.toISOString()
            });

            return Response.json({
                cache_hit: true,
                value: JSON.parse(entry.cache_value),
                hit_count: entry.hit_count + 1
            });

        } else if (action === 'set_cache') {
            if (!cache_key || cache_value === undefined) {
                return Response.json({ error: 'cache_key, cache_value required' }, { status: 400 });
            }

            const ttl = ttl_seconds || 3600;
            const expiresAt = new Date(Date.now() + (ttl * 1000));
            const valueStr = JSON.stringify(cache_value);

            const existing = await base44.asServiceRole.entities.CacheEntry.filter({
                organization_id,
                cache_key
            });

            if (existing && existing.length > 0) {
                await base44.asServiceRole.entities.CacheEntry.update(existing[0].id, {
                    cache_value: valueStr,
                    expires_at: expiresAt.toISOString(),
                    size_bytes: valueStr.length
                });
            } else {
                await base44.asServiceRole.entities.CacheEntry.create({
                    organization_id,
                    cache_key,
                    cache_value: valueStr,
                    cache_type: cache_type || 'query',
                    ttl_seconds: ttl,
                    created_at: new Date().toISOString(),
                    expires_at: expiresAt.toISOString(),
                    size_bytes: valueStr.length,
                    tags: tags || []
                });
            }

            return Response.json({ cache_set: true });

        } else if (action === 'invalidate_cache') {
            let deleted = 0;

            if (cache_key) {
                const entries = await base44.asServiceRole.entities.CacheEntry.filter({
                    organization_id,
                    cache_key
                });
                for (const entry of entries) {
                    await base44.asServiceRole.entities.CacheEntry.delete(entry.id);
                    deleted++;
                }
            } else if (tags && tags.length > 0) {
                const allEntries = await base44.asServiceRole.entities.CacheEntry.filter({
                    organization_id
                });
                for (const entry of allEntries) {
                    if (entry.tags && entry.tags.some(t => tags.includes(t))) {
                        await base44.asServiceRole.entities.CacheEntry.delete(entry.id);
                        deleted++;
                    }
                }
            }

            // Audit-Log
            await base44.functions.invoke('securityAuditLogger', {
                action: 'log_action',
                organization_id,
                log_action: 'invalidate_cache',
                action_category: 'cache',
                new_value: { cache_key, tags, deleted_count: deleted },
                severity: 'medium'
            });

            return Response.json({ invalidated: true, deleted_count: deleted });

        } else if (action === 'get_cache_stats') {
            const entries = await base44.asServiceRole.entities.CacheEntry.filter({
                organization_id
            }, '-created_at', 1000);

            const now = new Date();
            const validEntries = entries.filter(e => new Date(e.expires_at) > now);
            const expiredEntries = entries.length - validEntries.length;

            const totalHits = validEntries.reduce((sum, e) => sum + (e.hit_count || 0), 0);
            const totalSize = validEntries.reduce((sum, e) => sum + (e.size_bytes || 0), 0);
            const byType = {};
            validEntries.forEach(e => {
                byType[e.cache_type] = (byType[e.cache_type] || 0) + 1;
            });

            return Response.json({
                total_entries: validEntries.length,
                expired_entries: expiredEntries,
                total_hits: totalHits,
                total_size_bytes: totalSize,
                total_size_mb: (totalSize / 1024 / 1024).toFixed(2),
                by_type: byType,
                avg_hit_count: validEntries.length > 0 ? (totalHits / validEntries.length).toFixed(1) : 0
            });

        } else if (action === 'cleanup_expired') {
            const entries = await base44.asServiceRole.entities.CacheEntry.filter({
                organization_id
            });

            const now = new Date();
            let cleaned = 0;

            for (const entry of entries) {
                if (new Date(entry.expires_at) <= now) {
                    await base44.asServiceRole.entities.CacheEntry.delete(entry.id);
                    cleaned++;
                }
            }

            return Response.json({ cleaned_up: true, deleted_count: cleaned });

        } else if (action === 'create_invalidation_rule') {
            const { rule_name, trigger_type, entity_type } = await req.json();

            if (!rule_name || !trigger_type) {
                return Response.json({ error: 'rule_name, trigger_type required' }, { status: 400 });
            }

            const rule = await base44.asServiceRole.entities.CacheInvalidationRule.create({
                organization_id,
                rule_name,
                trigger_type,
                entity_type: entity_type || null,
                cache_tags: tags || [],
                cache_pattern: pattern || null
            });

            return Response.json({ rule_created: true, rule_id: rule.id });

        } else if (action === 'get_invalidation_rules') {
            const rules = await base44.asServiceRole.entities.CacheInvalidationRule.filter({
                organization_id
            }, '-created_date', 100);

            return Response.json({ rules });

        } else if (action === 'create_optimization') {
            const { optimization_name, optimization_type, target_resource } = await req.json();

            if (!optimization_name || !optimization_type) {
                return Response.json({ error: 'optimization_name, optimization_type required' }, { status: 400 });
            }

            const optimization = await base44.asServiceRole.entities.PerformanceOptimization.create({
                organization_id,
                optimization_name,
                optimization_type,
                target_resource: target_resource || null,
                created_by: user.id
            });

            return Response.json({ optimization_created: true, optimization_id: optimization.id });

        } else if (action === 'get_optimizations') {
            const optimizations = await base44.asServiceRole.entities.PerformanceOptimization.filter({
                organization_id
            }, '-created_date', 100);

            const stats = {
                total: optimizations.length,
                enabled: optimizations.filter(o => o.status === 'enabled').length,
                avg_gain: optimizations.length > 0
                    ? (optimizations.reduce((sum, o) => sum + (o.performance_gain_percent || 0), 0) / optimizations.length).toFixed(1)
                    : 0
            };

            return Response.json({ optimizations, stats });

        } else if (action === 'get_dashboard_data') {
            const [cacheStats, rules, optimizations] = await Promise.all([
                base44.functions.invoke('cachingEngine', {
                    action: 'get_cache_stats',
                    organization_id
                }),
                base44.asServiceRole.entities.CacheInvalidationRule.filter({ organization_id }),
                base44.asServiceRole.entities.PerformanceOptimization.filter({ organization_id })
            ]);

            return Response.json({
                cache_stats: cacheStats.data,
                rules,
                optimizations,
                stats: {
                    total_rules: rules.length,
                    active_rules: rules.filter(r => r.is_active).length,
                    total_optimizations: optimizations.length,
                    enabled_optimizations: optimizations.filter(o => o.status === 'enabled').length
                }
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Caching engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});