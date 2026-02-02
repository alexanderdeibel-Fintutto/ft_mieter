import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 96: Advanced Data Pipeline & ETL System
 * Verwaltet Pipelines, Stages und Pipeline-Runs
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
            const { pipeline_name, description, source_type, destination_type, schedule_type } = await req.json();

            if (!pipeline_name) {
                return Response.json({ error: 'pipeline_name required' }, { status: 400 });
            }

            const pipeline_id = crypto.randomUUID();

            const pipeline = await base44.asServiceRole.entities.DataPipeline.create({
                organization_id,
                pipeline_id,
                pipeline_name,
                description: description || '',
                source_type: source_type || 'api',
                destination_type: destination_type || 'database',
                schedule_type: schedule_type || 'manual',
                status: 'draft',
                created_at: new Date().toISOString()
            });

            return Response.json({ pipeline_created: true, pipeline_id: pipeline.id });

        } else if (action === 'add_stage') {
            const { pipeline_id, stage_name, stage_type, stage_order, transformation_rules } = await req.json();

            if (!pipeline_id || !stage_name || !stage_type) {
                return Response.json({ error: 'pipeline_id, stage_name, stage_type required' }, { status: 400 });
            }

            const stage_id = crypto.randomUUID();

            const stage = await base44.asServiceRole.entities.PipelineStage.create({
                organization_id,
                stage_id,
                pipeline_id,
                stage_name,
                stage_type,
                stage_order: stage_order || 1,
                transformation_rules: transformation_rules || [],
                created_at: new Date().toISOString()
            });

            const pipelines = await base44.asServiceRole.entities.DataPipeline.filter({
                organization_id,
                id: pipeline_id
            });

            if (pipelines.length > 0) {
                const pipeline = pipelines[0];
                await base44.asServiceRole.entities.DataPipeline.update(pipeline_id, {
                    stages_count: (pipeline.stages_count || 0) + 1
                });
            }

            return Response.json({ stage_added: true, stage_id: stage.id });

        } else if (action === 'start_pipeline') {
            const { pipeline_id, trigger_type } = await req.json();

            if (!pipeline_id) {
                return Response.json({ error: 'pipeline_id required' }, { status: 400 });
            }

            const run_id = crypto.randomUUID();
            const now = new Date().toISOString();

            const run = await base44.asServiceRole.entities.PipelineRun.create({
                organization_id,
                run_id,
                pipeline_id,
                status: 'running',
                trigger_type: trigger_type || 'manual',
                started_at: now,
                created_at: now
            });

            await base44.asServiceRole.entities.DataPipeline.update(pipeline_id, {
                status: 'active',
                last_run_at: now
            });

            return Response.json({ pipeline_started: true, run_id: run.id });

        } else if (action === 'complete_pipeline_run') {
            const { run_id, records_processed, records_success, records_failed, stages_completed, stages_failed } = await req.json();

            if (!run_id) {
                return Response.json({ error: 'run_id required' }, { status: 400 });
            }

            const runs = await base44.asServiceRole.entities.PipelineRun.filter({
                organization_id,
                id: run_id
            });

            if (runs.length === 0) {
                return Response.json({ error: 'Run not found' }, { status: 404 });
            }

            const run = runs[0];
            const completedAt = new Date().toISOString();
            const startedAt = new Date(run.started_at);
            const durationMs = Date.now() - startedAt.getTime();

            const status = (stages_failed || 0) > 0 || (records_failed || 0) > 0 ? 'failed' : 'completed';

            await base44.asServiceRole.entities.PipelineRun.update(run_id, {
                status,
                completed_at: completedAt,
                duration_ms: durationMs,
                records_processed: records_processed || 0,
                records_success: records_success || 0,
                records_failed: records_failed || 0,
                stages_completed: stages_completed || 0,
                stages_failed: stages_failed || 0
            });

            const pipelines = await base44.asServiceRole.entities.DataPipeline.filter({
                organization_id,
                id: run.pipeline_id
            });

            if (pipelines.length > 0) {
                const pipeline = pipelines[0];
                const totalRuns = (pipeline.total_runs || 0) + 1;
                const successfulRuns = status === 'completed' ? (pipeline.successful_runs || 0) + 1 : (pipeline.successful_runs || 0);
                const failedRuns = status === 'failed' ? (pipeline.failed_runs || 0) + 1 : (pipeline.failed_runs || 0);
                
                const totalDuration = (pipeline.avg_duration_ms || 0) * (totalRuns - 1) + durationMs;
                const avgDuration = Math.round(totalDuration / totalRuns);

                await base44.asServiceRole.entities.DataPipeline.update(run.pipeline_id, {
                    status: status === 'completed' ? 'active' : 'error',
                    total_runs: totalRuns,
                    successful_runs: successfulRuns,
                    failed_runs: failedRuns,
                    records_processed: (pipeline.records_processed || 0) + (records_processed || 0),
                    records_failed: (pipeline.records_failed || 0) + (records_failed || 0),
                    avg_duration_ms: avgDuration
                });
            }

            return Response.json({ run_completed: true });

        } else if (action === 'record_stage_execution') {
            const { stage_id, duration_ms, records_processed, success } = await req.json();

            if (!stage_id) {
                return Response.json({ error: 'stage_id required' }, { status: 400 });
            }

            const stages = await base44.asServiceRole.entities.PipelineStage.filter({
                organization_id,
                id: stage_id
            });

            if (stages.length === 0) {
                return Response.json({ error: 'Stage not found' }, { status: 404 });
            }

            const stage = stages[0];
            const executionCount = (stage.execution_count || 0) + 1;
            const successCount = success ? (stage.success_count || 0) + 1 : (stage.success_count || 0);
            const errorCount = !success ? (stage.error_count || 0) + 1 : (stage.error_count || 0);

            const totalDuration = (stage.avg_duration_ms || 0) * (executionCount - 1) + (duration_ms || 0);
            const avgDuration = Math.round(totalDuration / executionCount);

            await base44.asServiceRole.entities.PipelineStage.update(stage_id, {
                execution_count: executionCount,
                success_count: successCount,
                error_count: errorCount,
                avg_duration_ms: avgDuration,
                records_processed: (stage.records_processed || 0) + (records_processed || 0)
            });

            return Response.json({ stage_execution_recorded: true });

        } else if (action === 'get_dashboard_data') {
            const [pipelines, stages, runs] = await Promise.all([
                base44.asServiceRole.entities.DataPipeline.filter({ organization_id }, '-created_at', 50),
                base44.asServiceRole.entities.PipelineStage.filter({ organization_id }, '-created_at', 100),
                base44.asServiceRole.entities.PipelineRun.filter({ organization_id }, '-created_at', 50)
            ]);

            const pipelineStats = {
                total_pipelines: pipelines.length,
                draft_pipelines: pipelines.filter(p => p.status === 'draft').length,
                active_pipelines: pipelines.filter(p => p.status === 'active').length,
                paused_pipelines: pipelines.filter(p => p.status === 'paused').length,
                error_pipelines: pipelines.filter(p => p.status === 'error').length,
                total_runs: pipelines.reduce((sum, p) => sum + (p.total_runs || 0), 0),
                total_records_processed: pipelines.reduce((sum, p) => sum + (p.records_processed || 0), 0),
                by_source: {},
                by_destination: {}
            };

            pipelines.forEach(p => {
                pipelineStats.by_source[p.source_type] = (pipelineStats.by_source[p.source_type] || 0) + 1;
                pipelineStats.by_destination[p.destination_type] = (pipelineStats.by_destination[p.destination_type] || 0) + 1;
            });

            const stageStats = {
                total_stages: stages.length,
                active_stages: stages.filter(s => s.is_active).length,
                inactive_stages: stages.filter(s => !s.is_active).length,
                total_executions: stages.reduce((sum, s) => sum + (s.execution_count || 0), 0),
                by_type: {}
            };

            stages.forEach(s => {
                stageStats.by_type[s.stage_type] = (stageStats.by_type[s.stage_type] || 0) + 1;
            });

            const runStats = {
                total_runs: runs.length,
                pending_runs: runs.filter(r => r.status === 'pending').length,
                running_runs: runs.filter(r => r.status === 'running').length,
                completed_runs: runs.filter(r => r.status === 'completed').length,
                failed_runs: runs.filter(r => r.status === 'failed').length,
                total_records: runs.reduce((sum, r) => sum + (r.records_processed || 0), 0),
                avg_duration_ms: runs.length > 0
                    ? Math.round(runs.reduce((sum, r) => sum + (r.duration_ms || 0), 0) / runs.length)
                    : 0
            };

            return Response.json({
                pipelines: pipelines.slice(0, 30),
                stages: stages.slice(0, 40),
                runs: runs.slice(0, 30),
                pipeline_stats: pipelineStats,
                stage_stats: stageStats,
                run_stats: runStats
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Data pipeline engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});