import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Lock, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

export default function RateLimitingQuotaDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('policies');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('rateLimitingQuotaEngine', {
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
        within_limit: 'bg-green-100 text-green-800',
        near_limit: 'bg-yellow-100 text-yellow-800',
        exceeded: 'bg-orange-100 text-orange-800',
        blocked: 'bg-red-100 text-red-800'
    };

    const strategyColors = {
        token_bucket: 'bg-blue-100 text-blue-800',
        sliding_window: 'bg-purple-100 text-purple-800',
        fixed_window: 'bg-indigo-100 text-indigo-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['policies', 'quotas', 'usage'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'policies' && '⚡ Policies'}
                        {tab === 'quotas' && '📊 Quotas'}
                        {tab === 'usage' && '📈 Nutzung'}
                    </button>
                ))}
            </div>

            {activeTab === 'policies' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.policy_stats.total_policies}</div>
                            <div className="text-xs text-gray-600">Policies</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.policy_stats.active_policies}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.policy_stats.total_allowed}</div>
                            <div className="text-xs text-gray-600">Erlaubt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.policy_stats.total_blocked}</div>
                            <div className="text-xs text-gray-600">Blockiert ({data.policy_stats.block_rate}%)</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.policies.map(policy => (
                            <Card key={policy.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{policy.policy_name}</h5>
                                                <Badge variant="outline">{policy.policy_type}</Badge>
                                                <Badge className={strategyColors[policy.strategy]}>
                                                    {policy.strategy}
                                                </Badge>
                                            </div>
                                            {policy.target_identifier && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Target: {policy.target_identifier}
                                                </p>
                                            )}
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    {policy.requests_per_window} req / {policy.window_size_seconds}s
                                                </span>
                                                {policy.burst_size > 0 && (
                                                    <span className="text-xs text-gray-600">
                                                        Burst: {policy.burst_size}
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-600">
                                                    Action: {policy.action_on_limit}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-green-600">
                                                    Erlaubt: {policy.allowed_count || 0}
                                                </span>
                                                <span className="text-xs text-red-600">
                                                    Blockiert: {policy.blocked_count || 0}
                                                </span>
                                            </div>
                                            {policy.allowed_count > 0 && (
                                                <div className="mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                            <div 
                                                                className="h-2 rounded-full bg-red-500"
                                                                style={{ 
                                                                    width: `${Math.min(100, Math.round((policy.blocked_count || 0) / ((policy.allowed_count || 1) + (policy.blocked_count || 0)) * 100))}%` 
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-semibold">
                                                            {Math.min(100, Math.round((policy.blocked_count || 0) / ((policy.allowed_count || 1) + (policy.blocked_count || 0)) * 100))}%
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <Badge className={policy.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {policy.is_active ? 'ON' : 'OFF'}
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
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.quota_stats.total_quotas}</div>
                            <div className="text-xs text-gray-600">Quotas</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.quota_stats.active_quotas}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.quota_stats.near_limit_quotas}</div>
                            <div className="text-xs text-gray-600">Nahe Limit</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.quota_stats.exceeded_quotas}</div>
                            <div className="text-xs text-gray-600">Überschritten</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.quotas.map(quota => (
                            <Card key={quota.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Lock className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{quota.quota_name}</h5>
                                                <Badge variant="outline">{quota.quota_type}</Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {quota.subject_type}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Subjekt-ID: {quota.subject_id.substring(0, 12)}...
                                            </p>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Limit: {quota.limit_value} {quota.unit}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Periode: {quota.period}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Alert: bei {quota.alert_threshold_percentage}%
                                                </span>
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <Badge className={quota.is_hard_limit ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                                                    {quota.is_hard_limit ? 'Hard Limit' : 'Soft Limit'}
                                                </Badge>
                                                {quota.renewal_date && (
                                                    <span className="text-xs text-gray-600">
                                                        Erneuerung: {new Date(quota.renewal_date).toLocaleString('de-DE')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={quota.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {quota.is_active ? 'ON' : 'OFF'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'usage' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        {Object.entries(data.usage_by_status || {}).map(([status, count]) => (
                            <Card key={status}><CardContent className="p-4">
                                <div className="text-2xl font-bold" style={{
                                    color: status === 'within_limit' ? '#059669' : status === 'near_limit' ? '#d97706' : '#dc2626'
                                }}>
                                    {count}
                                </div>
                                <div className="text-xs text-gray-600">{status}</div>
                            </CardContent></Card>
                        ))}
                    </div>

                    <div className="space-y-2">
                        {data.usages.map(usage => (
                            <Card key={usage.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <TrendingDown className="w-4 h-4 text-gray-600" />
                                                <span className="font-semibold text-sm">
                                                    {usage.subject_id.substring(0, 12)}...
                                                </span>
                                                <Badge variant="outline">
                                                    {usage.usage_value} / {usage.limit_value}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    {new Date(usage.period_start).toLocaleDateString('de-DE')} - {new Date(usage.period_end).toLocaleDateString('de-DE')}
                                                </span>
                                            </div>
                                            <div className="mt-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full ${
                                                                usage.status === 'within_limit' ? 'bg-green-500' :
                                                                usage.status === 'near_limit' ? 'bg-yellow-500' :
                                                                'bg-red-500'
                                                            }`}
                                                            style={{ width: `${Math.min(100, usage.usage_percentage || 0)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold">
                                                        {usage.usage_percentage || 0}%
                                                    </span>
                                                </div>
                                            </div>
                                            {usage.exceeded_by > 0 && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    Überschritten um: {usage.exceeded_by}
                                                </p>
                                            )}
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                Aktualisiert: {new Date(usage.last_updated_at).toLocaleString('de-DE')}
                                            </span>
                                        </div>
                                        <Badge className={statusColors[usage.status]}>
                                            {usage.status}
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