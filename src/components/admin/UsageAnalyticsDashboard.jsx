import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_COLORS = {
    api: '#3b82f6',
    storage: '#10b981',
    users: '#f59e0b',
    compute: '#ef4444',
    bandwidth: '#8b5cf6',
    features: '#ec4899',
    integrations: '#06b6d4',
    support: '#14b8a6'
};

export default function UsageAnalyticsDashboard({ organizationId }) {
    const [metrics, setMetrics] = useState(null);
    const [report, setReport] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('current_month');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadData();
    }, [organizationId, period]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [metricsRes, reportRes, forecastRes] = await Promise.all([
                base44.functions.invoke('usageAnalytics', {
                    action: 'get_metrics',
                    organization_id: organizationId,
                    period: period
                }),
                base44.functions.invoke('usageAnalytics', {
                    action: 'get_usage_report',
                    organization_id: organizationId,
                    period: period
                }),
                base44.functions.invoke('usageAnalytics', {
                    action: 'get_forecasts',
                    organization_id: organizationId
                })
            ]);

            setMetrics(metricsRes.data);
            setReport(reportRes.data);
            setForecast(forecastRes.data);
        } catch (error) {
            console.error('Load error:', error);
            toast.error('Fehler beim Laden der Usage Analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !metrics || !report) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    const { stats } = metrics;
    const { summary, by_category } = report;

    // Prepare chart data
    const categoryData = Object.entries(by_category).map(([category, data]) => ({
        name: category,
        cost: data.total_cost,
        usage: data.total_usage
    }));

    const topFeaturesData = metrics.metrics.slice(0, 10).map(m => ({
        name: m.feature_name,
        cost: m.total_cost,
        usage: m.usage_count
    }));

    const dailyUsageData = [];
    const allDaily = {};
    metrics.metrics.forEach(m => {
        (m.daily_usage || []).forEach(d => {
            if (!allDaily[d.date]) allDaily[d.date] = 0;
            allDaily[d.date] += d.cost;
        });
    });
    Object.entries(allDaily).forEach(([date, cost]) => {
        dailyUsageData.push({ date, cost });
    });

    return (
        <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex gap-4 items-center">
                <span className="text-sm font-medium">Zeitraum:</span>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="current_month">Diesen Monat</SelectItem>
                        <SelectItem value="last_month">Letzten Monat</SelectItem>
                        <SelectItem value="last_30_days">Letzte 30 Tage</SelectItem>
                        <SelectItem value="last_60_days">Letzte 60 Tage</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Gesamtkosten</p>
                                <div className="text-2xl font-bold text-blue-600 mt-1">
                                    €{summary.total_cost.toFixed(2)}
                                </div>
                            </div>
                            <DollarSign className="w-8 h-8 text-blue-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Overage-Kosten</p>
                                <div className="text-2xl font-bold text-orange-600 mt-1">
                                    €{summary.overage_cost.toFixed(2)}
                                </div>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-orange-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Features Genutzt</p>
                                <div className="text-2xl font-bold text-green-600 mt-1">
                                    {stats.features_used}
                                </div>
                            </div>
                            <Activity className="w-8 h-8 text-green-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Limits Überschritten</p>
                                <div className="text-2xl font-bold text-red-600 mt-1">
                                    {stats.exceeded_limits}
                                </div>
                            </div>
                            <TrendingUp className="w-8 h-8 text-red-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                {['overview', 'breakdown', 'forecast', 'details'].map(tab => (
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
                        {tab === 'breakdown' && '💰 Aufschlüsselung'}
                        {tab === 'forecast' && '📈 Prognose'}
                        {tab === 'details' && '📋 Details'}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Tägliche Kosten</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={dailyUsageData.slice(-30)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" angle={-45} height={60} fontSize={12} />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
                                    <Line type="monotone" dataKey="cost" stroke="#3b82f6" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Top Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={topFeaturesData.slice(0, 5)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} height={80} fontSize={10} />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
                                    <Bar dataKey="cost" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Breakdown Tab */}
            {activeTab === 'breakdown' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Nach Kategorie</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, cost }) => `${name}: €${cost.toFixed(0)}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="cost"
                                    >
                                        {categoryData.map((entry) => (
                                            <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#999'} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Kosten-Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>Im Abo enthalten</span>
                                <Badge variant="outline">€{summary.included_usage.toFixed(2)}</Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Abrechenbare Nutzung</span>
                                <Badge variant="outline">€{summary.billable_usage.toFixed(2)}</Badge>
                            </div>
                            <div className="h-px bg-gray-200 my-2" />
                            <div className="flex justify-between text-sm font-semibold">
                                <span>Gesamtkosten</span>
                                <span className="text-lg text-blue-600">€{summary.total_cost.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Forecast Tab */}
            {activeTab === 'forecast' && forecast && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Kostenprognose (nächste 30 Tage)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {forecast.forecasts.slice(0, 5).map((f, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                    <div>
                                        <p className="font-medium text-sm">{f.feature_name}</p>
                                        <p className="text-xs text-gray-600">
                                            Ø {Math.round(f.daily_average)} pro Tag
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-blue-600">
                                            €{f.predicted_cost.toFixed(2)}
                                        </p>
                                        <Badge variant="outline" className="text-xs mt-1">
                                            {f.trend}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                            <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Voraussichtliche Gesamtkosten</span>
                                    <span className="text-lg font-bold text-blue-600">
                                        €{forecast.predicted_total_cost.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Feature-Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-gray-50">
                                    <tr>
                                        <th className="text-left py-2 px-3">Feature</th>
                                        <th className="text-right py-2 px-3">Nutzung</th>
                                        <th className="text-right py-2 px-3">Kosten</th>
                                        <th className="text-right py-2 px-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.metrics.map((m) => (
                                        <tr key={m.id} className="border-b hover:bg-gray-50">
                                            <td className="py-2 px-3 font-medium">{m.feature_name}</td>
                                            <td className="text-right py-2 px-3">
                                                {m.usage_count} {m.unit}
                                                {m.usage_limit && (
                                                    <span className="text-xs text-gray-600 block">
                                                        / {m.usage_limit} ({m.usage_percentage}%)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-right py-2 px-3 font-semibold">
                                                €{m.total_cost.toFixed(2)}
                                            </td>
                                            <td className="text-right py-2 px-3">
                                                <Badge className={`text-xs ${
                                                    m.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    m.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {m.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}