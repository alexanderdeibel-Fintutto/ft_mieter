import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Settings, Shield, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function MultiTenancyDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tenants');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('multiTenancyEngine', {
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
        trial: 'bg-blue-100 text-blue-800',
        suspended: 'bg-red-100 text-red-800',
        inactive: 'bg-gray-100 text-gray-800',
        churned: 'bg-orange-100 text-orange-800',
        free: 'bg-gray-100 text-gray-800',
        starter: 'bg-blue-100 text-blue-800',
        professional: 'bg-purple-100 text-purple-800',
        enterprise: 'bg-indigo-100 text-indigo-800',
        custom: 'bg-cyan-100 text-cyan-800',
        shared_database: 'bg-blue-100 text-blue-800',
        shared_schema: 'bg-green-100 text-green-800',
        dedicated_schema: 'bg-purple-100 text-purple-800',
        dedicated_database: 'bg-indigo-100 text-indigo-800',
        soft: 'bg-blue-100 text-blue-800',
        medium: 'bg-yellow-100 text-yellow-800',
        hard: 'bg-orange-100 text-orange-800',
        complete: 'bg-red-100 text-red-800',
        data_access: 'bg-blue-100 text-blue-800',
        network: 'bg-green-100 text-green-800',
        compute: 'bg-purple-100 text-purple-800',
        storage: 'bg-cyan-100 text-cyan-800',
        api_access: 'bg-orange-100 text-orange-800',
        branding: 'bg-pink-100 text-pink-800',
        security: 'bg-red-100 text-red-800',
        billing: 'bg-green-100 text-green-800',
        features: 'bg-blue-100 text-blue-800',
        limits: 'bg-yellow-100 text-yellow-800',
        integrations: 'bg-purple-100 text-purple-800',
        notifications: 'bg-cyan-100 text-cyan-800',
        pending_review: 'bg-yellow-100 text-yellow-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['tenants', 'configs', 'policies'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'tenants' && '👥 Tenants'}
                        {tab === 'configs' && '⚙️ Konfigurationen'}
                        {tab === 'policies' && '🛡️ Policies'}
                    </button>
                ))}
            </div>

            {activeTab === 'tenants' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.tenant_stats.total_tenants}</div>
                            <div className="text-xs text-gray-600">Tenants</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.tenant_stats.active_tenants}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.tenant_stats.trial_tenants}</div>
                            <div className="text-xs text-gray-600">Trial</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.tenant_stats.suspended_tenants}</div>
                            <div className="text-xs text-gray-600">Gesperrt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.tenant_stats.total_users}</div>
                            <div className="text-xs text-gray-600">Benutzer</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-cyan-600">{Math.round(data.tenant_stats.total_storage_mb)}MB</div>
                            <div className="text-xs text-gray-600">Speicher</div>
                        </CardContent></Card>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Tier</h4>
                            {Object.entries(data.tenant_stats.by_tier || {}).map(([tier, count]) => (
                                <div key={tier} className="text-xs flex justify-between mb-1">
                                    <span>{tier}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Isolation</h4>
                            {Object.entries(data.tenant_stats.by_isolation || {}).slice(0, 4).map(([iso, count]) => (
                                <div key={iso} className="text-xs flex justify-between mb-1">
                                    <span className="truncate">{iso}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.tenant_stats.total_api_requests}</div>
                            <div className="text-xs text-gray-600">API Requests</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.tenants.map(tenant => (
                            <Card key={tenant.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{tenant.tenant_name}</h5>
                                                <Badge className={statusColors[tenant.tier]}>
                                                    {tenant.tier}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="font-mono text-gray-600">
                                                    {tenant.tenant_slug}
                                                </span>
                                                <Badge variant="outline" className={statusColors[tenant.isolation_level]}>
                                                    {tenant.isolation_level}
                                                </Badge>
                                                <span className="text-purple-600">
                                                    Benutzer: {tenant.user_count}
                                                </span>
                                                <span className="text-cyan-600">
                                                    Speicher: {Math.round(tenant.storage_used_mb)}/{tenant.storage_limit_mb}MB
                                                </span>
                                                <span className="text-orange-600">
                                                    API: {tenant.api_requests_count}/{tenant.api_requests_limit}
                                                </span>
                                            </div>
                                            {tenant.last_activity_at && (
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    Letzte Aktivität: {new Date(tenant.last_activity_at).toLocaleDateString('de-DE')}
                                                </span>
                                            )}
                                        </div>
                                        <Badge className={statusColors[tenant.status]}>
                                            {tenant.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'configs' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.config_stats.total_configs}</div>
                            <div className="text-xs text-gray-600">Konfigurationen</div>
                        </CardContent></Card>
                        {Object.entries(data.config_stats.by_category || {}).slice(0, 5).map(([category, count]) => (
                            <Card key={category}><CardContent className="p-4">
                                <div className="text-2xl font-bold text-purple-600">{count}</div>
                                <div className="text-xs text-gray-600 truncate">{category}</div>
                            </CardContent></Card>
                        ))}
                    </div>

                    <div className="space-y-2">
                        {data.configs.slice(0, 40).map(config => (
                            <Card key={config.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Settings className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm font-mono">{config.config_key}</h5>
                                                <Badge className={statusColors[config.category]}>
                                                    {config.category}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Typ: {config.config_type}
                                                </span>
                                                {config.description && (
                                                    <span className="text-gray-600">{config.description}</span>
                                                )}
                                                {config.is_encrypted && (
                                                    <Badge variant="outline" className="text-xs">🔒 Verschlüsselt</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'policies' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.policy_stats.total_policies}</div>
                            <div className="text-xs text-gray-600">Policies</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.policy_stats.active_policies}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-gray-600">{data.policy_stats.inactive_policies}</div>
                            <div className="text-xs text-gray-600">Inaktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.policy_stats.total_violations}</div>
                            <div className="text-xs text-gray-600">Verstöße</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Typ</h4>
                            {Object.entries(data.policy_stats.by_type || {}).slice(0, 3).map(([type, count]) => (
                                <div key={type} className="text-xs flex justify-between">
                                    <span className="truncate">{type}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Level</h4>
                            {Object.entries(data.policy_stats.by_isolation_level || {}).slice(0, 3).map(([level, count]) => (
                                <div key={level} className="text-xs flex justify-between">
                                    <span>{level}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.policies.map(policy => (
                            <Card key={policy.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{policy.policy_name}</h5>
                                                <Badge className={statusColors[policy.policy_type]}>
                                                    {policy.policy_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <Badge variant="outline" className={statusColors[policy.isolation_level]}>
                                                    {policy.isolation_level}
                                                </Badge>
                                                {policy.cross_tenant_access_allowed && (
                                                    <Badge variant="outline" className="text-xs">Cross-Tenant ✓</Badge>
                                                )}
                                                {policy.data_encryption_required && (
                                                    <Badge variant="outline" className="text-xs">🔒 Encryption</Badge>
                                                )}
                                                {policy.violations_count > 0 && (
                                                    <span className="text-red-600">
                                                        Verstöße: {policy.violations_count}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={statusColors[policy.status]}>
                                            {policy.status}
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