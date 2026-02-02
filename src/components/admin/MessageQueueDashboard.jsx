import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Inbox, Send, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function MessageQueueDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('queues');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('messageQueueEngine', {
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
        pending: 'bg-blue-100 text-blue-800',
        in_flight: 'bg-yellow-100 text-yellow-800',
        processed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        dead_letter: 'bg-gray-100 text-gray-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['queues', 'messages', 'events'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'queues' && '📬 Queues'}
                        {tab === 'messages' && '✉️ Messages'}
                        {tab === 'events' && '⚡ Events'}
                    </button>
                ))}
            </div>

            {activeTab === 'queues' && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_queues}</div>
                            <div className="text-xs text-gray-600">Queues</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_queues}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.queues.map(queue => (
                            <Card key={queue.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Inbox className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{queue.queue_name}</h5>
                                                <Badge variant="outline" className="text-xs">{queue.queue_type}</Badge>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">{queue.description}</p>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    In Queue: {queue.messages_in_queue || 0}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    In Flight: {queue.messages_in_flight || 0}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Timeout: {queue.visibility_timeout}s
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Retention: {Math.floor(queue.message_retention_seconds / 3600)}h
                                                </span>
                                            </div>
                                        </div>
                                        <Badge className={queue.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {queue.is_active ? 'Aktiv' : 'Inaktiv'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'messages' && (
                <>
                    <div className="grid grid-cols-5 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_messages}</div>
                            <div className="text-xs text-gray-600">Gesamt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.pending_messages}</div>
                            <div className="text-xs text-gray-600">Ausstehend</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.stats.in_flight_messages}</div>
                            <div className="text-xs text-gray-600">In Bearbeitung</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.processed_messages}</div>
                            <div className="text-xs text-gray-600">Verarbeitet</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-gray-600">{data.stats.dead_letter_messages}</div>
                            <div className="text-xs text-gray-600">DLQ</div>
                        </CardContent></Card>
                    </div>

                    <Card>
                        <CardHeader><CardTitle className="text-sm">Messages nach Status</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(data.messages_by_status || {}).map(([status, count]) => (
                                    <div key={status} className="flex justify-between items-center p-2 border rounded">
                                        <span className="text-sm">{status}</span>
                                        <Badge>{count}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Letzte Messages</h4>
                        {data.messages.map(msg => (
                            <Card key={msg.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Send className="w-4 h-4 text-blue-600" />
                                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                    {msg.message_id.slice(0, 8)}
                                                </code>
                                                {msg.priority > 0 && (
                                                    <Badge variant="outline" className="text-xs">P{msg.priority}</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{msg.message_body}</p>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Empfangen: {msg.receive_count || 0}x
                                                </span>
                                                {msg.sent_timestamp && (
                                                    <span className="text-xs text-gray-600">
                                                        {new Date(msg.sent_timestamp).toLocaleString('de-DE')}
                                                    </span>
                                                )}
                                            </div>
                                            {msg.error_message && (
                                                <p className="text-xs text-red-600 mt-1">{msg.error_message}</p>
                                            )}
                                        </div>
                                        <Badge className={statusColors[msg.status]}>
                                            {msg.status}
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
                    <div className="grid grid-cols-2 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_events}</div>
                            <div className="text-xs text-gray-600">Events</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.processed_events}</div>
                            <div className="text-xs text-gray-600">Verarbeitet</div>
                        </CardContent></Card>
                    </div>

                    <Card>
                        <CardHeader><CardTitle className="text-sm">Events nach Typ</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(data.events_by_type || {}).map(([type, count]) => (
                                    <div key={type} className="flex justify-between items-center p-2 border rounded">
                                        <span className="text-sm">{type}</span>
                                        <Badge>{count}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Letzte Events</h4>
                        {data.events.map(event => (
                            <Card key={event.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-yellow-600" />
                                                <span className="text-sm font-semibold">{event.event_type}</span>
                                                <Badge variant="outline" className="text-xs">{event.topic}</Badge>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">Quelle: {event.source}</p>
                                            {event.payload && Object.keys(event.payload).length > 0 && (
                                                <code className="text-xs bg-gray-100 p-1 rounded block mt-2">
                                                    {JSON.stringify(event.payload).slice(0, 100)}...
                                                </code>
                                            )}
                                            <div className="flex gap-4 mt-2">
                                                {event.correlation_id && (
                                                    <span className="text-xs text-gray-600">
                                                        ID: {event.correlation_id.slice(0, 8)}
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-600">
                                                    {new Date(event.published_at).toLocaleString('de-DE')}
                                                </span>
                                                {event.subscribers_notified > 0 && (
                                                    <span className="text-xs text-green-600">
                                                        {event.subscribers_notified} Subscriber
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={event.is_processed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                            {event.is_processed ? 'Verarbeitet' : 'Ausstehend'}
                                        </Badge>
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