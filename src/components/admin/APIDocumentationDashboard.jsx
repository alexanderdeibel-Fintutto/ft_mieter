import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Code, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function APIDocumentationDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('docs');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('apiDocumentationEngine', {
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
        review: 'bg-yellow-100 text-yellow-800',
        published: 'bg-green-100 text-green-800',
        archived: 'bg-purple-100 text-purple-800',
        openapi: 'bg-blue-100 text-blue-800',
        graphql: 'bg-purple-100 text-purple-800',
        grpc: 'bg-indigo-100 text-indigo-800',
        rest: 'bg-cyan-100 text-cyan-800',
        webhook: 'bg-orange-100 text-orange-800',
        documented: 'bg-green-100 text-green-800',
        partial: 'bg-yellow-100 text-yellow-800',
        undocumented: 'bg-red-100 text-red-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['docs', 'endpoints'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'docs' && '📚 Dokumentation'}
                        {tab === 'endpoints' && '🔗 Endpoints'}
                    </button>
                ))}
            </div>

            {activeTab === 'docs' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.doc_stats.total_docs}</div>
                            <div className="text-xs text-gray-600">Dokumentationen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-gray-600">{data.doc_stats.draft_docs}</div>
                            <div className="text-xs text-gray-600">Entwurf</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.doc_stats.review_docs}</div>
                            <div className="text-xs text-gray-600">Review</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.doc_stats.published_docs}</div>
                            <div className="text-xs text-gray-600">Veröffentlicht</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.doc_stats.total_endpoints}</div>
                            <div className="text-xs text-gray-600">Endpoints</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-cyan-600">{data.doc_stats.total_views}</div>
                            <div className="text-xs text-gray-600">Aufrufe</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.docs.map(doc => (
                            <Card key={doc.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{doc.title}</h5>
                                                <Badge className={statusColors[doc.doc_type]}>
                                                    {doc.doc_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-blue-600">
                                                    v{doc.version}
                                                </span>
                                                <span className="text-gray-600">
                                                    API: {doc.api_name}
                                                </span>
                                                <span className="text-purple-600">
                                                    Endpoints: {doc.endpoints_count}
                                                </span>
                                                <span className="text-cyan-600">
                                                    Schemas: {doc.schemas_count}
                                                </span>
                                                <span className="text-green-600">
                                                    Abdeckung: {doc.coverage_percentage}%
                                                </span>
                                                <span className="text-orange-600">
                                                    Aufrufe: {doc.views_count}
                                                </span>
                                            </div>
                                            {doc.published_at && (
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    Veröffentlicht: {new Date(doc.published_at).toLocaleDateString('de-DE')}
                                                </span>
                                            )}
                                        </div>
                                        <Badge className={statusColors[doc.status]}>
                                            {doc.status}
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
                            <div className="text-2xl font-bold text-green-600">{data.endpoint_stats.documented_endpoints}</div>
                            <div className="text-xs text-gray-600">Dokumentiert</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.endpoint_stats.partial_endpoints}</div>
                            <div className="text-xs text-gray-600">Partiell</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.endpoint_stats.undocumented_endpoints}</div>
                            <div className="text-xs text-gray-600">Undokumentiert</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.endpoint_stats.total_requests}</div>
                            <div className="text-xs text-gray-600">Requests</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-cyan-600">{data.endpoint_stats.avg_response_time_ms}ms</div>
                            <div className="text-xs text-gray-600">Ø Response-Zeit</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.endpoints.slice(0, 40).map(endpoint => (
                            <Card key={endpoint.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Code className="w-4 h-4 text-gray-600" />
                                                <Badge variant="outline" className="text-xs font-mono">
                                                    {endpoint.method}
                                                </Badge>
                                                <h5 className="font-semibold text-sm font-mono">{endpoint.path}</h5>
                                                {endpoint.deprecated && (
                                                    <Badge className="bg-red-100 text-red-800">Deprecated</Badge>
                                                )}
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                {endpoint.summary && (
                                                    <span className="text-gray-600">{endpoint.summary}</span>
                                                )}
                                                <span className="text-purple-600">
                                                    Requests: {endpoint.request_count}
                                                </span>
                                                <span className="text-blue-600">
                                                    Response: {endpoint.average_response_time_ms}ms
                                                </span>
                                                {endpoint.error_count > 0 && (
                                                    <span className="text-red-600">
                                                        Fehler: {endpoint.error_count}
                                                    </span>
                                                )}
                                                {endpoint.examples && endpoint.examples.length > 0 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {endpoint.examples.length} Beispiele
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={statusColors[endpoint.documentation_status]}>
                                            {endpoint.documentation_status}
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