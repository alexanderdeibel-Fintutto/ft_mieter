import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 16: Batch Operations & Bulk Processing
 * Verarbeitet große Mengen an Daten asynchron mit Progress-Tracking
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,           // 'submit', 'get_status', 'cancel', 'retry'
            batch_job_id,
            organization_id,
            entity_type,
            operation_type,   // 'create', 'update', 'delete', 'export', 'import'
            batch_data = [],
            filters = {},
            update_fields = {}
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'submit') {
            if (!entity_type || !operation_type) {
                return Response.json({ error: 'Missing operation parameters' }, { status: 400 });
            }

            // Erstelle Batch Job
            const batchJob = await base44.asServiceRole.entities.BatchJob.create({
                organization_id: organization_id,
                created_by: user.id,
                entity_type: entity_type,
                operation_type: operation_type,
                total_items: batch_data.length || 1,
                batch_data: batch_data,
                filters: filters,
                update_fields: update_fields,
                status: 'pending',
                started_at: new Date().toISOString()
            });

            // Starte Verarbeitung asynchron (im Hintergrund)
            processBatchAsync(base44, batchJob, entity_type, operation_type, batch_data, filters, update_fields);

            return Response.json({
                batch_job_id: batchJob.id,
                status: 'submitted',
                message: 'Batch-Operation eingereicht'
            });

        } else if (action === 'get_status') {
            if (!batch_job_id) {
                return Response.json({ error: 'Missing batch_job_id' }, { status: 400 });
            }

            const job = await base44.asServiceRole.entities.BatchJob.filter({
                id: batch_job_id
            });

            if (job.length === 0) {
                return Response.json({ error: 'Batch job not found' }, { status: 404 });
            }

            return Response.json({
                batch_job: job[0]
            });

        } else if (action === 'cancel') {
            if (!batch_job_id) {
                return Response.json({ error: 'Missing batch_job_id' }, { status: 400 });
            }

            const job = await base44.asServiceRole.entities.BatchJob.filter({
                id: batch_job_id
            });

            if (job.length === 0 || (job[0].status !== 'pending' && job[0].status !== 'running')) {
                return Response.json({ 
                    error: 'Cannot cancel job in this state' 
                }, { status: 400 });
            }

            await base44.asServiceRole.entities.BatchJob.update(batch_job_id, {
                status: 'paused'
            });

            return Response.json({ cancelled: true });

        } else if (action === 'retry') {
            if (!batch_job_id) {
                return Response.json({ error: 'Missing batch_job_id' }, { status: 400 });
            }

            const job = await base44.asServiceRole.entities.BatchJob.filter({
                id: batch_job_id
            });

            if (job.length === 0 || job[0].status !== 'failed') {
                return Response.json({ 
                    error: 'Can only retry failed jobs' 
                }, { status: 400 });
            }

            // Reset und starte neu
            const jobData = job[0];
            await base44.asServiceRole.entities.BatchJob.update(batch_job_id, {
                status: 'running',
                processed_items: 0,
                successful_items: 0,
                failed_items: 0,
                error_log: [],
                progress_percentage: 0
            });

            processBatchAsync(
                base44,
                jobData,
                jobData.entity_type,
                jobData.operation_type,
                jobData.batch_data,
                jobData.filters,
                jobData.update_fields
            );

            return Response.json({ retrying: true });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Batch operation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function processBatchAsync(base44, batchJob, entityType, operationType, batchData, filters, updateFields) {
    const jobId = batchJob.id;
    const startTime = Date.now();

    try {
        // Update status zu running
        await base44.asServiceRole.entities.BatchJob.update(jobId, {
            status: 'running',
            started_at: new Date().toISOString()
        });

        const errorLog = [];
        let successCount = 0;
        let failedCount = 0;

        if (operationType === 'create') {
            for (let i = 0; i < batchData.length; i++) {
                try {
                    await base44.asServiceRole.entities[entityType].create(batchData[i]);
                    successCount++;
                } catch (error) {
                    failedCount++;
                    errorLog.push({
                        item_index: i,
                        error: error.message
                    });
                }

                // Update progress
                const processed = i + 1;
                const progress = Math.round((processed / batchData.length) * 100);
                const elapsed = Date.now() - startTime;
                const rate = processed / (elapsed / 1000);
                const remainingItems = batchData.length - processed;
                const estimatedSeconds = remainingItems / rate;

                await base44.asServiceRole.entities.BatchJob.update(jobId, {
                    processed_items: processed,
                    successful_items: successCount,
                    failed_items: failedCount,
                    progress_percentage: progress,
                    error_log: errorLog,
                    estimated_completion: new Date(Date.now() + estimatedSeconds * 1000).toISOString()
                });
            }

        } else if (operationType === 'update') {
            const items = await base44.asServiceRole.entities[entityType].filter(filters);

            for (let i = 0; i < items.length; i++) {
                try {
                    await base44.asServiceRole.entities[entityType].update(items[i].id, updateFields);
                    successCount++;
                } catch (error) {
                    failedCount++;
                    errorLog.push({
                        item_index: i,
                        item_id: items[i].id,
                        error: error.message
                    });
                }

                const processed = i + 1;
                const progress = Math.round((processed / items.length) * 100);
                await base44.asServiceRole.entities.BatchJob.update(jobId, {
                    processed_items: processed,
                    successful_items: successCount,
                    failed_items: failedCount,
                    progress_percentage: progress,
                    error_log: errorLog
                });
            }

        } else if (operationType === 'delete') {
            const items = await base44.asServiceRole.entities[entityType].filter(filters);

            for (let i = 0; i < items.length; i++) {
                try {
                    await base44.asServiceRole.entities[entityType].delete(items[i].id);
                    successCount++;
                } catch (error) {
                    failedCount++;
                    errorLog.push({
                        item_index: i,
                        item_id: items[i].id,
                        error: error.message
                    });
                }

                const processed = i + 1;
                const progress = Math.round((processed / items.length) * 100);
                await base44.asServiceRole.entities.BatchJob.update(jobId, {
                    processed_items: processed,
                    successful_items: successCount,
                    failed_items: failedCount,
                    progress_percentage: progress,
                    error_log: errorLog
                });
            }
        }

        // Mark as completed
        const finalStatus = failedCount === 0 ? 'completed' : (successCount > 0 ? 'completed' : 'failed');
        await base44.asServiceRole.entities.BatchJob.update(jobId, {
            status: finalStatus,
            completed_at: new Date().toISOString(),
            progress_percentage: 100
        });

    } catch (error) {
        console.error('Batch processing error:', error);
        await base44.asServiceRole.entities.BatchJob.update(jobId, {
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_log: [{ error: error.message }]
        });
    }
}