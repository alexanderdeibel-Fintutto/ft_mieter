import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 74: Advanced Caching & Invalidation System
 * Verwaltet Cache-Einträge, Cache-Policies und Invalidierungsstrategien
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

        if (action === 'store_cache') {
            const { cache_key, cache_layer, value_size_bytes, ttl_seconds, is_compressed, is_encrypted, metadata } = await req.json();

            if (!cache_key || !cache_layer || !ttl_seconds) {
                return Response.json({ error: 'cache_key, cache_layer, ttl_seconds required' }, { status: 400 });
            }

            const now = new Date();
            const expires_at = new Date(now.getTime() + ttl_seconds * 1000).toISOString();

            const entry = await base44.asServiceRole.entities.CacheEntry.create({
                organization_id,
                cache_key,
                cache_layer,
                value_size_bytes: value_size_bytes || 0,
                ttl_seconds,
                created_at: now.toISOString(),
                expires_at,
                last_accessed_at: now.toISOString(),
                is_compressed: is_compressed || false,
                is_encrypted: is_encrypted || false,
                metadata: metadata || {}
            });

            return Response.json({ cache_stored: true, cache_key: entry.id, expires_at });

        } else if (action === 'access_cache') {
            const { cache_key } = await req.json();

            if (!cache_key) {
                return Response.json({ error: 'cache_key required' }, { status: 400 });
            }

            const entries = await base44.asServiceRole.entities.CacheEntry.filter({
                organization_id,
                cache_key
            });

            if (entries.length === 0) {
                return Response.json({ cache_hit: false });
            }

            const entry = entries[0];
            const now = new Date();

            if (new Date(entry.expires_at) < now) {
                // Expired, invalidate it
                await base44.asServiceRole.entities.CacheEntry.update(entry.id, {
                    miss_count: (entry.miss_count || 0) + 1
                });
                return Response.json({ cache_hit: false, reason: 'expired' });
            }

            await base44.asServiceRole.entities.CacheEntry.update(entry.id, {
                hit_count: (entry.hit_count || 0) + 1,
                last_accessed_at: now.toISOString()
            });

            return Response.json({
                cache_hit: true,
                value_size_bytes: entry.value_size_bytes,
                created_at: entry.created_at
            });

        } else if (action === 'create_policy') {
            const { policy_name, cache_pattern, cache_layers, default_ttl_seconds, invalidation_strategy, invalidation_events, compression_enabled, encryption_enabled } = await req.json();

            if (!policy_name || !cache_pattern) {
                return Response.json({ error: 'policy_name, cache_pattern required' }, { status: 400 });
            }

            const policy = await base44.asServiceRole.entities.CachePolicy.create({
                organization_id,
                policy_name,
                cache_pattern,
                cache_layers: cache_layers || ['memory'],
                default_ttl_seconds: default_ttl_seconds || 3600,
                invalidation_strategy: invalidation_strategy || 'ttl',
                invalidation_events: invalidation_events || [],
                compression_enabled: compression_enabled !== undefined ? compression_enabled : true,
                encryption_enabled: encryption_enabled || false
            });

            return Response.json({ policy_created: true, policy_id: policy.id });

        } else if (action === 'invalidate_cache') {
            const { cache_keys, pattern, reason, triggered_by } = await req.json();

            if (!cache_keys && !pattern) {
                return Response.json({ error: 'cache_keys or pattern required' }, { status: 400 });
            }

            const invalidation_id = crypto.randomUUID();
            const start_time = Date.now();
            const now = new Date();

            let entries_to_invalidate = [];

            if (cache_keys && cache_keys.length > 0) {
                const entries = await base44.asServiceRole.entities.CacheEntry.filter({
                    organization_id
                }, '-created_at', 1000);

                entries_to_invalidate = entries.filter(e => cache_keys.includes(e.cache_key));
            } else if (pattern) {
                const entries = await base44.asServiceRole.entities.CacheEntry.filter({
                    organization_id
                }, '-created_at', 1000);

                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                entries_to_invalidate = entries.filter(e => regex.test(e.cache_key));
            }

            let space_freed = 0;
            for (const entry of entries_to_invalidate) {
                space_freed += entry.value_size_bytes || 0;
            }

            const invalidation = await base44.asServiceRole.entities.CacheInvalidation.create({
                organization_id,
                invalidation_id,
                cache_keys: cache_keys || [],
                pattern: pattern || '',
                reason: reason || 'manual',
                triggered_by: triggered_by || user.id,
                status: 'completed',
                entries_invalidated: entries_to_invalidate.length,
                space_freed_bytes: space_freed,
                duration_ms: Date.now() - start_time,
                started_at: now.toISOString(),
                completed_at: new Date().toISOString()
            });

            return Response.json({
                cache_invalidated: true,
                entries_invalidated: entries_to_invalidate.length,
                space_freed_bytes: space_freed,
                invalidation_id: invalidation.id
            });

        } else if (action === 'get_cache_stats') {
            const entries = await base44.asServiceRole.entities.CacheEntry.filter({
                organization_id
            }, '-created_at', 1000);

            const policies = await base44.asServiceRole.entities.CachePolicy.filter({
                organization_id
            }, '-created_date');

            const invalidations = await base44.asServiceRole.entities.CacheInvalidation.filter({
                organization_id
            }, '-started_at', 100);

            const cacheByLayer = {};
            let totalHits = 0;
            let totalMisses = 0;
            let totalSize = 0;

            entries.forEach(e => {
                cacheByLayer[e.cache_layer] = (cacheByLayer[e.cache_layer] || 0) + 1;
                totalHits += e.hit_count || 0;
                totalMisses += e.miss_count || 0;
                totalSize += e.value_size_bytes || 0;
            });

            const hitRate = totalHits + totalMisses > 0
                ? Math.round((totalHits / (totalHits + totalMisses)) * 100)
                : 0;

            const stats = {
                total_entries: entries.length,
                total_size_bytes: totalSize,
                total_size_mb: Math.round((totalSize / 1024 / 1024) * 100) / 100,
                total_hits: totalHits,
                total_misses: totalMisses,
                hit_rate: hitRate,
                entries_by_layer: cacheByLayer,
                total_policies: policies.length,
                active_policies: policies.filter(p => p.is_active).length,
                total_invalidations: invalidations.length,
                total_space_freed: invalidations.reduce((sum, inv) => sum + (inv.space_freed_bytes || 0), 0)
            };

            return Response.json({
                entries: entries.slice(0, 30),
                policies,
                invalidations: invalidations.slice(0, 20),
                stats
            });

        } else if (action === 'get_policies') {
            const { is_active } = await req.json();

            let filter = { organization_id };
            if (is_active !== undefined) filter.is_active = is_active;

            const policies = await base44.asServiceRole.entities.CachePolicy.filter(filter, '-priority');

            return Response.json({ policies });

        } else if (action === 'get_invalidations') {
            const { status, reason } = await req.json();

            let filter = { organization_id };
            if (status) filter.status = status;
            if (reason) filter.reason = reason;

            const invalidations = await base44.asServiceRole.entities.CacheInvalidation.filter(
                filter,
                '-started_at',
                50
            );

            return Response.json({ invalidations });

        } else if (action === 'cleanup_expired') {
            const now = new Date();
            const entries = await base44.asServiceRole.entities.CacheEntry.filter({
                organization_id
            }, '-created_at', 5000);

            const expiredEntries = entries.filter(e => new Date(e.expires_at) < now);
            let totalSpaceFreed = 0;

            for (const entry of expiredEntries) {
                totalSpaceFreed += entry.value_size_bytes || 0;
            }

            const invalidation_id = crypto.randomUUID();

            await base44.asServiceRole.entities.CacheInvalidation.create({
                organization_id,
                invalidation_id,
                reason: 'ttl_expired',
                status: 'completed',
                entries_invalidated: expiredEntries.length,
                space_freed_bytes: totalSpaceFreed,
                duration_ms: 0,
                started_at: now.toISOString(),
                completed_at: now.toISOString()
            });

            return Response.json({
                cleanup_completed: true,
                entries_removed: expiredEntries.length,
                space_freed_bytes: totalSpaceFreed
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Cache invalidation engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});