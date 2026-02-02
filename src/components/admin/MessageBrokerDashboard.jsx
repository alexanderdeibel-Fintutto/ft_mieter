import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Inbox, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function MessageBrokerDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('brokers');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('messageBrokerEngine', {
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
        pending: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        dead_letter: 'bg-gray-100 text-gray-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['brokers', 'topics', 'messages'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'brokers' && '📡 Brokers'}
                        {tab === 'topics' && '📬 Topics'}
                        {tab === 'messages' && '📨 Messages'}
                    </button>
                ))}
            </div>

            {activeTab === 'brokers' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_brokers}</div>
                            <div className="text-xs text-gray-600">Brokers</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_brokers}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.total_messages}</div>
                            <div className="text-xs text-gray-600">Messages gesamt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.failed_messages}</div>
                            <div className="text-xs text-gray-600">Fehlgeschlagen</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.brokers.map(broker => (
                            <Card key={broker.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{broker.broker_name}</h5>
                                                <Badge variant="outline">{broker.broker_type}</Badge>
                                                <Badge variant="outline">{broker.protocol}</Badge>
                                            </div>
                                            {broker.host && (
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        {broker.host}:{broker.port}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Max Connections: {broker.max_connections}
                                                    </span>
                                                </div>
                                            )}
                                            {broker.is_clustered && (
                                                <Badge className="bg-purple-100 text-purple-800 mt-2">Clustered</Badge>
                                            )}
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Messages: {broker.total_messages || 0}
                                                </span>
                                                <span className="text-xs text-red-600">
                                                    Failed: {broker.failed_messages || 0}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge className={broker.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {broker.is_active ? 'aktiv' : 'inaktiv'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'topics' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_topics}</div>
                            <div className="text-xs text-gray-600">Topics</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.stats.pending_messages}</div>
                            <div className="text-xs text-gray-600">Pending</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.processing_messages}</div>
                            <div className="text-xs text-gray-600">Processing</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Nach Typ</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.topics_by_type || {}).map(([type, count]) => (
                                    <Badge key={type} variant="outline">
                                        {type}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.topics.map(topic => {
                            const broker = data.brokers.find(b => b.id === topic.broker_id);
                            return (
                                <Card key={topic.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Inbox className="w-4 h-4 text-blue-600" />
                                                    <span className="font-semibold text-sm">{topic.topic_name}</span>
                                                    <Badge variant="outline">{topic.topic_type}</Badge>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Broker: {broker?.broker_name || 'Unknown'}
                                                </p>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Messages: {topic.message_count || 0}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Consumers: {topic.consumer_count || 0}
                                                    </span>
                                                    {topic.message_ttl_seconds > 0 && (
                                                        <span className="text-xs text-gray-600">
                                                            TTL: {topic.message_ttl_seconds}s
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-3 mt-2">
                                                    {topic.durable && (
                                                        <Badge className="bg-green-100 text-green-800 text-xs">Durable</Badge>
                                                    )}
                                                    {topic.auto_delete && (
                                                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">Auto-Delete</Badge>
                                                    )}
                                                </div>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Published: {topic.messages_published || 0}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Consumed: {topic.messages_consumed || 0}
                                                    </span>
                                                </div>
                                            </div>
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
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.stats.pending_messages}</div>
                            <div className="text-xs text-gray-600">Pending</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.processing_messages}</div>
                            <div className="text-xs text-gray-600">Processing</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.dead_letter_messages}</div>
                            <div className="text-xs text-gray-600">Dead Letter</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Nach Status</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.messages_by_status || {}).map(([status, count]) => (
                                    <Badge key={status} className={statusColors[status]}>
                                        {status}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.messages.map(message => {
                            const topic = data.topics.find(t => t.id === message.topic_id);
                            return (
                                <Card key={message.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-blue-600" />
                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                        {message.message_id.substring(0, 8)}...
                                                    </code>
                                                    {message.priority > 0 && (
                                                        <Badge variant="outline">P{message.priority}</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Topic: {topic?.topic_name || 'Unknown'}
                                                </p>
                                                {message.routing_key && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Routing: {message.routing_key}
                                                    </p>
                                                )}
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Published: {new Date(message.published_at).toLocaleString('de-DE')}
                                                    </span>
                                                    {message.consumed_at && (
                                                        <span className="text-xs text-gray-600">
                                                            Consumed: {new Date(message.consumed_at).toLocaleTimeString('de-DE')}
                                                        </span>
                                                    )}
                                                </div>
                                                {message.retry_count > 0 && (
                                                    <span className="text-xs text-yellow-600 mt-2 inline-block">
                                                        Retries: {message.retry_count}/{message.max_retries}
                                                    </span>
                                                )}
                                                {message.error_message && (
                                                    <p className="text-xs text-red-600 mt-2">
                                                        Error: {message.error_message}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge className={statusColors[message.status]}>
                                                {message.status}
                                            </Badge>
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