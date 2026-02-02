import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Wifi, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

export default function CollaborationDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sessions');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('collaborationEngine', {
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
        active: 'bg-green-100 text-green-800',
        idle: 'bg-yellow-100 text-yellow-800',
        closed: 'bg-gray-100 text-gray-800',
        online: 'bg-green-100 text-green-800',
        away: 'bg-yellow-100 text-yellow-800',
        offline: 'bg-gray-100 text-gray-800',
        document: 'bg-blue-100 text-blue-800',
        whiteboard: 'bg-purple-100 text-purple-800',
        spreadsheet: 'bg-green-100 text-green-800',
        code: 'bg-indigo-100 text-indigo-800',
        design: 'bg-pink-100 text-pink-800',
        form: 'bg-cyan-100 text-cyan-800',
        insert: 'bg-green-100 text-green-800',
        delete: 'bg-red-100 text-red-800',
        update: 'bg-blue-100 text-blue-800',
        move: 'bg-purple-100 text-purple-800',
        format: 'bg-orange-100 text-orange-800',
        comment: 'bg-cyan-100 text-cyan-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['sessions', 'presence', 'edits'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'sessions' && '👥 Sessions'}
                        {tab === 'presence' && '📡 Presence'}
                        {tab === 'edits' && '✏️ Edits'}
                    </button>
                ))}
            </div>

            {activeTab === 'sessions' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.session_stats.total_sessions}</div>
                            <div className="text-xs text-gray-600">Sessions</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.session_stats.active_sessions}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.session_stats.idle_sessions}</div>
                            <div className="text-xs text-gray-600">Idle</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.session_stats.total_participants}</div>
                            <div className="text-xs text-gray-600">Teilnehmer</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-cyan-600">{data.session_stats.total_edits}</div>
                            <div className="text-xs text-gray-600">Edits</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Typ</h4>
                            {Object.entries(data.session_stats.by_resource_type || {}).slice(0, 3).map(([type, count]) => (
                                <div key={type} className="text-xs flex justify-between">
                                    <span>{type}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.sessions.map(session => (
                            <Card key={session.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{session.session_name}</h5>
                                                <Badge className={statusColors[session.resource_type]}>
                                                    {session.resource_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="font-mono text-gray-600">
                                                    {session.resource_id?.substring(0, 12)}
                                                </span>
                                                <span className="text-purple-600">
                                                    Teilnehmer: {session.active_participants}/{session.max_participants}
                                                </span>
                                                <span className="text-cyan-600">
                                                    Edits: {session.edit_count}
                                                </span>
                                                {session.started_at && (
                                                    <span className="text-gray-600">
                                                        Start: {new Date(session.started_at).toLocaleString('de-DE')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={statusColors[session.status]}>
                                            {session.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'presence' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.presence_stats.total_presences}</div>
                            <div className="text-xs text-gray-600">Presences</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.presence_stats.online}</div>
                            <div className="text-xs text-gray-600">Online</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.presence_stats.active}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.presence_stats.idle}</div>
                            <div className="text-xs text-gray-600">Idle</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.presence_stats.away}</div>
                            <div className="text-xs text-gray-600">Away</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.presence_stats.editing_now}</div>
                            <div className="text-xs text-gray-600">Bearbeiten</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.presences.slice(0, 40).map(presence => (
                            <Card key={presence.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Wifi className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">User {presence.user_id?.substring(0, 8)}</h5>
                                                {presence.is_editing && (
                                                    <Badge className="bg-purple-100 text-purple-800">Bearbeitet</Badge>
                                                )}
                                                {presence.user_color && (
                                                    <div 
                                                        className="w-4 h-4 rounded-full border"
                                                        style={{ backgroundColor: presence.user_color }}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                {presence.device_type && (
                                                    <span className="text-blue-600">
                                                        {presence.device_type}
                                                    </span>
                                                )}
                                                {presence.editing_region && (
                                                    <span className="text-purple-600">
                                                        Region: {presence.editing_region}
                                                    </span>
                                                )}
                                                {presence.last_heartbeat_at && (
                                                    <span className="text-gray-600">
                                                        Heartbeat: {new Date(presence.last_heartbeat_at).toLocaleTimeString('de-DE')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={statusColors[presence.status]}>
                                            {presence.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'edits' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.edit_stats.total_edits}</div>
                            <div className="text-xs text-gray-600">Edits</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.edit_stats.insert}</div>
                            <div className="text-xs text-gray-600">Insert</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.edit_stats.delete}</div>
                            <div className="text-xs text-gray-600">Delete</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.edit_stats.update}</div>
                            <div className="text-xs text-gray-600">Update</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.edit_stats.conflicts_detected}</div>
                            <div className="text-xs text-gray-600">Konflikte</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.edit_stats.conflicts_resolved}</div>
                            <div className="text-xs text-gray-600">Gelöst</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.edits.slice(0, 40).map(edit => (
                            <Card key={edit.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Edit3 className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">Edit #{edit.sequence_number}</h5>
                                                <Badge className={statusColors[edit.edit_type]}>
                                                    {edit.edit_type}
                                                </Badge>
                                                {edit.conflict_detected && (
                                                    <Badge className="bg-orange-100 text-orange-800">Konflikt</Badge>
                                                )}
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    User: {edit.user_id?.substring(0, 8)}
                                                </span>
                                                {edit.is_synced && (
                                                    <Badge variant="outline" className="text-xs">✓ Sync</Badge>
                                                )}
                                                {edit.timestamp && (
                                                    <span className="text-gray-600">
                                                        {new Date(edit.timestamp).toLocaleString('de-DE')}
                                                    </span>
                                                )}
                                            </div>
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