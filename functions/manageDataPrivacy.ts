import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 22: Data Privacy & GDPR Compliance System
 * Verwaltet Datenschutzanfragen, Löschung, Anonymisierung und Aufbewahrungsrichtlinien
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,                    // 'create_request', 'get_requests', 'verify_request', 'export_data', 'delete_data', 'anonymize_data', 'configure_retention', 'execute_retention'
            organization_id,
            request_type,
            user_id,
            scope,
            request_id,
            entity_type,
            retention_period_days,
            retention_action,
            data_ids_to_delete
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'create_request') {
            // Create GDPR privacy request
            if (!request_type || !user_id) {
                return Response.json({ error: 'request_type and user_id required' }, { status: 400 });
            }

            const deadline = new Date();
            deadline.setDate(deadline.getDate() + 30); // 30-day deadline

            const privacyRequest = await base44.asServiceRole.entities.DataPrivacyRequest.create({
                organization_id: organization_id,
                user_id: user_id,
                request_type: request_type,
                scope: scope || { include_all: true },
                requested_at: new Date().toISOString(),
                deadline_date: deadline.toISOString()
            });

            // Log security event
            await base44.asServiceRole.entities.SecurityEvent.create({
                organization_id: organization_id,
                event_type: 'data_privacy_request',
                severity: 'high',
                user_id: user_id,
                ip_address: 'system',
                description: `${request_type} request created for user`,
                timestamp: new Date().toISOString()
            });

            return Response.json({
                request_created: true,
                request_id: privacyRequest.id,
                deadline_date: deadline.toISOString()
            });

        } else if (action === 'get_requests') {
            // Get privacy requests
            const requests = await base44.asServiceRole.entities.DataPrivacyRequest.filter({
                organization_id: organization_id
            }, '-requested_at', 100);

            return Response.json({
                requests: requests,
                total: requests.length
            });

        } else if (action === 'verify_request') {
            // Verify privacy request (admin only)
            if (user.role !== 'admin') {
                return Response.json({ error: 'Admin access required' }, { status: 403 });
            }

            if (!request_id) {
                return Response.json({ error: 'request_id required' }, { status: 400 });
            }

            await base44.asServiceRole.entities.DataPrivacyRequest.update(request_id, {
                verified: true,
                verified_by: user.id,
                verified_at: new Date().toISOString(),
                status: 'in_progress'
            });

            return Response.json({ verified: true });

        } else if (action === 'export_data') {
            // Export user data (for portability)
            if (!request_id || !user_id) {
                return Response.json({ error: 'request_id and user_id required' }, { status: 400 });
            }

            // Collect all user data from different entities
            const exportData = {
                export_date: new Date().toISOString(),
                user_id: user_id,
                data: {}
            };

            // Example: Export from multiple entities
            const entities = ['PaymentTransaction', 'Document', 'ActivityLog'];
            for (const entity of entities) {
                const records = await base44.asServiceRole.entities[entity]?.filter({
                    created_by: user_id
                }) || [];
                exportData.data[entity] = records;
            }

            // Create JSON export
            const jsonData = JSON.stringify(exportData, null, 2);

            // In production, upload to secure storage
            const fileName = `data_export_${user_id}_${Date.now()}.json`;

            // Update request
            await base44.asServiceRole.entities.DataPrivacyRequest.update(request_id, {
                status: 'completed',
                completed_at: new Date().toISOString(),
                exported_file_url: fileName
            });

            return Response.json({
                exported: true,
                file_name: fileName,
                record_count: Object.values(exportData.data).reduce((sum, arr) => sum + arr.length, 0)
            });

        } else if (action === 'delete_data') {
            // Delete user data
            if (!request_id || !user_id) {
                return Response.json({ error: 'request_id and user_id required' }, { status: 400 });
            }

            let totalDeleted = 0;

            // Delete from multiple entities
            const entities = ['PaymentTransaction', 'Document', 'ActivityLog', 'ErrorLog'];
            for (const entity of entities) {
                const records = await base44.asServiceRole.entities[entity]?.filter({
                    created_by: user_id
                }) || [];

                for (const record of records) {
                    try {
                        await base44.asServiceRole.entities[entity]?.delete(record.id);
                        totalDeleted++;
                    } catch (e) {
                        console.error(`Failed to delete ${entity}:`, e);
                    }
                }
            }

            // Update request
            await base44.asServiceRole.entities.DataPrivacyRequest.update(request_id, {
                status: 'completed',
                completed_at: new Date().toISOString(),
                deletion_count: totalDeleted
            });

            return Response.json({
                deleted: true,
                deleted_count: totalDeleted
            });

        } else if (action === 'anonymize_data') {
            // Anonymize user data instead of deleting
            if (!request_id || !user_id) {
                return Response.json({ error: 'request_id and user_id required' }, { status: 400 });
            }

            let totalAnonymized = 0;

            // Anonymize in multiple entities
            const entities = ['PaymentTransaction', 'Document', 'ActivityLog'];
            for (const entity of entities) {
                const records = await base44.asServiceRole.entities[entity]?.filter({
                    created_by: user_id
                }) || [];

                for (const record of records) {
                    try {
                        await base44.asServiceRole.entities[entity]?.update(record.id, {
                            created_by: 'anonymous',
                            updated_by: 'anonymous'
                        });
                        totalAnonymized++;
                    } catch (e) {
                        console.error(`Failed to anonymize ${entity}:`, e);
                    }
                }
            }

            // Update request
            await base44.asServiceRole.entities.DataPrivacyRequest.update(request_id, {
                status: 'completed',
                completed_at: new Date().toISOString(),
                anonymization_count: totalAnonymized
            });

            return Response.json({
                anonymized: true,
                anonymization_count: totalAnonymized
            });

        } else if (action === 'configure_retention') {
            // Configure data retention policy
            if (user.role !== 'admin') {
                return Response.json({ error: 'Admin access required' }, { status: 403 });
            }

            if (!entity_type || !retention_period_days) {
                return Response.json({ error: 'entity_type and retention_period_days required' }, { status: 400 });
            }

            const nextExecution = new Date();
            nextExecution.setDate(nextExecution.getDate() + 1);

            const policy = await base44.asServiceRole.entities.DataRetentionPolicy.create({
                organization_id: organization_id,
                entity_type: entity_type,
                retention_period_days: retention_period_days,
                retention_action: retention_action || 'delete',
                next_execution_at: nextExecution.toISOString(),
                execution_schedule: 'daily'
            });

            return Response.json({
                configured: true,
                policy: policy
            });

        } else if (action === 'execute_retention') {
            // Execute retention policies
            if (user.role !== 'admin') {
                return Response.json({ error: 'Admin access required' }, { status: 403 });
            }

            const policies = await base44.asServiceRole.entities.DataRetentionPolicy.filter({
                organization_id: organization_id,
                is_active: true
            });

            const results = [];

            for (const policy of policies) {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - policy.retention_period_days);

                // Get records older than cutoff
                const records = await base44.asServiceRole.entities[policy.entity_type]?.filter({
                    created_date: { $lt: cutoffDate.toISOString() }
                }) || [];

                let processed = 0;
                let deleted = 0;

                for (const record of records) {
                    try {
                        if (policy.retention_action === 'delete') {
                            await base44.asServiceRole.entities[policy.entity_type]?.delete(record.id);
                            deleted++;
                        } else if (policy.retention_action === 'anonymize') {
                            await base44.asServiceRole.entities[policy.entity_type]?.update(record.id, {
                                created_by: 'anonymous'
                            });
                        }
                        processed++;
                    } catch (e) {
                        console.error(`Retention error for ${policy.entity_type}:`, e);
                    }
                }

                // Update policy
                await base44.asServiceRole.entities.DataRetentionPolicy.update(policy.id, {
                    records_processed: (policy.records_processed || 0) + processed,
                    records_deleted: (policy.records_deleted || 0) + deleted,
                    last_executed_at: new Date().toISOString(),
                    next_execution_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                });

                results.push({
                    entity_type: policy.entity_type,
                    processed,
                    deleted
                });
            }

            return Response.json({
                executed: true,
                results: results
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Data privacy error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});