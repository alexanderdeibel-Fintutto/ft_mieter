import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, TrendingUp, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function KnowledgeBaseManager({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('knowledge_bases');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('knowledgeBaseEngine', {
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

    const categoryColors = {
        documentation: 'bg-blue-100 text-blue-800',
        faq: 'bg-purple-100 text-purple-800',
        troubleshooting: 'bg-orange-100 text-orange-800',
        best_practices: 'bg-green-100 text-green-800',
        api_docs: 'bg-pink-100 text-pink-800',
        draft: 'bg-yellow-100 text-yellow-800',
        review: 'bg-orange-100 text-orange-800',
        published: 'bg-green-100 text-green-800',
        archived: 'bg-gray-100 text-gray-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['knowledge_bases', 'articles', 'categories', 'analytics'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'knowledge_bases' && '📚 Knowledge Bases'}
                        {tab === 'articles' && '📄 Artikel'}
                        {tab === 'categories' && '🏷️ Kategorien'}
                        {tab === 'analytics' && '📊 Analytik'}
                    </button>
                ))}
            </div>

            {activeTab === 'knowledge_bases' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.kb_stats.total_kbs}</div>
                            <div className="text-xs text-gray-600">Knowledge Bases</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.kb_stats.active_kbs}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.kb_stats.total_articles}</div>
                            <div className="text-xs text-gray-600">Artikel</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">
                                {data.kb_stats.total_views}
                            </div>
                            <div className="text-xs text-gray-600">Ansichten</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.kbs.map(kb => (
                            <Card key={kb.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{kb.kb_name}</h5>
                                                <Badge className={categoryColors[kb.category]}>
                                                    {kb.category}
                                                </Badge>
                                            </div>
                                            {kb.description && (
                                                <p className="text-xs text-gray-600 mt-1">{kb.description}</p>
                                            )}
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Artikel: {kb.total_articles}
                                                </span>
                                                <span className="text-xs text-green-600">
                                                    Veröffentlicht: {kb.published_articles}
                                                </span>
                                                <span className="text-xs text-purple-600">
                                                    Ansichten: {kb.total_views}
                                                </span>
                                                {kb.avg_rating > 0 && (
                                                    <span className="text-xs text-yellow-600">
                                                        Rating: {kb.avg_rating.toFixed(1)}⭐
                                                    </span>
                                                )}
                                            </div>
                                            {kb.is_public && (
                                                <Badge variant="outline" className="mt-2 text-xs">
                                                    🌐 Öffentlich
                                                </Badge>
                                            )}
                                        </div>
                                        <Badge className={kb.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {kb.is_active ? 'ON' : 'OFF'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'articles' && (
                <>
                    <div className="grid grid-cols-5 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.article_stats.total_articles}
                            </div>
                            <div className="text-xs text-gray-600">Gesamt-Artikel</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.article_stats.published}
                            </div>
                            <div className="text-xs text-gray-600">Veröffentlicht</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">
                                {data.article_stats.draft}
                            </div>
                            <div className="text-xs text-gray-600">Entwurf</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.article_stats.avg_views}
                            </div>
                            <div className="text-xs text-gray-600">Ø Ansichten</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">
                                {data.article_stats.avg_rating}%
                            </div>
                            <div className="text-xs text-gray-600">Ø Rating</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.articles.map(article => (
                            <Card key={article.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{article.title}</h5>
                                            </div>
                                            {article.summary && (
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                                                    {article.summary}
                                                </p>
                                            )}
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    {article.category}
                                                </span>
                                                <span className="text-xs text-blue-600">
                                                    <Eye className="w-3 h-3 inline mr-1" />
                                                    {article.view_count || 0} Ansichten
                                                </span>
                                                {article.helpful_count > 0 && (
                                                    <span className="text-xs text-green-600">
                                                        👍 {article.helpful_count}
                                                    </span>
                                                )}
                                                {article.not_helpful_count > 0 && (
                                                    <span className="text-xs text-red-600">
                                                        👎 {article.not_helpful_count}
                                                    </span>
                                                )}
                                            </div>
                                            {article.tags && article.tags.length > 0 && (
                                                <div className="flex gap-1 mt-2 flex-wrap">
                                                    {article.tags.slice(0, 3).map(tag => (
                                                        <Badge key={tag} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <Badge className={categoryColors[article.status]}>
                                            {article.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'categories' && (
                <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.categories.length}</div>
                            <div className="text-xs text-gray-600">Kategorien</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.categories.filter(c => c.is_active).length}
                            </div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.categories.map(category => (
                            <Card key={category.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{category.icon}</span>
                                                <h5 className="font-semibold text-sm">{category.category_name}</h5>
                                            </div>
                                            {category.description && (
                                                <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                                            )}
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Slug: {category.slug}
                                                </span>
                                                <span className="text-xs text-purple-600">
                                                    Artikel: {category.article_count}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Reihenfolge: {category.order}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge className={category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {category.is_active ? 'ON' : 'OFF'}
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
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.total_analytics_views}
                            </div>
                            <div className="text-xs text-gray-600">Gesamt-Ansichten</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.total_helpful_votes}
                            </div>
                            <div className="text-xs text-gray-600">Hilfreich-Stimmen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.analytics.length}
                            </div>
                            <div className="text-xs text-gray-600">Analytik-Einträge</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.analytics.slice(0, 20).map(analytic => (
                            <Card key={analytic.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-blue-600" />
                                                <span className="text-xs font-mono">
                                                    {analytic.article_id?.substring(0, 12)}...
                                                </span>
                                                <Badge variant="outline" className="text-xs">
                                                    {analytic.analytics_period}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Ansichten: {analytic.view_count}
                                                </span>
                                                <span className="text-xs text-blue-600">
                                                    Besucher: {analytic.unique_visitors}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Zeit: {analytic.avg_time_on_page_seconds}s
                                                </span>
                                                <span className="text-xs text-orange-600">
                                                    Bounce: {analytic.bounce_rate.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-green-600">
                                                    👍 {analytic.helpful_votes}
                                                </span>
                                                <span className="text-xs text-red-600">
                                                    👎 {analytic.not_helpful_votes}
                                                </span>
                                                {analytic.helpful_rate > 0 && (
                                                    <span className="text-xs text-purple-600">
                                                        Hilfreich: {analytic.helpful_rate.toFixed(1)}%
                                                    </span>
                                                )}
                                                {analytic.avg_rating > 0 && (
                                                    <span className="text-xs text-yellow-600">
                                                        Rating: {analytic.avg_rating.toFixed(1)}⭐
                                                    </span>
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
        </div>
    );
}