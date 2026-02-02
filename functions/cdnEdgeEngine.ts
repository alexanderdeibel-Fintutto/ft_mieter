import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 61: Advanced CDN & Edge Computing System
 * Verwaltet CDN-Provider, Edge-Nodes und gecachten Content
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

        if (action === 'create_provider') {
            const { provider_name, provider_type, api_endpoint, regions } = await req.json();

            if (!provider_name || !provider_type) {
                return Response.json({ error: 'provider_name, provider_type required' }, { status: 400 });
            }

            const provider = await base44.asServiceRole.entities.CDNProvider.create({
                organization_id,
                provider_name,
                provider_type,
                api_endpoint: api_endpoint || '',
                regions: regions || []
            });

            return Response.json({ provider_created: true, provider_id: provider.id });

        } else if (action === 'get_providers') {
            const providers = await base44.asServiceRole.entities.CDNProvider.filter({
                organization_id
            });

            return Response.json({ providers });

        } else if (action === 'create_edge_node') {
            const { provider_id, node_name, location, country_code, latitude, longitude, capacity_gbps } = await req.json();

            if (!provider_id || !node_name || !location) {
                return Response.json({ error: 'provider_id, node_name, location required' }, { status: 400 });
            }

            const node = await base44.asServiceRole.entities.EdgeNode.create({
                organization_id,
                provider_id,
                node_name,
                location,
                country_code: country_code || '',
                latitude: latitude || 0,
                longitude: longitude || 0,
                capacity_gbps: capacity_gbps || 10
            });

            return Response.json({ node_created: true, node_id: node.id });

        } else if (action === 'get_edge_nodes') {
            const { provider_id } = await req.json();

            let filter = { organization_id };
            if (provider_id) filter.provider_id = provider_id;

            const nodes = await base44.asServiceRole.entities.EdgeNode.filter(filter);

            return Response.json({ nodes });

        } else if (action === 'cache_content') {
            const { provider_id, content_key, content_type, size_bytes, ttl_seconds } = await req.json();

            if (!provider_id || !content_key || !content_type) {
                return Response.json({ error: 'provider_id, content_key, content_type required' }, { status: 400 });
            }

            const now = new Date();
            const expires_at = new Date(now.getTime() + (ttl_seconds || 3600) * 1000);

            const content = await base44.asServiceRole.entities.CachedContent.create({
                organization_id,
                provider_id,
                content_key,
                content_type,
                size_bytes: size_bytes || 0,
                ttl_seconds: ttl_seconds || 3600,
                cached_at: now.toISOString(),
                expires_at: expires_at.toISOString()
            });

            return Response.json({ content_cached: true, content_id: content.id });

        } else if (action === 'record_cache_hit') {
            const { content_id } = await req.json();

            if (!content_id) {
                return Response.json({ error: 'content_id required' }, { status: 400 });
            }

            const contents = await base44.asServiceRole.entities.CachedContent.filter({
                organization_id,
                id: content_id
            });

            if (contents.length === 0) {
                return Response.json({ error: 'Content not found' }, { status: 404 });
            }

            const content = contents[0];
            await base44.asServiceRole.entities.CachedContent.update(content_id, {
                hit_count: (content.hit_count || 0) + 1,
                last_accessed_at: new Date().toISOString()
            });

            // Update provider stats
            const providers = await base44.asServiceRole.entities.CDNProvider.filter({
                organization_id,
                id: content.provider_id
            });

            if (providers.length > 0) {
                const provider = providers[0];
                await base44.asServiceRole.entities.CDNProvider.update(content.provider_id, {
                    total_requests: (provider.total_requests || 0) + 1,
                    cache_hits: (provider.cache_hits || 0) + 1
                });
            }

            return Response.json({ hit_recorded: true });

        } else if (action === 'purge_cache') {
            const { content_id } = await req.json();

            if (!content_id) {
                return Response.json({ error: 'content_id required' }, { status: 400 });
            }

            await base44.asServiceRole.entities.CachedContent.update(content_id, {
                cache_status: 'purged'
            });

            return Response.json({ cache_purged: true });

        } else if (action === 'get_cached_content') {
            const { provider_id, cache_status } = await req.json();

            let filter = { organization_id };
            if (provider_id) filter.provider_id = provider_id;
            if (cache_status) filter.cache_status = cache_status;

            const contents = await base44.asServiceRole.entities.CachedContent.filter(filter, '-hit_count', 50);

            return Response.json({ contents });

        } else if (action === 'get_dashboard_data') {
            const [providers, nodes, contents] = await Promise.all([
                base44.asServiceRole.entities.CDNProvider.filter({ organization_id }),
                base44.asServiceRole.entities.EdgeNode.filter({ organization_id }),
                base44.asServiceRole.entities.CachedContent.filter({ organization_id }, '-hit_count', 100)
            ]);

            const nodesByStatus = {};
            nodes.forEach(n => {
                nodesByStatus[n.health_status] = (nodesByStatus[n.health_status] || 0) + 1;
            });

            const contentsByType = {};
            contents.forEach(c => {
                contentsByType[c.content_type] = (contentsByType[c.content_type] || 0) + 1;
            });

            const stats = {
                total_providers: providers.length,
                active_providers: providers.filter(p => p.is_active).length,
                total_nodes: nodes.length,
                healthy_nodes: nodes.filter(n => n.health_status === 'healthy').length,
                total_cached_items: contents.filter(c => c.cache_status === 'cached').length,
                total_requests: providers.reduce((sum, p) => sum + (p.total_requests || 0), 0),
                total_cache_hits: providers.reduce((sum, p) => sum + (p.cache_hits || 0), 0),
                total_bandwidth_gb: providers.reduce((sum, p) => sum + (p.bandwidth_gb || 0), 0)
            };

            const cache_hit_rate = stats.total_requests > 0
                ? Math.round((stats.total_cache_hits / stats.total_requests) * 100)
                : 0;

            return Response.json({
                providers,
                nodes,
                contents: contents.slice(0, 20),
                stats: { ...stats, cache_hit_rate },
                nodes_by_status: nodesByStatus,
                contents_by_type: contentsByType
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('CDN edge engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});