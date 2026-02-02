import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Webhook, Zap, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function WebhookManagementDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('endpoints');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('webhookManagementEngine', {
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
        delivered: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        cancelled: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        timeout: 'bg-orange-100 text-orange-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['endpoints', 'events', 'deliveries'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'endpoints' && '🔗 Endpoints'}
                        {tab === 'events' && '⚡ Events'}
                        {tab === 'deliveries' && '📨 Deliveries'}
                    </button>
                ))}
            </div>

            {activeTab === 'endpoints' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_endpoints}</div>
                            <div className="text-xs text-gray-600">Endpoints</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_endpoints}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.total_deliveries}</div>
                            <div className="text-xs text-gray-600">Deliveries</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.stats.success_rate}%</div>
                            <div className="text-xs text-gray-600">Success Rate</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.endpoints.map(endpoint => {
                            const successRate = endpoint.total_deliveries > 0
                                ? Math.round((endpoint.successful_deliveries / endpoint.total_deliveries) * 100)
                                : 0;
                            return (
                                <Card key={endpoint.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Webhook className="w-4 h-4 text-blue-600" />
                                                    <h5 className="font-semibold text-sm">{endpoint.endpoint_name}</h5>
                                                    {endpoint.is_active && (
                                                        <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1 break-all">
                                                    URL: {endpoint.url}
                                                </p>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Timeout: {endpoint.timeout_seconds}s
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Total: {endpoint.total_deliveries || 0}
                                                    </span>
                                                    <span className="text-xs text-green-600">
                                                        Erfolg: {endpoint.successful_deliveries || 0}
                                                    </span>
                                                    <span className="text-xs text-red-600">
                                                        Fehler: {endpoint.failed_deliveries || 0}
                                                    </span>
                                                </div>
                                                {endpoint.event_types && endpoint.event_types.length > 0 && (
                                                    <div className="flex gap-1 mt-2 flex-wrap">
                                                        <span className="text-xs text-gray-600">Events:</span>
                                                        {endpoint.event_types.slice(0, 5).map(evt => (
                                                            <Badge key={evt} variant="outline" className="text-xs">
                                                                {evt}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                {endpoint.last_delivery_at && (
                                                    <span className="text-xs text-gray-600 mt-2 inline-block">
                                                        Letzte Zustellung: {new Date(endpoint.last_delivery_at).toLocaleString('de-DE')}
                                                    </span>
                                                )}
                                                {endpoint.total_deliveries > 0 && (
                                                    <div className="mt-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                                <div 
                                                                    className="h-2 rounded-full bg-green-500"
                                                                    style={{ width: `${successRate}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-semibold text-green-600">{successRate}%</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <Badge className={endpoint.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                {endpoint.is_active ? 'ON' : 'OFF'}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {activeTab === 'events' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_events}</div>
                            <div className="text-xs text-gray-600">Events</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.stats.pending_events}</div>
                            <div className="text-xs text-gray-600">Pending</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.events.filter(e => e.status === 'delivered').length}
                            </div>
                            <div className="text-xs text-gray-600">Zugestellt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Status</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.events_by_status || {}).map(([status, count]) => (
                                    <Badge key={status} variant="outline">
                                        {status}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.events.map(event => (
                            <Card key={event.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-blue-600" />
                                                <span className="font-semibold text-sm">{event.event_type}</span>
                                                <Badge variant="outline">{event.event_id.substring(0, 8)}...</Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Versuche: {event.delivery_count || 0}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Erstellt: {new Date(event.created_at).toLocaleString('de-DE')}
                                                </span>
                                            </div>
                                            {event.next_retry_at && (
                                                <p className="text-xs text-yellow-600 mt-1">
                                                    Nächster Retry: {new Date(event.next_retry_at).toLocaleString('de-DE')}
                                                </p>
                                            )}
                                        </div>
                                        <Badge className={statusColors[event.status]}>
                                            {event.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'deliveries' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_deliveries}</div>
                            <div className="text-xs text-gray-600">Deliveries</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.successful_deliveries}</div>
                            <div className="text-xs text-gray-600">Erfolg</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.failed_deliveries}</div>
                            <div className="text-xs text-gray-600">Fehler</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Status</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.deliveries_by_status || {}).map(([status, count]) => (
                                    <Badge key={status} className={statusColors[status]}>
                                        {status}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.deliveries.map(delivery => {
                            const endpoint = data.endpoints.find(e => e.id === delivery.endpoint_id);
                            const event = data.events.find(e => e.id === delivery.event_id);
                            return (
                                <Card key={delivery.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Send className="w-4 h-4 text-blue-600" />
                                                    <span className="font-semibold text-sm">
                                                        {endpoint?.endpoint_name || 'Unknown'}
                                                    </span>
                                                    <Badge variant="outline">
                                                        {event?.event_type || 'Unknown'}
                                                    </Badge>
                                                </div>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Versuch #{delivery.attempt_number}
                                                    </span>
                                                    {delivery.http_status && (
                                                        <span className="text-xs text-gray-600">
                                                            HTTP: {delivery.http_status}
                                                        </span>
                                                    )}
                                                    {delivery.duration_ms && (
                                                        <span className="text-xs text-gray-600">
                                                            {delivery.duration_ms}ms
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    {new Date(delivery.attempted_at).toLocaleString('de-DE')}
                                                </span>
                                                {delivery.error_message && (
                                                    <p className="text-xs text-red-600 mt-1">
                                                        Error: {delivery.error_message}
                                                    </p>
                                                )}
                                                {delivery.response_body && (
                                                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                                                        Response: {delivery.response_body}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge className={statusColors[delivery.status]}>
                                                {delivery.status}
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