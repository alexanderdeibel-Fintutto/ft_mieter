import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, GitBranch, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function CICDDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pipelines');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('cicdEngine', {
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

    const triggerPipeline = async (pipelineId) => {
        try {
            const res = await base44.functions.invoke('cicdEngine', {
                action: 'trigger_pipeline',
                organization_id: organizationId,
                pipeline_id: pipelineId
            });
            toast.success(`Build #${res.data.build_number} gestartet`);
            loadData();
        } catch (error) {
            toast.error('Fehler beim Triggern');
        }
    };

    if (loading || !data) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    const statusColors = {
        pending: 'bg-gray-100 text-gray-800',
        running: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        cancelled: 'bg-gray-100 text-gray-800',
        skipped: 'bg-yellow-100 text-yellow-800'
    };

    const envColors = {
        development: 'bg-blue-100 text-blue-800',
        staging: 'bg-yellow-100 text-yellow-800',
        production: 'bg-green-100 text-green-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['pipelines', 'builds', 'stats'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'pipelines' && '🔄 Pipelines'}
                        {tab === 'builds' && '🏗️ Builds'}
                        {tab === 'stats' && '📊 Statistiken'}
                    </button>
                ))}
            </div>

            {activeTab === 'pipelines' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_pipelines}</div>
                            <div className="text-xs text-gray-600">Pipelines</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_pipelines}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.success_rate}%</div>
                            <div className="text-xs text-gray-600">Erfolgsrate</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.pipelines.map(pipeline => (
                            <Card key={pipeline.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <GitBranch className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{pipeline.pipeline_name}</h5>
                                                <Badge className={envColors[pipeline.environment]}>
                                                    {pipeline.environment}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">{pipeline.description}</p>
                                            <div className="flex gap-4 mt-2">
                                                {pipeline.repository && (
                                                    <span className="text-xs text-gray-600">
                                                        {pipeline.repository}
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-600">
                                                    Branch: {pipeline.branch}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Trigger: {pipeline.trigger_type}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-green-600">
                                                    ✓ {pipeline.success_count || 0}
                                                </span>
                                                <span className="text-xs text-red-600">
                                                    ✗ {pipeline.failure_count || 0}
                                                </span>
                                                {pipeline.last_run_at && (
                                                    <span className="text-xs text-gray-600">
                                                        Letzter Run: {new Date(pipeline.last_run_at).toLocaleString('de-DE')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-start">
                                            {pipeline.last_run_status && (
                                                <Badge className={statusColors[pipeline.last_run_status]}>
                                                    {pipeline.last_run_status}
                                                </Badge>
                                            )}
                                            <Button
                                                size="sm"
                                                onClick={() => triggerPipeline(pipeline.id)}
                                                disabled={!pipeline.is_active}
                                            >
                                                <Play className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'builds' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_builds}</div>
                            <div className="text-xs text-gray-600">Builds</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.successful_builds}</div>
                            <div className="text-xs text-gray-600">Erfolgreich</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.failed_builds}</div>
                            <div className="text-xs text-gray-600">Fehlgeschlagen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.running_builds}</div>
                            <div className="text-xs text-gray-600">Laufend</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Letzte Builds</h4>
                        {data.builds.map(build => {
                            const pipeline = data.pipelines.find(p => p.id === build.pipeline_id);
                            return (
                                <Card key={build.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    {build.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                                                    {build.status === 'failed' && <XCircle className="w-4 h-4 text-red-600" />}
                                                    {build.status === 'running' && <Clock className="w-4 h-4 text-blue-600 animate-spin" />}
                                                    <span className="font-semibold text-sm">
                                                        #{build.build_number}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        {pipeline?.pipeline_name || 'Unknown'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">{build.commit_message}</p>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Branch: {build.branch}
                                                    </span>
                                                    {build.commit_hash && (
                                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                            {build.commit_hash.slice(0, 7)}
                                                        </code>
                                                    )}
                                                    {build.duration_seconds && (
                                                        <span className="text-xs text-gray-600">
                                                            {build.duration_seconds}s
                                                        </span>
                                                    )}
                                                    {build.started_at && (
                                                        <span className="text-xs text-gray-600">
                                                            {new Date(build.started_at).toLocaleString('de-DE')}
                                                        </span>
                                                    )}
                                                </div>
                                                {build.test_results && Object.keys(build.test_results).length > 0 && (
                                                    <div className="flex gap-3 mt-2">
                                                        <span className="text-xs text-green-600">
                                                            ✓ {build.test_results.passed || 0} passed
                                                        </span>
                                                        <span className="text-xs text-red-600">
                                                            ✗ {build.test_results.failed || 0} failed
                                                        </span>
                                                        <span className="text-xs text-gray-600">
                                                            - {build.test_results.skipped || 0} skipped
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <Badge className={statusColors[build.status]}>
                                                {build.status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {activeTab === 'stats' && (
                <>
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Builds nach Status</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(data.builds_by_status || {}).map(([status, count]) => (
                                    <div key={status} className="flex justify-between items-center p-2 border rounded">
                                        <div className="flex items-center gap-2">
                                            <Badge className={statusColors[status]}>{status}</Badge>
                                        </div>
                                        <span className="text-sm font-bold">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-sm">Stages nach Typ</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(data.stages_by_type || {}).map(([type, count]) => (
                                    <div key={type} className="text-center p-3 border rounded">
                                        <div className="text-xs text-gray-600 mb-1">{type}</div>
                                        <div className="text-lg font-bold text-blue-600">{count}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-sm">Pipeline-Performance</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data.pipelines.map(p => {
                                    const total = (p.success_count || 0) + (p.failure_count || 0);
                                    const successRate = total > 0 ? Math.round((p.success_count / total) * 100) : 0;
                                    return (
                                        <div key={p.id} className="p-3 border rounded">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-semibold">{p.pipeline_name}</span>
                                                <Badge variant="outline">{successRate}%</Badge>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-green-600 h-2 rounded-full"
                                                    style={{ width: `${successRate}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-xs text-gray-600">{p.success_count || 0} erfolgreiche</span>
                                                <span className="text-xs text-gray-600">{p.failure_count || 0} fehlgeschlagene</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}