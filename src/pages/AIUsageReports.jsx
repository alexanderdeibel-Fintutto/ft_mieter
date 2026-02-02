import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, ShieldAlert, Download } from 'lucide-react';
import useAuth from '../components/useAuth';

export default function AIUsageReports() {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Admin-Guard
    if (user && user.role !== 'admin') {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-red-800">
                            <ShieldAlert className="h-8 w-8" />
                            <div>
                                <h3 className="font-semibold text-lg">Zugriff verweigert</h3>
                                <p>Nur Administratoren können Nutzungsberichte einsehen.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    useEffect(() => {
        if (user && user.role === 'admin') {
            // Standard: aktueller Monat
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            setDateFrom(startOfMonth.toISOString().split('T')[0]);
            setDateTo(now.toISOString().split('T')[0]);
            loadReports(startOfMonth.toISOString(), now.toISOString());
        }
    }, [user]);

    const loadReports = async (from, to) => {
        setLoading(true);
        try {
            const logs = await base44.entities.AIUsageLog.filter({
                created_date: { $gte: from, $lte: to },
                success: true
            });

            const featureBudgets = await base44.entities.FeatureBudget.list();

            // Nach Feature aggregieren
            const featureStats = {};
            logs.forEach(log => {
                const feature = log.feature || 'unknown';
                if (!featureStats[feature]) {
                    featureStats[feature] = {
                        feature,
                        totalCost: 0,
                        totalRequests: 0,
                        totalTokens: 0,
                        lastUsed: log.created_date,
                        budget: featureBudgets.find(b => b.feature_key === feature)?.monthly_budget_eur || 0
                    };
                }
                featureStats[feature].totalCost += log.cost_eur || 0;
                featureStats[feature].totalRequests += 1;
                featureStats[feature].totalTokens += (log.input_tokens || 0) + (log.output_tokens || 0);
                
                // Neuestes Datum
                if (new Date(log.created_date) > new Date(featureStats[feature].lastUsed)) {
                    featureStats[feature].lastUsed = log.created_date;
                }
            });

            const reportData = Object.values(featureStats).map(stat => ({
                ...stat,
                totalCost: Math.round(stat.totalCost * 100) / 100,
                avgCostPerRequest: Math.round((stat.totalCost / stat.totalRequests) * 10000) / 10000
            }));

            setReports(reportData);
        } catch (error) {
            console.error('Failed to load reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        if (dateFrom && dateTo) {
            loadReports(dateFrom, dateTo);
        }
    };

    const handleExportCSV = async () => {
        try {
            const params = new URLSearchParams();
            if (dateFrom) params.append('from', dateFrom);
            if (dateTo) params.append('to', dateTo);
            
            window.open(`/api/exportAIUsageCSV?${params.toString()}`, '_blank');
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export fehlgeschlagen');
        }
    };

    const getFeatureName = (key) => {
        const names = {
            chat: 'Mietrecht Chat',
            ocr: 'Zählerstand-Erkennung',
            analysis: 'Dokument-Analyse',
            categorization: 'Kategorisierung'
        };
        return names[key] || key;
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">📊 AI-Nutzungsberichte</h1>

            {/* Filter */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Zeitraum filtern
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <Label>Von</Label>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label>Bis</Label>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleFilter}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Filtern
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Reports */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Feature-Statistiken</CardTitle>
                        <Button variant="outline" onClick={handleExportCSV}>
                            <Download className="h-4 w-4 mr-2" />
                            Als CSV exportieren
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Lade Berichte...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Feature</TableHead>
                                    <TableHead className="text-right">Gesamtkosten</TableHead>
                                    <TableHead className="text-right">Anfragen</TableHead>
                                    <TableHead className="text-right">Ø Kosten/Anfrage</TableHead>
                                    <TableHead className="text-right">Tokens</TableHead>
                                    <TableHead className="text-center">Budget</TableHead>
                                    <TableHead className="text-right">Letzte Nutzung</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-gray-500">
                                            Keine Daten für den gewählten Zeitraum
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reports.map((report) => (
                                        <TableRow key={report.feature}>
                                            <TableCell className="font-medium">
                                                {getFeatureName(report.feature)}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-blue-600">
                                                {report.totalCost.toFixed(2)}€
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {report.totalRequests}
                                            </TableCell>
                                            <TableCell className="text-right text-sm text-gray-600">
                                                {report.avgCostPerRequest.toFixed(4)}€
                                            </TableCell>
                                            <TableCell className="text-right text-sm text-gray-600">
                                                {report.totalTokens.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {report.budget > 0 ? `${report.budget}€` : '∞'}
                                            </TableCell>
                                            <TableCell className="text-right text-sm text-gray-500">
                                                {new Date(report.lastUsed).toLocaleDateString('de-DE')}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}