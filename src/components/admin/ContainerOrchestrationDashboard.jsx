import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Rocket, GitBranch } from 'lucide-react';
import { toast } from 'sonner';

export default function ContainerOrchestrationDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('images');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('containerOrchestrationEngine', {
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
        deploying: 'bg-yellow-100 text-yellow-800',
        running: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        scaling: 'bg-purple-100 text-purple-800',
        terminated: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['images', 'deployments', 'pipelines'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'images' && '📦 Images'}
                        {tab === 'deployments' && '🚀 Deployments'}
                        {tab === 'pipelines' && '🔄 Pipelines'}
                    </button>
                ))}
            </div>

            {activeTab === 'images' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_images}</div>
                            <div className="text-xs text-gray-600">Images</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.scanned_images}</div>
                            <div className="text-xs text-gray-600">Gescannt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.vulnerable_images}</div>
                            <div className="text-xs text-gray-600">Schwachstellen</div>
                        </CardContent></Card>
                    </div>

                    <Card>
                        <CardHeader><CardTitle className="text-sm">Images nach Registry</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(data.images_by_registry || {}).map(([registry, count]) => (
                                    <div key={registry} className="flex justify-between items-center p-2 border rounded">
                                        <span className="text-sm">{registry}</span>
                                        <Badge>{count}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        {data.images.map(image => (
                            <Card key={image.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{image.image_name}</h5>
                                                <Badge variant="outline" className="text-xs">{image.image_tag}</Badge>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">{image.registry}</p>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Größe: {Math.round(image.size_bytes / 1024 / 1024)}MB
                                                </span>
                                                {image.vulnerabilities_count > 0 && (
                                                    <span className="text-xs text-red-600">
                                                        🔴 {image.vulnerabilities_count} Schwachstellen
                                                    </span>
                                                )}
                                                {image.build_timestamp && (
                                                    <span className="text-xs text-gray-600">
                                                        {new Date(image.build_timestamp).toLocaleDateString('de-DE')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={
                                            image.scan_status === 'passed' ? 'bg-green-100 text-green-800' :
                                            image.scan_status === 'failed' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }>
                                            {image.scan_status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'deployments' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_deployments}</div>
                            <div className="text-xs text-gray-600">Deployments</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.running_deployments}</div>
                            <div className="text-xs text-gray-600">Laufend</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.failed_deployments}</div>
                            <div className="text-xs text-gray-600">Fehlgeschlagen</div>
                        </CardContent></Card>
                    </div>

                    <Card>
                        <CardHeader><CardTitle className="text-sm">Deployments nach Umgebung</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.entries(data.deployments_by_environment || {}).map(([env, count]) => (
                                    <div key={env} className="text-center p-3 border rounded">
                                        <div className="text-xs text-gray-600 mb-1">{env}</div>
                                        <div className="text-lg font-bold text-blue-600">{count}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        {data.deployments.map(deployment => {
                            const image = data.images.find(i => i.id === deployment.image_id);
                            return (
                                <Card key={deployment.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Rocket className="w-4 h-4 text-blue-600" />
                                                    <h5 className="font-semibold text-sm">{deployment.deployment_name}</h5>
                                                    <Badge variant="outline" className="text-xs">{deployment.environment}</Badge>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Image: {image?.image_name || 'Unknown'}:{image?.image_tag || ''}
                                                </p>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Namespace: {deployment.namespace}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Replicas: {deployment.replicas_available}/{deployment.replicas}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Strategie: {deployment.strategy}
                                                    </span>
                                                </div>
                                                {deployment.deployed_at && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Deployed: {new Date(deployment.deployed_at).toLocaleString('de-DE')}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge className={statusColors[deployment.status]}>
                                                {deployment.status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {activeTab === 'pipelines' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_pipelines}</div>
                            <div className="text-xs text-gray-600">Pipelines</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.stats.running_pipelines}</div>
                            <div className="text-xs text-gray-600">Laufend</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.successful_pipelines}</div>
                            <div className="text-xs text-gray-600">Erfolgreich</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.pipelines.map(pipeline => {
                            const deployment = data.deployments.find(d => d.id === pipeline.deployment_id);
                            return (
                                <Card key={pipeline.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <GitBranch className="w-4 h-4 text-purple-600" />
                                                    <h5 className="font-semibold text-sm">{pipeline.pipeline_name}</h5>
                                                    <Badge variant="outline" className="text-xs">{pipeline.trigger_type}</Badge>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Deployment: {deployment?.deployment_name || 'Unknown'}
                                                </p>
                                                {pipeline.stages && pipeline.stages.length > 0 && (
                                                    <div className="flex gap-2 mt-2">
                                                        {pipeline.stages.map((stage, idx) => (
                                                            <Badge 
                                                                key={idx}
                                                                className={`text-xs ${
                                                                    stage.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
                                                                    stage.status === 'success' ? 'bg-green-100 text-green-800' :
                                                                    stage.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}
                                                            >
                                                                {stage.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex gap-4 mt-2">
                                                    {pipeline.started_at && (
                                                        <span className="text-xs text-gray-600">
                                                            {new Date(pipeline.started_at).toLocaleString('de-DE')}
                                                        </span>
                                                    )}
                                                    {pipeline.duration_seconds && (
                                                        <span className="text-xs text-gray-600">
                                                            {pipeline.duration_seconds}s
                                                        </span>
                                                    )}
                                                </div>
                                                {pipeline.error_message && (
                                                    <p className="text-xs text-red-600 mt-1">{pipeline.error_message}</p>
                                                )}
                                            </div>
                                            <Badge className={statusColors[pipeline.status]}>
                                                {pipeline.status}
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