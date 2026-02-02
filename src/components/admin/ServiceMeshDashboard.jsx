import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Route, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function ServiceMeshDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('meshes');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('serviceMeshEngine', {
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

    const stateColors = {
        closed: 'bg-green-100 text-green-800',
        open: 'bg-red-100 text-red-800',
        half_open: 'bg-yellow-100 text-yellow-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['meshes', 'rules', 'breakers'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'meshes' && '🕸️ Service Meshes'}
                        {tab === 'rules' && '🚦 Traffic Rules'}
                        {tab === 'breakers' && '🔌 Circuit Breakers'}
                    </button>
                ))}
            </div>

            {activeTab === 'meshes' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_meshes}</div>
                            <div className="text-xs text-gray-600">Meshes</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_meshes}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.total_requests}</div>
                            <div className="text-xs text-gray-600">Requests gesamt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.total_rejected}</div>
                            <div className="text-xs text-gray-600">Abgewiesen</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.meshes.map(mesh => (
                            <Card key={mesh.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Network className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{mesh.mesh_name}</h5>
                                                <Badge variant="outline">{mesh.mesh_type}</Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Namespace: {mesh.namespace}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Services: {mesh.services_count || 0}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Timeout: {mesh.timeout_seconds}s
                                                </span>
                                            </div>
                                            <div className="flex gap-3 mt-2">
                                                {mesh.mtls_enabled && (
                                                    <Badge className="bg-green-100 text-green-800">mTLS</Badge>
                                                )}
                                                {mesh.observability_enabled && (
                                                    <Badge className="bg-blue-100 text-blue-800">Observability</Badge>
                                                )}
                                                {mesh.retry_enabled && (
                                                    <Badge className="bg-purple-100 text-purple-800">Auto-Retry</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={mesh.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {mesh.is_active ? 'aktiv' : 'inaktiv'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'rules' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_rules}</div>
                            <div className="text-xs text-gray-600">Rules</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_rules}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Nach Typ</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.rules_by_type || {}).map(([type, count]) => (
                                    <Badge key={type} variant="outline" className="text-xs">
                                        {type}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.rules.map(rule => {
                            const mesh = data.meshes.find(m => m.id === rule.mesh_id);
                            return (
                                <Card key={rule.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Route className="w-4 h-4 text-blue-600" />
                                                    <span className="font-semibold text-sm">{rule.rule_name}</span>
                                                    <Badge variant="outline">{rule.rule_type}</Badge>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Mesh: {mesh?.mesh_name || 'Unknown'}
                                                </p>
                                                <div className="flex gap-4 mt-2">
                                                    {rule.source_service && (
                                                        <span className="text-xs text-gray-600">
                                                            Source: {rule.source_service}
                                                        </span>
                                                    )}
                                                    {rule.destination_service && (
                                                        <span className="text-xs text-gray-600">
                                                            Dest: {rule.destination_service}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-600">
                                                        Gewicht: {rule.weight}%
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Priorität: {rule.priority}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    Angewendet: {rule.applied_count || 0}x
                                                </span>
                                            </div>
                                            <Badge className={rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                {rule.is_active ? 'aktiv' : 'inaktiv'}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {activeTab === 'breakers' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_breakers}</div>
                            <div className="text-xs text-gray-600">Circuit Breakers</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.open_breakers}</div>
                            <div className="text-xs text-gray-600">Offen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">
                                {data.breakers.filter(b => b.state === 'half_open').length}
                            </div>
                            <div className="text-xs text-gray-600">Halb-Offen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Status</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.breakers_by_state || {}).map(([state, count]) => (
                                    <Badge key={state} className={stateColors[state]}>
                                        {state}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.breakers.map(breaker => {
                            const mesh = data.meshes.find(m => m.id === breaker.mesh_id);
                            const failureRate = breaker.total_requests > 0
                                ? Math.round((breaker.failed_requests / breaker.total_requests) * 100)
                                : 0;

                            return (
                                <Card key={breaker.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="w-4 h-4 text-purple-600" />
                                                    <span className="font-semibold text-sm">{breaker.breaker_name}</span>
                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                        {breaker.service_name}
                                                    </code>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Mesh: {mesh?.mesh_name || 'Unknown'}
                                                </p>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Schwellenwert: {breaker.failure_threshold}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Timeout: {breaker.timeout_ms}ms
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Reset: {breaker.reset_timeout_seconds}s
                                                    </span>
                                                </div>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Requests: {breaker.total_requests || 0}
                                                    </span>
                                                    <span className="text-xs text-red-600">
                                                        Fehler: {breaker.failed_requests || 0} ({failureRate}%)
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Abgewiesen: {breaker.rejected_requests || 0}
                                                    </span>
                                                    <span className="text-xs text-yellow-600">
                                                        Aufeinander: {breaker.consecutive_failures || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge className={stateColors[breaker.state]}>
                                                {breaker.state}
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