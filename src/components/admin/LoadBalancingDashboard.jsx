import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Server, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function LoadBalancingDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('balancers');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('loadBalancingEngine', {
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

    const healthColors = {
        healthy: 'bg-green-100 text-green-800',
        unhealthy: 'bg-red-100 text-red-800',
        draining: 'bg-yellow-100 text-yellow-800',
        unknown: 'bg-gray-100 text-gray-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['balancers', 'instances', 'policies'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'balancers' && '⚖️ Load Balancers'}
                        {tab === 'instances' && '🖥️ Instanzen'}
                        {tab === 'policies' && '📈 Auto-Scaling'}
                    </button>
                ))}
            </div>

            {activeTab === 'balancers' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_balancers}</div>
                            <div className="text-xs text-gray-600">Load Balancers</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_balancers}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.total_requests}</div>
                            <div className="text-xs text-gray-600">Requests gesamt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.failed_requests}</div>
                            <div className="text-xs text-gray-600">Fehler</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.balancers.map(balancer => {
                            const instances = data.instances.filter(i => i.load_balancer_id === balancer.id);
                            const healthyCount = instances.filter(i => i.health_status === 'healthy').length;
                            const successRate = balancer.total_requests > 0
                                ? Math.round(((balancer.total_requests - (balancer.failed_requests || 0)) / balancer.total_requests) * 100)
                                : 0;

                            return (
                                <Card key={balancer.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Activity className="w-4 h-4 text-blue-600" />
                                                    <h5 className="font-semibold text-sm">{balancer.balancer_name}</h5>
                                                    <Badge variant="outline">{balancer.balancer_type}</Badge>
                                                </div>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">Port: {balancer.listen_port}</span>
                                                    <span className="text-xs text-gray-600">
                                                        Instanzen: {healthyCount}/{instances.length}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Health-Check: {balancer.health_check_path}
                                                    </span>
                                                </div>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Requests: {balancer.total_requests || 0}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Erfolgsrate: {successRate}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{ width: `${successRate}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <Badge className={balancer.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                {balancer.is_active ? 'aktiv' : 'inaktiv'}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {activeTab === 'instances' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_instances}</div>
                            <div className="text-xs text-gray-600">Instanzen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.healthy_instances}</div>
                            <div className="text-xs text-gray-600">Healthy</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.unhealthy_instances}</div>
                            <div className="text-xs text-gray-600">Unhealthy</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Status</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.instances_by_health || {}).map(([status, count]) => (
                                    <Badge key={status} className={healthColors[status]}>
                                        {status}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.instances.map(instance => {
                            const balancer = data.balancers.find(b => b.id === instance.load_balancer_id);
                            const successRate = instance.total_requests > 0
                                ? Math.round(((instance.total_requests - (instance.failed_requests || 0)) / instance.total_requests) * 100)
                                : 0;

                            return (
                                <Card key={instance.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Server className="w-4 h-4 text-blue-600" />
                                                    <span className="font-semibold text-sm">{instance.instance_name}</span>
                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                        {instance.host}:{instance.port}
                                                    </code>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Load Balancer: {balancer?.balancer_name || 'Unknown'}
                                                </p>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Gewichtung: {instance.weight}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Verbindungen: {instance.active_connections || 0}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Requests: {instance.total_requests || 0}
                                                    </span>
                                                    {instance.response_time_ms && (
                                                        <span className="text-xs text-gray-600">
                                                            Response: {instance.response_time_ms}ms
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    <span className="text-xs text-green-600">
                                                        Erfolgsrate: {successRate}%
                                                    </span>
                                                    {instance.last_health_check && (
                                                        <span className="text-xs text-gray-600">
                                                            Letzter Check: {new Date(instance.last_health_check).toLocaleTimeString('de-DE')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge className={healthColors[instance.health_status]}>
                                                {instance.health_status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {activeTab === 'policies' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_policies}</div>
                            <div className="text-xs text-gray-600">Policies</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_policies}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.policies.reduce((sum, p) => sum + (p.scale_up_count || 0) + (p.scale_down_count || 0), 0)}
                            </div>
                            <div className="text-xs text-gray-600">Skalierungen gesamt</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.policies.map(policy => {
                            const balancer = data.balancers.find(b => b.id === policy.load_balancer_id);
                            const instances = data.instances.filter(i => i.load_balancer_id === policy.load_balancer_id);
                            const healthyCount = instances.filter(i => i.health_status === 'healthy').length;

                            return (
                                <Card key={policy.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="w-4 h-4 text-purple-600" />
                                                    <h5 className="font-semibold text-sm">{policy.policy_name}</h5>
                                                    <Badge variant="outline">{policy.metric_type}</Badge>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Load Balancer: {balancer?.balancer_name || 'Unknown'}
                                                </p>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Scale Up: &gt; {policy.scale_up_threshold}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Scale Down: &lt; {policy.scale_down_threshold}
                                                    </span>
                                                </div>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Min: {policy.min_instances}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Aktuell: {healthyCount}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Max: {policy.max_instances}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Cooldown: {policy.cooldown_seconds}s
                                                    </span>
                                                </div>
                                                <div className="flex gap-3 mt-2">
                                                    <span className="text-xs text-green-600">
                                                        ↑ {policy.scale_up_count || 0} Scale-Ups
                                                    </span>
                                                    <span className="text-xs text-blue-600">
                                                        ↓ {policy.scale_down_count || 0} Scale-Downs
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge className={policy.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                {policy.is_active ? 'aktiv' : 'inaktiv'}
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