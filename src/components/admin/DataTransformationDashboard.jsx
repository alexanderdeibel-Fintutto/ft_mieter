import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DataTransformationDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('streams');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('dataTransformationEngine', {
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

    const typeColors = {
        kafka: 'bg-blue-100 text-blue-800',
        rabbitmq: 'bg-orange-100 text-orange-800',
        pubsub: 'bg-purple-100 text-purple-800',
        custom: 'bg-gray-100 text-gray-800',
        api: 'bg-green-100 text-green-800',
        database: 'bg-indigo-100 text-indigo-800',
        file: 'bg-yellow-100 text-yellow-800',
        webhook: 'bg-pink-100 text-pink-800',
        map: 'bg-blue-100 text-blue-800',
        filter: 'bg-red-100 text-red-800',
        aggregate: 'bg-purple-100 text-purple-800',
        join: 'bg-green-100 text-green-800',
        completed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        running: 'bg-blue-100 text-blue-800',
        pending: 'bg-yellow-100 text-yellow-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['streams', 'transformations', 'jobs', 'mappings'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'streams' && '📊 Datenströme'}
                        {tab === 'transformations' && '⚡ Transformationen'}
                        {tab === 'jobs' && '🔄 Jobs'}
                        {tab === 'mappings' && '🗺️ Mappings'}
                    </button>
                ))}
            </div>

            {activeTab === 'streams' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stream_stats.total_streams}</div>
                            <div className="text-xs text-gray-600">Datenströme</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stream_stats.active_streams}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.stream_stats.total_records_processed.toLocaleString('de-DE')}
                            </div>
                            <div className="text-xs text-gray-600">Records verarbeitet</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.streams.map(stream => (
                            <Card key={stream.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h5 className="font-semibold text-sm">{stream.stream_name}</h5>
                                                <Badge className={typeColors[stream.stream_type]}>
                                                    {stream.stream_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Von: {stream.source_type}
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                                <span className="text-xs text-gray-600">
                                                    Nach: {stream.destination_type}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                {stream.partitioning_key && (
                                                    <span className="text-xs text-gray-600">
                                                        Partition: {stream.partitioning_key}
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-600">
                                                    Retention: {stream.retention_hours}h
                                                </span>
                                                <span className="text-xs text-purple-600">
                                                    Verarbeitet: {stream.total_records_processed || 0}
                                                </span>
                                            </div>
                                            {stream.last_activity && (
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    Aktivität: {new Date(stream.last_activity).toLocaleString('de-DE')}
                                                </span>
                                            )}
                                        </div>
                                        <Badge className={stream.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {stream.is_active ? 'ON' : 'OFF'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'transformations' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.transformation_stats.total_transformations}
                            </div>
                            <div className="text-xs text-gray-600">Transformationen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.transformation_stats.active_transformations}
                            </div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.transformation_stats.total_executions}
                            </div>
                            <div className="text-xs text-gray-600">Ausführungen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-indigo-600">
                                {data.transformation_stats.success_rate}%
                            </div>
                            <div className="text-xs text-gray-600">Erfolgsrate</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.transformations.map(transformation => (
                            <Card key={transformation.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{transformation.transformation_name}</h5>
                                                <Badge className={typeColors[transformation.transformation_type]}>
                                                    {transformation.transformation_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Ausführungen: {transformation.execution_count || 0}
                                                </span>
                                                <span className="text-xs text-green-600">
                                                    Erfolg: {transformation.success_count || 0}
                                                </span>
                                                <span className="text-xs text-red-600">
                                                    Fehler: {transformation.failure_count || 0}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Fehlerbehandlung: {transformation.error_handling}
                                                </span>
                                            </div>
                                            {transformation.field_mappings && transformation.field_mappings.length > 0 && (
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    Feld-Zuordnungen: {transformation.field_mappings.length}
                                                </span>
                                            )}
                                            {transformation.filters && transformation.filters.length > 0 && (
                                                <span className="text-xs text-gray-600 mt-2 inline-block ml-2">
                                                    Filter: {transformation.filters.length}
                                                </span>
                                            )}
                                        </div>
                                        <Badge className={transformation.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {transformation.is_active ? 'ON' : 'OFF'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'jobs' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.job_stats.total_jobs}</div>
                            <div className="text-xs text-gray-600">Jobs</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.job_stats.completed_jobs}</div>
                            <div className="text-xs text-gray-600">Abgeschlossen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.job_stats.failed_jobs}</div>
                            <div className="text-xs text-gray-600">Fehlgeschlagen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.job_stats.avg_duration}s</div>
                            <div className="text-xs text-gray-600">Ø Dauer</div>
                        </CardContent></Card>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-sm mb-2">Jobs nach Status</h4>
                            {Object.entries(data.jobs_by_status || {}).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between">
                                    <Badge className={typeColors[status] || 'bg-gray-100 text-gray-800'}>
                                        {status}
                                    </Badge>
                                    <span className="text-sm font-semibold">{count}</span>
                                </div>
                            ))}
                        </CardContent></Card>

                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-sm mb-2">Durchsatz</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Gesamt-Durchsatz</span>
                                    <span className="text-sm font-semibold">
                                        {data.job_stats.total_throughput.toFixed(2)} rec/s
                                    </span>
                                </div>
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.jobs.map(job => (
                            <Card key={job.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                {job.status === 'completed' && (
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                )}
                                                <span className="font-semibold text-sm truncate">
                                                    Job {job.job_id.substring(0, 8)}
                                                </span>
                                                <Badge className={typeColors[job.status]}>
                                                    {job.status}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Input: {job.input_records}
                                                </span>
                                                <span className="text-xs text-green-600">
                                                    Output: {job.output_records}
                                                </span>
                                                <span className="text-xs text-yellow-600">
                                                    Gefiltert: {job.filtered_records || 0}
                                                </span>
                                                <span className="text-xs text-red-600">
                                                    Fehler: {job.error_records || 0}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Dauer: {job.duration_seconds || 0}s
                                                </span>
                                                {job.throughput_records_per_second && (
                                                    <span className="text-xs text-purple-600">
                                                        Durchsatz: {job.throughput_records_per_second.toFixed(2)} rec/s
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                {new Date(job.started_at).toLocaleString('de-DE')}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'mappings' && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.mappings.length}</div>
                            <div className="text-xs text-gray-600">Feld-Zuordnungen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.mappings.filter(m => m.is_active).length}
                            </div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.mappings.map(mapping => (
                            <Card key={mapping.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h5 className="font-semibold text-sm">{mapping.mapping_name}</h5>
                                                <Badge className={typeColors[mapping.mapping_type]}>
                                                    {mapping.mapping_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-2 items-center mt-2">
                                                <span className="text-xs text-gray-600 font-mono">
                                                    {mapping.source_field}
                                                </span>
                                                <ArrowRight className="w-3 h-3 text-gray-400" />
                                                <span className="text-xs text-gray-600 font-mono">
                                                    {mapping.target_field}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                {mapping.transformation_rule && (
                                                    <span className="text-xs text-gray-600">
                                                        Regel: {mapping.transformation_rule}
                                                    </span>
                                                )}
                                                {mapping.default_value && (
                                                    <span className="text-xs text-gray-600">
                                                        Default: {mapping.default_value}
                                                    </span>
                                                )}
                                                <span className="text-xs text-purple-600">
                                                    Verwendet: {mapping.usage_count || 0}x
                                                </span>
                                            </div>
                                        </div>
                                        <Badge className={mapping.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {mapping.is_active ? 'ON' : 'OFF'}
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