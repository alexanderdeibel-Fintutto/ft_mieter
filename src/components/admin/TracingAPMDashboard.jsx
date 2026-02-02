import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Layers, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function TracingAPMDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('traces');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('tracingAPMEngine', {
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
        success: 'bg-green-100 text-green-800',
        error: 'bg-red-100 text-red-800',
        timeout: 'bg-orange-100 text-orange-800',
        ok: 'bg-green-100 text-green-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['traces', 'spans', 'metrics'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'traces' && '🔍 Traces'}
                        {tab === 'spans' && '📊 Spans'}
                        {tab === 'metrics' && '📈 Metrics'}
                    </button>
                ))}
            </div>

            {activeTab === 'traces' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_traces}</div>
                            <div className="text-xs text-gray-600">Traces</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.total_services}</div>
                            <div className="text-xs text-gray-600">Services</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.avg_duration_ms}ms</div>
                            <div className="text-xs text-gray-600">Ø Dauer</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.error_rate}%</div>
                            <div className="text-xs text-gray-600">Error Rate</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.traces.map(trace => (
                            <Card key={trace.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{trace.operation_name}</h5>
                                                <Badge variant="outline">{trace.service_name}</Badge>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Trace ID: {trace.trace_id.substring(0, 16)}...
                                            </p>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Spans: {trace.span_count || 0}
                                                </span>
                                                {trace.duration_ms && (
                                                    <span className="text-xs text-gray-600">
                                                        Dauer: {trace.duration_ms}ms
                                                    </span>
                                                )}
                                                {trace.error_count > 0 && (
                                                    <span className="text-xs text-red-600">
                                                        Fehler: {trace.error_count}
                                                    </span>
                                                )}
                                            </div>
                                            {Object.keys(trace.tags || {}).length > 0 && (
                                                <div className="flex gap-1 mt-2 flex-wrap">
                                                    {Object.entries(trace.tags).slice(0, 3).map(([key, value]) => (
                                                        <Badge key={key} variant="outline" className="text-xs">
                                                            {key}: {value}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                Start: {new Date(trace.started_at).toLocaleString('de-DE')}
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
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_spans}</div>
                            <div className="text-xs text-gray-600">Spans</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.spans.filter(s => s.status === 'ok').length}
                            </div>
                            <div className="text-xs text-gray-600">Erfolg</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">
                                {data.spans.filter(s => s.status === 'error').length}
                            </div>
                            <div className="text-xs text-gray-600">Fehler</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Nach Typ</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.spans_by_type || {}).map(([type, count]) => (
                                    <Badge key={type} variant="outline">
                                        {type}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.spans.map(span => (
                            <Card key={span.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-blue-600" />
                                                <span className="font-semibold text-sm">{span.span_name}</span>
                                                <Badge variant="outline">{span.span_type}</Badge>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Service: {span.service_name}
                                            </p>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Span ID: {span.span_id.substring(0, 8)}...
                                                </span>
                                                {span.parent_span_id && (
                                                    <span className="text-xs text-gray-600">
                                                        Parent: {span.parent_span_id.substring(0, 8)}...
                                                    </span>
                                                )}
                                            </div>
                                            {span.duration_ms && (
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    Dauer: {span.duration_ms}ms
                                                </span>
                                            )}
                                            {span.error_message && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    Error: {span.error_message}
                                                </p>
                                            )}
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
                    <div className="grid grid-cols-3 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_metrics}</div>
                            <div className="text-xs text-gray-600">Metriken</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.total_services}</div>
                            <div className="text-xs text-gray-600">Services</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Nach Typ</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.metrics_by_type || {}).map(([type, count]) => (
                                    <Badge key={type} variant="outline">
                                        {type}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.metrics.map(metric => (
                            <Card key={metric.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-blue-600" />
                                                <span className="font-semibold text-sm">{metric.metric_name}</span>
                                                <Badge variant="outline">{metric.metric_type}</Badge>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Service: {metric.service_name}
                                            </p>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-blue-600 font-semibold">
                                                    Wert: {metric.value} {metric.unit}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Aggregation: {metric.aggregation}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Intervall: {metric.interval_seconds}s
                                                </span>
                                            </div>
                                            {Object.keys(metric.dimensions || {}).length > 0 && (
                                                <div className="flex gap-1 mt-2 flex-wrap">
                                                    {Object.entries(metric.dimensions).slice(0, 3).map(([key, value]) => (
                                                        <Badge key={key} variant="outline" className="text-xs">
                                                            {key}: {value}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                {new Date(metric.timestamp).toLocaleString('de-DE')}
                                            </span>
                                        </div>
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