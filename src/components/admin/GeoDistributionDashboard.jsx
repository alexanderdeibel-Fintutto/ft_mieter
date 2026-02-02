import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Server, ArrowRightLeft, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function GeoDistributionDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('regions');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('geoDistributionEngine', {
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
        degraded: 'bg-yellow-100 text-yellow-800',
        offline: 'bg-red-100 text-red-800',
        maintenance: 'bg-orange-100 text-orange-800',
        standby: 'bg-blue-100 text-blue-800',
        deprecated: 'bg-purple-100 text-purple-800',
        draft: 'bg-gray-100 text-gray-800',
        scheduled: 'bg-yellow-100 text-yellow-800',
        'in_progress': 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        'rolled_back': 'bg-orange-100 text-orange-800',
        failed: 'bg-red-100 text-red-800',
        primary: 'bg-purple-100 text-purple-800',
        secondary: 'bg-blue-100 text-blue-800',
        tertiary: 'bg-cyan-100 text-cyan-800',
        dr: 'bg-orange-100 text-orange-800',
        edge: 'bg-indigo-100 text-indigo-800',
        api: 'bg-blue-100 text-blue-800',
        webhook: 'bg-green-100 text-green-800',
        cdn: 'bg-purple-100 text-purple-800',
        database: 'bg-orange-100 text-orange-800',
        cache: 'bg-cyan-100 text-cyan-800',
        storage: 'bg-indigo-100 text-indigo-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['regions', 'endpoints', 'migrations'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'regions' && '🌍 Regionen'}
                        {tab === 'endpoints' && '🔗 Endpoints'}
                        {tab === 'migrations' && '📊 Migrationen'}
                    </button>
                ))}
            </div>

            {activeTab === 'regions' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.region_stats.total_regions}</div>
                            <div className="text-xs text-gray-600">Regionen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.region_stats.active_regions}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.region_stats.degraded_regions}</div>
                            <div className="text-xs text-gray-600">Beeinträchtigt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.region_stats.offline_regions}</div>
                            <div className="text-xs text-gray-600">Offline</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.region_stats.primary_regions}</div>
                            <div className="text-xs text-gray-600">Primär</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-cyan-600">{data.region_stats.avg_latency_ms}ms</div>
                            <div className="text-xs text-gray-600">Ø Latenz</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.regions.map(region => (
                            <Card key={region.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{region.region_name}</h5>
                                                {region.is_primary && (
                                                    <Badge className="bg-purple-100 text-purple-800">Primär</Badge>
                                                )}
                                                <Badge className={statusColors[region.region_type]}>
                                                    {region.region_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="font-mono text-gray-600">
                                                    {region.region_code}
                                                </span>
                                                {region.country && (
                                                    <span className="text-gray-600">
                                                        {region.country}
                                                    </span>
                                                )}
                                                <span className="text-blue-600">
                                                    Latenz: {region.latency_ms}ms
                                                </span>
                                                <span className="text-green-600">
                                                    Verfügbarkeit: {region.uptime_percentage}%
                                                </span>
                                                {region.error_rate > 0 && (
                                                    <span className="text-red-600">
                                                        Fehlerquote: {region.error_rate}%
                                                    </span>
                                                )}
                                                <span className="text-purple-600">
                                                    Kapazität: {region.used_capacity}/{region.capacity_units}
                                                </span>
                                                <span className="text-cyan-600">
                                                    Verbindungen: {region.concurrent_connections}
                                                </span>
                                            </div>
                                            {region.data_replication_lag_ms > 0 && (
                                                <span className="text-xs text-orange-600 mt-2 inline-block">
                                                    Replikations-Lag: {region.data_replication_lag_ms}ms
                                                </span>
                                            )}
                                        </div>
                                        <Badge className={statusColors[region.status]}>
                                            {region.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'endpoints' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.endpoint_stats.total_endpoints}</div>
                            <div className="text-xs text-gray-600">Endpoints</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.endpoint_stats.active_endpoints}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.endpoint_stats.standby_endpoints}</div>
                            <div className="text-xs text-gray-600">Standby</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.endpoint_stats.total_requests}</div>
                            <div className="text-xs text-gray-600">Requests</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.endpoint_stats.total_errors}</div>
                            <div className="text-xs text-gray-600">Fehler</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Typ</h4>
                            {Object.entries(data.endpoint_stats.by_type || {}).slice(0, 3).map(([type, count]) => (
                                <div key={type} className="text-xs flex justify-between">
                                    <span>{type}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </Card></CardContent>
                    </div>

                    <div className="space-y-2">
                        {data.endpoints.slice(0, 40).map(endpoint => (
                            <Card key={endpoint.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Server className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{endpoint.service_name}</h5>
                                                <Badge className={statusColors[endpoint.endpoint_type]}>
                                                    {endpoint.endpoint_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="font-mono text-gray-600 truncate max-w-xs">
                                                    {endpoint.endpoint_url?.substring(0, 30)}
                                                </span>
                                                {endpoint.api_version && (
                                                    <span className="text-blue-600">
                                                        v{endpoint.api_version}
                                                    </span>
                                                )}
                                                <span className="text-purple-600">
                                                    Response: {endpoint.response_time_ms}ms
                                                </span>
                                                <span className="text-green-600">
                                                    Verfügbarkeit: {endpoint.availability_percentage}%
                                                </span>
                                                <span className="text-cyan-600">
                                                    Requests: {endpoint.request_count}
                                                </span>
                                                {endpoint.error_count > 0 && (
                                                    <span className="text-red-600">
                                                        Fehler: {endpoint.error_count}
                                                    </span>
                                                )}
                                            </div>
                                            {endpoint.rate_limit && (
                                                <span className="text-xs text-orange-600 mt-2 inline-block">
                                                    Rate-Limit: {endpoint.rate_limit}/s
                                                </span>
                                            )}
                                        </div>
                                        <Badge className={statusColors[endpoint.status]}>
                                            {endpoint.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'migrations' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.migration_stats.total_migrations}</div>
                            <div className="text-xs text-gray-600">Migrationen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-gray-600">{data.migration_stats.draft_migrations}</div>
                            <div className="text-xs text-gray-600">Entwurf</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.migration_stats.in_progress_migrations}</div>
                            <div className="text-xs text-gray-600">Laufend</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.migration_stats.completed_migrations}</div>
                            <div className="text-xs text-gray-600">Abgeschlossen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.migration_stats.failed_migrations}</div>
                            <div className="text-xs text-gray-600">Fehlgeschlagen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Typ</h4>
                            {Object.entries(data.migration_stats.by_type || {}).slice(0, 3).map(([type, count]) => (
                                <div key={type} className="text-xs flex justify-between">
                                    <span className="truncate">{type}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </Card></CardContent>
                    </div>

                    <div className="space-y-2">
                        {data.migrations.map(migration => (
                            <Card key={migration.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <ArrowRightLeft className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{migration.migration_name}</h5>
                                                <Badge className={statusColors[migration.migration_type]}>
                                                    {migration.migration_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    {migration.source_version} → {migration.target_version}
                                                </span>
                                                {migration.entity_type && (
                                                    <span className="text-purple-600">
                                                        Entity: {migration.entity_type}
                                                    </span>
                                                )}
                                                <span className="text-blue-600">
                                                    Records: {migration.migrated_records || 0}/{migration.total_records || 0}
                                                </span>
                                                {migration.failed_records > 0 && (
                                                    <span className="text-red-600">
                                                        Fehler: {migration.failed_records}
                                                    </span>
                                                )}
                                                {migration.regions_affected && migration.regions_affected.length > 0 && (
                                                    <span className="text-cyan-600">
                                                        Regionen: {migration.regions_affected.length}
                                                    </span>
                                                )}
                                            </div>
                                            {migration.progress_percentage > 0 && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                                                        <div
                                                            className="h-2 rounded-full bg-blue-600"
                                                            style={{ width: `${Math.min(migration.progress_percentage, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-600">
                                                        {migration.progress_percentage}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <Badge className={statusColors[migration.status]}>
                                            {migration.status}
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