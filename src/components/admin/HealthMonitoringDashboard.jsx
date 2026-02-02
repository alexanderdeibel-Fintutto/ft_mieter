import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Play, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const CHECK_TYPES = [
    { value: 'http', label: 'HTTP' },
    { value: 'database', label: 'Datenbank' },
    { value: 'api', label: 'API' },
    { value: 'cache', label: 'Cache' },
    { value: 'queue', label: 'Queue' },
    { value: 'service', label: 'Service' }
];

export default function HealthMonitoringDashboard({ organizationId }) {
    const [dashboardData, setDashboardData] = useState(null);
    const [checks, setChecks] = useState([]);
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showNewCheck, setShowNewCheck] = useState(false);
    const [checkForm, setCheckForm] = useState({
        check_name: '',
        check_type: 'http',
        target_url: ''
    });

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [dashboardRes, checksRes, metricsRes] = await Promise.all([
                base44.functions.invoke('healthMonitoringEngine', {
                    action: 'get_dashboard_data',
                    organization_id: organizationId
                }),
                base44.functions.invoke('healthMonitoringEngine', {
                    action: 'get_health_checks',
                    organization_id: organizationId
                }),
                base44.functions.invoke('healthMonitoringEngine', {
                    action: 'get_performance_metrics',
                    organization_id: organizationId
                })
            ]);

            setDashboardData(dashboardRes.data);
            setChecks(checksRes.data.checks || []);
            setMetrics(metricsRes.data.metrics || []);
        } catch (error) {
            console.error('Load error:', error);
            toast.error('Fehler beim Laden');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCheck = async () => {
        if (!checkForm.check_name || !checkForm.check_type) {
            toast.error('Name und Typ erforderlich');
            return;
        }

        try {
            await base44.functions.invoke('healthMonitoringEngine', {
                action: 'create_health_check',
                organization_id: organizationId,
                ...checkForm
            });

            toast.success('Health Check erstellt');
            setCheckForm({ check_name: '', check_type: 'http', target_url: '' });
            setShowNewCheck(false);
            loadData();
        } catch (error) {
            console.error('Create error:', error);
            toast.error('Fehler beim Erstellen');
        }
    };

    const handleRunCheck = async (checkId) => {
        try {
            await base44.functions.invoke('healthMonitoringEngine', {
                action: 'run_health_check',
                organization_id: organizationId,
                check_id: checkId
            });

            toast.success('Check ausgeführt');
            loadData();
        } catch (error) {
            console.error('Run error:', error);
            toast.error('Fehler beim Ausführen');
        }
    };

    if (loading || !dashboardData) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    const stats = dashboardData.stats;

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b">
                {['overview', 'checks', 'metrics'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'overview' && '📊 Überblick'}
                        {tab === 'checks' && '✓ Health Checks'}
                        {tab === 'metrics' && '📈 Metriken'}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-green-600">{stats.healthy_components}</div>
                                <div className="text-xs text-gray-600">Gesund</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-yellow-600">{stats.degraded_components}</div>
                                <div className="text-xs text-gray-600">Beeinträchtigt</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-red-600">{stats.unhealthy_components}</div>
                                <div className="text-xs text-gray-600">Fehler</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-blue-600">{stats.avg_uptime}%</div>
                                <div className="text-xs text-gray-600">Ø Verfügbarkeit</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Komponenten-Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {dashboardData.health.map(comp => (
                                    <div key={comp.id} className="flex items-center justify-between p-2 border rounded">
                                        <div className="flex-1">
                                            <h5 className="font-semibold text-sm">{comp.component_name}</h5>
                                            <p className="text-xs text-gray-600">
                                                ⏱️ {comp.response_time_ms || 0}ms | 🔴 {comp.error_rate || 0}% | 🕐 {comp.uptime_percentage || 100}%
                                            </p>
                                        </div>
                                        <Badge className={
                                            comp.status === 'healthy' ? 'bg-green-100 text-green-800' :
                                            comp.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }>
                                            {comp.status === 'healthy' && '✓ Gesund'}
                                            {comp.status === 'degraded' && '⚠️ Beeinträchtigt'}
                                            {comp.status === 'unhealthy' && '✗ Fehler'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Checks Tab */}
            {activeTab === 'checks' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-blue-600">{stats.total_checks}</div>
                                <div className="text-xs text-gray-600">Checks</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-green-600">{stats.checks_healthy}</div>
                                <div className="text-xs text-gray-600">Erfolgreich</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-red-600">
                                    {checks.filter(c => c.consecutive_failures > 0).length}
                                </div>
                                <div className="text-xs text-gray-600">Fehler</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-xs text-gray-600">Letzte Überprüfung</div>
                                <div className="text-sm font-semibold mt-1">
                                    {stats.last_check ? new Date(stats.last_check).toLocaleTimeString() : '-'}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {!showNewCheck && (
                        <Button onClick={() => setShowNewCheck(true)} className="w-full md:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Neuer Check
                        </Button>
                    )}

                    {showNewCheck && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Neuer Health Check</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="Check Name"
                                    value={checkForm.check_name}
                                    onChange={(e) => setCheckForm({...checkForm, check_name: e.target.value})}
                                />
                                <Select value={checkForm.check_type} onValueChange={(v) => setCheckForm({...checkForm, check_type: v})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CHECK_TYPES.map(t => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder="Target URL (für HTTP)"
                                    value={checkForm.target_url}
                                    onChange={(e) => setCheckForm({...checkForm, target_url: e.target.value})}
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleCreateCheck} className="flex-1">Erstellen</Button>
                                    <Button variant="outline" onClick={() => setShowNewCheck(false)} className="flex-1">
                                        Abbrechen
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-3">
                        {checks.map(check => (
                            <Card key={check.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h5 className="font-semibold text-sm">{check.check_name}</h5>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {check.check_type} {check.target_url && `• ${check.target_url}`}
                                            </p>
                                            {check.last_response_time_ms && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    ⏱️ {check.last_response_time_ms}ms {check.last_error_message && `• ❌ ${check.last_error_message}`}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={
                                                check.status === 'healthy' ? 'bg-green-100 text-green-800' :
                                                check.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }>
                                                {check.status}
                                            </Badge>
                                            <Button size="sm" onClick={() => handleRunCheck(check.id)}>
                                                <Play className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {/* Metrics Tab */}
            {activeTab === 'metrics' && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {metrics.slice(0, 30).map(metric => (
                        <Card key={metric.id}>
                            <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{metric.metric_name}</p>
                                        <p className="text-xs text-gray-600">{metric.component_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">{metric.value} {metric.unit}</p>
                                        <p className="text-xs text-gray-600">{new Date(metric.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}