import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Zap, Search, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function EventSourcingDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('events');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('eventSourcingEngine', {
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
        pending: 'bg-gray-100 text-gray-800',
        processing: 'bg-blue-100 text-blue-800',
        executing: 'bg-blue-100 text-blue-800',
        succeeded: 'bg-green-100 text-green-800',
        completed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        cancelled: 'bg-orange-100 text-orange-800',
        cached: 'bg-purple-100 text-purple-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['events', 'commands', 'queries'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'events' && '📊 Events'}
                        {tab === 'commands' && '⚡ Commands'}
                        {tab === 'queries' && '🔍 Queries'}
                    </button>
                ))}
            </div>

            {activeTab === 'events' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.event_stats.total_events}</div>
                            <div className="text-xs text-gray-600">Events</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.event_stats.processed_events}</div>
                            <div className="text-xs text-gray-600">Verarbeitet</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.event_stats.unprocessed_events}</div>
                            <div className="text-xs text-gray-600">Unverarbeitet</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.event_stats.snapshots}</div>
                            <div className="text-xs text-gray-600">Snapshots</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Typ</h4>
                            {Object.entries(data.event_stats.by_aggregate_type || {}).slice(0, 3).map(([type, count]) => (
                                <div key={type} className="text-xs flex justify-between">
                                    <span className="truncate">{type}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Event-Typen</h4>
                            {Object.entries(data.event_stats.by_event_type || {}).slice(0, 3).map(([type, count]) => (
                                <div key={type} className="text-xs flex justify-between">
                                    <span className="truncate">{type}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.events.slice(0, 40).map(event => (
                            <Card key={event.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Database className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{event.event_type}</h5>
                                                {event.is_snapshot && (
                                                    <Badge className="bg-purple-100 text-purple-800">Snapshot</Badge>
                                                )}
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Aggregate: {event.aggregate_type}
                                                </span>
                                                <span className="text-blue-600">
                                                    Seq: #{event.sequence_number}
                                                </span>
                                                <span className="font-mono text-gray-600">
                                                    {event.aggregate_id?.substring(0, 8)}
                                                </span>
                                                {event.correlation_id && (
                                                    <span className="text-purple-600">
                                                        Corr: {event.correlation_id.substring(0, 8)}
                                                    </span>
                                                )}
                                                <span className="text-gray-600">
                                                    {new Date(event.timestamp).toLocaleString('de-DE')}
                                                </span>
                                            </div>
                                        </div>
                                        {event.processed ? (
                                            <Badge className="bg-green-100 text-green-800">Verarbeitet</Badge>
                                        ) : (
                                            <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'commands' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.command_stats.total_commands}</div>
                            <div className="text-xs text-gray-600">Commands</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-gray-600">{data.command_stats.pending}</div>
                            <div className="text-xs text-gray-600">Pending</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.command_stats.processing}</div>
                            <div className="text-xs text-gray-600">Verarbeitung</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.command_stats.succeeded}</div>
                            <div className="text-xs text-gray-600">Erfolgreich</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.command_stats.failed}</div>
                            <div className="text-xs text-gray-600">Fehlgeschlagen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.command_stats.avg_processing_time_ms}ms</div>
                            <div className="text-xs text-gray-600">Ø Zeit</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.commands.map(command => (
                            <Card key={command.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{command.command_type}</h5>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Aggregate: {command.aggregate_type}
                                                </span>
                                                <span className="font-mono text-gray-600">
                                                    {command.aggregate_id?.substring(0, 8)}
                                                </span>
                                                {command.processing_time_ms > 0 && (
                                                    <span className="text-purple-600">
                                                        Zeit: {command.processing_time_ms}ms
                                                    </span>
                                                )}
                                                {command.retry_count > 0 && (
                                                    <span className="text-orange-600">
                                                        Retries: {command.retry_count}/{command.max_retries}
                                                    </span>
                                                )}
                                                {command.events_generated && command.events_generated.length > 0 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {command.events_generated.length} Events
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={statusColors[command.status]}>
                                            {command.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'queries' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.query_stats.total_queries}</div>
                            <div className="text-xs text-gray-600">Queries</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-gray-600">{data.query_stats.pending}</div>
                            <div className="text-xs text-gray-600">Pending</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.query_stats.executing}</div>
                            <div className="text-xs text-gray-600">Ausführung</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.query_stats.completed}</div>
                            <div className="text-xs text-gray-600">Abgeschlossen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.query_stats.cache_hits}</div>
                            <div className="text-xs text-gray-600">Cache-Hits</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-cyan-600">{data.query_stats.avg_execution_time_ms}ms</div>
                            <div className="text-xs text-gray-600">Ø Zeit</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.queries.map(query => (
                            <Card key={query.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Search className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{query.query_name}</h5>
                                                {query.cache_hit && (
                                                    <Badge className="bg-purple-100 text-purple-800">Cache</Badge>
                                                )}
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Typ: {query.query_type}
                                                </span>
                                                {query.read_model_name && (
                                                    <span className="text-blue-600">
                                                        Model: {query.read_model_name}
                                                    </span>
                                                )}
                                                {query.execution_time_ms > 0 && (
                                                    <span className="text-purple-600">
                                                        Zeit: {query.execution_time_ms}ms
                                                    </span>
                                                )}
                                                {query.result_count > 0 && (
                                                    <span className="text-cyan-600">
                                                        Ergebnisse: {query.result_count}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={statusColors[query.status]}>
                                            {query.status}
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