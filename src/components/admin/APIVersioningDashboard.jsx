import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function APIVersioningDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('versions');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('apiVersioningEngine', {
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
        draft: 'bg-gray-100 text-gray-800',
        beta: 'bg-blue-100 text-blue-800',
        stable: 'bg-green-100 text-green-800',
        deprecated: 'bg-yellow-100 text-yellow-800',
        retired: 'bg-red-100 text-red-800',
        planning: 'bg-gray-100 text-gray-800',
        announced: 'bg-yellow-100 text-yellow-800',
        active: 'bg-orange-100 text-orange-800',
        enforcement: 'bg-red-100 text-red-800',
        'api_version': 'bg-blue-100 text-blue-800',
        endpoint: 'bg-green-100 text-green-800',
        parameter: 'bg-purple-100 text-purple-800',
        field: 'bg-indigo-100 text-indigo-800',
        feature: 'bg-cyan-100 text-cyan-800',
        method: 'bg-orange-100 text-orange-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['versions', 'deprecations'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'versions' && '📦 API Versionen'}
                        {tab === 'deprecations' && '⏰ Deprecations'}
                    </button>
                ))}
            </div>

            {activeTab === 'versions' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.version_stats.total_versions}</div>
                            <div className="text-xs text-gray-600">Versionen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-gray-600">{data.version_stats.draft_versions}</div>
                            <div className="text-xs text-gray-600">Entwurf</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.version_stats.beta_versions}</div>
                            <div className="text-xs text-gray-600">Beta</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.version_stats.stable_versions}</div>
                            <div className="text-xs text-gray-600">Stabil</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.version_stats.deprecated_versions}</div>
                            <div className="text-xs text-gray-600">Deprecated</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.version_stats.retired_versions}</div>
                            <div className="text-xs text-gray-600">Eingestellt</div>
                        </CardContent></Card>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.version_stats.total_requests}</div>
                            <div className="text-xs text-gray-600">Requests</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.version_stats.total_errors}</div>
                            <div className="text-xs text-gray-600">Fehler</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-cyan-600">{data.version_stats.total_active_users}</div>
                            <div className="text-xs text-gray-600">Aktive Benutzer</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.versions.map(version => (
                            <Card key={version.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{version.api_name}</h5>
                                                <Badge className={statusColors[version.status]}>
                                                    v{version.version_number}
                                                </Badge>
                                                {version.is_default && (
                                                    <Badge className="bg-purple-100 text-purple-800">Standard</Badge>
                                                )}
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Endpoints: {version.endpoints_count}
                                                </span>
                                                <span className="text-blue-600">
                                                    Requests: {version.request_count}
                                                </span>
                                                <span className="text-cyan-600">
                                                    Benutzer: {version.active_users}
                                                </span>
                                                {version.error_rate > 0 && (
                                                    <span className="text-red-600">
                                                        Fehlerquote: {version.error_rate}%
                                                    </span>
                                                )}
                                            </div>
                                            {version.release_date && (
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    Release: {new Date(version.release_date).toLocaleDateString('de-DE')}
                                                </span>
                                            )}
                                            {version.deprecation_date && (
                                                <span className="text-xs text-yellow-600 mt-2 inline-block ml-4">
                                                    Deprecated: {new Date(version.deprecation_date).toLocaleDateString('de-DE')}
                                                </span>
                                            )}
                                        </div>
                                        <Badge className={statusColors[version.status]}>
                                            {version.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'deprecations' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.deprecation_stats.total_schedules}</div>
                            <div className="text-xs text-gray-600">Deprecations</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-gray-600">{data.deprecation_stats.planning}</div>
                            <div className="text-xs text-gray-600">Planung</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.deprecation_stats.announced}</div>
                            <div className="text-xs text-gray-600">Ankündigung</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.deprecation_stats.active}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.deprecation_stats.enforcement}</div>
                            <div className="text-xs text-gray-600">Durchsetzung</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.deprecation_stats.avg_migration_percentage}%</div>
                            <div className="text-xs text-gray-600">Ø Migration</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.schedules.map(schedule => (
                            <Card key={schedule.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{schedule.item_name}</h5>
                                                <Badge className={statusColors[schedule.item_type]}>
                                                    {schedule.item_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                {schedule.current_version && (
                                                    <span className="text-blue-600">
                                                        Aktuell: {schedule.current_version}
                                                    </span>
                                                )}
                                                {schedule.replacement_name && (
                                                    <span className="text-green-600">
                                                        Ersatz: {schedule.replacement_name} (v{schedule.replacement_version})
                                                    </span>
                                                )}
                                                <span className="text-purple-600">
                                                    Betroffene Benutzer: {schedule.affected_users_count}
                                                </span>
                                                <span className="text-cyan-600">
                                                    Migriert: {schedule.migrated_users_count}
                                                </span>
                                            </div>
                                            {schedule.migration_percentage > 0 && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                                                        <div
                                                            className="h-2 rounded-full bg-blue-600"
                                                            style={{ width: `${Math.min(schedule.migration_percentage, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-600">
                                                        {schedule.migration_percentage}%
                                                    </span>
                                                </div>
                                            )}
                                            {schedule.sunset_date && (
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    Sunset: {new Date(schedule.sunset_date).toLocaleDateString('de-DE')}
                                                </span>
                                            )}
                                        </div>
                                        <Badge className={statusColors[schedule.deprecation_stage]}>
                                            {schedule.deprecation_stage}
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