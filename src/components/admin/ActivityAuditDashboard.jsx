import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Lock, Globe, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ActivityAuditDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('activities');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('activityAuditEngine', {
                action: 'get_dashboard_data',
                organization_id: organizationId
            });
            setData(res.data);
        } catch (error) {
            console.error('Load error:', error);
            toast.error('Fehler beim Laden');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    const statusColors = {
        success: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800',
        warning: 'bg-orange-100 text-orange-800',
        critical: 'bg-red-100 text-red-800',
        login: 'bg-green-100 text-green-800',
        logout: 'bg-gray-100 text-gray-800',
        create: 'bg-blue-100 text-blue-800',
        update: 'bg-purple-100 text-purple-800',
        delete: 'bg-red-100 text-red-800',
        view: 'bg-cyan-100 text-cyan-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['activities', 'audits', 'sessions', 'events'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'activities' && '📊 Aktivitäten'}
                        {tab === 'audits' && '🔐 Audit-Logs'}
                        {tab === 'sessions' && '🌐 Sessions'}
                        {tab === 'events' && '⚠️ Events'}
                    </button>
                ))}
            </div>

            {activeTab === 'activities' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.activity_stats.total_activities}
                            </div>
                            <div className="text-xs text-gray-600">Aktivitäten</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.activity_stats.successful_activities}
                            </div>
                            <div className="text-xs text-gray-600">Erfolgreich</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">
                                {data.activity_stats.failed_activities}
                            </div>
                            <div className="text-xs text-gray-600">Fehlgeschlagen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Top-Typen</h4>
                            {Object.entries(data.activity_stats.by_type || {})
                                .slice(0, 3)
                                .map(([type, count]) => (
                                    <div key={type} className="text-xs flex justify-between">
                                        <span>{type}</span>
                                        <span className="font-bold">{count}</span>
                                    </div>
                                ))}
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.activities.map(activity => (
                            <Card key={activity.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-gray-600" />
                                                <Badge className={statusColors[activity.activity_type]}>
                                                    {activity.activity_type}
                                                </Badge>
                                                {activity.resource_type && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {activity.resource_type}
                                                    </Badge>
                                                )}
                                            </div>
                                            {activity.action_description && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {activity.action_description}
                                                </p>
                                            )}
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    {activity.ip_address}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    {activity.device_type}
                                                </span>
                                                {activity.duration_ms > 0 && (
                                                    <span className="text-xs text-purple-600">
                                                        ⏱️ {activity.duration_ms}ms
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={statusColors[activity.status]}>
                                            {activity.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'audits' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.audit_stats.total_audits}
                            </div>
                            <div className="text-xs text-gray-600">Audit-Einträge</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Schweregrad</h4>
                            {Object.entries(data.audit_stats.by_severity || {}).map(([sev, count]) => (
                                <div key={sev} className="text-xs flex justify-between">
                                    <Badge variant="outline" className="text-xs mb-1">{sev}</Badge>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Top-Aktionen</h4>
                            {Object.entries(data.audit_stats.by_action || {})
                                .slice(0, 3)
                                .map(([action, count]) => (
                                    <div key={action} className="text-xs flex justify-between">
                                        <span>{action}</span>
                                        <span className="font-bold">{count}</span>
                                    </div>
                                ))}
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.audits.filter(a => a.changes?.length > 0).length}
                            </div>
                            <div className="text-xs text-gray-600">Mit Änderungen</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.audits.map(audit => (
                            <Card key={audit.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Lock className="w-4 h-4 text-gray-600" />
                                                <span className="font-semibold text-sm">{audit.action}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {audit.entity_type}
                                                </Badge>
                                            </div>
                                            {audit.reason && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Grund: {audit.reason}
                                                </p>
                                            )}
                                            {audit.changes && audit.changes.length > 0 && (
                                                <div className="bg-gray-50 p-2 rounded mt-2 text-xs space-y-1">
                                                    {audit.changes.slice(0, 3).map((change, idx) => (
                                                        <div key={idx} className="text-gray-600">
                                                            <span className="font-mono">{change.field}</span>: {change.old_value} → {change.new_value}
                                                        </div>
                                                    ))}
                                                    {audit.changes.length > 3 && (
                                                        <div className="text-gray-600">
                                                            +{audit.changes.length - 3} weitere Änderungen
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <Badge className={statusColors[audit.severity]}>
                                            {audit.severity}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'sessions' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.session_stats.total_sessions}
                            </div>
                            <div className="text-xs text-gray-600">Sessions</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.session_stats.active_sessions}
                            </div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.session_stats.avg_duration_seconds}s
                            </div>
                            <div className="text-xs text-gray-600">Ø Dauer</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">
                                {data.sessions.filter(s => s.is_active).length}
                            </div>
                            <div className="text-xs text-gray-600">Derzeit aktiv</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.sessions.map(session => (
                            <Card key={session.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-gray-600" />
                                                <span className="font-semibold text-sm">
                                                    {session.browser} / {session.os}
                                                </span>
                                                {session.device_name && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {session.device_name}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    IP: {session.ip_address}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Aktivitäten: {session.activity_count}
                                                </span>
                                                {session.session_duration_seconds > 0 && (
                                                    <span className="text-xs text-purple-600">
                                                        ⏱️ {session.session_duration_seconds}s
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                Start: {new Date(session.started_at).toLocaleString('de-DE')}
                                            </span>
                                        </div>
                                        <Badge className={session.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {session.is_active ? 'AKTIV' : 'BEENDET'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'events' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.event_stats.total_events}
                            </div>
                            <div className="text-xs text-gray-600">System-Events</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">
                                {data.event_stats.open_events}
                            </div>
                            <div className="text-xs text-gray-600">Offen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">
                                {data.event_stats.critical_events}
                            </div>
                            <div className="text-xs text-gray-600">Kritisch</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Event-Typen</h4>
                            {['security', 'performance', 'error', 'warning'].map(type => (
                                <div key={type} className="text-xs flex justify-between">
                                    <span>{type}</span>
                                    <span className="font-bold">
                                        {data.events.filter(e => e.event_type === type).length}
                                    </span>
                                </div>
                            ))}
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.events.map(event => (
                            <Card key={event.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{event.title}</h5>
                                                <Badge variant="outline" className="text-xs">
                                                    {event.event_type}
                                                </Badge>
                                            </div>
                                            {event.description && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {event.description}
                                                </p>
                                            )}
                                            <div className="flex gap-4 mt-2">
                                                {event.source && (
                                                    <span className="text-xs text-gray-600">
                                                        Quelle: {event.source}
                                                    </span>
                                                )}
                                                {event.affected_component && (
                                                    <span className="text-xs text-gray-600">
                                                        Komponente: {event.affected_component}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge className={statusColors[event.severity]}>
                                                {event.severity}
                                            </Badge>
                                            <Badge variant="outline">
                                                {event.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}