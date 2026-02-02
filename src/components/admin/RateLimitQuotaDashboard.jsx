import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gauge, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function RateLimitQuotaDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('rate-limits');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('rateLimitQuotaEngine', {
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
        active: 'bg-green-100 text-green-800',
        exceeded: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
        inactive: 'bg-gray-100 text-gray-800',
        'per_user': 'bg-blue-100 text-blue-800',
        'per_api_key': 'bg-purple-100 text-purple-800',
        'per_ip': 'bg-cyan-100 text-cyan-800',
        'per_endpoint': 'bg-orange-100 text-orange-800',
        global: 'bg-red-100 text-red-800',
        custom: 'bg-gray-100 text-gray-800',
        'api_calls': 'bg-blue-100 text-blue-800',
        'storage_gb': 'bg-green-100 text-green-800',
        'bandwidth_gb': 'bg-purple-100 text-purple-800',
        'concurrent_connections': 'bg-orange-100 text-orange-800',
        'data_exports': 'bg-cyan-100 text-cyan-800',
        info: 'bg-blue-100 text-blue-800',
        critical: 'bg-red-100 text-red-800'
    };

    const getProgressColor = (percent) => {
        if (percent >= 100) return 'bg-red-600';
        if (percent >= 80) return 'bg-orange-600';
        if (percent >= 60) return 'bg-yellow-600';
        return 'bg-green-600';
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['rate-limits', 'quotas', 'events'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'rate-limits' && '⚡ Rate Limits'}
                        {tab === 'quotas' && '📊 Quotas'}
                        {tab === 'events' && '🚨 Events'}
                    </button>
                ))}
            </div>

            {activeTab === 'rate-limits' && (
                <>
                    <div className="grid grid-cols-5 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.bucket_stats.total_buckets}</div>
                            <div className="text-xs text-gray-600">Buckets</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.bucket_stats.active_buckets}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.bucket_stats.blocked_buckets}</div>
                            <div className="text-xs text-gray-600">Blockiert</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.bucket_stats.total_requests}</div>
                            <div className="text-xs text-gray-600">Anfragen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Typ</h4>
                            {Object.entries(data.bucket_stats.by_type || {}).slice(0, 3).map(([type, count]) => (
                                <div key={type} className="text-xs flex justify-between">
                                    <span>{type}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </Card></CardContent>
                    </div>

                    <div className="space-y-2">
                        {data.buckets.map(bucket => (
                            <Card key={bucket.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{bucket.bucket_name}</h5>
                                                <Badge className={statusColors[bucket.limit_type]}>
                                                    {bucket.limit_type}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {bucket.strategy}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600 font-mono">
                                                    {bucket.identifier?.substring(0, 12)}
                                                </span>
                                                <span className="text-purple-600">
                                                    Limit: {bucket.requests_limit}
                                                </span>
                                                <span className="text-blue-600">
                                                    Verfügbar: {Math.ceil(bucket.current_tokens || 0)}
                                                </span>
                                                <span className="text-green-600">
                                                    Gemacht: {bucket.requests_made}
                                                </span>
                                                <span className="text-gray-600">
                                                    Fenster: {bucket.window_seconds}s
                                                </span>
                                            </div>
                                        </div>
                                        <Badge className={bucket.is_blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                                            {bucket.is_blocked ? '🔒 Blockiert' : '✓ Aktiv'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'quotas' && (
                <>
                    <div className="grid grid-cols-5 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.quota_stats.total_quotas}</div>
                            <div className="text-xs text-gray-600">Quotas</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.quota_stats.active_quotas}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.quota_stats.warning_quotas}</div>
                            <div className="text-xs text-gray-600">Warnung</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.quota_stats.exceeded_quotas}</div>
                            <div className="text-xs text-gray-600">Überschritten</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.quota_stats.avg_usage_percent}%</div>
                            <div className="text-xs text-gray-600">Ø Auslastung</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.quotas.map(quota => (
                            <Card key={quota.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Gauge className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{quota.quota_name}</h5>
                                                <Badge className={statusColors[quota.quota_type]}>
                                                    {quota.quota_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Subject: {quota.subject_type} #{quota.subject_id?.substring(0, 8)}
                                                </span>
                                                <span className="text-purple-600">
                                                    Limit: {quota.limit} {quota.unit}
                                                </span>
                                                <span className="text-blue-600">
                                                    Verbrauch: {quota.usage} {quota.unit}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                                                    <div
                                                        className={`h-2 rounded-full ${getProgressColor(quota.usage_percentage)}`}
                                                        style={{ width: `${Math.min(quota.usage_percentage, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-gray-600">
                                                    {quota.usage_percentage}%
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                Erneuert: {new Date(quota.renewal_date).toLocaleDateString('de-DE')}
                                            </span>
                                        </div>
                                        <Badge className={statusColors[quota.status]}>
                                            {quota.status}
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
                    <div className="grid grid-cols-5 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.event_stats.total_events}</div>
                            <div className="text-xs text-gray-600">Events</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.event_stats.rate_limit_exceeded}</div>
                            <div className="text-xs text-gray-600">Rate Limit</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.event_stats.quota_exceeded}</div>
                            <div className="text-xs text-gray-600">Quota</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.event_stats.warnings}</div>
                            <div className="text-xs text-gray-600">Warnungen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Severity</h4>
                            {Object.entries(data.event_stats.by_severity || {}).slice(0, 3).map(([sev, count]) => (
                                <div key={sev} className="text-xs flex justify-between">
                                    <span className="capitalize">{sev}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </Card></CardContent>
                    </div>

                    <div className="space-y-2">
                        {data.events.slice(0, 40).map(event => (
                            <Card key={event.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4 text-gray-600" />
                                                <Badge variant="outline" className="text-xs">
                                                    {event.event_type}
                                                </Badge>
                                                <span className="text-sm font-semibold">
                                                    {event.resource || event.identifier?.substring(0, 12)}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-purple-600">
                                                    Limit: {event.limit_value}
                                                </span>
                                                <span className="text-blue-600">
                                                    Aktuell: {event.current_value}
                                                </span>
                                                {event.exceeded_by > 0 && (
                                                    <span className="text-red-600">
                                                        Überschritten: +{event.exceeded_by}
                                                    </span>
                                                )}
                                                <Badge variant="outline" className="text-xs">
                                                    {event.action_taken}
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                {new Date(event.timestamp).toLocaleString('de-DE')}
                                            </span>
                                        </div>
                                        <Badge className={statusColors[event.severity]}>
                                            {event.severity}
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