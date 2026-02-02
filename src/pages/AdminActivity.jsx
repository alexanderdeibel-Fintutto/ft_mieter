import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ACTIVITY_TYPES = {
    user_login: { label: 'Benutzer-Login', icon: '🔐', color: 'bg-blue-100 text-blue-700' },
    document_upload: { label: 'Dokument hochgeladen', icon: '📄', color: 'bg-green-100 text-green-700' },
    payment_made: { label: 'Zahlung getätigt', icon: '💰', color: 'bg-purple-100 text-purple-700' },
    repair_created: { label: 'Reparatur erstellt', icon: '🔧', color: 'bg-orange-100 text-orange-700' },
    user_invited: { label: 'Nutzer eingeladen', icon: '👥', color: 'bg-indigo-100 text-indigo-700' },
    settings_changed: { label: 'Einstellungen geändert', icon: '⚙️', color: 'bg-gray-100 text-gray-700' },
};

const MOCK_LOGS = [
    { id: 1, type: 'user_login', user: 'Anna Schmidt', detail: 'Angemeldet', timestamp: '2026-01-24 14:32', ip: '192.168.1.5' },
    { id: 2, type: 'document_upload', user: 'Max Müller', detail: 'Mietvertrag.pdf hochgeladen', timestamp: '2026-01-24 14:15', ip: '192.168.1.8' },
    { id: 3, type: 'payment_made', user: 'Lisa Wagner', detail: '€850 für Februar bezahlt', timestamp: '2026-01-24 13:45', ip: '192.168.1.10' },
    { id: 4, type: 'repair_created', user: 'Thomas Klein', detail: 'Heizung: Status offen', timestamp: '2026-01-24 13:20', ip: '192.168.1.3' },
    { id: 5, type: 'settings_changed', user: 'Admin', detail: 'Benachrichtigungen aktiviert', timestamp: '2026-01-24 12:00', ip: '192.168.1.1' },
    { id: 6, type: 'user_invited', user: 'Admin', detail: 'Sarah König eingeladen', timestamp: '2026-01-23 16:30', ip: '192.168.1.1' },
];

export default function AdminActivity() {
    const [logs, setLogs] = useState(MOCK_LOGS);
    const [filteredLogs, setFilteredLogs] = useState(MOCK_LOGS);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');

    const handleSearch = (query) => {
        setSearchQuery(query);
        const filtered = logs.filter(log =>
            log.user.toLowerCase().includes(query.toLowerCase()) ||
            log.detail.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredLogs(selectedFilter === 'all' ? filtered : filtered.filter(l => l.type === selectedFilter));
    };

    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter);
        setFilteredLogs(searchQuery
            ? filtered.filter(l => l.user.toLowerCase().includes(searchQuery.toLowerCase()) || l.detail.toLowerCase().includes(searchQuery.toLowerCase()))
            : filtered
        );
    };

    const exportLogs = () => {
        const csv = [
            ['Benutzer', 'Aktion', 'Details', 'Zeitstempel', 'IP'].join(','),
            ...filteredLogs.map(l => [l.user, l.type, l.detail, l.timestamp, l.ip].join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-4 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Aktivitätsprotokoll</h1>
                <Button onClick={exportLogs} variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" /> Export
                </Button>
            </div>

            {/* Search & Filter */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                        placeholder="Nach Nutzer oder Aktion suchen..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                    <Button
                        variant={selectedFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange('all')}
                        className={selectedFilter === 'all' ? 'bg-violet-600' : ''}
                    >
                        Alle
                    </Button>
                    {Object.entries(ACTIVITY_TYPES).map(([key, value]) => (
                        <Button
                            key={key}
                            variant={selectedFilter === key ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleFilterChange(key)}
                            className={selectedFilter === key ? 'bg-violet-600' : ''}
                        >
                            {value.icon} {value.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Logs List */}
            <div className="space-y-2">
                {filteredLogs.length > 0 ? (
                    filteredLogs.map(log => {
                        const type = ACTIVITY_TYPES[log.type];
                        return (
                            <Card key={log.id} className="hover:shadow-sm transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <span className="text-xl mt-1">{type.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium text-gray-900">{log.user}</p>
                                                    <Badge className={type.color}>{type.label}</Badge>
                                                </div>
                                                <p className="text-sm text-gray-600">{log.detail}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {log.timestamp} • IP: {log.ip}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            Keine Aktivitäten gefunden
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}