import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 63: Advanced Job Scheduling & Distributed Task Queue System
 * Verwaltet Scheduled Jobs, Task Queues und Task Executions
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

        if (action === 'create_job') {
            const { job_name, job_type, schedule, task_function, parameters, priority, timeout_seconds, retry_count } = await req.json();

            if (!job_name || !job_type || !task_function) {
                return Response.json({ error: 'job_name, job_type, task_function required' }, { status: 400 });
            }

            const job = await base44.asServiceRole.entities.ScheduledJob.create({
                organization_id,
                job_name,
                job_type,
                schedule: schedule || '',
                task_function,
                parameters: parameters || {},
                priority: priority || 0,
                timeout_seconds: timeout_seconds || 300,
                retry_count: retry_count || 3
            });

            return Response.json({ job_created: true, job_id: job.id });

        } else if (action === 'get_jobs') {
            const jobs = await base44.asServiceRole.entities.ScheduledJob.filter({
                organization_id
            });

            return Response.json({ jobs });

        } else if (action === 'create_queue') {
            const { queue_name, queue_type, max_workers, concurrency_limit, retention_hours } = await req.json();

            if (!queue_name || !queue_type) {
                return Response.json({ error: 'queue_name, queue_type required' }, { status: 400 });
            }

            const queue = await base44.asServiceRole.entities.TaskQueue.create({
                organization_id,
                queue_name,
                queue_type,
                max_workers: max_workers || 10,
                concurrency_limit: concurrency_limit || 5,
                retention_hours: retention_hours || 168
            });

            return Response.json({ queue_created: true, queue_id: queue.id });

        } else if (action === 'get_queues') {
            const queues = await base44.asServiceRole.entities.TaskQueue.filter({
                organization_id
            });

            return Response.json({ queues });

        } else if (action === 'enqueue_task') {
            const { queue_id, task_name, parameters, priority, job_id } = await req.json();

            if (!queue_id || !task_name) {
                return Response.json({ error: 'queue_id, task_name required' }, { status: 400 });
            }

            const task_id = crypto.randomUUID();

            const task = await base44.asServiceRole.entities.TaskExecution.create({
                organization_id,
                queue_id,
                job_id: job_id || '',
                task_id,
                task_name,
                parameters: parameters || {},
                priority: priority || 0,
                status: 'pending'
            });

            // Update queue stats
            const queues = await base44.asServiceRole.entities.TaskQueue.filter({
                organization_id,
                id: queue_id
            });

            if (queues.length > 0) {
                const queue = queues[0];
                await base44.asServiceRole.entities.TaskQueue.update(queue_id, {
                    pending_tasks: (queue.pending_tasks || 0) + 1
                });
            }

            return Response.json({ task_enqueued: true, task_id: task.id });

        } else if (action === 'start_task') {
            const { task_id, worker_id } = await req.json();

            if (!task_id || !worker_id) {
                return Response.json({ error: 'task_id, worker_id required' }, { status: 400 });
            }

            const tasks = await base44.asServiceRole.entities.TaskExecution.filter({
                organization_id,
                id: task_id
            });

            if (tasks.length === 0) {
                return Response.json({ error: 'Task not found' }, { status: 404 });
            }

            const task = tasks[0];

            await base44.asServiceRole.entities.TaskExecution.update(task_id, {
                status: 'running',
                worker_id,
                started_at: new Date().toISOString()
            });

            // Update queue stats
            const queues = await base44.asServiceRole.entities.TaskQueue.filter({
                organization_id,
                id: task.queue_id
            });

            if (queues.length > 0) {
                const queue = queues[0];
                await base44.asServiceRole.entities.TaskQueue.update(task.queue_id, {
                    pending_tasks: Math.max((queue.pending_tasks || 0) - 1, 0),
                    running_tasks: (queue.running_tasks || 0) + 1
                });
            }

            return Response.json({ task_started: true });

        } else if (action === 'complete_task') {
            const { task_id, result, success } = await req.json();

            if (!task_id) {
                return Response.json({ error: 'task_id required' }, { status: 400 });
            }

            const tasks = await base44.asServiceRole.entities.TaskExecution.filter({
                organization_id,
                id: task_id
            });

            if (tasks.length === 0) {
                return Response.json({ error: 'Task not found' }, { status: 404 });
            }

            const task = tasks[0];
            const completed_at = new Date();
            const started_at = task.started_at ? new Date(task.started_at) : completed_at;
            const duration_ms = completed_at - started_at;

            await base44.asServiceRole.entities.TaskExecution.update(task_id, {
                status: success ? 'completed' : 'failed',
                completed_at: completed_at.toISOString(),
                duration_ms,
                result: result || {},
                error_message: success ? '' : (result?.error || 'Task failed')
            });

            // Update queue stats
            const queues = await base44.asServiceRole.entities.TaskQueue.filter({
                organization_id,
                id: task.queue_id
            });

            if (queues.length > 0) {
                const queue = queues[0];
                await base44.asServiceRole.entities.TaskQueue.update(task.queue_id, {
                    running_tasks: Math.max((queue.running_tasks || 0) - 1, 0),
                    completed_tasks: success ? (queue.completed_tasks || 0) + 1 : queue.completed_tasks,
                    failed_tasks: !success ? (queue.failed_tasks || 0) + 1 : queue.failed_tasks
                });
            }

            // Update job stats if job_id exists
            if (task.job_id) {
                const jobs = await base44.asServiceRole.entities.ScheduledJob.filter({
                    organization_id,
                    id: task.job_id
                });

                if (jobs.length > 0) {
                    const job = jobs[0];
                    await base44.asServiceRole.entities.ScheduledJob.update(task.job_id, {
                        last_run_at: completed_at.toISOString(),
                        success_count: success ? (job.success_count || 0) + 1 : job.success_count,
                        failure_count: !success ? (job.failure_count || 0) + 1 : job.failure_count
                    });
                }
            }

            return Response.json({ task_completed: true });

        } else if (action === 'get_tasks') {
            const { queue_id, status, limit } = await req.json();

            let filter = { organization_id };
            if (queue_id) filter.queue_id = queue_id;
            if (status) filter.status = status;

            const tasks = await base44.asServiceRole.entities.TaskExecution.filter(filter, '-started_at', limit || 50);

            return Response.json({ tasks });

        } else if (action === 'get_dashboard_data') {
            const [jobs, queues, tasks] = await Promise.all([
                base44.asServiceRole.entities.ScheduledJob.filter({ organization_id }),
                base44.asServiceRole.entities.TaskQueue.filter({ organization_id }),
                base44.asServiceRole.entities.TaskExecution.filter({ organization_id }, '-started_at', 100)
            ]);

            const tasksByStatus = {};
            tasks.forEach(t => {
                tasksByStatus[t.status] = (tasksByStatus[t.status] || 0) + 1;
            });

            const jobsByType = {};
            jobs.forEach(j => {
                jobsByType[j.job_type] = (jobsByType[j.job_type] || 0) + 1;
            });

            const stats = {
                total_jobs: jobs.length,
                active_jobs: jobs.filter(j => j.is_active).length,
                total_queues: queues.length,
                active_queues: queues.filter(q => q.is_active).length,
                pending_tasks: queues.reduce((sum, q) => sum + (q.pending_tasks || 0), 0),
                running_tasks: queues.reduce((sum, q) => sum + (q.running_tasks || 0), 0),
                completed_tasks: queues.reduce((sum, q) => sum + (q.completed_tasks || 0), 0),
                failed_tasks: queues.reduce((sum, q) => sum + (q.failed_tasks || 0), 0)
            };

            const success_rate = (stats.completed_tasks + stats.failed_tasks) > 0
                ? Math.round((stats.completed_tasks / (stats.completed_tasks + stats.failed_tasks)) * 100)
                : 0;

            return Response.json({
                jobs,
                queues,
                tasks: tasks.slice(0, 20),
                stats: { ...stats, success_rate },
                tasks_by_status: tasksByStatus,
                jobs_by_type: jobsByType
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Job scheduler engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});