import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const RESOURCE_TYPES = ['storage', 'compute', 'api_calls', 'database', 'users', 'entities'];
const ISOLATION_LEVELS = ['strict', 'moderate', 'relaxed'];

export default function TenantIsolationDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('quotas');

    useEffect(() => {
        loadData();
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('tenantIsolationEngine', {
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

    const handleResetQuota = async (quotaId) => {
        try {
            await base44.functions.invoke('tenantIsolationEngine', {
                action: 'reset_quota',
                organization_id: organizationId,
                quota_id: quotaId
            });
            toast.success('Quota zurückgesetzt');
            loadData();
        } catch (error) {
            toast.error('Fehler beim Zurücksetzen');
        }
    };

    if (loading || !data) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['quotas', 'policies', 'config'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'quotas' && '📊 Quotas'}
                        {tab === 'policies' && '🔒 Policies'}
                        {tab === 'config' && '⚙️ Konfiguration'}
                    </button>
                ))}
            </div>

            {activeTab === 'quotas' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_quotas}</div>
                            <div className="text-xs text-gray-600">Quotas</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_quotas}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.quotas_exceeded}</div>
                            <div className="text-xs text-gray-600">Überschritten</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.stats.quotas_near_limit}</div>
                            <div className="text-xs text-gray-600">Nahe Limit</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.quotas.map(quota => {
                            const usage = quota.current_usage || 0;
                            const limit = quota.limit_value;
                            const percentage = (usage / limit) * 100;
                            const isExceeded = usage >= limit;
                            const isNearLimit = usage >= (limit * 0.8);

                            return (
                                <Card key={quota.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h5 className="font-semibold text-sm">{quota.resource_name}</h5>
                                                    <Badge variant="outline" className="text-xs">{quota.resource_type}</Badge>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {usage} / {limit} {quota.unit}
                                                </p>
                                                <div className="mt-2">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full ${
                                                                isExceeded ? 'bg-red-600' : 
                                                                isNearLimit ? 'bg-orange-600' : 
                                                                'bg-green-600'
                                                            }`}
                                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1">{percentage.toFixed(1)}%</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {isExceeded && <AlertTriangle className="w-5 h-5 text-red-600" />}
                                                <Badge className={quota.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                    {quota.is_active ? 'Aktiv' : 'Inaktiv'}
                                                </Badge>
                                                <Button size="sm" variant="outline" onClick={() => handleResetQuota(quota.id)}>
                                                    Reset
                                                </Button>
                                            </div>
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
                    <div className="grid grid-cols-2 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_policies}</div>
                            <div className="text-xs text-gray-600">Policies</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_policies}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.policies.map(policy => (
                            <Card key={policy.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{policy.policy_name}</h5>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">Level: {policy.isolation_level}</p>
                                            <div className="mt-2 space-y-1">
                                                <p className="text-xs text-gray-600">
                                                    ✓ Daten-Isolation: {policy.data_isolation ? 'Ja' : 'Nein'}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    ✓ Netzwerk-Isolation: {policy.network_isolation ? 'Ja' : 'Nein'}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    ✓ Storage-Isolation: {policy.storage_isolation ? 'Ja' : 'Nein'}
                                                </p>
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

            {activeTab === 'config' && (
                <>
                    {data.tenant_config ? (
                        <Card>
                            <CardHeader><CardTitle className="text-sm">Tenant-Konfiguration</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center p-3 border rounded">
                                    <span className="text-sm">Tier</span>
                                    <Badge className="bg-blue-100 text-blue-800">{data.tenant_config.tenant_tier}</Badge>
                                </div>
                                <div className="flex justify-between items-center p-3 border rounded">
                                    <span className="text-sm">Max. Benutzer</span>
                                    <span className="font-semibold">{data.tenant_config.max_users}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 border rounded">
                                    <span className="text-sm">Max. Storage</span>
                                    <span className="font-semibold">{data.tenant_config.max_storage_gb} GB</span>
                                </div>
                                {data.tenant_config.is_suspended && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                                        <p className="text-sm text-red-800 font-semibold">⚠️ Tenant ist suspendiert</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center text-gray-500">
                                Keine Tenant-Konfiguration gefunden
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}