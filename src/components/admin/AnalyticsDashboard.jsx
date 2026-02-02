import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['financial', 'operational', 'customer', 'growth', 'quality'];

export default function AnalyticsDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('kpis');
    const [showNewKPI, setShowNewKPI] = useState(false);
    const [kpiForm, setKpiForm] = useState({
        metric_name: '',
        metric_key: '',
        category: 'operational',
        target_value: 0,
        unit: 'count'
    });

    useEffect(() => {
        loadData();
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('analyticsEngine', {
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

    const handleCreateKPI = async () => {
        if (!kpiForm.metric_name || !kpiForm.metric_key) {
            toast.error('Name und Key erforderlich');
            return;
        }

        try {
            await base44.functions.invoke('analyticsEngine', {
                action: 'create_kpi',
                organization_id: organizationId,
                ...kpiForm
            });

            toast.success('KPI erstellt');
            setKpiForm({ metric_name: '', metric_key: '', category: 'operational', target_value: 0, unit: 'count' });
            setShowNewKPI(false);
            loadData();
        } catch (error) {
            toast.error('Fehler beim Erstellen');
        }
    };

    if (loading || !data) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['kpis', 'dashboards', 'analytics'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'kpis' && '📊 KPIs'}
                        {tab === 'dashboards' && '📈 Dashboards'}
                        {tab === 'analytics' && '🔍 Analytics'}
                    </button>
                ))}
            </div>

            {activeTab === 'kpis' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_kpis}</div>
                            <div className="text-xs text-gray-600">KPIs</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_kpis}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.analytics.kpis_on_target || 0}
                            </div>
                            <div className="text-xs text-gray-600">Ziel erreicht</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">
                                {data.analytics.avg_performance}%
                            </div>
                            <div className="text-xs text-gray-600">Ø Performance</div>
                        </CardContent></Card>
                    </div>

                    {!showNewKPI && (
                        <Button onClick={() => setShowNewKPI(true)}>
                            <Plus className="w-4 h-4 mr-2" />Neuer KPI
                        </Button>
                    )}

                    {showNewKPI && (
                        <Card><CardHeader><CardTitle className="text-sm">Neuer KPI</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Input placeholder="KPI-Name" value={kpiForm.metric_name} onChange={(e) => setKpiForm({...kpiForm, metric_name: e.target.value})} />
                            <Input placeholder="Key (eindeutig)" value={kpiForm.metric_key} onChange={(e) => setKpiForm({...kpiForm, metric_key: e.target.value})} />
                            <Select value={kpiForm.category} onValueChange={(v) => setKpiForm({...kpiForm, category: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                            <Input type="number" placeholder="Zielwert" value={kpiForm.target_value} onChange={(e) => setKpiForm({...kpiForm, target_value: Number(e.target.value)})} />
                            <Input placeholder="Einheit (%, €, count)" value={kpiForm.unit} onChange={(e) => setKpiForm({...kpiForm, unit: e.target.value})} />
                            <div className="flex gap-2">
                                <Button onClick={handleCreateKPI} className="flex-1">Erstellen</Button>
                                <Button variant="outline" onClick={() => setShowNewKPI(false)} className="flex-1">Abbrechen</Button>
                            </div>
                        </CardContent></Card>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        {data.kpis.map(kpi => (
                            <Card key={kpi.id}><CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h5 className="font-semibold text-sm">{kpi.metric_name}</h5>
                                        <p className="text-xs text-gray-600 mt-1">{kpi.category}</p>
                                        <div className="mt-2 space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>Aktuell:</span>
                                                <span className="font-semibold">{kpi.current_value || 0} {kpi.unit}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Ziel:</span>
                                                <span>{kpi.target_value || 0} {kpi.unit}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end">
                                        <Badge className={kpi.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {kpi.is_active ? 'Aktiv' : 'Inaktiv'}
                                        </Badge>
                                        {kpi.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                                        {kpi.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
                                    </div>
                                </div>
                            </CardContent></Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'dashboards' && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_dashboards}</div>
                            <div className="text-xs text-gray-600">Dashboards</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.public_dashboards}</div>
                            <div className="text-xs text-gray-600">Öffentlich</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.dashboards.map(dashboard => (
                            <Card key={dashboard.id}><CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h5 className="font-semibold text-sm">{dashboard.dashboard_name}</h5>
                                        <p className="text-xs text-gray-600 mt-1">{dashboard.description}</p>
                                        <p className="text-xs text-gray-600 mt-1">{dashboard.widgets?.length || 0} Widgets</p>
                                    </div>
                                    <Badge className={dashboard.is_public ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                                        {dashboard.is_public ? 'Öffentlich' : 'Privat'}
                                    </Badge>
                                </div>
                            </CardContent></Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-sm">KPIs nach Kategorie</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(data.analytics.by_category || {}).map(([category, count]) => (
                                    <div key={category} className="flex justify-between items-center p-2 border rounded">
                                        <span className="text-sm">{category}</span>
                                        <Badge>{count}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}