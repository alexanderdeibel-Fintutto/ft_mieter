import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, MapPin, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function CDNEdgeDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('providers');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('cdnEdgeEngine', {
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
        cached: 'bg-green-100 text-green-800',
        stale: 'bg-yellow-100 text-yellow-800',
        purged: 'bg-gray-100 text-gray-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['providers', 'nodes', 'cache'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'providers' && '☁️ Providers'}
                        {tab === 'nodes' && '🌍 Edge Nodes'}
                        {tab === 'cache' && '💾 Cache'}
                    </button>
                ))}
            </div>

            {activeTab === 'providers' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_providers}</div>
                            <div className="text-xs text-gray-600">Providers</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.total_requests}</div>
                            <div className="text-xs text-gray-600">Requests</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.cache_hit_rate}%</div>
                            <div className="text-xs text-gray-600">Cache Hit Rate</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_bandwidth_gb.toFixed(2)} GB</div>
                            <div className="text-xs text-gray-600">Bandwidth</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.providers.map(provider => {
                            const hitRate = provider.total_requests > 0
                                ? Math.round((provider.cache_hits / provider.total_requests) * 100)
                                : 0;

                            return (
                                <Card key={provider.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Cloud className="w-4 h-4 text-blue-600" />
                                                    <h5 className="font-semibold text-sm">{provider.provider_name}</h5>
                                                    <Badge variant="outline">{provider.provider_type}</Badge>
                                                </div>
                                                {provider.api_endpoint && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        API: {provider.api_endpoint}
                                                    </p>
                                                )}
                                                {provider.regions.length > 0 && (
                                                    <div className="flex gap-1 mt-2 flex-wrap">
                                                        {provider.regions.slice(0, 5).map((region, idx) => (
                                                            <Badge key={idx} variant="outline" className="text-xs">
                                                                {region}
                                                            </Badge>
                                                        ))}
                                                        {provider.regions.length > 5 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{provider.regions.length - 5}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Requests: {provider.total_requests || 0}
                                                    </span>
                                                    <span className="text-xs text-green-600">
                                                        Hits: {provider.cache_hits || 0} ({hitRate}%)
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Bandwidth: {(provider.bandwidth_gb || 0).toFixed(2)} GB
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge className={provider.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                {provider.is_active ? 'aktiv' : 'inaktiv'}
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
                            <div className="text-xs text-gray-600">Edge Nodes</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.healthy_nodes}</div>
                            <div className="text-xs text-gray-600">Healthy</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">
                                {data.nodes.filter(n => n.health_status === 'degraded').length}
                            </div>
                            <div className="text-xs text-gray-600">Degraded</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Status</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.nodes_by_status || {}).map(([status, count]) => (
                                    <Badge key={status} className={statusColors[status]}>
                                        {status}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.nodes.map(node => {
                            const provider = data.providers.find(p => p.id === node.provider_id);
                            return (
                                <Card key={node.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-blue-600" />
                                                    <span className="font-semibold text-sm">{node.node_name}</span>
                                                    <Badge variant="outline">{node.location}</Badge>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Provider: {provider?.provider_name || 'Unknown'}
                                                </p>
                                                {node.country_code && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Land: {node.country_code}
                                                    </p>
                                                )}
                                                <div className="flex gap-4 mt-2">
                                                    {node.capacity_gbps && (
                                                        <span className="text-xs text-gray-600">
                                                            Kapazität: {node.capacity_gbps} Gbps
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-600">
                                                        Requests: {node.request_count || 0}
                                                    </span>
                                                </div>
                                                {(node.cpu_usage || node.memory_usage) && (
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

            {activeTab === 'cache' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_cached_items}</div>
                            <div className="text-xs text-gray-600">Cached Items</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.total_cache_hits}</div>
                            <div className="text-xs text-gray-600">Cache Hits</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.cache_hit_rate}%</div>
                            <div className="text-xs text-gray-600">Hit Rate</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Nach Typ</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.contents_by_type || {}).map(([type, count]) => (
                                    <Badge key={type} variant="outline">
                                        {type}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.contents.map(content => {
                            const provider = data.providers.find(p => p.id === content.provider_id);
                            return (
                                <Card key={content.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-blue-600" />
                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                        {content.content_key.length > 50 
                                                            ? content.content_key.substring(0, 50) + '...'
                                                            : content.content_key}
                                                    </code>
                                                    <Badge variant="outline">{content.content_type}</Badge>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Provider: {provider?.provider_name || 'Unknown'}
                                                </p>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Größe: {(content.size_bytes / 1024).toFixed(2)} KB
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        TTL: {content.ttl_seconds}s
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Hits: {content.hit_count || 0}
                                                    </span>
                                                </div>
                                                {content.cached_at && (
                                                    <span className="text-xs text-gray-600 mt-2 inline-block">
                                                        Cached: {new Date(content.cached_at).toLocaleString('de-DE')}
                                                    </span>
                                                )}
                                            </div>
                                            <Badge className={statusColors[content.cache_status]}>
                                                {content.cache_status}
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