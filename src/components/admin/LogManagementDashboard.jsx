import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, BarChart3, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function LogManagementDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('logs');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('logManagementEngine', {
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

    const levelColors = {
        debug: 'bg-gray-100 text-gray-800',
        info: 'bg-blue-100 text-blue-800',
        warn: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
        fatal: 'bg-orange-100 text-orange-800',
        pending: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        anomaly: 'bg-purple-100 text-purple-800',
        pattern: 'bg-blue-100 text-blue-800',
        trend: 'bg-indigo-100 text-indigo-800',
        correlation: 'bg-pink-100 text-pink-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['logs', 'aggregations', 'analyses'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'logs' && '📝 Logs'}
                        {tab === 'aggregations' && '📊 Aggregationen'}
                        {tab === 'analyses' && '🔍 Analysen'}
                    </button>
                ))}
            </div>

            {activeTab === 'logs' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_logs}</div>
                            <div className="text-xs text-gray-600">Logs</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.error_logs}</div>
                            <div className="text-xs text-gray-600">Fehler</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.stats.warn_logs}</div>
                            <div className="text-xs text-gray-600">Warnungen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.avg_duration}ms</div>
                            <div className="text-xs text-gray-600">Ø Dauer</div>
                        </CardContent></Card>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-sm mb-3">Nach Level</h4>
                            <div className="space-y-2">
                                {Object.entries(data.logs_by_level || {}).map(([level, count]) => (
                                    <div key={level} className="flex items-center justify-between">
                                        <Badge className={levelColors[level]}>{level}</Badge>
                                        <span className="text-sm font-semibold">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent></Card>

                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-sm mb-3">Top Quellen</h4>
                            <div className="space-y-2">
                                {Object.entries(data.logs_by_source || {})
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 5)
                                    .map(([source, count]) => (
                                        <div key={source} className="flex items-center justify-between">
                                            <span className="text-sm truncate">{source}</span>
                                            <Badge variant="outline">{count}</Badge>
                                        </div>
                                    ))
                                }
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.logs.map(log => (
                            <Card key={log.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-gray-600" />
                                                <Badge className={levelColors[log.log_level]}>
                                                    {log.log_level}
                                                </Badge>
                                                <span className="text-xs font-semibold text-gray-700">{log.source}</span>
                                            </div>
                                            <p className="text-sm text-gray-800 mt-1">{log.message}</p>
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                {log.duration_ms && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {log.duration_ms}ms
                                                    </Badge>
                                                )}
                                                {log.request_id && (
                                                    <Badge variant="outline" className="text-xs">
                                                        req: {log.request_id.substring(0, 8)}...
                                                    </Badge>
                                                )}
                                                {log.tags && log.tags.map(tag => (
                                                    <Badge key={tag} variant="outline" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                {new Date(log.timestamp).toLocaleString('de-DE')}
                                            </span>
                                        </div>
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
                            <div className="text-2xl font-bold text-green-600">{data.stats.unique_sources}</div>
                            <div className="text-xs text-gray-600">Quellen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Ø Fehlerrate</div>
                            <div className="space-y-1">
                                {data.aggregations.slice(0, 1).map(agg => (
                                    <span key={agg.id} className="text-2xl font-bold text-red-600">
                                        {agg.error_rate ? agg.error_rate.toFixed(2) : 0}%
                                    </span>
                                ))}
                            </div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.aggregations.reduce((sum, a) => sum + (a.total_logs || 0), 0)}
                            </div>
                            <div className="text-xs text-gray-600">Aggregierte Logs</div>
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
                                                <h5 className="font-semibold text-sm">{agg.source}</h5>
                                                <Badge variant="outline">{agg.aggregation_type}</Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Logs: {agg.total_logs}
                                                </span>
                                                <span className="text-xs text-red-600">
                                                    Fehler: {agg.error_count}
                                                </span>
                                                <span className="text-xs text-yellow-600">
                                                    Warn: {agg.warn_count}
                                                </span>
                                                <span className="text-xs text-blue-600">
                                                    Info: {agg.info_count}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Ø Dauer: {agg.avg_duration_ms || 0}ms
                                                </span>
                                                <span className="text-xs text-red-600">
                                                    Fehlerrate: {agg.error_rate ? agg.error_rate.toFixed(2) : 0}%
                                                </span>
                                            </div>
                                            {agg.top_errors && agg.top_errors.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-700 font-semibold mb-1">Top Fehler:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {agg.top_errors.slice(0, 3).map((err, idx) => (
                                                            <Badge key={idx} className="bg-red-100 text-red-800 text-xs">
                                                                {err}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
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

            {activeTab === 'analyses' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_analyses}</div>
                            <div className="text-xs text-gray-600">Analysen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.stats.pending_analyses}</div>
                            <div className="text-xs text-gray-600">Ausstehend</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.analyses.filter(a => a.status === 'completed').length}
                            </div>
                            <div className="text-xs text-gray-600">Abgeschlossen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">
                                {data.analyses.filter(a => a.status === 'failed').length}
                            </div>
                            <div className="text-xs text-gray-600">Fehler</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.analyses.map(analysis => (
                            <Card key={analysis.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{analysis.analysis_name}</h5>
                                                <Badge className={levelColors[analysis.analysis_type]}>
                                                    {analysis.analysis_type}
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-gray-600 mt-1 inline-block">
                                                Gestartet: {new Date(analysis.started_at).toLocaleString('de-DE')}
                                            </span>
                                            {analysis.completed_at && (
                                                <span className="text-xs text-gray-600 ml-4 inline-block">
                                                    Abgeschlossen: {new Date(analysis.completed_at).toLocaleString('de-DE')}
                                                </span>
                                            )}
                                            {analysis.insights && analysis.insights.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-700 font-semibold mb-1">Insights:</p>
                                                    <div className="space-y-1">
                                                        {analysis.insights.map((insight, idx) => (
                                                            <div key={idx} className="text-xs text-gray-700">
                                                                • {insight}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <Badge className={levelColors[analysis.status]}>
                                            {analysis.status}
                                        </Badge>
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