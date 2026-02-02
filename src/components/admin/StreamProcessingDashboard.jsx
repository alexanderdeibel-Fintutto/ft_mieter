import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, Zap, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function StreamProcessingDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('streams');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 2000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('streamProcessingEngine', {
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
                {['streams', 'processors', 'events'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'streams' && '📡 Streams'}
                        {tab === 'processors' && '⚙️ Processors'}
                        {tab === 'events' && '⚡ Events'}
                    </button>
                ))}
            </div>

            {activeTab === 'streams' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_streams}</div>
                            <div className="text-xs text-gray-600">Streams</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_streams}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.total_events}</div>
                            <div className="text-xs text-gray-600">Events gesamt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{formatBytes(data.stats.total_bytes)}</div>
                            <div className="text-xs text-gray-600">Daten empfangen</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.streams.map(stream => (
                            <Card key={stream.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Radio className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{stream.stream_name}</h5>
                                                <Badge variant="outline">{stream.stream_type}</Badge>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Quelle: {stream.source}
                                            </p>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Partitions: {stream.partition_count}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Retention: {stream.retention_hours}h
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Events: {stream.total_events || 0}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Größe: {formatBytes(stream.bytes_received || 0)}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge className={stream.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {stream.is_active ? 'aktiv' : 'inaktiv'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'processors' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_processors}</div>
                            <div className="text-xs text-gray-600">Processors</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_processors}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.processed_events}</div>
                            <div className="text-xs text-gray-600">Verarbeitet</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Nach Typ</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.processors_by_type || {}).map(([type, count]) => (
                                    <Badge key={type} variant="outline">
                                        {type}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.processors.map(processor => {
                            const stream = data.streams.find(s => s.id === processor.stream_id);
                            return (
                                <Card key={processor.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-purple-600" />
                                                    <span className="font-semibold text-sm">{processor.processor_name}</span>
                                                    <Badge variant="outline">{processor.processor_type}</Badge>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Stream: {stream?.stream_name || 'Unknown'}
                                                </p>
                                                {processor.window_size_seconds > 0 && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Window: {processor.window_size_seconds}s
                                                    </p>
                                                )}
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Verarbeitet: {processor.events_processed || 0}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Gefiltert: {processor.events_filtered || 0}
                                                    </span>
                                                </div>
                                                {processor.processing_time_ms && (
                                                    <span className="text-xs text-gray-600 mt-2 inline-block">
                                                        Ø Zeit: {processor.processing_time_ms}ms
                                                    </span>
                                                )}
                                            </div>
                                            <Badge className={processor.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                {processor.is_active ? 'aktiv' : 'inaktiv'}
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
                    <div className="grid grid-cols-3 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_events}</div>
                            <div className="text-xs text-gray-600">Events gesamt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.processed_events}</div>
                            <div className="text-xs text-gray-600">Verarbeitet</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.stats.filtered_events}</div>
                            <div className="text-xs text-gray-600">Gefiltert</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.events.map(event => {
                            const stream = data.streams.find(s => s.id === event.stream_id);
                            return (
                                <Card key={event.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Activity className="w-4 h-4 text-blue-600" />
                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                        #{event.sequence_number}
                                                    </code>
                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                        {event.event_id.substring(0, 8)}...
                                                    </code>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Stream: {stream?.stream_name || 'Unknown'}
                                                </p>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Partition: {event.partition_key}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Größe: {formatBytes(event.size_bytes || 0)}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        {new Date(event.timestamp).toLocaleString('de-DE')}
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge className={event.is_processed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                                {event.is_processed ? 'verarbeitet' : 'pending'}
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