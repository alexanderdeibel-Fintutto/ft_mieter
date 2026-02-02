import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Gauge, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function MetricsPerformanceDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('metrics');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('metricsPerformanceEngine', {
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
        normal: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        critical: 'bg-red-100 text-red-800',
        summary: 'bg-blue-100 text-blue-800',
        detailed: 'bg-indigo-100 text-indigo-800',
        trend: 'bg-purple-100 text-purple-800',
        comparison: 'bg-pink-100 text-pink-800',
        draft: 'bg-gray-100 text-gray-800',
        published: 'bg-green-100 text-green-800',
        archived: 'bg-gray-100 text-gray-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['metrics', 'aggregations', 'reports'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'metrics' && '📊 Metriken'}
                        {tab === 'aggregations' && '📈 Aggregationen'}
                        {tab === 'reports' && '📋 Reports'}
                    </button>
                ))}
            </div>

            {activeTab === 'metrics' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_metrics}</div>
                            <div className="text-xs text-gray-600">Metriken</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.normal_metrics}</div>
                            <div className="text-xs text-gray-600">Normal</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.stats.warning_metrics}</div>
                            <div className="text-xs text-gray-600">Warnung</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.critical_metrics}</div>
                            <div className="text-xs text-gray-600">Kritisch</div>
                        </CardContent></Card>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-sm mb-3">Nach Typ</h4>
                            <div className="space-y-2">
                                {Object.entries(data.metrics_by_type || {}).map(([type, count]) => (
                                    <div key={type} className="flex items-center justify-between">
                                        <Badge className={statusColors[type] || 'bg-gray-100 text-gray-800'}>{type}</Badge>
                                        <span className="text-sm font-semibold">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent></Card>

                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-sm mb-3">Nach Status</h4>
                            <div className="space-y-2">
                                {Object.entries(data.metrics_by_status || {}).map(([status, count]) => (
                                    <div key={status} className="flex items-center justify-between">
                                        <Badge className={statusColors[status]}>{status}</Badge>
                                        <span className="text-sm font-semibold">{count}</span>
                                    </div>
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
                                                <Gauge className="w-4 h-4 text-gray-600" />
                                                <span className="font-semibold text-sm">{metric.metric_name}</span>
                                                <Badge variant="outline">{metric.metric_type}</Badge>
                                                {metric.component && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {metric.component}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-sm font-bold text-gray-900">
                                                    {metric.value} {metric.unit}
                                                </span>
                                                {metric.threshold_warning > 0 && (
                                                    <span className="text-xs text-yellow-600">
                                                        Warn: {metric.threshold_warning}
                                                    </span>
                                                )}
                                                {metric.threshold_critical > 0 && (
                                                    <span className="text-xs text-red-600">
                                                        Crit: {metric.threshold_critical}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                {new Date(metric.timestamp).toLocaleString('de-DE')}
                                            </span>
                                        </div>
                                        <Badge className={statusColors[metric.status]}>
                                            {metric.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'aggregations' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_aggregations}</div>
                            <div className="text-xs text-gray-600">Aggregationen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.stats.anomalies_detected}</div>
                            <div className="text-xs text-gray-600">Anomalien</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.unique_components}</div>
                            <div className="text-xs text-gray-600">Komponenten</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-indigo-600">{data.stats.avg_value}</div>
                            <div className="text-xs text-gray-600">Ø Wert</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.aggregations.map(agg => (
                            <Card key={agg.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <BarChart3 className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{agg.metric_name}</h5>
                                                <Badge variant="outline">{agg.period_type}</Badge>
                                                {agg.anomaly_detected && (
                                                    <Badge className="bg-orange-100 text-orange-800">⚠️ Anomalie</Badge>
                                                )}
                                            </div>
                                            {agg.component && (
                                                <p className="text-xs text-gray-600 mt-1">Component: {agg.component}</p>
                                            )}
                                            <div className="flex gap-4 mt-2 flex-wrap">
                                                <span className="text-xs text-gray-600">Min: {agg.value_min}</span>
                                                <span className="text-xs text-gray-600">Max: {agg.value_max}</span>
                                                <span className="text-xs text-gray-600">Avg: {agg.value_avg}</span>
                                                <span className="text-xs text-gray-600">P50: {agg.value_p50}</span>
                                                <span className="text-xs text-gray-600">P95: {agg.value_p95}</span>
                                                <span className="text-xs text-gray-600">P99: {agg.value_p99}</span>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Samples: {agg.sample_count}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                {new Date(agg.period_start).toLocaleString('de-DE')} - {new Date(agg.period_end).toLocaleString('de-DE')}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'reports' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_reports}</div>
                            <div className="text-xs text-gray-600">Reports</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.published_reports}</div>
                            <div className="text-xs text-gray-600">Veröffentlicht</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Durchschn. Score</div>
                            <div className="text-2xl font-bold text-purple-600">
                                {data.reports.length > 0
                                    ? Math.round(data.reports.reduce((sum, r) => sum + (r.overall_score || 0), 0) / data.reports.length)
                                    : 0}
                            </div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-indigo-600">{data.stats.total_reports}</div>
                            <div className="text-xs text-gray-600">Gesamt</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.reports.map(report => (
                            <Card key={report.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{report.report_name}</h5>
                                                <Badge className={statusColors[report.report_type]}>
                                                    {report.report_type}
                                                </Badge>
                                            </div>
                                            {report.key_findings && report.key_findings.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-700 font-semibold mb-1">Erkenntnisse:</p>
                                                    <div className="space-y-1">
                                                        {report.key_findings.slice(0, 2).map((finding, idx) => (
                                                            <div key={idx} className="text-xs text-gray-700">
                                                                • {finding}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {report.recommendations && report.recommendations.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-700 font-semibold mb-1">Empfehlungen:</p>
                                                    <div className="space-y-1">
                                                        {report.recommendations.slice(0, 2).map((rec, idx) => (
                                                            <div key={idx} className="text-xs text-gray-700">
                                                                • {rec}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                Erstellt: {new Date(report.generated_at).toLocaleString('de-DE')}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-purple-600 mb-1">
                                                {report.overall_score || 0}
                                            </div>
                                            <Badge className={statusColors[report.status]}>
                                                {report.status}
                                            </Badge>
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