import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function MonitoringAlertDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('targets');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('monitoringAlertEngine', {
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
        down: 'bg-red-100 text-red-800',
        unknown: 'bg-gray-100 text-gray-800',
        open: 'bg-red-100 text-red-800',
        acknowledged: 'bg-yellow-100 text-yellow-800',
        resolved: 'bg-green-100 text-green-800',
        muted: 'bg-gray-100 text-gray-800',
        info: 'bg-blue-100 text-blue-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-orange-100 text-orange-800',
        critical: 'bg-red-100 text-red-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['targets', 'alerts', 'rules'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'targets' && '🎯 Targets'}
                        {tab === 'alerts' && '🚨 Alerts'}
                        {tab === 'rules' && '📋 Regeln'}
                    </button>
                ))}
            </div>

            {activeTab === 'targets' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_targets}</div>
                            <div className="text-xs text-gray-600">Targets</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.healthy_targets}</div>
                            <div className="text-xs text-gray-600">Gesund</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.down_targets}</div>
                            <div className="text-xs text-gray-600">Down</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.avg_uptime}%</div>
                            <div className="text-xs text-gray-600">Ø Uptime</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.targets.map(target => (
                            <Card key={target.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{target.target_name}</h5>
                                                <Badge variant="outline">{target.target_type}</Badge>
                                                {target.is_active && (
                                                    <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                                                )}
                                            </div>
                                            {target.target_url && (
                                                <p className="text-xs text-gray-600 mt-1 break-all">
                                                    URL: {target.target_url}
                                                </p>
                                            )}
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Intervall: {target.monitoring_interval_seconds}s
                                                </span>
                                                {target.response_time_ms && (
                                                    <span className="text-xs text-gray-600">
                                                        Response: {target.response_time_ms}ms
                                                    </span>
                                                )}
                                                {target.uptime_percentage !== undefined && (
                                                    <span className="text-xs text-green-600">
                                                        Uptime: {target.uptime_percentage.toFixed(2)}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Checks: {target.total_checks || 0}
                                                </span>
                                                <span className="text-xs text-red-600">
                                                    Fehler: {target.failed_checks || 0}
                                                </span>
                                            </div>
                                            {target.last_check_at && (
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    Letzte Prüfung: {new Date(target.last_check_at).toLocaleString('de-DE')}
                                                </span>
                                            )}
                                        </div>
                                        <Badge className={statusColors[target.status]}>
                                            {target.status}
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
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_alerts}</div>
                            <div className="text-xs text-gray-600">Alerts</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.open_alerts}</div>
                            <div className="text-xs text-gray-600">Offen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.stats.critical_alerts}</div>
                            <div className="text-xs text-gray-600">Kritisch</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Nach Severity</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.alerts_by_severity || {}).map(([severity, count]) => (
                                    <Badge key={severity} className={statusColors[severity]}>
                                        {severity}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.alerts.map(alert => {
                            const target = data.targets.find(t => t.id === alert.target_id);
                            return (
                                <Card key={alert.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-red-600" />
                                                    <span className="font-semibold text-sm">
                                                        {target?.target_name || 'Unknown Target'}
                                                    </span>
                                                    <Badge className={statusColors[alert.severity]}>
                                                        {alert.severity}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-800 mt-1">{alert.message}</p>
                                                {alert.details && Object.keys(alert.details).length > 0 && (
                                                    <div className="flex gap-2 mt-2 flex-wrap">
                                                        {Object.entries(alert.details).map(([key, value]) => (
                                                            <Badge key={key} variant="outline" className="text-xs">
                                                                {key}: {String(value)}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    Ausgelöst: {new Date(alert.triggered_at).toLocaleString('de-DE')}
                                                </span>
                                                {alert.acknowledged_at && (
                                                    <span className="text-xs text-yellow-600 ml-4">
                                                        Bestätigt: {new Date(alert.acknowledged_at).toLocaleString('de-DE')}
                                                    </span>
                                                )}
                                                {alert.resolved_at && (
                                                    <span className="text-xs text-green-600 ml-4">
                                                        Gelöst: {new Date(alert.resolved_at).toLocaleString('de-DE')}
                                                    </span>
                                                )}
                                            </div>
                                            <Badge className={statusColors[alert.status]}>
                                                {alert.status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {activeTab === 'rules' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_rules}</div>
                            <div className="text-xs text-gray-600">Regeln</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_rules}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.rules.reduce((sum, r) => sum + (r.alerts_triggered || 0), 0)}
                            </div>
                            <div className="text-xs text-gray-600">Ausgelöste Alerts</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.stats.total_targets}</div>
                            <div className="text-xs text-gray-600">Überwachte Targets</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.rules.map(rule => {
                            const target = data.targets.find(t => t.id === rule.target_id);
                            return (
                                <Card key={rule.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Bell className="w-4 h-4 text-blue-600" />
                                                    <h5 className="font-semibold text-sm">{rule.rule_name}</h5>
                                                    <Badge variant="outline">{rule.condition_type}</Badge>
                                                    <Badge className={statusColors[rule.severity]}>
                                                        {rule.severity}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Target: {target?.target_name || 'Unknown'}
                                                </p>
                                                <div className="flex gap-4 mt-2">
                                                    {rule.threshold_value !== undefined && (
                                                        <span className="text-xs text-gray-600">
                                                            Schwellwert: {rule.comparison_operator} {rule.threshold_value}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-600">
                                                        Cooldown: {rule.cooldown_minutes}min
                                                    </span>
                                                    <span className="text-xs text-purple-600">
                                                        Alerts: {rule.alerts_triggered || 0}
                                                    </span>
                                                </div>
                                                {rule.notification_channels && rule.notification_channels.length > 0 && (
                                                    <div className="flex gap-1 mt-2 flex-wrap">
                                                        <span className="text-xs text-gray-600">Kanäle:</span>
                                                        {rule.notification_channels.map(channel => (
                                                            <Badge key={channel} variant="outline" className="text-xs">
                                                                {channel}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                {rule.last_triggered_at && (
                                                    <span className="text-xs text-gray-600 mt-2 inline-block">
                                                        Letzter Trigger: {new Date(rule.last_triggered_at).toLocaleString('de-DE')}
                                                    </span>
                                                )}
                                            </div>
                                            <Badge className={rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                {rule.is_active ? 'ON' : 'OFF'}
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