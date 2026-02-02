import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Eye, Edit, Trash2, LogIn, LogOut, DollarSign, FileUp, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const ACTION_ICONS = {
    create: <Edit className="w-4 h-4" />,
    update: <Edit className="w-4 h-4" />,
    delete: <Trash2 className="w-4 h-4" />,
    view: <Eye className="w-4 h-4" />,
    export: <Download className="w-4 h-4" />,
    login: <LogIn className="w-4 h-4" />,
    logout: <LogOut className="w-4 h-4" />,
    payment: <DollarSign className="w-4 h-4" />,
    document_upload: <FileUp className="w-4 h-4" />,
    notification_sent: <Bell className="w-4 h-4" />
};

const ACTION_COLORS = {
    create: 'bg-green-100 text-green-800',
    update: 'bg-blue-100 text-blue-800',
    delete: 'bg-red-100 text-red-800',
    view: 'bg-gray-100 text-gray-800',
    export: 'bg-purple-100 text-purple-800',
    login: 'bg-green-100 text-green-800',
    logout: 'bg-gray-100 text-gray-800',
    payment: 'bg-green-100 text-green-800',
    document_upload: 'bg-blue-100 text-blue-800',
    notification_sent: 'bg-purple-100 text-purple-800'
};

export default function ActivityLogDashboard({ organizationId }) {
    const [activities, setActivities] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        organization_id: organizationId,
        action: '',
        entity_type: '',
        user_id: ''
    });
    const [pagination, setPagination] = useState({ limit: 50, offset: 0 });

    useEffect(() => {
        loadActivities();
    }, [filters, pagination]);

    const loadActivities = async () => {
        try {
            setLoading(true);
            const response = await base44.functions.invoke('getActivityLog', {
                ...filters,
                limit: pagination.limit,
                offset: pagination.offset
            });
            setActivities(response.data.activities);
            setStats(response.data.stats);
            setPagination(prev => ({
                ...prev,
                total: response.data.pagination.total,
                hasMore: response.data.pagination.hasMore
            }));
        } catch (error) {
            console.error('Load activities error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const csv = [
                ['Zeitpunkt', 'Benutzer', 'Aktion', 'Entität', 'Beschreibung', 'IP'].join(',')
            ];

            activities.forEach(a => {
                csv.push([
                    format(new Date(a.timestamp), 'dd.MM.yyyy HH:mm:ss', { locale: de }),
                    a.user?.full_name || 'Unknown',
                    a.action,
                    `${a.entity_type}${a.entity_id ? ` (${a.entity_id})` : ''}`,
                    a.description || '',
                    a.ip_address || ''
                ].map(cell => `"${cell}"`).join(','));
            });

            const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
        } catch (error) {
            console.error('Export error:', error);
        }
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
            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div>
                                <p className="text-sm text-gray-600">Gesamt Aktivitäten</p>
                                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div>
                                <p className="text-sm text-gray-600">Top Aktion</p>
                                <p className="text-2xl font-bold mt-1">
                                    {Object.entries(stats.by_action)[0]?.[0] || 'N/A'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div>
                                <p className="text-sm text-gray-600">Aktive Benutzer</p>
                                <p className="text-2xl font-bold mt-1">
                                    {Object.keys(stats.by_user).length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Select 
                            value={filters.action} 
                            onValueChange={(value) => {
                                setFilters({...filters, action: value});
                                setPagination({...pagination, offset: 0});
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Aktion" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={null}>Alle Aktionen</SelectItem>
                                <SelectItem value="create">Erstellt</SelectItem>
                                <SelectItem value="update">Aktualisiert</SelectItem>
                                <SelectItem value="delete">Gelöscht</SelectItem>
                                <SelectItem value="payment">Zahlung</SelectItem>
                                <SelectItem value="login">Login</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select 
                            value={filters.entity_type} 
                            onValueChange={(value) => {
                                setFilters({...filters, entity_type: value});
                                setPagination({...pagination, offset: 0});
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Entitätstyp" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={null}>Alle Typen</SelectItem>
                                <SelectItem value="Payment">Zahlung</SelectItem>
                                <SelectItem value="Document">Dokument</SelectItem>
                                <SelectItem value="Tenant">Mieter</SelectItem>
                                <SelectItem value="Building">Gebäude</SelectItem>
                            </SelectContent>
                        </Select>

                        <Input 
                            placeholder="Benutzer-Email..."
                            onChange={(e) => {
                                setFilters({...filters, user_id: e.target.value});
                                setPagination({...pagination, offset: 0});
                            }}
                        />

                        <Button onClick={handleExport} variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            CSV Export
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Activity List */}
            <div className="space-y-3">
                {activities.map(activity => (
                    <Card key={activity.id}>
                        <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${ACTION_COLORS[activity.action]}`}>
                                    {ACTION_ICONS[activity.action]}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge className={ACTION_COLORS[activity.action]}>
                                                    {activity.action}
                                                </Badge>
                                                <span className="font-medium text-gray-900">
                                                    {activity.user?.full_name}
                                                </span>
                                                <span className="text-gray-600">
                                                    {activity.entity_type}
                                                    {activity.entity_id && ` #${activity.entity_id}`}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-2">
                                                {format(new Date(activity.timestamp), 'dd.MM.yyyy HH:mm:ss', { locale: de })}
                                                {activity.ip_address && ` • IP: ${activity.ip_address}`}
                                            </p>
                                            {activity.description && (
                                                <p className="text-sm text-gray-700 mt-1">
                                                    {activity.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {activity.changes && Object.keys(activity.changes).length > 0 && (
                                        <details className="mt-2 text-sm">
                                            <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                                                Änderungen
                                            </summary>
                                            <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-x-auto">
                                                {JSON.stringify(activity.changes, null, 2)}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {activities.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            Keine Aktivitäten gefunden
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Pagination */}
            {pagination.total > pagination.limit && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setPagination({...pagination, offset: Math.max(0, pagination.offset - pagination.limit)})}
                        disabled={pagination.offset === 0}
                    >
                        Zurück
                    </Button>
                    <span className="text-sm text-gray-600">
                        {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} von {pagination.total}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setPagination({...pagination, offset: pagination.offset + pagination.limit})}
                        disabled={!pagination.hasMore}
                    >
                        Weiter
                    </Button>
                </div>
            )}
        </div>
    );
}