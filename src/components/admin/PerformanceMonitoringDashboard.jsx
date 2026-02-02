import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, TrendingUp, Clock, Zap, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const METRIC_TYPES = [
    { value: 'api_latency', label: 'API Latenz', unit: 'ms', icon: '⚡' },
    { value: 'error_rate', label: 'Fehlerrate', unit: '%', icon: '❌' },
    { value: 'memory_usage', label: 'Speichernutzung', unit: '%', icon: '💾' },
    { value: 'cpu_usage', label: 'CPU-Auslastung', unit: '%', icon: '🔥' },
    { value: 'database_query_time', label: 'DB-Abfragezeit', unit: 'ms', icon: '🗄️' },
    { value: 'cache_hit_rate', label: 'Cache Hit-Rate', unit: '%', icon: '📦' }
];

const ALERT_COLORS = {
    critical: 'text-red-600 bg-red-50 border-red-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200'
};

export default function PerformanceMonitoringDashboard({ organizationId }) {
    const [metrics, setMetrics] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeMetric, setActiveMetric] = useState('api_latency');
    const [timeRange, setTimeRange] = useState(24);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadMonitoringData();
        const interval = setInterval(loadMonitoringData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [organizationId, activeMetric, timeRange]);

    const loadMonitoringData = async () => {
        try {
            setLoading(true);
            const [metricsRes, alertsRes, analysisRes] = await Promise.all([
                base44.functions.invoke('monitoringService', {
                    action: 'get_metrics',
                    organization_id: organizationId,
                    metric_filter: activeMetric,
                    time_range_hours: timeRange
                }),
                base44.functions.invoke('monitoringService', {
                    action: 'get_alerts',
                    organization_id: organizationId
                }),
                base44.functions.invoke('monitoringService', {
                    action: 'analyze_performance',
                    organization_id: organizationId
                })
            ]);

            setMetrics(metricsRes.data.metrics || []);
            setAlerts(alertsRes.data.alerts || []);
            setAnalysis(analysisRes.data);
        } catch (error) {
            console.error('Load error:', error);
            toast.error('Fehler beim Laden der Monitoring-Daten');
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledgeAlert = async (alertId) => {
        try {
            await base44.functions.invoke('monitoringService', {
                action: 'acknowledge_alert',
                organization_id: organizationId,
                alert_id: alertId
            });
            toast.success('Alert bestätigt');
            loadMonitoringData();
        } catch (error) {
            console.error('Acknowledge error:', error);
            toast.error('Fehler beim Bestätigen des Alerts');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMetricInfo = (type) => METRIC_TYPES.find(m => m.value === type);

    const chartData = metrics.map(m => ({
        time: formatDate(m.timestamp),
        value: m.value,
        threshold_status: m.threshold_status
    }));

    const activeAlerts = alerts.filter(a => a.status === 'active');
    const summary = {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        warning: alerts.filter(a => a.severity === 'warning').length,
        acknowledged: alerts.filter(a => a.status === 'acknowledged').length
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Alert Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
                        <div className="text-xs text-gray-600">Gesamt Alerts</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-600">{summary.critical}</div>
                        <div className="text-xs text-gray-600">Kritisch</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-600">{summary.warning}</div>
                        <div className="text-xs text-gray-600">Warnung</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">{summary.acknowledged}</div>
                        <div className="text-xs text-gray-600">Bestätigt</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-purple-600">{activeAlerts.length}</div>
                        <div className="text-xs text-gray-600">Aktiv</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                {['overview', 'metrics', 'alerts', 'analysis'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'overview' && '📊 Übersicht'}
                        {tab === 'metrics' && '📈 Metriken'}
                        {tab === 'alerts' && '🚨 Alerts'}
                        {tab === 'analysis' && '🔍 Analyse'}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {METRIC_TYPES.map(type => {
                        const typeMetrics = metrics.filter(m => m.metric_type === type.value);
                        if (typeMetrics.length === 0) return null;

                        const avg = typeMetrics.reduce((sum, m) => sum + m.value, 0) / typeMetrics.length;
                        const latest = typeMetrics[typeMetrics.length - 1];

                        return (
                            <Card key={type.value}>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <span>{type.icon}</span>
                                        {type.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-2xl font-bold">{avg.toFixed(1)}</div>
                                            <div className="text-xs text-gray-600">Durchschnitt</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">{latest.value.toFixed(1)}</div>
                                            <div className="text-xs text-gray-600">Aktuell</div>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={
                                            latest.threshold_status === 'critical' ? 'destructive' :
                                            latest.threshold_status === 'warning' ? 'outline' : 'default'
                                        }
                                    >
                                        {latest.threshold_status === 'critical' && '🔴 Kritisch'}
                                        {latest.threshold_status === 'warning' && '🟡 Warnung'}
                                        {latest.threshold_status === 'normal' && '🟢 Normal'}
                                    </Badge>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Metrics Tab */}
            {activeTab === 'metrics' && (
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <Select value={activeMetric} onValueChange={setActiveMetric}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {METRIC_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.icon} {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(parseInt(v))}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Letzte Stunde</SelectItem>
                                <SelectItem value="6">Letzte 6 Stunden</SelectItem>
                                <SelectItem value="24">Letzte 24 Stunden</SelectItem>
                                <SelectItem value="168">Letzte Woche</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Card>
                        <CardContent className="p-4">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#3b82f6"
                                            dot={{ r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center text-gray-500 py-8">Keine Daten verfügbar</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
                <div className="space-y-3">
                    {activeAlerts.length > 0 ? (
                        activeAlerts.map(alert => (
                            <Card key={alert.id} className={`border-l-4 ${
                                alert.severity === 'critical' ? 'border-l-red-600' : 'border-l-yellow-600'
                            } ${ALERT_COLORS[alert.severity]}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{alert.message}</h4>
                                            <div className="text-sm mt-2 space-y-1">
                                                <p>Aktuelle Wert: <span className="font-medium">{alert.current_value}</span> / Grenzwert: <span className="font-medium">{alert.threshold}</span></p>
                                                <p>Auslösung: {formatDate(alert.triggered_at)}</p>
                                                {alert.affected_endpoint && (
                                                    <p>Endpoint: <code className="bg-gray-100 px-1 rounded text-xs">{alert.affected_endpoint}</code></p>
                                                )}
                                            </div>
                                        </div>
                                        {alert.status === 'active' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleAcknowledgeAlert(alert.id)}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Bestätigen
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center text-gray-500">
                                Keine aktiven Alerts 🎉
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && analysis && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(analysis.by_type).map(([type, stats]) => {
                            const info = getMetricInfo(type);
                            return (
                                <Card key={type}>
                                    <CardHeader>
                                        <CardTitle className="text-sm">{info?.label}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <span className="text-gray-600">Mittel</span>
                                                <div className="font-bold">{stats.avg.toFixed(1)}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Min/Max</span>
                                                <div className="font-bold">{stats.min.toFixed(1)} / {stats.max.toFixed(1)}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">P95</span>
                                                <div className="font-bold">{stats.p95.toFixed(1)}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">P99</span>
                                                <div className="font-bold">{stats.p99.toFixed(1)}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {analysis.slowest_endpoints.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">🐌 Langsamste Endpoints</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {analysis.slowest_endpoints.slice(0, 5).map((ep, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <div>
                                                <code className="text-xs">{ep.endpoint}</code>
                                                <div className="text-sm text-gray-600">
                                                    Ø {ep.avg_latency.toFixed(0)}ms / P95 {ep.p95.toFixed(0)}ms
                                                </div>
                                            </div>
                                            {ep.avg_latency > 1000 && (
                                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}