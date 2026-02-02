import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, RotateCw, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function ResiliencePatternDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('breakers');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('resiliencePatternEngine', {
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
        closed: 'bg-green-100 text-green-800',
        open: 'bg-red-100 text-red-800',
        half_open: 'bg-yellow-100 text-yellow-800',
        retry: 'bg-blue-100 text-blue-800',
        timeout: 'bg-orange-100 text-orange-800',
        bulkhead: 'bg-purple-100 text-purple-800',
        fallback: 'bg-cyan-100 text-cyan-800',
        'circuit_breaker': 'bg-red-100 text-red-800',
        combined: 'bg-indigo-100 text-indigo-800',
        triggered: 'bg-red-100 text-red-800',
        resolved: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        low: 'bg-blue-100 text-blue-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        critical: 'bg-red-100 text-red-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['breakers', 'policies', 'events'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'breakers' && '🔌 Circuit Breaker'}
                        {tab === 'policies' && '📋 Policies'}
                        {tab === 'events' && '📊 Events'}
                    </button>
                ))}
            </div>

            {activeTab === 'breakers' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.breaker_stats.total_breakers}</div>
                            <div className="text-xs text-gray-600">Breaker</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.breaker_stats.closed_breakers}</div>
                            <div className="text-xs text-gray-600">Geschlossen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.breaker_stats.open_breakers}</div>
                            <div className="text-xs text-gray-600">Offen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.breaker_stats.half_open_breakers}</div>
                            <div className="text-xs text-gray-600">Halb Offen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.breaker_stats.total_requests}</div>
                            <div className="text-xs text-gray-600">Anfragen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.breaker_stats.rejection_rate || 0}%</div>
                            <div className="text-xs text-gray-600">Ablehnungsquote</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.breakers.map(breaker => (
                            <Card key={breaker.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{breaker.breaker_name}</h5>
                                                <span className="text-xs text-gray-600">
                                                    {breaker.target_service}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Anfragen: {breaker.total_requests}
                                                </span>
                                                <span className="text-red-600">
                                                    Abgelehnt: {breaker.rejected_requests}
                                                </span>
                                                <span className="text-orange-600">
                                                    Fehler: {breaker.failure_count}/{breaker.failure_threshold}
                                                </span>
                                                {breaker.state === 'half_open' && (
                                                    <span className="text-yellow-600">
                                                        Erfolg: {breaker.success_count}/{breaker.success_threshold}
                                                    </span>
                                                )}
                                                <span className="text-blue-600">
                                                    Reset: {breaker.reset_timeout_seconds}s
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                Geändert: {new Date(breaker.last_state_change).toLocaleString('de-DE')}
                                            </span>
                                        </div>
                                        <Badge className={statusColors[breaker.state]}>
                                            {breaker.state}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'policies' && (
                <>
                    <div className="grid grid-cols-5 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.policy_stats.total_policies}</div>
                            <div className="text-xs text-gray-600">Policies</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.policy_stats.active_policies}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Typ</h4>
                            {Object.entries(data.policy_stats.by_type || {}).slice(0, 2).map(([type, count]) => (
                                <div key={type} className="text-xs flex justify-between">
                                    <span>{type}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </Card></CardContent>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Priorität</h4>
                            {Object.entries(data.policy_stats.by_priority || {}).slice(0, 2).map(([pri, count]) => (
                                <div key={pri} className="text-xs flex justify-between">
                                    <span className="capitalize">{pri}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </Card></CardContent>
                    </div>

                    <div className="space-y-2">
                        {data.policies.map(policy => (
                            <Card key={policy.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <RotateCw className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{policy.policy_name}</h5>
                                                <Badge className={statusColors[policy.policy_type]}>
                                                    {policy.policy_type}
                                                </Badge>
                                                <Badge className={statusColors[policy.priority]}>
                                                    {policy.priority}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Service: {policy.target_service}
                                                </span>
                                                {Object.keys(policy.retry_config || {}).length > 0 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        ↻ Retry
                                                    </Badge>
                                                )}
                                                {Object.keys(policy.timeout_config || {}).length > 0 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        ⏱️ Timeout
                                                    </Badge>
                                                )}
                                                {Object.keys(policy.bulkhead_config || {}).length > 0 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        🔒 Bulkhead
                                                    </Badge>
                                                )}
                                                {Object.keys(policy.fallback_config || {}).length > 0 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        🔄 Fallback
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={policy.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {policy.is_active ? 'Aktiv' : 'Inaktiv'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'events' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.event_stats.total_events}</div>
                            <div className="text-xs text-gray-600">Events</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.event_stats.circuit_opens}</div>
                            <div className="text-xs text-gray-600">Öffnungen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.event_stats.circuit_closes}</div>
                            <div className="text-xs text-gray-600">Schließungen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.event_stats.retries}</div>
                            <div className="text-xs text-gray-600">Wiederholungen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-cyan-600">{data.event_stats.fallbacks}</div>
                            <div className="text-xs text-gray-600">Fallbacks</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.event_stats.timeouts}</div>
                            <div className="text-xs text-gray-600">Timeouts</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.events.map(event => (
                            <Card key={event.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-gray-600" />
                                                <Badge className={statusColors[event.event_type]}>
                                                    {event.event_type}
                                                </Badge>
                                                <h5 className="font-semibold text-sm">{event.service_name}</h5>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                {event.error_message && (
                                                    <span className="text-red-600">
                                                        Fehler: {event.error_message.substring(0, 30)}
                                                    </span>
                                                )}
                                                {event.recovery_action && (
                                                    <span className="text-green-600">
                                                        Recovery: {event.recovery_action}
                                                    </span>
                                                )}
                                                {event.response_time_ms && (
                                                    <span className="text-blue-600">
                                                        Response: {event.response_time_ms}ms
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                {new Date(event.timestamp).toLocaleString('de-DE')}
                                            </span>
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
        </div>
    );
}