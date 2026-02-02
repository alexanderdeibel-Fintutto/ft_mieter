import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SystemHealth() {
    const services = [
        { name: 'API Server', status: 'healthy', uptime: '99.99%', avgResponse: '45ms' },
        { name: 'Datenbank', status: 'healthy', uptime: '99.98%', avgResponse: '8ms' },
        { name: 'Cache (Redis)', status: 'healthy', uptime: '99.95%', avgResponse: '2ms' },
        { name: 'Message Queue', status: 'degraded', uptime: '99.50%', avgResponse: '120ms' },
        { name: 'Search Index', status: 'healthy', uptime: '99.97%', avgResponse: '25ms' },
        { name: 'File Storage', status: 'healthy', uptime: '100%', avgResponse: '150ms' },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Systemintegritäts-Überblick</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {services.map((service, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-3">
                                {service.status === 'healthy' ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                )}
                                <div>
                                    <p className="font-medium text-gray-900">{service.name}</p>
                                    <p className="text-sm text-gray-500">{service.avgResponse} Ø Response</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge className={service.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                    {service.status === 'healthy' ? 'Aktiv' : 'Beeinträchtigt'}
                                </Badge>
                                <p className="text-sm text-gray-500 mt-1">{service.uptime}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}