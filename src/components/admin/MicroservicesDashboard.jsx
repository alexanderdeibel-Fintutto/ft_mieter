import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server, Activity, GitBranch } from 'lucide-react';
import { toast } from 'sonner';

export default function MicroservicesDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('services');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('microservicesEngine', {
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
        running: 'bg-green-100 text-green-800',
        stopped: 'bg-gray-100 text-gray-800',
        error: 'bg-red-100 text-red-800',
        deploying: 'bg-blue-100 text-blue-800',
        scaling: 'bg-purple-100 text-purple-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['services', 'instances', 'dependencies'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'services' && '🚀 Services'}
                        {tab === 'instances' && '⚙️ Instanzen'}
                        {tab === 'dependencies' && '🔗 Abhängigkeiten'}
                    </button>
                ))}
            </div>

            {activeTab === 'services' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_services}</div>
                            <div className="text-xs text-gray-600">Services</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.running_services}</div>
                            <div className="text-xs text-gray-600">Laufend</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-gray-600">{data.stats.stopped_services}</div>
                            <div className="text-xs text-gray-600">Gestoppt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.error_services}</div>
                            <div className="text-xs text-gray-600">Fehler</div>
                        </CardContent></Card>
                    </div>

                    <Card>
                        <CardHeader><CardTitle className="text-sm">Services nach Typ</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-2">
                                {Object.entries(data.services_by_type || {}).map(([type, count]) => (
                                    <div key={type} className="text-center p-3 border rounded">
                                        <div className="text-xs text-gray-600 mb-1">{type}</div>
                                        <div className="text-lg font-bold text-blue-600">{count}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        {data.services.map(service => (
                            <Card key={service.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Server className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{service.service_name}</h5>
                                                <Badge variant="outline" className="text-xs">v{service.version}</Badge>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">{service.description}</p>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">Typ: {service.service_type}</span>
                                                <span className="text-xs text-gray-600">Instanzen: {service.instance_count}</span>
                                                <span className="text-xs text-gray-600">Env: {service.environment}</span>
                                            </div>
                                            {service.endpoint_url && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    <code className="bg-gray-100 px-2 py-1 rounded">{service.endpoint_url}</code>
                                                </p>
                                            )}
                                        </div>
                                        <Badge className={statusColors[service.status]}>
                                            {service.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'instances' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_instances}</div>
                            <div className="text-xs text-gray-600">Instanzen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.healthy_instances}</div>
                            <div className="text-xs text-gray-600">Gesund</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.unhealthy_instances}</div>
                            <div className="text-xs text-gray-600">Ungesund</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.registry.map(instance => (
                            <Card key={instance.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-green-600" />
                                                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                    {instance.instance_id}
                                                </code>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-2">
                                                {instance.host}:{instance.port}
                                            </p>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Requests: {instance.request_count || 0}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Fehler: {instance.error_count || 0}
                                                </span>
                                                {instance.response_time_ms && (
                                                    <span className="text-xs text-gray-600">
                                                        Response: {instance.response_time_ms}ms
                                                    </span>
                                                )}
                                            </div>
                                            {instance.last_heartbeat && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Letzter Heartbeat: {new Date(instance.last_heartbeat).toLocaleString('de-DE')}
                                                </p>
                                            )}
                                        </div>
                                        <Badge className={
                                            instance.health_status === 'healthy' ? 'bg-green-100 text-green-800' :
                                            instance.health_status === 'unhealthy' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }>
                                            {instance.health_status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'dependencies' && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_dependencies}</div>
                            <div className="text-xs text-gray-600">Abhängigkeiten</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.critical_dependencies}</div>
                            <div className="text-xs text-gray-600">Kritisch</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.dependencies.map(dep => {
                            const sourceService = data.services.find(s => s.id === dep.source_service_id);
                            const targetService = data.services.find(s => s.id === dep.target_service_id);
                            
                            return (
                                <Card key={dep.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <GitBranch className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm font-semibold">
                                                        {sourceService?.service_name || 'Unknown'}
                                                    </span>
                                                </div>
                                                <span className="text-gray-400">→</span>
                                                <span className="text-sm font-semibold">
                                                    {targetService?.service_name || 'Unknown'}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {dep.dependency_type}
                                                </Badge>
                                                {dep.is_critical && (
                                                    <Badge className="bg-red-100 text-red-800 text-xs">
                                                        Kritisch
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-4 mt-2 ml-6">
                                            <span className="text-xs text-gray-600">
                                                Protokoll: {dep.communication_protocol}
                                            </span>
                                            <span className="text-xs text-gray-600">
                                                Timeout: {dep.timeout_ms}ms
                                            </span>
                                            <span className="text-xs text-gray-600">
                                                Retries: {dep.retry_count}
                                            </span>
                                            {dep.circuit_breaker_enabled && (
                                                <span className="text-xs text-green-600">Circuit Breaker ✓</span>
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