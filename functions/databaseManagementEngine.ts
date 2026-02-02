import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 57: Advanced Database Management & Sharding System
 * Verwaltet Database Clusters, Sharding und Replication
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

        if (action === 'create_cluster') {
            const { cluster_name, cluster_type, cluster_mode, max_connections, storage_size_gb } = await req.json();

            if (!cluster_name || !cluster_type) {
                return Response.json({ error: 'cluster_name, cluster_type required' }, { status: 400 });
            }

            const cluster = await base44.asServiceRole.entities.DatabaseCluster.create({
                organization_id,
                cluster_name,
                cluster_type,
                cluster_mode: cluster_mode || 'standalone',
                max_connections: max_connections || 100,
                storage_size_gb: storage_size_gb || 10
            });

            return Response.json({ cluster_created: true, cluster_id: cluster.id });

        } else if (action === 'get_clusters') {
            const clusters = await base44.asServiceRole.entities.DatabaseCluster.filter({
                organization_id
            });

            return Response.json({ clusters });

        } else if (action === 'update_cluster_stats') {
            const { cluster_id, storage_used_gb, total_queries, slow_queries } = await req.json();

            if (!cluster_id) {
                return Response.json({ error: 'cluster_id required' }, { status: 400 });
            }

            const updateData = {};
            if (storage_used_gb !== undefined) updateData.storage_used_gb = storage_used_gb;
            if (total_queries !== undefined) updateData.total_queries = total_queries;
            if (slow_queries !== undefined) updateData.slow_queries = slow_queries;

            await base44.asServiceRole.entities.DatabaseCluster.update(cluster_id, updateData);

            return Response.json({ stats_updated: true });

        } else if (action === 'create_shard') {
            const { cluster_id, shard_key, shard_number, shard_range_start, shard_range_end, node_host, node_port } = await req.json();

            if (!cluster_id || !shard_key || shard_number === undefined) {
                return Response.json({ error: 'cluster_id, shard_key, shard_number required' }, { status: 400 });
            }

            const shard = await base44.asServiceRole.entities.ShardConfig.create({
                organization_id,
                cluster_id,
                shard_key,
                shard_number,
                shard_range_start: shard_range_start || '',
                shard_range_end: shard_range_end || '',
                node_host: node_host || '',
                node_port: node_port || 5432
            });

            return Response.json({ shard_created: true, shard_id: shard.id });

        } else if (action === 'get_shards') {
            const { cluster_id } = await req.json();

            let filter = { organization_id };
            if (cluster_id) filter.cluster_id = cluster_id;

            const shards = await base44.asServiceRole.entities.ShardConfig.filter(filter, 'shard_number');

            return Response.json({ shards });

        } else if (action === 'create_replication_node') {
            const { cluster_id, node_name, node_role, host, port } = await req.json();

            if (!cluster_id || !node_name || !node_role || !host || !port) {
                return Response.json({ error: 'cluster_id, node_name, node_role, host, port required' }, { status: 400 });
            }

            const node = await base44.asServiceRole.entities.ReplicationNode.create({
                organization_id,
                cluster_id,
                node_name,
                node_role,
                host,
                port,
                last_sync_at: new Date().toISOString()
            });

            return Response.json({ node_created: true, node_id: node.id });

        } else if (action === 'get_replication_nodes') {
            const { cluster_id } = await req.json();

            let filter = { organization_id };
            if (cluster_id) filter.cluster_id = cluster_id;

            const nodes = await base44.asServiceRole.entities.ReplicationNode.filter(filter);

            return Response.json({ nodes });

        } else if (action === 'update_node_health') {
            const { node_id, replication_lag_ms, cpu_usage, memory_usage, disk_usage } = await req.json();

            if (!node_id) {
                return Response.json({ error: 'node_id required' }, { status: 400 });
            }

            const updateData = {
                last_sync_at: new Date().toISOString()
            };

            if (replication_lag_ms !== undefined) updateData.replication_lag_ms = replication_lag_ms;
            if (cpu_usage !== undefined) updateData.cpu_usage = cpu_usage;
            if (memory_usage !== undefined) updateData.memory_usage = memory_usage;
            if (disk_usage !== undefined) updateData.disk_usage = disk_usage;

            // Determine health status based on lag
            if (replication_lag_ms !== undefined) {
                if (replication_lag_ms > 5000) {
                    updateData.health_status = 'lagging';
                } else {
                    updateData.health_status = 'healthy';
                }
            }

            await base44.asServiceRole.entities.ReplicationNode.update(node_id, updateData);

            return Response.json({ health_updated: true });

        } else if (action === 'get_dashboard_data') {
            const [clusters, shards, nodes] = await Promise.all([
                base44.asServiceRole.entities.DatabaseCluster.filter({ organization_id }),
                base44.asServiceRole.entities.ShardConfig.filter({ organization_id }),
                base44.asServiceRole.entities.ReplicationNode.filter({ organization_id })
            ]);

            const clustersByType = {};
            clusters.forEach(c => {
                clustersByType[c.cluster_type] = (clustersByType[c.cluster_type] || 0) + 1;
            });

            const nodesByRole = {};
            nodes.forEach(n => {
                nodesByRole[n.node_role] = (nodesByRole[n.node_role] || 0) + 1;
            });

            const stats = {
                total_clusters: clusters.length,
                healthy_clusters: clusters.filter(c => c.status === 'healthy').length,
                total_shards: shards.length,
                active_shards: shards.filter(s => s.status === 'active').length,
                total_nodes: nodes.length,
                healthy_nodes: nodes.filter(n => n.health_status === 'healthy').length,
                total_storage_gb: clusters.reduce((sum, c) => sum + (c.storage_size_gb || 0), 0),
                used_storage_gb: clusters.reduce((sum, c) => sum + (c.storage_used_gb || 0), 0),
                total_queries: clusters.reduce((sum, c) => sum + (c.total_queries || 0), 0),
                slow_queries: clusters.reduce((sum, c) => sum + (c.slow_queries || 0), 0)
            };

            return Response.json({
                clusters,
                shards,
                nodes,
                stats,
                clusters_by_type: clustersByType,
                nodes_by_role: nodesByRole
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Database management engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});