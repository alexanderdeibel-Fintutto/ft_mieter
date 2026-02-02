import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 35: Advanced Scheduling & Task Queue System
 * Verwaltet geplante Aufgaben, Task Queues und Batch Jobs
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,                    // 'create_scheduled_task', 'get_scheduled_tasks', 'update_task', 'delete_task', 'execute_task', 'create_queue', 'get_queues', 'add_to_queue', 'process_queue', 'create_batch_job', 'get_batch_jobs', 'update_batch_progress'
            organization_id,
            task_id,
            queue_id,
            job_id,
            task_name,
            queue_name,
            job_name,
            task_type,
            job_type,
            function_name,
            function_params = {},
            schedule_type,
            cron_expression,
            total_items,
            batch_size = 100
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'create_scheduled_task') {
            // Create scheduled task
            if (!task_name || !task_type || !function_name || !schedule_type) {
                return Response.json({ error: 'Required fields missing' }, { status: 400 });
            }

            const nextExecution = calculateNextExecution(schedule_type, cron_expression);

            const task = await base44.asServiceRole.entities.ScheduledTask.create({
                organization_id: organization_id,
                task_name: task_name,
                task_type: task_type,
                function_name: function_name,
                function_params: function_params,
                schedule_type: schedule_type,
                cron_expression: cron_expression || null,
                next_execution_at: nextExecution,
                created_by: user.id
            });

            return Response.json({
                task_created: true,
                task_id: task.id
            });

        } else if (action === 'get_scheduled_tasks') {
            // Get all scheduled tasks
            const tasks = await base44.asServiceRole.entities.ScheduledTask.filter({
                organization_id: organization_id
            }, '-next_execution_at', 100);

            const stats = {
                total: tasks.length,
                active: tasks.filter(t => t.enabled).length,
                failed: tasks.filter(t => t.status === 'failed').length,
                total_executions: tasks.reduce((sum, t) => sum + (t.execution_count || 0), 0)
            };

            return Response.json({
                tasks: tasks,
                stats: stats
            });

        } else if (action === 'update_task') {
            // Update scheduled task
            if (!task_id) {
                return Response.json({ error: 'task_id required' }, { status: 400 });
            }

            const updateData = {};
            if (task_name) updateData.task_name = task_name;
            if (function_params) updateData.function_params = function_params;

            await base44.asServiceRole.entities.ScheduledTask.update(task_id, updateData);

            return Response.json({
                task_updated: true
            });

        } else if (action === 'execute_task') {
            // Execute scheduled task immediately
            if (!task_id) {
                return Response.json({ error: 'task_id required' }, { status: 400 });
            }

            const tasks = await base44.asServiceRole.entities.ScheduledTask.filter({
                id: task_id
            });

            if (!tasks || tasks.length === 0) {
                return Response.json({ error: 'Task not found' }, { status: 404 });
            }

            const task = tasks[0];

            try {
                // Execute function
                const result = await base44.asServiceRole.functions.invoke(
                    task.function_name,
                    task.function_params || {}
                );

                // Update task
                const nextExecution = calculateNextExecution(task.schedule_type, task.cron_expression);
                await base44.asServiceRole.entities.ScheduledTask.update(task_id, {
                    execution_count: (task.execution_count || 0) + 1,
                    success_count: (task.success_count || 0) + 1,
                    last_execution_at: new Date().toISOString(),
                    next_execution_at: nextExecution,
                    last_error: null
                });

                return Response.json({
                    task_executed: true,
                    result: result.data
                });
            } catch (error) {
                // Log error
                await base44.asServiceRole.entities.ScheduledTask.update(task_id, {
                    execution_count: (task.execution_count || 0) + 1,
                    failure_count: (task.failure_count || 0) + 1,
                    last_error: error.message
                });

                return Response.json({
                    task_executed: false,
                    error: error.message
                }, { status: 500 });
            }

        } else if (action === 'delete_task') {
            // Delete task
            if (!task_id) {
                return Response.json({ error: 'task_id required' }, { status: 400 });
            }

            await base44.asServiceRole.entities.ScheduledTask.delete(task_id);

            return Response.json({
                task_deleted: true
            });

        } else if (action === 'create_queue') {
            // Create task queue
            if (!queue_name) {
                return Response.json({ error: 'queue_name required' }, { status: 400 });
            }

            const queue = await base44.asServiceRole.entities.TaskQueue.create({
                organization_id: organization_id,
                queue_name: queue_name,
                created_by: user.id
            });

            return Response.json({
                queue_created: true,
                queue_id: queue.id
            });

        } else if (action === 'get_queues') {
            // Get all queues
            const queues = await base44.asServiceRole.entities.TaskQueue.filter({
                organization_id: organization_id
            }, '-last_processed_at', 50);

            const stats = {
                total: queues.length,
                active: queues.filter(q => q.is_active).length,
                total_pending: queues.reduce((sum, q) => sum + (q.pending_count || 0), 0),
                total_completed: queues.reduce((sum, q) => sum + (q.completed_count || 0), 0)
            };

            return Response.json({
                queues: queues,
                stats: stats
            });

        } else if (action === 'create_batch_job') {
            // Create batch job
            if (!job_name || !job_type || !total_items) {
                return Response.json({ error: 'job_name, job_type, total_items required' }, { status: 400 });
            }

            const job = await base44.asServiceRole.entities.BatchJob.create({
                organization_id: organization_id,
                job_name: job_name,
                job_type: job_type,
                total_items: total_items,
                batch_size: batch_size,
                started_at: new Date().toISOString(),
                created_by: user.id
            });

            return Response.json({
                job_created: true,
                job_id: job.id
            });

        } else if (action === 'get_batch_jobs') {
            // Get all batch jobs
            const jobs = await base44.asServiceRole.entities.BatchJob.filter({
                organization_id: organization_id
            }, '-started_at', 100);

            const stats = {
                total: jobs.length,
                processing: jobs.filter(j => j.status === 'processing').length,
                completed: jobs.filter(j => j.status === 'completed').length,
                failed: jobs.filter(j => j.status === 'failed').length,
                total_items_processed: jobs.reduce((sum, j) => sum + (j.processed_items || 0), 0)
            };

            return Response.json({
                jobs: jobs,
                stats: stats
            });

        } else if (action === 'update_batch_progress') {
            // Update batch job progress
            if (!job_id) {
                return Response.json({ error: 'job_id required' }, { status: 400 });
            }

            const jobs = await base44.asServiceRole.entities.BatchJob.filter({
                id: job_id
            });

            if (!jobs || jobs.length === 0) {
                return Response.json({ error: 'Job not found' }, { status: 404 });
            }

            const job = jobs[0];
            const processed = (job.processed_items || 0) + 1;
            const progress = Math.round((processed / job.total_items) * 100);

            let updateData = {
                processed_items: processed,
                progress_percentage: progress,
                successful_items: (job.successful_items || 0) + 1
            };

            if (progress >= 100) {
                updateData.status = 'completed';
                updateData.completed_at = new Date().toISOString();
                updateData.duration_seconds = Math.floor(
                    (new Date(updateData.completed_at) - new Date(job.started_at)) / 1000
                );
            } else if (job.status === 'pending') {
                updateData.status = 'processing';
            }

            await base44.asServiceRole.entities.BatchJob.update(job_id, updateData);

            return Response.json({
                progress_updated: true,
                progress_percentage: progress
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Task scheduling error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function calculateNextExecution(scheduleType, cronExpression) {
    const now = new Date();
    let next;

    switch (scheduleType) {
        case 'once':
            return null;
        case 'hourly':
            next = new Date(now);
            next.setHours(next.getHours() + 1);
            next.setMinutes(0);
            break;
        case 'daily':
            next = new Date(now);
            next.setDate(next.getDate() + 1);
            next.setHours(0, 0, 0, 0);
            break;
        case 'weekly':
            next = new Date(now);
            next.setDate(next.getDate() + 7);
            next.setHours(0, 0, 0, 0);
            break;
        case 'monthly':
            next = new Date(now);
            next.setMonth(next.getMonth() + 1);
            next.setDate(1);
            next.setHours(0, 0, 0, 0);
            break;
        case 'cron':
            // Simple cron parser (basic implementation)
            next = new Date(now);
            next.setMinutes(next.getMinutes() + 5); // Default: every 5 minutes
            break;
        default:
            next = new Date(now);
            next.setHours(next.getHours() + 1);
    }

    return next.toISOString();
}