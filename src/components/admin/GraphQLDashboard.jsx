import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Zap, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function GraphQLDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('schemas');

    useEffect(() => {
        loadData();
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('graphqlEngine', {
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

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['schemas', 'resolvers', 'queries'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'schemas' && '📋 Schemas'}
                        {tab === 'resolvers' && '⚡ Resolver'}
                        {tab === 'queries' && '📊 Queries'}
                    </button>
                ))}
            </div>

            {activeTab === 'schemas' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_schemas}</div>
                            <div className="text-xs text-gray-600">Schemas</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.published_schemas}</div>
                            <div className="text-xs text-gray-600">Veröffentlicht</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.deprecated_schemas}</div>
                            <div className="text-xs text-gray-600">Veraltet</div>
                        </CardContent></Card>
                    </div>

                    <Card>
                        <CardHeader><CardTitle className="text-sm">Schemas nach Kategorie</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-2">
                                {Object.entries(data.schemas_by_category || {}).map(([cat, count]) => (
                                    <div key={cat} className="text-center p-3 border rounded">
                                        <div className="text-xs text-gray-600 mb-1">{cat}</div>
                                        <div className="text-lg font-bold text-blue-600">{count}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        {data.schemas.map(schema => (
                            <Card key={schema.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Code className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{schema.schema_name}</h5>
                                                <Badge variant="outline" className="text-xs">v{schema.version}</Badge>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">{schema.description}</p>
                                            <div className="mt-2">
                                                <code className="text-xs bg-gray-100 p-2 rounded block whitespace-pre-wrap">
                                                    {schema.type_definitions.slice(0, 200)}
                                                    {schema.type_definitions.length > 200 && '...'}
                                                </code>
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs">{schema.schema_category}</Badge>
                                                {schema.is_deprecated && (
                                                    <Badge className="bg-red-100 text-red-800 text-xs">Veraltet</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={schema.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {schema.is_published ? 'Veröffentlicht' : 'Entwurf'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'resolvers' && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_resolvers}</div>
                            <div className="text-xs text-gray-600">Resolver</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_resolvers}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                    </div>

                    <Card>
                        <CardHeader><CardTitle className="text-sm">Resolver nach Typ</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(data.resolvers_by_type || {}).map(([type, count]) => (
                                    <div key={type} className="flex justify-between items-center p-2 border rounded">
                                        <span className="text-sm">{type}</span>
                                        <Badge>{count}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        {data.resolvers.map(resolver => (
                            <Card key={resolver.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-yellow-600" />
                                                <h5 className="font-semibold text-sm">{resolver.resolver_name}</h5>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {resolver.parent_type}.{resolver.field_name}
                                            </p>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Quelle: {resolver.data_source}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Ausführungen: {resolver.execution_count || 0}
                                                </span>
                                                {resolver.avg_execution_time_ms && (
                                                    <span className="text-xs text-gray-600">
                                                        Ø {resolver.avg_execution_time_ms}ms
                                                    </span>
                                                )}
                                            </div>
                                            {resolver.caching_enabled && (
                                                <Badge variant="outline" className="text-xs mt-2">
                                                    Cache: {resolver.cache_ttl_seconds}s
                                                </Badge>
                                            )}
                                        </div>
                                        <Badge className={resolver.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {resolver.is_active ? 'Aktiv' : 'Inaktiv'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'queries' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_queries}</div>
                            <div className="text-xs text-gray-600">Queries</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.successful_queries}</div>
                            <div className="text-xs text-gray-600">Erfolgreich</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.failed_queries}</div>
                            <div className="text-xs text-gray-600">Fehlgeschlagen</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Letzte Queries</h4>
                        {data.recent_queries.map(query => (
                            <Card key={query.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-blue-600" />
                                                <Badge variant="outline" className="text-xs">{query.operation_type}</Badge>
                                                {query.operation_name && (
                                                    <span className="text-xs font-semibold">{query.operation_name}</span>
                                                )}
                                            </div>
                                            <code className="text-xs bg-gray-100 p-1 rounded block mt-2 whitespace-pre-wrap">
                                                {query.query_string.slice(0, 150)}
                                                {query.query_string.length > 150 && '...'}
                                            </code>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    {query.execution_time_ms}ms
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    {new Date(query.timestamp).toLocaleString('de-DE')}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge className={
                                            query.status === 'success' ? 'bg-green-100 text-green-800' :
                                            query.status === 'error' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }>
                                            {query.status}
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