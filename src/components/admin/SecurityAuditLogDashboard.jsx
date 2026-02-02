import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
    'configuration',
    'feature_flag',
    'api_route',
    'rate_limit',
    'cache',
    'data_import',
    'data_export',
    'mapping',
    'health_check',
    'billing',
    'system'
];

const SEVERITIES = ['low', 'medium', 'high', 'critical'];

export default function SecurityAuditLogDashboard({ organizationId }) {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        action_category: '',
        severity: '',
        status: ''
    });
    const [activeTab, setActiveTab] = useState('logs');

    useEffect(() => {
        loadData();
    }, [organizationId, filters]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [logsRes, statsRes] = await Promise.all([
                base44.functions.invoke('securityAuditLogger', {
                    action: 'get_audit_logs',
                    organization_id: organizationId,
                    filters: Object.keys(filters).reduce((acc, key) => {
                        if (filters[key]) acc[key] = filters[key];
                        return acc;
                    }, {})
                }),
                base44.functions.invoke('securityAuditLogger', {
                    action: 'get_audit_stats',
                    organization_id: organizationId
                })
            ]);

            setLogs(logsRes.data.logs || []);
            setStats(statsRes.data.stats);
        } catch (error) {
            console.error('Load error:', error);
            toast.error('Fehler beim Laden');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadData();
            return;
        }

        try {
            const res = await base44.functions.invoke('securityAuditLogger', {
                action: 'search_audit_logs',
                organization_id: organizationId,
                search_query: searchQuery
            });
            setLogs(res.data.results || []);
            toast.success(`${res.data.count} Ergebnisse gefunden`);
        } catch (error) {
            toast.error('Fehler bei der Suche');
        }
    };

    const handleExport = async () => {
        try {
            const res = await base44.functions.invoke('securityAuditLogger', {
                action: 'export_audit_logs',
                organization_id: organizationId
            });
            
            const blob = new Blob([res.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'audit-logs.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            
            toast.success('Audit-Logs exportiert');
        } catch (error) {
            toast.error('Fehler beim Export');
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'bg-green-100 text-green-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading && !stats) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['logs', 'stats'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'logs' && '📋 Audit-Logs'}
                        {tab === 'stats' && '📊 Statistiken'}
                    </button>
                ))}
            </div>

            {activeTab === 'logs' && (
                <>
                    <div className="flex gap-3 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Suche nach Aktion, User, Ressource..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Button onClick={handleSearch}>
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <Select value={filters.action_category} onValueChange={(v) => setFilters({...filters, action_category: v})}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Kategorie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={null}>Alle Kategorien</SelectItem>
                                {CATEGORIES.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filters.severity} onValueChange={(v) => setFilters({...filters, severity: v})}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Schweregrad" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={null}>Alle</SelectItem>
                                {SEVERITIES.map(sev => (
                                    <SelectItem key={sev} value={sev}>{sev}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button variant="outline" onClick={handleExport}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {logs.map(log => (
                            <Card key={log.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h5 className="font-semibold text-sm">{log.action}</h5>
                                                <Badge variant="outline" className="text-xs">{log.action_category}</Badge>
                                            </div>
                                            <p className="text-xs text-gray-600">
                                                👤 {log.user_email} • 🕐 {new Date(log.timestamp).toLocaleString('de-DE')}
                                            </p>
                                            {log.resource_name && (
                                                <p className="text-xs text-gray-600">
                                                    📦 {log.resource_type}: {log.resource_name}
                                                </p>
                                            )}
                                            {log.changes && log.changes.length > 0 && (
                                                <div className="text-xs text-gray-600 mt-2 space-y-1">
                                                    <p className="font-medium">Änderungen:</p>
                                                    {log.changes.slice(0, 3).map((change, idx) => (
                                                        <p key={idx}>
                                                            • {change.field}: {change.old || '(leer)'} → {change.new || '(leer)'}
                                                        </p>
                                                    ))}
                                                    {log.changes.length > 3 && (
                                                        <p className="text-blue-600">+ {log.changes.length - 3} weitere</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2 items-end">
                                            <Badge className={getSeverityColor(log.severity)}>
                                                {log.severity}
                                            </Badge>
                                            <Badge className={getStatusColor(log.status)}>
                                                {log.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {logs.length === 0 && (
                            <Card>
                                <CardContent className="p-8 text-center text-gray-500">
                                    Keine Audit-Logs gefunden
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'stats' && stats && (
                <div className="space-y-6">
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{stats.total_logs}</div>
                            <div className="text-xs text-gray-600">Gesamt-Logs</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{stats.by_status?.success || 0}</div>
                            <div className="text-xs text-gray-600">Erfolgreich</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{stats.by_status?.failed || 0}</div>
                            <div className="text-xs text-gray-600">Fehlgeschlagen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{stats.by_severity?.critical || 0}</div>
                            <div className="text-xs text-gray-600">Kritisch</div>
                        </CardContent></Card>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle className="text-sm">Nach Kategorie</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {Object.entries(stats.by_category || {})
                                        .sort(([,a], [,b]) => b - a)
                                        .map(([category, count]) => (
                                            <div key={category} className="flex justify-between items-center p-2 border rounded">
                                                <span className="text-sm">{category}</span>
                                                <Badge>{count}</Badge>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="text-sm">Nach User</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {Object.entries(stats.by_user || {})
                                        .sort(([,a], [,b]) => b - a)
                                        .slice(0, 10)
                                        .map(([user, count]) => (
                                            <div key={user} className="flex justify-between items-center p-2 border rounded">
                                                <span className="text-sm truncate">{user}</span>
                                                <Badge>{count}</Badge>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {stats.recent_critical.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle className="text-sm">Kritische Aktionen</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {stats.recent_critical.map(log => (
                                        <div key={log.id} className="p-3 border border-red-200 rounded bg-red-50">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-sm">{log.action}</p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {log.user_email} • {new Date(log.timestamp).toLocaleString('de-DE')}
                                                    </p>
                                                </div>
                                                <Badge className="bg-red-600 text-white">CRITICAL</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}