import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, Users, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function WebSocketDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('servers');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 2000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('websocketEngine', {
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
        connected: 'bg-green-100 text-green-800',
        disconnected: 'bg-gray-100 text-gray-800',
        idle: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800'
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['servers', 'connections', 'messages'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'servers' && '📡 Servers'}
                        {tab === 'connections' && '🔌 Connections'}
                        {tab === 'messages' && '💬 Messages'}
                    </button>
                ))}
            </div>

            {activeTab === 'servers' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_servers}</div>
                            <div className="text-xs text-gray-600">Servers</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.total_connections}</div>
                            <div className="text-xs text-gray-600">Verbindungen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.total_messages}</div>
                            <div className="text-xs text-gray-600">Nachrichten</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {formatBytes(data.stats.total_bytes_sent + data.stats.total_bytes_received)}
                            </div>
                            <div className="text-xs text-gray-600">Traffic</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.servers.map(server => (
                            <Card key={server.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Wifi className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{server.server_name}</h5>
                                                <Badge variant="outline">{server.protocol}</Badge>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {server.host}:{server.port}
                                            </p>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Max: {server.max_connections}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Heartbeat: {server.heartbeat_interval}s
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-green-600">
                                                    Aktiv: {server.active_connections || 0}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Nachrichten: {server.total_messages || 0}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    ↑ {formatBytes(server.bytes_sent || 0)}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    ↓ {formatBytes(server.bytes_received || 0)}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge className={server.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {server.is_active ? 'aktiv' : 'inaktiv'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'connections' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.connections.length}</div>
                            <div className="text-xs text-gray-600">Verbindungen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_connections}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">
                                {data.connections.filter(c => c.status === 'idle').length}
                            </div>
                            <div className="text-xs text-gray-600">Idle</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Status</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.connections_by_status || {}).map(([status, count]) => (
                                    <Badge key={status} className={statusColors[status]}>
                                        {status}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.connections.map(connection => {
                            const server = data.servers.find(s => s.id === connection.server_id);
                            return (
                                <Card key={connection.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-blue-600" />
                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                        {connection.connection_id.substring(0, 8)}...
                                                    </code>
                                                    {connection.user_id && (
                                                        <span className="text-xs text-gray-600">User: {connection.user_id}</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Server: {server?.server_name || 'Unknown'}
                                                </p>
                                                {connection.ip_address && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        IP: {connection.ip_address}
                                                    </p>
                                                )}
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Gesendet: {connection.messages_sent || 0}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Empfangen: {connection.messages_received || 0}
                                                    </span>
                                                </div>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Verbunden: {new Date(connection.connected_at).toLocaleString('de-DE')}
                                                    </span>
                                                </div>
                                                {connection.last_activity_at && (
                                                    <span className="text-xs text-gray-600 mt-1 inline-block">
                                                        Aktivität: {new Date(connection.last_activity_at).toLocaleString('de-DE')}
                                                    </span>
                                                )}
                                            </div>
                                            <Badge className={statusColors[connection.status]}>
                                                {connection.status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {activeTab === 'messages' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_messages}</div>
                            <div className="text-xs text-gray-600">Nachrichten</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {formatBytes(data.stats.total_bytes_sent)}
                            </div>
                            <div className="text-xs text-gray-600">Gesendet</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {formatBytes(data.stats.total_bytes_received)}
                            </div>
                            <div className="text-xs text-gray-600">Empfangen</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.messages.map(message => {
                            const server = data.servers.find(s => s.id === message.server_id);
                            return (
                                <Card key={message.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <MessageSquare className="w-4 h-4 text-blue-600" />
                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                        {message.message_id.substring(0, 8)}...
                                                    </code>
                                                    <Badge variant="outline">{message.message_type}</Badge>
                                                    <Badge variant={message.direction === 'inbound' ? 'default' : 'secondary'}>
                                                        {message.direction === 'inbound' ? '→ IN' : '← OUT'}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Server: {server?.server_name || 'Unknown'}
                                                </p>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Größe: {formatBytes(message.size_bytes || 0)}
                                                    </span>
                                                    {message.latency_ms && (
                                                        <span className="text-xs text-gray-600">
                                                            Latenz: {message.latency_ms}ms
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-600">
                                                        {new Date(message.timestamp).toLocaleString('de-DE')}
                                                    </span>
                                                </div>
                                            </div>
                                            {message.is_delivered && (
                                                <Badge className="bg-green-100 text-green-800">
                                                    zugestellt
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}