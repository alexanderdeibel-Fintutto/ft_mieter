import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, GitBranch, Activity, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ServiceMeshTracingDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('mesh');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('serviceMeshTracingEngine', {
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
        unhealthy: 'bg-red-100 text-red-800',
        initializing: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        error: 'bg-red-100 text-red-800',
        timeout: 'bg-orange-100 text-orange-800',
        ok: 'bg-green-100 text-green-800',
        internal: 'bg-blue-100 text-blue-800',
        server: 'bg-purple-100 text-purple-800',
        client: 'bg-cyan-100 text-cyan-800',
        producer: 'bg-orange-100 text-orange-800',
        consumer: 'bg-pink-100 text-pink-800',
        latency: 'bg-blue-100 text-blue-800',
        'error_rate': 'bg-red-100 text-red-800',
        throughput: 'bg-green-100 text-green-800',
        saturation: 'bg-orange-100 text-orange-800',
        availability: 'bg-purple-100 text-purple-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['mesh', 'traces', 'spans', 'metrics'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'mesh' && '🕸️ Mesh'}
                        {tab === 'traces' && '🔗 Traces'}
                        {tab === 'spans' && '📍 Spans'}
                        {tab === 'metrics' && '📊 Metriken'}
                    </button>
                ))}
            </div>

            {activeTab === 'mesh' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.mesh_stats.total_meshes}</div>
                            <div className="text-xs text-gray-600">Meshes</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.mesh_stats.healthy_meshes}</div>
                            <div className="text-xs text-gray-600">Gesund</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.mesh_stats.degraded_meshes}</div>
                            <div className="text-xs text-gray-600">Beeinträchtigt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.mesh_stats.unhealthy_meshes}</div>
                            <div className="text-xs text-gray-600">Unhealthy</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.mesh_stats.total_services}</div>
                            <div className="text-xs text-gray-600">Services</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.mesh_stats.healthy_services}</div>
                            <div className="text-xs text-gray-600">Gesund</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.meshes.map(mesh => (
                            <Card key={mesh.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Network className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{mesh.mesh_name}</h5>
                                                <Badge variant="outline" className="text-xs">
                                                    {mesh.mesh_type}
                                                </Badge>
                                                <Badge className={statusColors[mesh.status]}>
                                                    {mesh.status}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Namespace: {mesh.namespace}
                                                </span>
                                                <span className="text-gray-600">
                                                    Version: {mesh.version}
                                                </span>
                                                <span className="text-purple-600">
                                                    Services: {mesh.total_services}/{mesh.healthy_services}
                                                </span>
                                                {mesh.mtls_enabled && (
                                                    <Badge className="bg-green-100 text-green-800">
                                                        🔒 mTLS
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                {mesh.avg_latency_ms > 0 && (
                                                    <span className="text-blue-600">
                                                        Ø Latenz: {mesh.avg_latency_ms.toFixed(2)}ms
                                                    </span>
                                                )}
                                                {mesh.error_rate > 0 && (
                                                    <span className="text-red-600">
                                                        Fehlerquote: {mesh.error_rate.toFixed(2)}%
                                                    </span>
                                                )}
                                                {mesh.throughput_rps > 0 && (
                                                    <span className="text-green-600">
                                                        Throughput: {mesh.throughput_rps.toFixed(0)} req/s
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'traces' && (
                <>
                    <div className="grid grid-cols-5 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.trace_stats.total_traces}</div>
                            <div className="text-xs text-gray-600">Traces</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.trace_stats.successful_traces}</div>
                            <div className="text-xs text-gray-600">Erfolgreich</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.trace_stats.error_traces}</div>
                            <div className="text-xs text-gray-600">Fehler</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.trace_stats.timeout_traces}</div>
                            <div className="text-xs text-gray-600">Timeouts</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.trace_stats.avg_duration_ms}ms</div>
                            <div className="text-xs text-gray-600">Ø Dauer</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.traces.map(trace => (
                            <Card key={trace.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <GitBranch className="w-4 h-4 text-gray-600" />
                                                <span className="text-xs font-mono text-gray-600">
                                                    {trace.trace_id?.substring(0, 12)}
                                                </span>
                                                <h5 className="font-semibold text-sm">{trace.operation_name}</h5>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Service: {trace.service_name}
                                                </span>
                                                <span className="text-purple-600">
                                                    Spans: {trace.total_spans}
                                                </span>
                                                <span className="text-blue-600">
                                                    Dauer: {trace.duration_ms.toFixed(2)}ms
                                                </span>
                                                {trace.services_involved && trace.services_involved.length > 0 && (
                                                    <span className="text-gray-600">
                                                        Services: {trace.services_involved.slice(0, 2).join(', ')}
                                                        {trace.services_involved.length > 2 ? '...' : ''}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                {new Date(trace.start_time).toLocaleString('de-DE')}
                                            </span>
                                        </div>
                                        <Badge className={statusColors[trace.trace_status]}>
                                            {trace.trace_status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'spans' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.span_stats.total_spans}</div>
                            <div className="text-xs text-gray-600">Spans</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.span_stats.ok_spans}</div>
                            <div className="text-xs text-gray-600">OK</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.span_stats.error_spans}</div>
                            <div className="text-xs text-gray-600">Error</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Typ</h4>
                            {Object.entries(data.span_stats.by_kind || {}).slice(0, 3).map(([kind, count]) => (
                                <div key={kind} className="text-xs flex justify-between">
                                    <span>{kind}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.spans.map(span => (
                            <Card key={span.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-gray-600" />
                                                <Badge className={statusColors[span.span_kind]}>
                                                    {span.span_kind}
                                                </Badge>
                                                <h5 className="font-semibold text-sm">{span.operation_name}</h5>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Service: {span.service_name}
                                                </span>
                                                <span className="text-blue-600">
                                                    Dauer: {span.duration_ms.toFixed(2)}ms
                                                </span>
                                                {span.parent_span_id && (
                                                    <span className="text-gray-600 font-mono">
                                                        Parent: {span.parent_span_id.substring(0, 8)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={statusColors[span.status]}>
                                            {span.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'metrics' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        {Object.entries(data.metric_stats || {}).map(([type, stats]) => (
                            <Card key={type}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="text-lg font-bold text-blue-600">{stats.count}</div>
                                            <div className="text-xs text-gray-600 capitalize">{type}</div>
                                            <div className="text-xs text-purple-600 mt-1">
                                                Ø: {stats.avg}
                                            </div>
                                        </div>
                                        <TrendingUp className="w-5 h-5 text-blue-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.anomaly_count}</div>
                            <div className="text-xs text-gray-600">Anomalien</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.metrics.slice(0, 30).map(metric => (
                            <Card key={metric.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-gray-600" />
                                                <Badge className={statusColors[metric.metric_type]}>
                                                    {metric.metric_type}
                                                </Badge>
                                                <h5 className="font-semibold text-sm">{metric.metric_name}</h5>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Service: {metric.service_name}
                                                </span>
                                                <span className="text-purple-600 font-semibold">
                                                    {metric.value} {metric.unit}
                                                </span>
                                                {metric.percentile && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {metric.percentile}
                                                    </Badge>
                                                )}
                                                {metric.baseline_value && (
                                                    <span className="text-blue-600">
                                                        Baseline: {metric.baseline_value} {metric.unit}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {metric.is_anomaly && (
                                            <Badge className="bg-red-100 text-red-800">
                                                ⚠️ Anomalie
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}