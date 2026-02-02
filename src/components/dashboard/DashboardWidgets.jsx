import React from 'react';
import DashboardWidget from './DashboardWidget';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export function UpcomingTasksWidget() {
    const tasks = [
        { id: 1, title: 'Nebenkosten bezahlen', date: '2026-02-01', priority: 'high' },
        { id: 2, title: 'Reparatur buchen', date: '2026-02-05', priority: 'medium' },
    ];

    return (
        <div className="space-y-2">
            {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                        <p className="text-xs text-gray-500">{new Date(task.date).toLocaleDateString('de-DE')}</p>
                    </div>
                    <Badge className={task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                        {task.priority}
                    </Badge>
                </div>
            ))}
        </div>
    );
}

export function RepairStatusWidget() {
    const repairs = [
        { id: 1, title: 'Heizung nachjustieren', status: 'pending', daysOpen: 3 },
        { id: 2, title: 'Wasserhahn reparieren', status: 'in_progress', daysOpen: 1 },
    ];

    return (
        <div className="space-y-2">
            {repairs.map(repair => (
                <div key={repair.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    {repair.status === 'in_progress' ? (
                        <Clock className="w-4 h-4 text-blue-500" />
                    ) : (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{repair.title}</p>
                        <p className="text-xs text-gray-500">{repair.daysOpen} Tage offen</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function NextPaymentWidget() {
    const payment = { amount: 850, date: '2026-02-01', description: 'Miete Februar' };

    return (
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-4 border border-violet-200">
            <p className="text-sm text-gray-600 mb-1">{payment.description}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">€{payment.amount}</p>
            <p className="text-sm text-gray-500">Fällig: {new Date(payment.date).toLocaleDateString('de-DE')}</p>
        </div>
    );
}

export function LatestDocumentsWidget() {
    const documents = [
        { id: 1, name: 'Nebenkostenabrechnung 2025', date: '2026-01-15' },
        { id: 2, name: 'Mietvertrag 2023', date: '2023-06-01' },
    ];

    return (
        <div className="space-y-2">
            {documents.map(doc => (
                <div key={doc.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <span className="text-lg">📄</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500">{new Date(doc.date).toLocaleDateString('de-DE')}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function QuickStatsWidget() {
    const stats = [
        { label: 'Punkte', value: '175', icon: '⭐' },
        { label: 'Dokumente', value: '9', icon: '📄' },
        { label: 'Reparaturen', value: '2', icon: '🔧' },
    ];

    return (
        <div className="grid grid-cols-3 gap-2">
            {stats.map((stat, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-lg mb-1">{stat.icon}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
            ))}
        </div>
    );
}

export function CalendarEventsWidget() {
    const events = [
        { id: 1, title: 'Müllabfuhr', date: '2026-01-27', icon: '🗑️' },
        { id: 2, title: 'Heizungswartung', date: '2026-02-03', icon: '🔧' },
    ];

    return (
        <div className="space-y-2">
            {events.map(event => (
                <div key={event.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <span>{event.icon}</span>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString('de-DE')}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function CommunityNewsWidget() {
    const news = [
        { id: 1, title: 'Neue Gartengruppe gegründet', author: 'Admin', date: '2026-01-23' },
        { id: 2, title: 'Hausmeister-Sprechstunde', author: 'Verwaltung', date: '2026-01-20' },
    ];

    return (
        <div className="space-y-2">
            {news.map(item => (
                <div key={item.id} className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.author} • {new Date(item.date).toLocaleDateString('de-DE')}</p>
                </div>
            ))}
        </div>
    );
}