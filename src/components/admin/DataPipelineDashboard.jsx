import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Layers, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function DataPipelineDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pipelines');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('dataPipelineEngine', {
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
        draft: 'bg-gray-100 text-gray-800',
        active: 'bg-green-100 text-green-800',
        paused: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
        completed: 'bg-green-100 text-green-800',
        pending: 'bg-gray-100 text-gray-800',
        running: 'bg-blue-100 text-blue-800',
        failed: 'bg-red-100 text-red-800',
        cancelled: 'bg-orange-100 text-orange-800',
        database: 'bg-blue-100 text-blue-800',
        api: 'bg-green-100 text-green-800',
        file: 'bg-purple-100 text-purple-800',
        stream: 'bg-cyan-100 text-cyan-800',
        webhook: 'bg-orange-100 text-orange-800',
        s3: 'bg-indigo-100 text-indigo-800',
        warehouse: 'bg-purple-100 text-purple-800',
        elasticsearch: 'bg-yellow-100 text-yellow-800',
        extract: 'bg-blue-100 text-blue-800',
        transform: 'bg-purple-100 text-purple-800',
        validate: 'bg-green-100 text-green-800',
        enrich: 'bg-cyan-100 text-cyan-800',
        load: 'bg-orange-100 text-orange-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['pipelines', 'stages', 'runs'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'pipelines' && '🔄 Pipelines'}
                        {tab === 'stages' && '📊 Stages'}
                        {tab === 'runs' && '▶️ Runs'}
                    </button>
                ))}
            </div>

            {activeTab === 'pipelines' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.pipeline_stats.total_pipelines}</div>
                            <div className="text-xs text-gray-600">Pipelines</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.pipeline_stats.active_pipelines}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-gray-600">{data.pipeline_stats.draft_pipelines}</div>
                            <div className="text-xs text-gray-600">Entwurf</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.pipeline_stats.error_pipelines}</div>
                            <div className="text-xs text-gray-600">Fehler</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.pipeline_stats.total_runs}</div>
                            <div className="text-xs text-gray-600">Durchläufe</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-cyan-600">{data.pipeline_stats.total_records_processed}</div>
                            <div className="text-xs text-gray-600">Records</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.pipelines.map(pipeline => (
                            <Card key={pipeline.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <GitBranch className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{pipeline.pipeline_name}</h5>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <Badge className={statusColors[pipeline.source_type]}>
                                                    {pipeline.source_type}
                                                </Badge>
                                                <span className="text-gray-600">→</span>
                                                <Badge className={statusColors[pipeline.destination_type]}>
                                                    {pipeline.destination_type}
                                                </Badge>
                                                <span className="text-purple-600">
                                                    Stages: {pipeline.stages_count}
                                                </span>
                                                <span className="text-blue-600">
                                                    Runs: {pipeline.total_runs}
                                                </span>
                                                <span className="text-green-600">
                                                    Erfolg: {pipeline.successful_runs}
                                                </span>
                                                {pipeline.failed_runs > 0 && (
                                                    <span className="text-red-600">
                                                        Fehler: {pipeline.failed_runs}
                                                    </span>
                                                )}
                                                <span className="text-cyan-600">
                                                    Records: {pipeline.records_processed}
                                                </span>
                                            </div>
                                            {pipeline.last_run_at && (
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    Letzter Lauf: {new Date(pipeline.last_run_at).toLocaleDateString('de-DE')}
                                                </span>
                                            )}
                                        </div>
                                        <Badge className={statusColors[pipeline.status]}>
                                            {pipeline.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'stages' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stage_stats.total_stages}</div>
                            <div className="text-xs text-gray-600">Stages</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stage_stats.active_stages}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-gray-600">{data.stage_stats.inactive_stages}</div>
                            <div className="text-xs text-gray-600">Inaktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stage_stats.total_executions}</div>
                            <div className="text-xs text-gray-600">Ausführungen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Typ</h4>
                            {Object.entries(data.stage_stats.by_type || {}).slice(0, 3).map(([type, count]) => (
                                <div key={type} className="text-xs flex justify-between">
                                    <span>{type}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.stages.slice(0, 40).map(stage => (
                            <Card key={stage.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{stage.stage_name}</h5>
                                                <Badge className={statusColors[stage.stage_type]}>
                                                    {stage.stage_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Reihenfolge: #{stage.stage_order}
                                                </span>
                                                <span className="text-blue-600">
                                                    Ausführungen: {stage.execution_count}
                                                </span>
                                                <span className="text-green-600">
                                                    Erfolg: {stage.success_count}
                                                </span>
                                                {stage.error_count > 0 && (
                                                    <span className="text-red-600">
                                                        Fehler: {stage.error_count}
                                                    </span>
                                                )}
                                                <span className="text-purple-600">
                                                    Ø Dauer: {stage.avg_duration_ms}ms
                                                </span>
                                                <span className="text-cyan-600">
                                                    Records: {stage.records_processed}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge className={stage.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {stage.is_active ? 'Aktiv' : 'Inaktiv'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'runs' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.run_stats.total_runs}</div>
                            <div className="text-xs text-gray-600">Runs</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.run_stats.running_runs}</div>
                            <div className="text-xs text-gray-600">Laufend</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.run_stats.completed_runs}</div>
                            <div className="text-xs text-gray-600">Erfolgreich</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.run_stats.failed_runs}</div>
                            <div className="text-xs text-gray-600">Fehlgeschlagen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.run_stats.total_records}</div>
                            <div className="text-xs text-gray-600">Records</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-cyan-600">{data.run_stats.avg_duration_ms}ms</div>
                            <div className="text-xs text-gray-600">Ø Dauer</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.runs.map(run => (
                            <Card key={run.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">Run {run.run_id.substring(0, 8)}</h5>
                                                <Badge variant="outline" className="text-xs">
                                                    {run.trigger_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-blue-600">
                                                    Records: {run.records_processed}
                                                </span>
                                                <span className="text-green-600">
                                                    Erfolg: {run.records_success}
                                                </span>
                                                {run.records_failed > 0 && (
                                                    <span className="text-red-600">
                                                        Fehler: {run.records_failed}
                                                    </span>
                                                )}
                                                {run.duration_ms > 0 && (
                                                    <span className="text-purple-600">
                                                        Dauer: {run.duration_ms}ms
                                                    </span>
                                                )}
                                                <span className="text-cyan-600">
                                                    Stages: {run.stages_completed}/{run.stages_completed + run.stages_failed}
                                                </span>
                                                {run.started_at && (
                                                    <span className="text-gray-600">
                                                        {new Date(run.started_at).toLocaleString('de-DE')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={statusColors[run.status]}>
                                            {run.status}
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