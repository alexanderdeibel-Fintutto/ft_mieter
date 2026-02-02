import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, LineChart as LineChartIcon, AlertTriangle, Gauge } from 'lucide-react';
import { toast } from 'sonner';

export default function ObservabilityDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('health');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('observabilityEngine', {
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
        unknown: 'bg-gray-100 text-gray-800',
        normal: 'bg-green-100 text-green-800',
        warning: 'bg-orange-100 text-orange-800',
        critical: 'bg-red-100 text-red-800',
        triggered: 'bg-red-100 text-red-800',
        acknowledged: 'bg-yellow-100 text-yellow-800',
        resolved: 'bg-green-100 text-green-800',
        suppressed: 'bg-gray-100 text-gray-800',
        info: 'bg-blue-100 text-blue-800',
        emergency: 'bg-red-100 text-red-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['health', 'metrics', 'alerts', 'insights'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'health' && '❤️ Health'}
                        {tab === 'metrics' && '📊 Metriken'}
                        {tab === 'alerts' && '🚨 Alerts'}
                        {tab === 'insights' && '💡 Insights'}
                    </button>
                ))}
            </div>

            {activeTab === 'health' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.check_stats.total_checks}</div>
                            <div className="text-xs text-gray-600">Checks</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.check_stats.healthy_checks}</div>
                            <div className="text-xs text-gray-600">Gesund</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.check_stats.degraded_checks}</div>
                            <div className="text-xs text-gray-600">Beeinträchtigt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.check_stats.unhealthy_checks}</div>
                            <div className="text-xs text-gray-600">Unhealthy</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.check_stats.avg_uptime}%</div>
                            <div className="text-xs text-gray-600">Ø Verfügbarkeit</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-cyan-600">{data.check_stats.avg_response_time_ms}ms</div>
                            <div className="text-xs text-gray-600">Ø Response-Zeit</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.checks.map(check => (
                            <Card key={check.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Heart className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{check.check_name}</h5>
                                                <Badge variant="outline" className="text-xs">
                                                    {check.check_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Service: {check.target_service}
                                                </span>
                                                <span className="text-purple-600">
                                                    Verfügbarkeit: {check.uptime_percentage}%
                                                </span>
                                                <span className="text-blue-600">
                                                    Response: {check.response_time_ms}ms
                                                </span>
                                                {check.consecutive_failures > 0 && (
                                                    <span className="text-red-600">
                                                        ✗ {check.consecutive_failures} Fehler
                                                    </span>
                                                )}
                                                <span className="text-green-600">
                                                    ✓ {check.success_count}
                                                </span>
                                            </div>
                                            {check.error_message && (
                                                <p className="text-xs text-red-600 mt-1">{check.error_message}</p>
                                            )}
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                Letzter Check: {new Date(check.last_check_time).toLocaleString('de-DE')}
                                            </span>
                                        </div>
                                        <Badge className={statusColors[check.status]}>
                                            {check.status}
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
                            <div className="text-2xl font-bold text-green-600">{data.metric_stats.normal_metrics}</div>
                            <div className="text-xs text-gray-600">Normal</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.metric_stats.warning_metrics}</div>
                            <div className="text-xs text-gray-600">Warnung</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.metric_stats.critical_metrics}</div>
                            <div className="text-xs text-gray-600">Kritisch</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Kategorie</h4>
                            {Object.entries(data.metric_stats.by_category || {}).slice(0, 3).map(([cat, count]) => (
                                <div key={cat} className="text-xs flex justify-between">
                                    <span>{cat}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.metrics.slice(0, 30).map(metric => (
                            <Card key={metric.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Gauge className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{metric.metric_name}</h5>
                                                <Badge variant="outline" className="text-xs">
                                                    {metric.metric_category}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Quelle: {metric.source}
                                                </span>
                                                <span className="text-purple-600 font-semibold">
                                                    {metric.current_value} {metric.unit}
                                                </span>
                                                {metric.min_value && (
                                                    <span className="text-blue-600">
                                                        Min: {metric.min_value}
                                                    </span>
                                                )}
                                                {metric.max_value && (
                                                    <span className="text-blue-600">
                                                        Max: {metric.max_value}
                                                    </span>
                                                )}
                                                {metric.avg_value && (
                                                    <span className="text-blue-600">
                                                        Ø: {metric.avg_value}
                                                    </span>
                                                )}
                                            </div>
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

            {activeTab === 'alerts' && (
                <>
                    <div className="grid grid-cols-5 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.alert_stats.total_configs}</div>
                            <div className="text-xs text-gray-600">Konfigurationen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.alert_stats.active_configs}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.alert_stats.triggered_alerts}</div>
                            <div className="text-xs text-gray-600">Ausgelöst</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.alert_stats.acknowledged_alerts}</div>
                            <div className="text-xs text-gray-600">Bestätigt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.alert_stats.resolved_alerts}</div>
                            <div className="text-xs text-gray-600">Gelöst</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.alerts.map(alert => (
                            <Card key={alert.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{alert.alert_name}</h5>
                                                <Badge className={statusColors[alert.severity]}>
                                                    {alert.severity}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-purple-600">
                                                    Wert: {alert.metric_value} / {alert.threshold_value}
                                                </span>
                                                {alert.acknowledged_at && (
                                                    <span className="text-blue-600">
                                                        Bestätigt: {new Date(alert.acknowledged_at).toLocaleString('de-DE')}
                                                    </span>
                                                )}
                                                {alert.duration_minutes && (
                                                    <span className="text-gray-600">
                                                        Dauer: {alert.duration_minutes}min
                                                    </span>
                                                )}
                                                {alert.notifications_sent > 0 && (
                                                    <span className="text-gray-600">
                                                        📧 {alert.notifications_sent} Benachrichtigungen
                                                    </span>
                                                )}
                                            </div>
                                            {alert.resolution_notes && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Notizen: {alert.resolution_notes}
                                                </p>
                                            )}
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                Ausgelöst: {new Date(alert.triggered_at).toLocaleString('de-DE')}
                                            </span>
                                        </div>
                                        <Badge className={statusColors[alert.status]}>
                                            {alert.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'insights' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-sm mb-3">Health Status</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span>Gesund</span>
                                    <span className="text-green-600 font-bold">
                                        {((data.check_stats.healthy_checks / data.check_stats.total_checks) * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Beeinträchtigt</span>
                                    <span className="text-yellow-600 font-bold">
                                        {((data.check_stats.degraded_checks / data.check_stats.total_checks) * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Unhealthy</span>
                                    <span className="text-red-600 font-bold">
                                        {((data.check_stats.unhealthy_checks / data.check_stats.total_checks) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        </Card></CardContent>

                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-sm mb-3">Alert Distribution</h4>
                            <div className="space-y-2">
                                {Object.entries(data.alert_stats.by_severity || {}).map(([sev, count]) => (
                                    <div key={sev} className="flex justify-between text-xs">
                                        <span className="capitalize">{sev}</span>
                                        <Badge className={statusColors[sev]} variant="outline">
                                            {count}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </Card></CardContent>

                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-sm mb-3">Key Insights</h4>
                            <ul className="space-y-1 text-xs text-gray-600">
                                <li>• {data.check_stats.total_checks} Health Checks aktiv</li>
                                <li>• {data.metric_stats.critical_metrics} kritische Metriken</li>
                                <li>• {data.alert_stats.triggered_alerts} aktive Alerts</li>
                                <li>• Verfügbarkeit: {data.check_stats.avg_uptime}%</li>
                            </ul>
                        </Card></CardContent>
                    </div>
                </>
            )}
        </div>
    );
}