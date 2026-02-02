import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function FinancialOverview() {
    const financials = [
        { label: 'Gesamteinnahmen', value: '€145.300', change: '+12.5%', trend: 'up', period: 'vs. letzten Monat' },
        { label: 'Durchschn. Miete', value: '€850', change: '+2.3%', trend: 'up', period: 'vs. Vorjahr' },
        { label: 'Ausstehende Zahlungen', value: '€8.420', change: '-5.2%', trend: 'down', period: 'vs. letzten Monat' },
        { label: 'Nebenkosten (Ø)', value: '€245', change: '+8.1%', trend: 'up', period: 'vs. letzten Monat' },
    ];

    return (
        <div className="space-y-4">
            {financials.map((item, idx) => (
                <Card key={idx}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                                <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 mb-2">
                                    {item.trend === 'up' ? (
                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-blue-600" />
                                    )}
                                    <Badge className={item.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                                        {item.change}
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-500">{item.period}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}