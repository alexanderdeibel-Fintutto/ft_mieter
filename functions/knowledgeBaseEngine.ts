import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 78: Advanced Knowledge Base Management System
 * Verwaltet Knowledge Bases, Artikel und Analytiken
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, organization_id } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'create_knowledge_base') {
            const { kb_name, description, category, is_public } = await req.json();

            if (!kb_name || !category) {
                return Response.json({ error: 'kb_name, category required' }, { status: 400 });
            }

            const kb = await base44.asServiceRole.entities.KnowledgeBase.create({
                organization_id,
                kb_name,
                description: description || '',
                category,
                is_public: is_public || false,
                last_updated_at: new Date().toISOString()
            });

            return Response.json({ kb_created: true, kb_id: kb.id });

        } else if (action === 'create_category') {
            const { category_name, slug, description, icon, parent_category_id, order } = await req.json();

            if (!category_name || !slug) {
                return Response.json({ error: 'category_name, slug required' }, { status: 400 });
            }

            const category = await base44.asServiceRole.entities.ArticleCategory.create({
                organization_id,
                category_name,
                slug,
                description: description || '',
                icon: icon || '📁',
                parent_category_id: parent_category_id || '',
                order: order || 0,
                created_at: new Date().toISOString()
            });

            return Response.json({ category_created: true, category_id: category.id });

        } else if (action === 'create_article') {
            const { kb_id, title, slug, content, summary, category, tags, related_articles } = await req.json();

            if (!kb_id || !title || !slug || !content) {
                return Response.json({ error: 'kb_id, title, slug, content required' }, { status: 400 });
            }

            const article = await base44.asServiceRole.entities.Article.create({
                organization_id,
                kb_id,
                title,
                slug,
                content,
                summary: summary || '',
                status: 'draft',
                author_id: user.id,
                category: category || 'general',
                tags: tags || [],
                related_articles: related_articles || [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            // Update KB stats
            const kbs = await base44.asServiceRole.entities.KnowledgeBase.filter({
                organization_id,
                id: kb_id
            });

            if (kbs.length > 0) {
                const kb = kbs[0];
                await base44.asServiceRole.entities.KnowledgeBase.update(kb_id, {
                    total_articles: (kb.total_articles || 0) + 1
                });
            }

            return Response.json({ article_created: true, article_id: article.id });

        } else if (action === 'publish_article') {
            const { article_id } = await req.json();

            if (!article_id) {
                return Response.json({ error: 'article_id required' }, { status: 400 });
            }

            const articles = await base44.asServiceRole.entities.Article.filter({
                organization_id,
                id: article_id
            });

            if (articles.length === 0) {
                return Response.json({ error: 'Article not found' }, { status: 404 });
            }

            const article = articles[0];
            const now = new Date().toISOString();

            await base44.asServiceRole.entities.Article.update(article_id, {
                status: 'published',
                reviewer_id: user.id,
                published_at: now,
                updated_at: now
            });

            // Update KB published count
            const kbs = await base44.asServiceRole.entities.KnowledgeBase.filter({
                organization_id,
                id: article.kb_id
            });

            if (kbs.length > 0) {
                const kb = kbs[0];
                await base44.asServiceRole.entities.KnowledgeBase.update(kb.id, {
                    published_articles: (kb.published_articles || 0) + 1,
                    last_updated_at: now
                });
            }

            return Response.json({ article_published: true });

        } else if (action === 'record_view') {
            const { article_id } = await req.json();

            if (!article_id) {
                return Response.json({ error: 'article_id required' }, { status: 400 });
            }

            const articles = await base44.asServiceRole.entities.Article.filter({
                organization_id,
                id: article_id
            });

            if (articles.length === 0) {
                return Response.json({ error: 'Article not found' }, { status: 404 });
            }

            const article = articles[0];

            await base44.asServiceRole.entities.Article.update(article_id, {
                view_count: (article.view_count || 0) + 1
            });

            // Update KB total views
            const kbs = await base44.asServiceRole.entities.KnowledgeBase.filter({
                organization_id,
                id: article.kb_id
            });

            if (kbs.length > 0) {
                const kb = kbs[0];
                await base44.asServiceRole.entities.KnowledgeBase.update(kb.id, {
                    total_views: (kb.total_views || 0) + 1
                });
            }

            return Response.json({ view_recorded: true });

        } else if (action === 'rate_article') {
            const { article_id, helpful } = await req.json();

            if (!article_id || helpful === undefined) {
                return Response.json({ error: 'article_id, helpful required' }, { status: 400 });
            }

            const articles = await base44.asServiceRole.entities.Article.filter({
                organization_id,
                id: article_id
            });

            if (articles.length === 0) {
                return Response.json({ error: 'Article not found' }, { status: 404 });
            }

            const article = articles[0];
            const helpfulCount = (article.helpful_count || 0) + (helpful ? 1 : 0);
            const notHelpfulCount = (article.not_helpful_count || 0) + (!helpful ? 1 : 0);
            const totalRatings = helpfulCount + notHelpfulCount;
            const helpfulRate = totalRatings > 0 ? (helpfulCount / totalRatings) * 100 : 0;

            await base44.asServiceRole.entities.Article.update(article_id, {
                helpful_count: helpfulCount,
                not_helpful_count: notHelpfulCount,
                avg_rating: Math.round(helpfulRate)
            });

            return Response.json({ article_rated: true, helpful_rate: helpfulRate });

        } else if (action === 'get_dashboard_data') {
            const [kbs, articles, categories, analytics] = await Promise.all([
                base44.asServiceRole.entities.KnowledgeBase.filter({ organization_id }, '-created_date'),
                base44.asServiceRole.entities.Article.filter({ organization_id }, '-view_count', 50),
                base44.asServiceRole.entities.ArticleCategory.filter({ organization_id }, 'order'),
                base44.asServiceRole.entities.ArticleAnalytics.filter({ organization_id }, '-period_start', 100)
            ]);

            const kbStats = {
                total_kbs: kbs.length,
                active_kbs: kbs.filter(k => k.is_active).length,
                public_kbs: kbs.filter(k => k.is_public).length,
                total_articles: kbs.reduce((sum, k) => sum + (k.total_articles || 0), 0),
                published_articles: kbs.reduce((sum, k) => sum + (k.published_articles || 0), 0),
                total_views: kbs.reduce((sum, k) => sum + (k.total_views || 0), 0)
            };

            const articleStats = {
                total_articles: articles.length,
                published: articles.filter(a => a.status === 'published').length,
                draft: articles.filter(a => a.status === 'draft').length,
                avg_views: articles.length > 0
                    ? Math.round(articles.reduce((sum, a) => sum + (a.view_count || 0), 0) / articles.length)
                    : 0,
                avg_rating: articles.length > 0
                    ? Math.round(articles.reduce((sum, a) => sum + (a.avg_rating || 0), 0) / articles.length)
                    : 0,
                most_viewed: articles[0]?.title || 'N/A'
            };

            const totalViews = analytics.reduce((sum, a) => sum + (a.view_count || 0), 0);
            const totalHelpful = analytics.reduce((sum, a) => sum + (a.helpful_votes || 0), 0);

            return Response.json({
                kbs: kbs.slice(0, 20),
                articles: articles.slice(0, 30),
                categories,
                analytics: analytics.slice(0, 30),
                kb_stats: kbStats,
                article_stats: articleStats,
                total_analytics_views: totalViews,
                total_helpful_votes: totalHelpful
            });

        } else if (action === 'get_article_analytics') {
            const { article_id } = await req.json();

            if (!article_id) {
                return Response.json({ error: 'article_id required' }, { status: 400 });
            }

            const analytics = await base44.asServiceRole.entities.ArticleAnalytics.filter({
                organization_id,
                article_id
            }, '-period_start');

            return Response.json({ analytics });

        } else if (action === 'get_articles_by_kb') {
            const { kb_id, status } = await req.json();

            if (!kb_id) {
                return Response.json({ error: 'kb_id required' }, { status: 400 });
            }

            let filter = { organization_id, kb_id };
            if (status) filter.status = status;

            const articles = await base44.asServiceRole.entities.Article.filter(
                filter,
                '-view_count',
                100
            );

            return Response.json({ articles });

        } else if (action === 'get_popular_articles') {
            const limit = await req.json().then(d => d.limit).catch(() => 20);

            const articles = await base44.asServiceRole.entities.Article.filter(
                { organization_id, status: 'published' },
                '-view_count',
                limit
            );

            return Response.json({ articles });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Knowledge base engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});