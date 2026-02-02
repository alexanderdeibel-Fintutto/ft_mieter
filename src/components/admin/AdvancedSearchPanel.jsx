import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdvancedSearchPanel({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('indexes');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('searchEngine', {
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

    const typeColors = {
        full_text: 'bg-blue-100 text-blue-800',
        faceted: 'bg-purple-100 text-purple-800',
        spatial: 'bg-green-100 text-green-800',
        time_series: 'bg-orange-100 text-orange-800',
        graph: 'bg-pink-100 text-pink-800',
        simple: 'bg-blue-100 text-blue-800',
        advanced: 'bg-purple-100 text-purple-800',
        faceted_search: 'bg-indigo-100 text-indigo-800',
        filter: 'bg-yellow-100 text-yellow-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['indexes', 'content', 'queries', 'analytics'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'indexes' && '📇 Indizes'}
                        {tab === 'content' && '📄 Inhalte'}
                        {tab === 'queries' && '🔍 Abfragen'}
                        {tab === 'analytics' && '📊 Analytik'}
                    </button>
                ))}
            </div>

            {activeTab === 'indexes' && (
                <>
                    <div className="grid grid-cols-5 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.index_stats.total_indexes}</div>
                            <div className="text-xs text-gray-600">Indizes</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.index_stats.active_indexes}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.index_stats.total_documents_indexed}
                            </div>
                            <div className="text-xs text-gray-600">Dokumente</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">
                                {data.index_stats.total_queries}
                            </div>
                            <div className="text-xs text-gray-600">Abfragen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-indigo-600">
                                {data.index_stats.avg_query_time}ms
                            </div>
                            <div className="text-xs text-gray-600">Ø Query-Zeit</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.indexes.map(index => (
                            <Card key={index.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Search className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{index.index_name}</h5>
                                                <Badge className={typeColors[index.index_type]}>
                                                    {index.index_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Entity: {index.source_entity}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Dokumente: {index.indexed_documents} / {index.total_documents}
                                                </span>
                                                <span className="text-xs text-purple-600">
                                                    Queries: {index.query_count}
                                                </span>
                                            </div>
                                            {index.fields_indexed && index.fields_indexed.length > 0 && (
                                                <div className="flex gap-1 mt-2 flex-wrap">
                                                    {index.fields_indexed.slice(0, 5).map(field => (
                                                        <Badge key={field} variant="outline" className="text-xs">
                                                            {field}
                                                        </Badge>
                                                    ))}
                                                    {index.fields_indexed.length > 5 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{index.fields_indexed.length - 5}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                Indexiert: {new Date(index.last_indexed_at).toLocaleString('de-DE')}
                                            </span>
                                        </div>
                                        <Badge className={index.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {index.is_active ? 'ON' : 'OFF'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'content' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.content_stats.total_indexed_content}
                            </div>
                            <div className="text-xs text-gray-600">Indexierte Inhalte</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.content_stats.avg_relevance_score}
                            </div>
                            <div className="text-xs text-gray-600">Ø Relevanz-Score</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.content_stats.total_views}
                            </div>
                            <div className="text-xs text-gray-600">Gesamt-Views</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.indexed_contents.map(content => (
                            <Card key={content.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h5 className="font-semibold text-sm">{content.title}</h5>
                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                {content.body}
                                            </p>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Typ: {content.content_type}
                                                </span>
                                                <span className="text-xs text-purple-600">
                                                    Relevanz: {content.relevance_score || 0}
                                                </span>
                                                <span className="text-xs text-green-600">
                                                    Views: {content.view_count || 0}
                                                </span>
                                            </div>
                                            {content.tags && content.tags.length > 0 && (
                                                <div className="flex gap-1 mt-2 flex-wrap">
                                                    {content.tags.slice(0, 3).map(tag => (
                                                        <Badge key={tag} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <Badge className={content.is_indexed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {content.is_indexed ? 'Indexiert' : 'Pending'}
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
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.query_stats.total_queries}
                            </div>
                            <div className="text-xs text-gray-600">Abfragen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.query_stats.successful_queries}
                            </div>
                            <div className="text-xs text-gray-600">Erfolgreich</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.query_stats.avg_results_per_query}
                            </div>
                            <div className="text-xs text-gray-600">Ø Ergebnisse</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Query-Typen</h4>
                            {Object.entries(data.query_type_distribution || {}).map(([type, count]) => (
                                <div key={type} className="flex items-center justify-between text-xs">
                                    <Badge variant="outline" className="text-xs">{type}</Badge>
                                    <span className="font-semibold">{count}</span>
                                </div>
                            ))}
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.search_queries.map(query => (
                            <Card key={query.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Search className="w-4 h-4 text-gray-600" />
                                                <span className="font-semibold text-sm">"{query.query_text}"</span>
                                                <Badge className={typeColors[query.query_type]}>
                                                    {query.query_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Index: {query.index_name}
                                                </span>
                                                <span className="text-xs text-purple-600">
                                                    Ergebnisse: {query.results_count}
                                                </span>
                                                <span className="text-xs text-orange-600">
                                                    Zeit: {query.execution_time_ms}ms
                                                </span>
                                            </div>
                                        </div>
                                        <Badge className={query.is_successful ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                            {query.is_successful ? 'OK' : 'Error'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'analytics' && (
                <>
                    <Card><CardContent className="p-4">
                        <h4 className="font-semibold text-sm mb-3">Top-Suchanfragen</h4>
                        <div className="space-y-2">
                            {data.search_queries
                                .reduce((acc, q) => {
                                    const existing = acc.find(item => item.query_text === q.query_text);
                                    if (existing) {
                                        existing.count++;
                                    } else {
                                        acc.push({ query_text: q.query_text, count: 1 });
                                    }
                                    return acc;
                                }, [])
                                .sort((a, b) => b.count - a.count)
                                .slice(0, 10)
                                .map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <span className="text-xs truncate">"{item.query_text}"</span>
                                        <div className="flex items-center gap-2">
                                            <div className="bg-blue-200 rounded-full h-2 w-24">
                                                <div 
                                                    className="h-2 rounded-full bg-blue-600"
                                                    style={{ 
                                                        width: `${Math.min(100, (item.count / 10) * 100)}%` 
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs font-semibold w-6 text-right">{item.count}</span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </Card></CardContent>

                    <Card><CardContent className="p-4">
                        <h4 className="font-semibold text-sm mb-3">Top-Ergebnisse</h4>
                        <div className="space-y-2">
                            {data.search_results.slice(0, 10).map((result, idx) => (
                                <div key={idx} className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <span className="text-xs font-semibold">#{result.rank}</span>
                                        <p className="text-xs text-gray-600 truncate">
                                            Score: {result.relevance_score}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-600">
                                        Klicks: {result.click_count || 0}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card></CardContent>
                </>
            )}
        </div>
    );
}