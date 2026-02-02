import React from 'react';
import { Users, FileText, Wrench, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminStats() {
    const stats = [
        { label: 'Nutzer', value: '1.245', icon: Users, color: 'bg-blue-100 text-blue-600', change: '+12% diese Woche' },
        { label: 'Aktive Reparaturen', value: '34', icon: Wrench, color: 'bg-orange-100 text-orange-600', change: '8 offen' },
        { label: 'Dokumente', value: '8.932', icon: FileText, color: 'bg-green-100 text-green-600', change: '+245 diese Woche' },
        { label: 'Einnahmen', value: '€45.2K', icon: DollarSign, color: 'bg-purple-100 text-purple-600', change: '+8% vs. letzer Monat' },
        { label: 'Uptime', value: '99.98%', icon: TrendingUp, color: 'bg-emerald-100 text-emerald-600', change: 'Stabil' },
        { label: 'Fehler (24h)', value: '12', icon: AlertCircle, color: 'bg-red-100 text-red-600', change: '-3 vs. Vortag' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                    <Card key={idx} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className={`p-2 rounded-lg ${stat.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}