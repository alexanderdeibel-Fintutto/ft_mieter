import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, HardDrive, Server } from 'lucide-react';
import { toast } from 'sonner';

export default function DatabaseManagementDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('clusters');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('databaseManagementEngine', {
                action: 'get_dashboard_data',
                organization_id: organizationId
            });
            setData(res.data);
        } catch (error) {
            console.error('Load error:', error);
            toast.error('Fehler beim Laden');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    const statusColors = {
        healthy: 'bg-green-100 text-green-800',
        degraded: 'bg-yellow-100 text-yellow-800',
        offline: 'bg-red-100 text-red-800',
        maintenance: 'bg-blue-100 text-blue-800',
        lagging: 'bg-yellow-100 text-yellow-800',
        active: 'bg-green-100 text-green-800',
        draining: 'bg-yellow-100 text-yellow-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['clusters', 'shards', 'nodes'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'clusters' && '💾 Clusters'}
                        {tab === 'shards' && '🔀 Shards'}
                        {tab === 'nodes' && '🖥️ Nodes'}
                    </button>
                ))}
            </div>

            {activeTab === 'clusters' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_clusters}</div>
                            <div className="text-xs text-gray-600">Clusters</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.healthy_clusters}</div>
                            <div className="text-xs text-gray-600">Healthy</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.stats.used_storage_gb.toFixed(1)}/{data.stats.total_storage_gb} GB
                            </div>
                            <div className="text-xs text-gray-600">Storage</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_queries}</div>
                            <div className="text-xs text-gray-600">Queries</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.clusters.map(cluster => {
                            const storagePercent = cluster.storage_size_gb > 0
                                ? Math.round((cluster.storage_used_gb / cluster.storage_size_gb) * 100)
                                : 0;
                            const slowQueryRate = cluster.total_queries > 0
                                ? ((cluster.slow_queries / cluster.total_queries) * 100).toFixed(2)
                                : 0;

                            return (
                                <Card key={cluster.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Database className="w-4 h-4 text-blue-600" />
                                                    <h5 className="font-semibold text-sm">{cluster.cluster_name}</h5>
                                                    <Badge variant="outline">{cluster.cluster_type}</Badge>
                                                    <Badge variant="outline">{cluster.cluster_mode}</Badge>
                                                </div>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Max Connections: {cluster.max_connections}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Storage: {(cluster.storage_used_gb || 0).toFixed(1)}/{cluster.storage_size_gb} GB ({storagePercent}%)
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                    <div
                                                        className={`h-2 rounded-full ${storagePercent > 90 ? 'bg-red-600' : storagePercent > 75 ? 'bg-yellow-600' : 'bg-green-600'}`}
                                                        style={{ width: `${storagePercent}%` }}
                                                    />
                                                </div>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Queries: {cluster.total_queries || 0}
                                                    </span>
                                                    <span className="text-xs text-red-600">
                                                        Slow: {cluster.slow_queries || 0} ({slowQueryRate}%)
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge className={statusColors[cluster.status]}>
                                                {cluster.status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {activeTab === 'shards' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_shards}</div>
                            <div className="text-xs text-gray-600">Shards</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_shards}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.shards.reduce((sum, s) => sum + (s.record_count || 0), 0)}
                            </div>
                            <div className="text-xs text-gray-600">Records gesamt</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.shards.map(shard => {
                            const cluster = data.clusters.find(c => c.id === shard.cluster_id);
                            return (
                                <Card key={shard.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <HardDrive className="w-4 h-4 text-blue-600" />
                                                    <span className="font-semibold text-sm">Shard #{shard.shard_number}</span>
                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                        {shard.shard_key}
                                                    </code>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Cluster: {cluster?.cluster_name || 'Unknown'}
                                                </p>
                                                <div className="flex gap-4 mt-2">
                                                    {shard.node_host && (
                                                        <span className="text-xs text-gray-600">
                                                            Node: {shard.node_host}:{shard.node_port}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-600">
                                                        Records: {shard.record_count || 0}
                                                    </span>
                                                    {shard.data_size_mb && (
                                                        <span className="text-xs text-gray-600">
                                                            Größe: {shard.data_size_mb.toFixed(1)} MB
                                                        </span>
                                                    )}
                                                </div>
                                                {shard.shard_range_start && (
                                                    <div className="mt-2">
                                                        <span className="text-xs text-gray-600">
                                                            Range: {shard.shard_range_start} - {shard.shard_range_end}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <Badge className={statusColors[shard.status]}>
                                                {shard.status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {activeTab === 'nodes' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_nodes}</div>
                            <div className="text-xs text-gray-600">Nodes</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.healthy_nodes}</div>
                            <div className="text-xs text-gray-600">Healthy</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Nach Rolle</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.nodes_by_role || {}).map(([role, count]) => (
                                    <Badge key={role} variant="outline">
                                        {role}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">
                                {data.nodes.filter(n => n.health_status === 'lagging').length}
                            </div>
                            <div className="text-xs text-gray-600">Lagging</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.nodes.map(node => {
                            const cluster = data.clusters.find(c => c.id === node.cluster_id);
                            return (
                                <Card key={node.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Server className="w-4 h-4 text-blue-600" />
                                                    <span className="font-semibold text-sm">{node.node_name}</span>
                                                    <Badge variant="outline">{node.node_role}</Badge>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Cluster: {cluster?.cluster_name || 'Unknown'}
                                                </p>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        {node.host}:{node.port}
                                                    </span>
                                                    {node.replication_lag_ms !== undefined && (
                                                        <span className={`text-xs ${node.replication_lag_ms > 1000 ? 'text-red-600' : 'text-green-600'}`}>
                                                            Lag: {node.replication_lag_ms}ms
                                                        </span>
                                                    )}
                                                    {node.last_sync_at && (
                                                        <span className="text-xs text-gray-600">
                                                            Sync: {new Date(node.last_sync_at).toLocaleTimeString('de-DE')}
                                                        </span>
                                                    )}
                                                </div>
                                                {(node.cpu_usage || node.memory_usage || node.disk_usage) && (
                                                    <div className="flex gap-4 mt-2">
                                                        {node.cpu_usage !== undefined && (
                                                            <span className="text-xs text-gray-600">
                                                                CPU: {node.cpu_usage.toFixed(1)}%
                                                            </span>
                                                        )}
                                                        {node.memory_usage !== undefined && (
                                                            <span className="text-xs text-gray-600">
                                                                Memory: {node.memory_usage.toFixed(1)}%
                                                            </span>
                                                        )}
                                                        {node.disk_usage !== undefined && (
                                                            <span className="text-xs text-gray-600">
                                                                Disk: {node.disk_usage.toFixed(1)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <Badge className={statusColors[node.health_status]}>
                                                {node.health_status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}