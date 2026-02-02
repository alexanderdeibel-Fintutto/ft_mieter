import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 92: Advanced API Versioning & Deprecation Management System
 * Verwaltet API-Versionen und Deprecation-Zeitpläne
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

        if (action === 'create_api_version') {
            const { api_name, version_number, base_url, documentation_url } = await req.json();

            if (!api_name || !version_number) {
                return Response.json({ error: 'api_name, version_number required' }, { status: 400 });
            }

            const version_id = crypto.randomUUID();

            const version = await base44.asServiceRole.entities.APIVersion.create({
                organization_id,
                version_id,
                api_name,
                version_number,
                status: 'draft',
                base_url: base_url || '',
                documentation_url: documentation_url || '',
                created_at: new Date().toISOString()
            });

            return Response.json({ version_created: true, version_id: version.id });

        } else if (action === 'release_api_version') {
            const { version_id, changelog, breaking_changes, new_features, is_default } = await req.json();

            if (!version_id) {
                return Response.json({ error: 'version_id required' }, { status: 400 });
            }

            const now = new Date().toISOString();

            const updateData = {
                status: 'stable',
                release_date: now,
                changelog: changelog || '',
                breaking_changes: breaking_changes || [],
                new_features: new_features || []
            };

            if (is_default) {
                const versions = await base44.asServiceRole.entities.APIVersion.filter({
                    organization_id,
                    is_default: true
                });

                for (const v of versions) {
                    await base44.asServiceRole.entities.APIVersion.update(v.id, { is_default: false });
                }

                updateData.is_default = true;
            }

            await base44.asServiceRole.entities.APIVersion.update(version_id, updateData);

            return Response.json({ version_released: true });

        } else if (action === 'create_deprecation') {
            const { item_name, item_type, current_version, replacement_name, replacement_version, sunset_date } = await req.json();

            if (!item_name || !item_type) {
                return Response.json({ error: 'item_name, item_type required' }, { status: 400 });
            }

            const schedule_id = crypto.randomUUID();

            const schedule = await base44.asServiceRole.entities.DeprecationSchedule.create({
                organization_id,
                schedule_id,
                item_name,
                item_type,
                current_version: current_version || '',
                deprecation_stage: 'planning',
                deprecation_start_date: new Date().toISOString(),
                sunset_date: sunset_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                replacement_name: replacement_name || '',
                replacement_version: replacement_version || '',
                created_at: new Date().toISOString()
            });

            return Response.json({ deprecation_created: true, schedule_id: schedule.id });

        } else if (action === 'announce_deprecation') {
            const { schedule_id, migration_guide_url } = await req.json();

            if (!schedule_id) {
                return Response.json({ error: 'schedule_id required' }, { status: 400 });
            }

            const updateData = {
                deprecation_stage: 'announced',
                communication_sent: true
            };

            if (migration_guide_url) {
                updateData.migration_guide_url = migration_guide_url;
            }

            await base44.asServiceRole.entities.DeprecationSchedule.update(schedule_id, updateData);

            return Response.json({ deprecation_announced: true });

        } else if (action === 'update_migration_progress') {
            const { schedule_id, migrated_users_count } = await req.json();

            if (!schedule_id) {
                return Response.json({ error: 'schedule_id required' }, { status: 400 });
            }

            const schedules = await base44.asServiceRole.entities.DeprecationSchedule.filter({
                organization_id,
                id: schedule_id
            });

            if (schedules.length === 0) {
                return Response.json({ error: 'Schedule not found' }, { status: 404 });
            }

            const schedule = schedules[0];
            const migratedCount = migrated_users_count || 0;
            const affectedCount = schedule.affected_users_count || 1;
            const migrationPercent = ((migratedCount / affectedCount) * 100).toFixed(2);

            const updateData = {
                migrated_users_count: migratedCount,
                migration_percentage: parseFloat(migrationPercent)
            };

            if (parseFloat(migrationPercent) >= 100) {
                updateData.deprecation_stage = 'enforcement';
            }

            await base44.asServiceRole.entities.DeprecationSchedule.update(schedule_id, updateData);

            return Response.json({ progress_updated: true, migration_percentage: migrationPercent });

        } else if (action === 'retire_api_version') {
            const { version_id } = await req.json();

            if (!version_id) {
                return Response.json({ error: 'version_id required' }, { status: 400 });
            }

            const now = new Date().toISOString();

            await base44.asServiceRole.entities.APIVersion.update(version_id, {
                status: 'retired',
                retirement_date: now
            });

            return Response.json({ version_retired: true });

        } else if (action === 'record_api_usage') {
            const { version_id, request_count, error_count, active_users } = await req.json();

            if (!version_id) {
                return Response.json({ error: 'version_id required' }, { status: 400 });
            }

            const versions = await base44.asServiceRole.entities.APIVersion.filter({
                organization_id,
                id: version_id
            });

            if (versions.length === 0) {
                return Response.json({ error: 'Version not found' }, { status: 404 });
            }

            const version = versions[0];
            const totalRequests = (version.request_count || 0) + (request_count || 0);
            const totalErrors = (version.error_count || 0) + (error_count || 0);
            const errorRate = totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : 0;

            const updateData = {
                request_count: totalRequests,
                error_count: totalErrors,
                error_rate: parseFloat(errorRate),
                active_users: active_users !== undefined ? active_users : version.active_users
            };

            await base44.asServiceRole.entities.APIVersion.update(version_id, updateData);

            return Response.json({ usage_recorded: true });

        } else if (action === 'get_dashboard_data') {
            const [versions, schedules] = await Promise.all([
                base44.asServiceRole.entities.APIVersion.filter({ organization_id }, '-release_date', 50),
                base44.asServiceRole.entities.DeprecationSchedule.filter({ organization_id }, '-deprecation_start_date', 30)
            ]);

            const versionStats = {
                total_versions: versions.length,
                draft_versions: versions.filter(v => v.status === 'draft').length,
                beta_versions: versions.filter(v => v.status === 'beta').length,
                stable_versions: versions.filter(v => v.status === 'stable').length,
                deprecated_versions: versions.filter(v => v.status === 'deprecated').length,
                retired_versions: versions.filter(v => v.status === 'retired').length,
                total_requests: versions.reduce((sum, v) => sum + (v.request_count || 0), 0),
                total_errors: versions.reduce((sum, v) => sum + (v.error_count || 0), 0),
                total_active_users: versions.reduce((sum, v) => sum + (v.active_users || 0), 0)
            };

            const deprecationStats = {
                total_schedules: schedules.length,
                planning: schedules.filter(s => s.deprecation_stage === 'planning').length,
                announced: schedules.filter(s => s.deprecation_stage === 'announced').length,
                active: schedules.filter(s => s.deprecation_stage === 'active').length,
                enforcement: schedules.filter(s => s.deprecation_stage === 'enforcement').length,
                retired: schedules.filter(s => s.deprecation_stage === 'retired').length,
                by_type: {}
            };

            schedules.forEach(s => {
                deprecationStats.by_type[s.item_type] = (deprecationStats.by_type[s.item_type] || 0) + 1;
            });

            const avgMigrationPercent = schedules.length > 0
                ? (schedules.reduce((sum, s) => sum + (s.migration_percentage || 0), 0) / schedules.length).toFixed(2)
                : 0;

            return Response.json({
                versions: versions.slice(0, 30),
                schedules: schedules.slice(0, 25),
                version_stats: versionStats,
                deprecation_stats: {
                    ...deprecationStats,
                    avg_migration_percentage: avgMigrationPercent
                }
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('API versioning engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});