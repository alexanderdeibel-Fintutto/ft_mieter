import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 91: Advanced Geo-Distribution & Regional Deployment System
 * Verwaltet Regionen, Endpoints und Versionsmigrationen
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

        if (action === 'create_region') {
            const { region_name, region_code, continent, country, latitude, longitude, region_type, is_primary } = await req.json();

            if (!region_name || !region_code) {
                return Response.json({ error: 'region_name, region_code required' }, { status: 400 });
            }

            const region_id = crypto.randomUUID();

            const region = await base44.asServiceRole.entities.GeoRegion.create({
                organization_id,
                region_id,
                region_name,
                region_code,
                continent: continent || '',
                country: country || '',
                latitude: latitude || 0,
                longitude: longitude || 0,
                region_type: region_type || 'secondary',
                status: 'active',
                is_primary: is_primary || false,
                created_at: new Date().toISOString()
            });

            return Response.json({ region_created: true, region_id: region.id });

        } else if (action === 'create_endpoint') {
            const { region_id, endpoint_url, service_name, endpoint_type, api_version, supported_protocols } = await req.json();

            if (!region_id || !endpoint_url || !service_name) {
                return Response.json({ error: 'region_id, endpoint_url, service_name required' }, { status: 400 });
            }

            const endpoint_id = crypto.randomUUID();

            const endpoint = await base44.asServiceRole.entities.RegionEndpoint.create({
                organization_id,
                endpoint_id,
                region_id,
                endpoint_url,
                service_name,
                endpoint_type: endpoint_type || 'api',
                api_version: api_version || '1.0',
                status: 'active',
                supported_protocols: supported_protocols || [],
                created_at: new Date().toISOString()
            });

            return Response.json({ endpoint_created: true, endpoint_id: endpoint.id });

        } else if (action === 'update_region_status') {
            const { region_id, status, latency_ms, uptime_percentage, error_rate } = await req.json();

            if (!region_id || !status) {
                return Response.json({ error: 'region_id, status required' }, { status: 400 });
            }

            const updateData = { status };

            if (latency_ms !== undefined) updateData.latency_ms = latency_ms;
            if (uptime_percentage !== undefined) updateData.uptime_percentage = uptime_percentage;
            if (error_rate !== undefined) updateData.error_rate = error_rate;

            await base44.asServiceRole.entities.GeoRegion.update(region_id, updateData);

            return Response.json({ region_updated: true });

        } else if (action === 'health_check_endpoint') {
            const { endpoint_id, response_time_ms, availability_percentage, error_count } = await req.json();

            if (!endpoint_id) {
                return Response.json({ error: 'endpoint_id required' }, { status: 400 });
            }

            const endpoints = await base44.asServiceRole.entities.RegionEndpoint.filter({
                organization_id,
                id: endpoint_id
            });

            if (endpoints.length === 0) {
                return Response.json({ error: 'Endpoint not found' }, { status: 404 });
            }

            const endpoint = endpoints[0];
            const requestCount = (endpoint.request_count || 0) + 1;
            const newErrorCount = (endpoint.error_count || 0) + (error_count || 0);

            const updateData = {
                response_time_ms: response_time_ms || 0,
                availability_percentage: availability_percentage || 100,
                error_count: newErrorCount,
                request_count: requestCount,
                last_health_check: new Date().toISOString()
            };

            if (availability_percentage < 100) {
                updateData.status = 'degraded';
            } else if (endpoint.status === 'degraded') {
                updateData.status = 'active';
            }

            await base44.asServiceRole.entities.RegionEndpoint.update(endpoint_id, updateData);

            return Response.json({ health_check_recorded: true });

        } else if (action === 'create_migration') {
            const { migration_name, source_version, target_version, migration_type, entity_type, regions_affected, rollback_plan } = await req.json();

            if (!migration_name || !source_version || !target_version || !migration_type) {
                return Response.json({ error: 'migration_name, source_version, target_version, migration_type required' }, { status: 400 });
            }

            const migration_id = crypto.randomUUID();

            const migration = await base44.asServiceRole.entities.VersionMigration.create({
                organization_id,
                migration_id,
                migration_name,
                source_version,
                target_version,
                migration_type,
                entity_type: entity_type || '',
                status: 'draft',
                regions_affected: regions_affected || [],
                rollback_plan: rollback_plan || '',
                created_at: new Date().toISOString()
            });

            return Response.json({ migration_created: true, migration_id: migration.id });

        } else if (action === 'start_migration') {
            const { migration_id, total_records } = await req.json();

            if (!migration_id) {
                return Response.json({ error: 'migration_id required' }, { status: 400 });
            }

            const now = new Date().toISOString();

            await base44.asServiceRole.entities.VersionMigration.update(migration_id, {
                status: 'in_progress',
                started_at: now,
                total_records: total_records || 0,
                progress_percentage: 0
            });

            return Response.json({ migration_started: true });

        } else if (action === 'update_migration_progress') {
            const { migration_id, migrated_records, failed_records } = await req.json();

            if (!migration_id) {
                return Response.json({ error: 'migration_id required' }, { status: 400 });
            }

            const migrations = await base44.asServiceRole.entities.VersionMigration.filter({
                organization_id,
                id: migration_id
            });

            if (migrations.length === 0) {
                return Response.json({ error: 'Migration not found' }, { status: 404 });
            }

            const migration = migrations[0];
            const totalDone = (migrated_records || 0) + (failed_records || 0);
            const progressPercent = migration.total_records > 0 
                ? Math.round((totalDone / migration.total_records) * 100)
                : 0;

            const updateData = {
                migrated_records: migrated_records || migration.migrated_records || 0,
                failed_records: failed_records || migration.failed_records || 0,
                progress_percentage: progressPercent
            };

            if (progressPercent === 100) {
                updateData.status = 'completed';
                updateData.completed_at = new Date().toISOString();
            }

            await base44.asServiceRole.entities.VersionMigration.update(migration_id, updateData);

            return Response.json({ progress_updated: true, progress_percentage: progressPercent });

        } else if (action === 'get_dashboard_data') {
            const [regions, endpoints, migrations] = await Promise.all([
                base44.asServiceRole.entities.GeoRegion.filter({ organization_id }, '-created_at', 50),
                base44.asServiceRole.entities.RegionEndpoint.filter({ organization_id }, '-created_at', 100),
                base44.asServiceRole.entities.VersionMigration.filter({ organization_id }, '-created_at', 30)
            ]);

            const regionStats = {
                total_regions: regions.length,
                active_regions: regions.filter(r => r.status === 'active').length,
                degraded_regions: regions.filter(r => r.status === 'degraded').length,
                offline_regions: regions.filter(r => r.status === 'offline').length,
                primary_regions: regions.filter(r => r.is_primary).length,
                avg_latency_ms: regions.length > 0
                    ? Math.round(regions.reduce((sum, r) => sum + (r.latency_ms || 0), 0) / regions.length)
                    : 0,
                avg_uptime: regions.length > 0
                    ? (regions.reduce((sum, r) => sum + (r.uptime_percentage || 0), 0) / regions.length).toFixed(2)
                    : 100
            };

            const endpointStats = {
                total_endpoints: endpoints.length,
                active_endpoints: endpoints.filter(e => e.status === 'active').length,
                standby_endpoints: endpoints.filter(e => e.status === 'standby').length,
                deprecated_endpoints: endpoints.filter(e => e.status === 'deprecated').length,
                offline_endpoints: endpoints.filter(e => e.status === 'offline').length,
                by_type: {},
                total_requests: endpoints.reduce((sum, e) => sum + (e.request_count || 0), 0),
                total_errors: endpoints.reduce((sum, e) => sum + (e.error_count || 0), 0)
            };

            endpoints.forEach(e => {
                endpointStats.by_type[e.endpoint_type] = (endpointStats.by_type[e.endpoint_type] || 0) + 1;
            });

            const migrationStats = {
                total_migrations: migrations.length,
                draft_migrations: migrations.filter(m => m.status === 'draft').length,
                scheduled_migrations: migrations.filter(m => m.status === 'scheduled').length,
                in_progress_migrations: migrations.filter(m => m.status === 'in_progress').length,
                completed_migrations: migrations.filter(m => m.status === 'completed').length,
                failed_migrations: migrations.filter(m => m.status === 'failed').length,
                by_type: {}
            };

            migrations.forEach(m => {
                migrationStats.by_type[m.migration_type] = (migrationStats.by_type[m.migration_type] || 0) + 1;
            });

            return Response.json({
                regions: regions.slice(0, 30),
                endpoints: endpoints.slice(0, 50),
                migrations: migrations.slice(0, 20),
                region_stats: regionStats,
                endpoint_stats: endpointStats,
                migration_stats: migrationStats
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Geo distribution engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});