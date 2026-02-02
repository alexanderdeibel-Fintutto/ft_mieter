import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Trash2 } from 'lucide-react';

const TYPE_CONFIG = {
    financial: { icon: '💰', label: 'Finanzbericht' },
    activity: { icon: '📊', label: 'Aktivitätsbericht' },
    repairs: { icon: '🔧', label: 'Reparaturbericht' },
    documents: { icon: '📄', label: 'Dokumentbericht' },
};

export default function GeneratedReports({ reports }) {
    const downloadReport = (id, name) => {
        const link = document.createElement('a');
        link.href = `#`;
        link.download = `${name}.pdf`;
        link.click();
    };

    return (
        <div className="space-y-3">
            {reports.map(report => {
                const config = TYPE_CONFIG[report.type];
                return (
                    <Card key={report.id}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                    <span className="text-2xl">{config.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900">{report.name}</p>
                                        <p className="text-sm text-gray-600">{config.label}</p>
                                        <p className="text-xs text-gray-500 mt-1">Generiert: {report.generated}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Eye className="w-4 h-4" /> Vorschau
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => downloadReport(report.id, report.name)}
                                        className="gap-2"
                                    >
                                        <Download className="w-4 h-4" /> PDF
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}