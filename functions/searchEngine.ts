import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 77: Advanced Search & Indexing System
 * Verwaltet Suchindizes, indexierte Inhalte und Suchabfragen
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

        if (action === 'create_index') {
            const { index_name, index_type, source_entity, fields_indexed } = await req.json();

            if (!index_name || !index_type || !source_entity) {
                return Response.json({ error: 'index_name, index_type, source_entity required' }, { status: 400 });
            }

            const index = await base44.asServiceRole.entities.SearchIndex.create({
                organization_id,
                index_name,
                index_type,
                source_entity,
                fields_indexed: fields_indexed || [],
                last_indexed_at: new Date().toISOString()
            });

            return Response.json({ index_created: true, index_id: index.id });

        } else if (action === 'index_content') {
            const { index_id, content_id, content_type, title, body, metadata, tags } = await req.json();

            if (!index_id || !content_id || !content_type || !title || !body) {
                return Response.json({ error: 'index_id, content_id, content_type, title, body required' }, { status: 400 });
            }

            const indexes = await base44.asServiceRole.entities.SearchIndex.filter({
                organization_id,
                id: index_id
            });

            if (indexes.length === 0) {
                return Response.json({ error: 'Index not found' }, { status: 404 });
            }

            const idx = indexes[0];
            const now = new Date().toISOString();

            const content = await base44.asServiceRole.entities.IndexedContent.create({
                organization_id,
                index_id,
                content_id,
                content_type,
                title,
                body,
                metadata: metadata || {},
                tags: tags || [],
                indexed_at: now,
                last_updated_at: now
            });

            // Update index stats
            await base44.asServiceRole.entities.SearchIndex.update(index_id, {
                indexed_documents: (idx.indexed_documents || 0) + 1,
                last_indexed_at: now
            });

            return Response.json({ content_indexed: true, content_index_id: content.id });

        } else if (action === 'search') {
            const { index_name, query_text, query_type, filters, sort_by, limit } = await req.json();

            if (!index_name || !query_text) {
                return Response.json({ error: 'index_name, query_text required' }, { status: 400 });
            }

            const query_id = crypto.randomUUID();
            const start_time = Date.now();

            // Find the index
            const indexes = await base44.asServiceRole.entities.SearchIndex.filter({
                organization_id,
                index_name
            });

            if (indexes.length === 0) {
                return Response.json({ error: 'Index not found' }, { status: 404 });
            }

            const idx = indexes[0];

            // Search in indexed content
            const allContent = await base44.asServiceRole.entities.IndexedContent.filter({
                organization_id,
                index_id: idx.id
            }, '-indexed_at', 1000);

            // Simple full-text search implementation
            const query_lower = query_text.toLowerCase();
            const matches = allContent.filter(content => {
                const titleMatch = content.title.toLowerCase().includes(query_lower);
                const bodyMatch = content.body.toLowerCase().includes(query_lower);
                return titleMatch || bodyMatch;
            });

            // Apply filters if provided
            let filtered = matches;
            if (filters && Object.keys(filters).length > 0) {
                filtered = matches.filter(content => {
                    for (const [key, value] of Object.entries(filters)) {
                        if (content.metadata && content.metadata[key] !== value) {
                            return false;
                        }
                    }
                    return true;
                });
            }

            // Calculate relevance scores and sort
            const results = filtered.map((content, index) => {
                const titleMatch = content.title.toLowerCase().includes(query_lower) ? 50 : 0;
                const bodyMatch = content.body.toLowerCase().includes(query_lower) ? 25 : 0;
                const relevance = Math.min(100, titleMatch + bodyMatch + content.view_count);

                return {
                    content,
                    relevance_score: relevance,
                    rank: index + 1
                };
            });

            // Sort by relevance or specified sort
            results.sort((a, b) => {
                if (sort_by === 'date') {
                    return new Date(b.content.last_updated_at) - new Date(a.content.last_updated_at);
                } else if (sort_by === 'popularity') {
                    return b.content.view_count - a.content.view_count;
                } else if (sort_by === 'title') {
                    return a.content.title.localeCompare(b.content.title);
                }
                return b.relevance_score - a.relevance_score;
            });

            const execution_time_ms = Date.now() - start_time;

            // Create search query record
            const query = await base44.asServiceRole.entities.SearchQuery.create({
                organization_id,
                query_id,
                query_text,
                query_type: query_type || 'simple',
                filters: filters || {},
                sort_by: sort_by || 'relevance',
                index_name,
                results_count: results.length,
                execution_time_ms,
                user_id: user.id,
                executed_at: new Date().toISOString(),
                is_successful: true
            });

            // Create search result records
            const limited_results = results.slice(0, limit || 20);
            for (const result of limited_results) {
                await base44.asServiceRole.entities.SearchResult.create({
                    organization_id,
                    query_id: query.id,
                    indexed_content_id: result.content.id,
                    rank: result.rank,
                    relevance_score: Math.round(result.relevance_score),
                    snippet: result.content.body.substring(0, 150) + '...',
                    matched_fields: result.content.title.toLowerCase().includes(query_lower) ? ['title'] : ['body'],
                    created_at: new Date().toISOString()
                });
            }

            // Update index stats
            await base44.asServiceRole.entities.SearchIndex.update(idx.id, {
                query_count: (idx.query_count || 0) + 1,
                avg_query_time_ms: execution_time_ms
            });

            return Response.json({
                query_id: query.id,
                results: limited_results.map(r => ({
                    id: r.content.id,
                    title: r.content.title,
                    body: r.content.body,
                    relevance_score: r.relevance_score,
                    rank: r.rank,
                    type: r.content.content_type
                })),
                total_results: results.length,
                execution_time_ms
            });

        } else if (action === 'get_dashboard_data') {
            const [indexes, contents, queries, results] = await Promise.all([
                base44.asServiceRole.entities.SearchIndex.filter({ organization_id }, '-created_date'),
                base44.asServiceRole.entities.IndexedContent.filter({ organization_id }, '-indexed_at', 50),
                base44.asServiceRole.entities.SearchQuery.filter({ organization_id }, '-executed_at', 50),
                base44.asServiceRole.entities.SearchResult.filter({ organization_id }, '-created_at', 100)
            ]);

            const indexStats = {
                total_indexes: indexes.length,
                active_indexes: indexes.filter(i => i.is_active).length,
                total_documents_indexed: indexes.reduce((sum, i) => sum + (i.indexed_documents || 0), 0),
                total_queries: indexes.reduce((sum, i) => sum + (i.query_count || 0), 0),
                avg_query_time: indexes.length > 0
                    ? Math.round(indexes.reduce((sum, i) => sum + (i.avg_query_time_ms || 0), 0) / indexes.length)
                    : 0
            };

            const contentStats = {
                total_indexed_content: contents.length,
                avg_relevance_score: contents.length > 0
                    ? Math.round(contents.reduce((sum, c) => sum + (c.relevance_score || 0), 0) / contents.length)
                    : 0,
                total_views: contents.reduce((sum, c) => sum + (c.view_count || 0), 0)
            };

            const queryStats = {
                total_queries: queries.length,
                successful_queries: queries.filter(q => q.is_successful).length,
                avg_results_per_query: queries.length > 0
                    ? Math.round(queries.reduce((sum, q) => sum + (q.results_count || 0), 0) / queries.length)
                    : 0
            };

            const queryTypeDistribution = {};
            queries.forEach(q => {
                queryTypeDistribution[q.query_type] = (queryTypeDistribution[q.query_type] || 0) + 1;
            });

            return Response.json({
                indexes: indexes.slice(0, 20),
                indexed_contents: contents,
                search_queries: queries,
                search_results: results,
                index_stats: indexStats,
                content_stats: contentStats,
                query_stats: queryStats,
                query_type_distribution: queryTypeDistribution
            });

        } else if (action === 'get_search_analytics') {
            const { index_name } = await req.json();

            let filter = { organization_id };
            if (index_name) {
                const indexes = await base44.asServiceRole.entities.SearchIndex.filter({
                    organization_id,
                    index_name
                });
                if (indexes.length > 0) {
                    filter = { organization_id, query_text: { $exists: true } };
                }
            }

            const queries = await base44.asServiceRole.entities.SearchQuery.filter(
                { organization_id, index_name },
                '-executed_at',
                100
            );

            const topQueries = queries
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
                .slice(0, 20);

            const topResults = await base44.asServiceRole.entities.SearchResult.filter(
                { organization_id },
                '-click_count',
                20
            );

            return Response.json({
                top_queries: topQueries,
                top_results: topResults,
                total_searches: queries.length,
                avg_results_per_search: queries.length > 0
                    ? Math.round(queries.reduce((sum, q) => sum + (q.results_count || 0), 0) / queries.length)
                    : 0
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Search engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});