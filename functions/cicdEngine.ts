import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 53: Advanced CI/CD Pipeline System
 * Verwaltet Pipelines, Stages, Builds und Deployments
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

        if (action === 'create_pipeline') {
            const { pipeline_name, environment, repository, branch, trigger_type } = await req.json();

            if (!pipeline_name || !environment) {
                return Response.json({ error: 'pipeline_name, environment required' }, { status: 400 });
            }

            const pipeline = await base44.asServiceRole.entities.Pipeline.create({
                organization_id,
                pipeline_name,
                environment,
                repository: repository || '',
                branch: branch || 'main',
                trigger_type: trigger_type || 'manual'
            });

            return Response.json({ pipeline_created: true, pipeline_id: pipeline.id });

        } else if (action === 'get_pipelines') {
            const pipelines = await base44.asServiceRole.entities.Pipeline.filter({
                organization_id
            }, '-created_date', 200);

            return Response.json({ pipelines });

        } else if (action === 'trigger_pipeline') {
            const { pipeline_id, commit_hash, commit_message, branch } = await req.json();

            if (!pipeline_id) {
                return Response.json({ error: 'pipeline_id required' }, { status: 400 });
            }

            // Get pipeline
            const pipelines = await base44.asServiceRole.entities.Pipeline.filter({
                organization_id,
                id: pipeline_id
            });

            if (pipelines.length === 0) {
                return Response.json({ error: 'Pipeline not found' }, { status: 404 });
            }

            const pipeline = pipelines[0];

            // Get last build number
            const builds = await base44.asServiceRole.entities.Build.filter({
                organization_id,
                pipeline_id
            }, '-build_number', 1);

            const buildNumber = builds.length > 0 ? builds[0].build_number + 1 : 1;

            // Create build
            const build = await base44.asServiceRole.entities.Build.create({
                organization_id,
                pipeline_id,
                build_number: buildNumber,
                commit_hash: commit_hash || 'HEAD',
                commit_message: commit_message || 'Manual trigger',
                branch: branch || pipeline.branch,
                status: 'running',
                triggered_by: user.id,
                trigger_type: 'manual',
                started_at: new Date().toISOString()
            });

            // Create stages
            const stages = [
                { name: 'Build', type: 'build', order: 1 },
                { name: 'Unit Tests', type: 'test_unit', order: 2 },
                { name: 'Integration Tests', type: 'test_integration', order: 3 },
                { name: 'E2E Tests', type: 'test_e2e', order: 4 },
                { name: 'Deploy', type: 'deploy', order: 5 }
            ];

            for (const stage of stages) {
                await base44.asServiceRole.entities.Stage.create({
                    organization_id,
                    pipeline_id,
                    build_id: build.id,
                    stage_name: stage.name,
                    stage_type: stage.type,
                    order: stage.order,
                    status: stage.order === 1 ? 'running' : 'pending'
                });
            }

            // Update pipeline
            await base44.asServiceRole.entities.Pipeline.update(pipeline_id, {
                last_run_at: new Date().toISOString(),
                last_run_status: 'running'
            });

            return Response.json({ build_triggered: true, build_id: build.id, build_number: buildNumber });

        } else if (action === 'update_stage') {
            const { stage_id, status, duration_seconds, error_message } = await req.json();

            if (!stage_id || !status) {
                return Response.json({ error: 'stage_id, status required' }, { status: 400 });
            }

            const updateData = {
                status,
                completed_at: new Date().toISOString(),
                duration_seconds: duration_seconds || 0
            };

            if (error_message) {
                updateData.error_message = error_message;
            }

            await base44.asServiceRole.entities.Stage.update(stage_id, updateData);

            // If stage failed, update build status
            if (status === 'failed') {
                const stages = await base44.asServiceRole.entities.Stage.filter({
                    organization_id,
                    id: stage_id
                });

                if (stages.length > 0) {
                    const stage = stages[0];
                    await base44.asServiceRole.entities.Build.update(stage.build_id, {
                        status: 'failed',
                        completed_at: new Date().toISOString()
                    });
                }
            }

            return Response.json({ stage_updated: true });

        } else if (action === 'complete_build') {
            const { build_id, status, test_results, deployment_url } = await req.json();

            if (!build_id || !status) {
                return Response.json({ error: 'build_id, status required' }, { status: 400 });
            }

            const builds = await base44.asServiceRole.entities.Build.filter({
                organization_id,
                id: build_id
            });

            if (builds.length === 0) {
                return Response.json({ error: 'Build not found' }, { status: 404 });
            }

            const build = builds[0];
            const startTime = new Date(build.started_at);
            const endTime = new Date();
            const durationSeconds = Math.floor((endTime - startTime) / 1000);

            await base44.asServiceRole.entities.Build.update(build_id, {
                status,
                completed_at: endTime.toISOString(),
                duration_seconds: durationSeconds,
                test_results: test_results || {},
                deployment_url: deployment_url || ''
            });

            // Update pipeline stats
            const pipeline = await base44.asServiceRole.entities.Pipeline.filter({
                organization_id,
                id: build.pipeline_id
            });

            if (pipeline.length > 0) {
                const p = pipeline[0];
                await base44.asServiceRole.entities.Pipeline.update(build.pipeline_id, {
                    last_run_status: status,
                    success_count: status === 'success' ? (p.success_count || 0) + 1 : p.success_count,
                    failure_count: status === 'failed' ? (p.failure_count || 0) + 1 : p.failure_count
                });
            }

            return Response.json({ build_completed: true });

        } else if (action === 'get_builds') {
            const { pipeline_id } = await req.json();

            let filter = { organization_id };
            if (pipeline_id) filter.pipeline_id = pipeline_id;

            const builds = await base44.asServiceRole.entities.Build.filter(
                filter,
                '-build_number',
                100
            );

            return Response.json({ builds });

        } else if (action === 'get_stages') {
            const { build_id } = await req.json();

            if (!build_id) {
                return Response.json({ error: 'build_id required' }, { status: 400 });
            }

            const stages = await base44.asServiceRole.entities.Stage.filter({
                organization_id,
                build_id
            }, 'order');

            return Response.json({ stages });

        } else if (action === 'cancel_build') {
            const { build_id } = await req.json();

            if (!build_id) {
                return Response.json({ error: 'build_id required' }, { status: 400 });
            }

            await base44.asServiceRole.entities.Build.update(build_id, {
                status: 'cancelled',
                completed_at: new Date().toISOString()
            });

            // Cancel all pending/running stages
            const stages = await base44.asServiceRole.entities.Stage.filter({
                organization_id,
                build_id
            });

            for (const stage of stages) {
                if (stage.status === 'pending' || stage.status === 'running') {
                    await base44.asServiceRole.entities.Stage.update(stage.id, {
                        status: 'cancelled',
                        completed_at: new Date().toISOString()
                    });
                }
            }

            return Response.json({ build_cancelled: true });

        } else if (action === 'get_dashboard_data') {
            const [pipelines, builds, stages] = await Promise.all([
                base44.asServiceRole.entities.Pipeline.filter({ organization_id }),
                base44.asServiceRole.entities.Build.filter({ organization_id }, '-started_at', 200),
                base44.asServiceRole.entities.Stage.filter({ organization_id }, '-started_at', 500)
            ]);

            const buildsByStatus = {};
            const buildsByPipeline = {};
            const stagesByType = {};

            builds.forEach(b => {
                buildsByStatus[b.status] = (buildsByStatus[b.status] || 0) + 1;
                buildsByPipeline[b.pipeline_id] = (buildsByPipeline[b.pipeline_id] || 0) + 1;
            });

            stages.forEach(s => {
                stagesByType[s.stage_type] = (stagesByType[s.stage_type] || 0) + 1;
            });

            const stats = {
                total_pipelines: pipelines.length,
                active_pipelines: pipelines.filter(p => p.is_active).length,
                total_builds: builds.length,
                successful_builds: builds.filter(b => b.status === 'success').length,
                failed_builds: builds.filter(b => b.status === 'failed').length,
                running_builds: builds.filter(b => b.status === 'running').length,
                total_stages: stages.length,
                success_rate: builds.length > 0 
                    ? Math.round((builds.filter(b => b.status === 'success').length / builds.length) * 100) 
                    : 0
            };

            return Response.json({
                pipelines,
                builds: builds.slice(0, 50),
                recent_stages: stages.slice(0, 100),
                stats,
                builds_by_status: buildsByStatus,
                stages_by_type: stagesByType
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('CI/CD engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});