import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 49: Advanced GraphQL API & Schema Management System
 * Verwaltet GraphQL Schemas, Resolver und Query-Analytics
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

        if (action === 'create_schema') {
            const { schema_name, version, type_definitions, schema_category } = await req.json();

            if (!schema_name || !version || !type_definitions) {
                return Response.json({ error: 'schema_name, version, type_definitions required' }, { status: 400 });
            }

            const schema = await base44.asServiceRole.entities.GraphQLSchema.create({
                organization_id,
                schema_name,
                version,
                type_definitions,
                schema_category: schema_category || 'type'
            });

            return Response.json({ schema_created: true, schema_id: schema.id });

        } else if (action === 'get_schemas') {
            const schemas = await base44.asServiceRole.entities.GraphQLSchema.filter({
                organization_id
            }, '-created_date', 200);

            return Response.json({ schemas });

        } else if (action === 'publish_schema') {
            const { schema_id } = await req.json();

            if (!schema_id) {
                return Response.json({ error: 'schema_id required' }, { status: 400 });
            }

            await base44.asServiceRole.entities.GraphQLSchema.update(schema_id, {
                is_published: true
            });

            return Response.json({ schema_published: true });

        } else if (action === 'deprecate_schema') {
            const { schema_id, reason } = await req.json();

            if (!schema_id) {
                return Response.json({ error: 'schema_id required' }, { status: 400 });
            }

            await base44.asServiceRole.entities.GraphQLSchema.update(schema_id, {
                is_deprecated: true,
                deprecation_reason: reason || 'No longer maintained'
            });

            return Response.json({ schema_deprecated: true });

        } else if (action === 'create_resolver') {
            const { resolver_name, field_name, parent_type, data_source } = await req.json();

            if (!resolver_name || !field_name || !parent_type) {
                return Response.json({ error: 'resolver_name, field_name, parent_type required' }, { status: 400 });
            }

            const resolver = await base44.asServiceRole.entities.GraphQLResolver.create({
                organization_id,
                resolver_name,
                field_name,
                parent_type,
                data_source: data_source || 'database'
            });

            return Response.json({ resolver_created: true, resolver_id: resolver.id });

        } else if (action === 'get_resolvers') {
            const resolvers = await base44.asServiceRole.entities.GraphQLResolver.filter({
                organization_id
            }, '-created_date', 200);

            return Response.json({ resolvers });

        } else if (action === 'update_resolver_stats') {
            const { resolver_id, execution_time_ms } = await req.json();

            if (!resolver_id) {
                return Response.json({ error: 'resolver_id required' }, { status: 400 });
            }

            const resolvers = await base44.asServiceRole.entities.GraphQLResolver.filter({
                organization_id,
                id: resolver_id
            });

            if (!resolvers || resolvers.length === 0) {
                return Response.json({ error: 'Resolver not found' }, { status: 404 });
            }

            const resolver = resolvers[0];
            const newCount = (resolver.execution_count || 0) + 1;
            const currentAvg = resolver.avg_execution_time_ms || 0;
            const newAvg = Math.round((currentAvg * (newCount - 1) + execution_time_ms) / newCount);

            await base44.asServiceRole.entities.GraphQLResolver.update(resolver_id, {
                execution_count: newCount,
                avg_execution_time_ms: newAvg
            });

            return Response.json({ stats_updated: true });

        } else if (action === 'log_query') {
            const { query_string, operation_type, execution_time_ms, status } = await req.json();

            if (!query_string || !operation_type) {
                return Response.json({ error: 'query_string, operation_type required' }, { status: 400 });
            }

            // Generate query hash
            const encoder = new TextEncoder();
            const data = encoder.encode(query_string);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const queryHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);

            const queryLog = await base44.asServiceRole.entities.GraphQLQuery.create({
                organization_id,
                query_hash: queryHash,
                query_string,
                operation_type,
                execution_time_ms: execution_time_ms || 0,
                status: status || 'success',
                user_id: user.id,
                timestamp: new Date().toISOString()
            });

            return Response.json({ query_logged: true, log_id: queryLog.id });

        } else if (action === 'get_query_analytics') {
            const queries = await base44.asServiceRole.entities.GraphQLQuery.filter({
                organization_id
            }, '-timestamp', 500);

            const queryByType = {};
            const queryByStatus = {};
            let totalExecutionTime = 0;

            queries.forEach(q => {
                queryByType[q.operation_type] = (queryByType[q.operation_type] || 0) + 1;
                queryByStatus[q.status] = (queryByStatus[q.status] || 0) + 1;
                totalExecutionTime += q.execution_time_ms || 0;
            });

            const avgExecutionTime = queries.length > 0 ? Math.round(totalExecutionTime / queries.length) : 0;

            return Response.json({
                total_queries: queries.length,
                queries_by_type: queryByType,
                queries_by_status: queryByStatus,
                avg_execution_time_ms: avgExecutionTime,
                recent_queries: queries.slice(0, 20)
            });

        } else if (action === 'get_dashboard_data') {
            const [schemas, resolvers, queries] = await Promise.all([
                base44.asServiceRole.entities.GraphQLSchema.filter({ organization_id }),
                base44.asServiceRole.entities.GraphQLResolver.filter({ organization_id }),
                base44.asServiceRole.entities.GraphQLQuery.filter({ organization_id }, '-timestamp', 200)
            ]);

            const schemaByCategory = {};
            const resolverByType = {};
            
            schemas.forEach(s => {
                schemaByCategory[s.schema_category] = (schemaByCategory[s.schema_category] || 0) + 1;
            });

            resolvers.forEach(r => {
                resolverByType[r.parent_type] = (resolverByType[r.parent_type] || 0) + 1;
            });

            const stats = {
                total_schemas: schemas.length,
                published_schemas: schemas.filter(s => s.is_published).length,
                deprecated_schemas: schemas.filter(s => s.is_deprecated).length,
                total_resolvers: resolvers.length,
                active_resolvers: resolvers.filter(r => r.is_active).length,
                total_queries: queries.length,
                successful_queries: queries.filter(q => q.status === 'success').length,
                failed_queries: queries.filter(q => q.status === 'error').length
            };

            return Response.json({
                schemas,
                resolvers,
                recent_queries: queries.slice(0, 50),
                stats,
                schemas_by_category: schemaByCategory,
                resolvers_by_type: resolverByType
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('GraphQL engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});