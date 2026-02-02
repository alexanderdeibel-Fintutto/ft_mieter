import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsDashboard({ organizationId }) {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadDashboard();
    }, [organizationId, dateFrom, dateTo]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const response = await base44.functions.invoke('getAnalyticsDashboard', {
                organization_id: organizationId,
                date_from: dateFrom,
                date_to: dateTo,
                metrics: ['payments', 'tenants', 'documents', 'maintenance']
            });

            setDashboard(response.data.dashboard);
        } catch (error) {
            console.error('Load dashboard error:', error);
            toast.error('Fehler beim Laden des Dashboards');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const csv = generateCSV();
            downloadCSV(csv);
            toast.success('Analytics exportiert');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Export fehlgeschlagen');
        }
    };

    const generateCSV = () => {
        let csv = 'Metrik,Wert\n';
        
        if (dashboard.payments) {
            csv += `Gesamtumsatz,${dashboard.payments.total_amount}\n`;
            csv += `Zahlungen (Anzahl),${dashboard.payments.count}\n`;
            csv += `Durchschnittszahlung,${dashboard.payments.average.toFixed(2)}\n`;
        }

        if (dashboard.tenants) {
            csv += `Neue Mieter,${dashboard.tenants.new_tenants}\n`;
            csv += `Aktive Mieter,${dashboard.tenants.active_count}\n`;
        }

        if (dashboard.maintenance) {
            csv += `Wartungsaufgaben,${dashboard.maintenance.total_tasks}\n`;
            csv += `Abschlussquote,${dashboard.maintenance.completion_rate.toFixed(1)}%\n`;
        }

        return csv;
    };

    const downloadCSV = (csv) => {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header mit Datumfilter */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Von</label>
                        <input 
                            type="date" 
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="border rounded px-2 py-1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Bis</label>
                        <input 
                            type="date" 
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="border rounded px-2 py-1"
                        />
                    </div>
                </div>
                <Button onClick={handleExport} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportieren
                </Button>
            </div>

            {/* Payment Metrics */}
            {dashboard?.payments && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Zahlungen</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-sm text-gray-600">Gesamtumsatz</div>
                                <div className="text-2xl font-bold">€{dashboard.payments.total_amount.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-sm text-gray-600">Zahlungen</div>
                                <div className="text-2xl font-bold">{dashboard.payments.count}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-sm text-gray-600">Durchschnitt</div>
                                <div className="text-2xl font-bold">€{dashboard.payments.average.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {dashboard.payments.by_status && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Nach Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={Object.entries(dashboard.payments.by_status).map(([name, value]) => ({
                                                    name,
                                                    value
                                                }))}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, value }) => `${name}: ${value}`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {Object.keys(dashboard.payments.by_status).map((_, i) => (
                                                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        )}

                        {dashboard.payments.trend && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Trend</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={dashboard.payments.trend}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="period" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="count" stroke="#3b82f6" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* Maintenance Metrics */}
            {dashboard?.maintenance && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Wartung & Reparaturen</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-sm text-gray-600">Gesamt</div>
                                <div className="text-2xl font-bold">{dashboard.maintenance.total_tasks}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-sm text-gray-600">Abgeschlossen</div>
                                <div className="text-2xl font-bold">{dashboard.maintenance.completed_tasks}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-sm text-gray-600">Abschlussquote</div>
                                <div className="text-2xl font-bold">{dashboard.maintenance.completion_rate.toFixed(1)}%</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Tenant Metrics */}
            {dashboard?.tenants && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Mieter</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-sm text-gray-600">Gesamt</div>
                                <div className="text-2xl font-bold">{dashboard.tenants.total_count}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-sm text-gray-600">Aktiv</div>
                                <div className="text-2xl font-bold">{dashboard.tenants.active_count}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-sm text-gray-600">Neu</div>
                                <div className="text-2xl font-bold">{dashboard.tenants.new_tenants}</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}