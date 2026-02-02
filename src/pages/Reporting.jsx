import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Plus, Download, Clock } from 'lucide-react';
import ReportBuilder from '../components/reporting/ReportBuilder';
import GeneratedReports from '../components/reporting/GeneratedReports';

export default function Reporting() {
    const [showBuilder, setShowBuilder] = useState(false);
    const [reports, setReports] = useState([
        { id: 1, name: 'Monatliche Finanzübersicht', type: 'financial', generated: '2026-01-20', schedule: 'Monatlich' },
        { id: 2, name: 'Nutzer-Aktivitätsbericht', type: 'activity', generated: '2026-01-15', schedule: 'Wöchentlich' },
    ]);

    const handleGenerateReport = (config) => {
        const newReport = {
            id: Math.max(...reports.map(r => r.id)) + 1,
            name: config.name,
            type: config.type,
            generated: new Date().toISOString().split('T')[0],
            schedule: config.schedule || 'Einmalig'
        };
        setReports([newReport, ...reports]);
        setShowBuilder(false);
    };

    return (
        <div className="space-y-4 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-6 h-6" /> Berichte & Reports
                </h1>
                <Button onClick={() => setShowBuilder(true)} className="bg-violet-600 hover:bg-violet-700 gap-2">
                    <Plus className="w-4 h-4" /> Neuer Report
                </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="generated" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="generated">Generierte Berichte</TabsTrigger>
                    <TabsTrigger value="scheduled">Geplante Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="generated">
                    <GeneratedReports reports={reports} />
                </TabsContent>

                <TabsContent value="scheduled">
                    <div className="space-y-3">
                        {reports.filter(r => r.schedule !== 'Einmalig').map(report => (
                            <Card key={report.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-gray-900">{report.name}</p>
                                                <p className="text-sm text-gray-600">{report.schedule}</p>
                                                <p className="text-xs text-gray-500 mt-1">Zuletzt: {report.generated}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Bearbeiten</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Report Builder Dialog */}
            <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Neuen Report erstellen</DialogTitle>
                    </DialogHeader>
                    <ReportBuilder onGenerate={handleGenerateReport} />
                </DialogContent>
            </Dialog>
        </div>
    );
}