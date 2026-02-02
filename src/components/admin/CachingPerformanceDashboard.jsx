import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Database, TrendingUp, Gauge } from 'lucide-react';
import { toast } from 'sonner';

export default function CachingPerformanceDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('strategies');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('cachingPerformanceEngine', {
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
        redis: 'bg-red-100 text-red-800',
        memcached: 'bg-blue-100 text-blue-800',
        cloudflare: 'bg-orange-100 text-orange-800',
        cdn: 'bg-purple-100 text-purple-800',
        browser: 'bg-cyan-100 text-cyan-800',
        database: 'bg-green-100 text-green-800',
        custom: 'bg-gray-100 text-gray-800',
        low: 'bg-blue-100 text-blue-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        critical: 'bg-red-100 text-red-800',
        proposed: 'bg-gray-100 text-gray-800',
        'in_progress': 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        rolled_back: 'bg-red-100 text-red-800',
        monitoring: 'bg-purple-100 text-purple-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['strategies', 'metrics', 'optimizations'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'strategies' && '⚙️ Strategien'}
                        {tab === 'metrics' && '📊 Metriken'}
                        {tab === 'optimizations' && '🚀 Optimierungen'}
                    </button>
                ))}
            </div>

            {activeTab === 'strategies' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.strategy_stats.total_strategies}</div>
                            <div className="text-xs text-gray-600">Strategien</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.strategy_stats.active_strategies}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Typ</h4>
                            {Object.entries(data.strategy_stats.by_type || {}).slice(0, 2).map(([type, count]) => (
                                <div key={type} className="text-xs flex justify-between">
                                    <span>{type}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </Card></CardContent>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Priorität</h4>
                            {Object.entries(data.strategy_stats.by_priority || {}).slice(0, 2).map(([pri, count]) => (
                                <div key={pri} className="text-xs flex justify-between">
                                    <span className="capitalize">{pri}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </Card></CardContent>
                    </div>

                    <div className="space-y-2">
                        {data.strategies.map(strategy => (
                            <Card key={strategy.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Database className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{strategy.strategy_name}</h5>
                                                <Badge className={statusColors[strategy.cache_type]}>
                                                    {strategy.cache_type}
                                                </Badge>
                                                <Badge className={statusColors[strategy.priority]}>
                                                    {strategy.priority}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Ressource: {strategy.target_resource}
                                                </span>
                                                <span className="text-blue-600">
                                                    TTL: {strategy.ttl_seconds}s
                                                </span>
                                                <span className="text-purple-600">
                                                    Max: {strategy.max_size_mb}MB
                                                </span>
                                                <span className="text-cyan-600">
                                                    Eviction: {strategy.eviction_policy}
                                                </span>
                                                {strategy.compression_enabled && (
                                                    <Badge className="bg-green-100 text-green-800">
                                                        🗜️ Kompression
                                                    </Badge>
                                                )}
                                                {strategy.encryption_enabled && (
                                                    <Badge className="bg-green-100 text-green-800">
                                                        🔒 Verschlüsselung
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={strategy.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {strategy.is_active ? 'Aktiv' : 'Inaktiv'}
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
                    <div className="grid grid-cols-5 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.metric_stats.total_metrics}</div>
                            <div className="text-xs text-gray-600">Metriken</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.metric_stats.avg_hit_rate}%</div>
                            <div className="text-xs text-gray-600">Ø Hit-Rate</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.metric_stats.avg_response_time_ms}ms</div>
                            <div className="text-xs text-gray-600">Ø Response-Zeit</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-cyan-600">{data.metric_stats.total_bandwidth_saved_mb}</div>
                            <div className="text-xs text-gray-600">Bandbreite gespart</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Cache-Typen</h4>
                            {Object.keys(data.metric_stats.cache_types || {}).slice(0, 3).map(type => (
                                <div key={type} className="text-xs flex justify-between">
                                    <span>{type}</span>
                                    <span className="font-bold">{data.metric_stats.cache_types[type].count}</span>
                                </div>
                            ))}
                        </Card></CardContent>
                    </div>

                    <div className="space-y-2">
                        {data.metrics.slice(0, 30).map(metric => (
                            <Card key={metric.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Gauge className="w-4 h-4 text-gray-600" />
                                                <Badge className={statusColors[metric.cache_type]}>
                                                    {metric.cache_type}
                                                </Badge>
                                                <span className="text-sm font-semibold">{metric.metric_id?.substring(0, 8)}</span>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Anfragen: {metric.total_requests}
                                                </span>
                                                <span className="text-green-600">
                                                    Treffer: {metric.cache_hits}
                                                </span>
                                                <span className="text-red-600">
                                                    Fehltreff: {metric.cache_misses}
                                                </span>
                                                <span className="text-purple-600 font-bold">
                                                    Hit-Rate: {metric.hit_rate}%
                                                </span>
                                                <span className="text-blue-600">
                                                    Response: {metric.avg_response_time_ms.toFixed(2)}ms
                                                </span>
                                                <span className="text-cyan-600">
                                                    Size: {metric.cache_size_mb.toFixed(2)}MB
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'optimizations' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.optimization_stats.total_optimizations}</div>
                            <div className="text-xs text-gray-600">Gesamt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-gray-600">{data.optimization_stats.proposed}</div>
                            <div className="text-xs text-gray-600">Vorgeschlagen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.optimization_stats.in_progress}</div>
                            <div className="text-xs text-gray-600">In Arbeit</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.optimization_stats.completed}</div>
                            <div className="text-xs text-gray-600">Abgeschlossen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.optimization_stats.avg_actual_improvement || 0}%
                            </div>
                            <div className="text-xs text-gray-600">Ø Verbesserung</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Typ</h4>
                            {Object.entries(data.optimization_stats.by_type || {}).slice(0, 3).map(([type, count]) => (
                                <div key={type} className="text-xs flex justify-between">
                                    <span className="truncate">{type}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </Card></CardContent>
                    </div>

                    <div className="space-y-2">
                        {data.optimizations.map(opt => (
                            <Card key={opt.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{opt.optimization_name}</h5>
                                                <Badge variant="outline" className="text-xs">
                                                    {opt.optimization_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Ziel: {opt.target_entity}
                                                </span>
                                                {opt.baseline_metric > 0 && (
                                                    <span className="text-blue-600">
                                                        Baseline: {opt.baseline_metric}
                                                    </span>
                                                )}
                                                {opt.expected_improvement_percent > 0 && (
                                                    <span className="text-orange-600">
                                                        Erwartet: +{opt.expected_improvement_percent}%
                                                    </span>
                                                )}
                                                {opt.actual_improvement_percent > 0 && (
                                                    <span className="text-green-600 font-bold">
                                                        Tatsächlich: +{opt.actual_improvement_percent}%
                                                    </span>
                                                )}
                                                <span className="text-gray-600">
                                                    Aufwand: {opt.estimated_effort_hours}h / {opt.actual_effort_hours || '?'}h
                                                </span>
                                            </div>
                                            {opt.implementation_notes && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Notizen: {opt.implementation_notes}
                                                </p>
                                            )}
                                        </div>
                                        <Badge className={statusColors[opt.status]}>
                                            {opt.status}
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