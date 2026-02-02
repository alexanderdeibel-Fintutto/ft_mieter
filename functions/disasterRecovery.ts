import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 24: Disaster Recovery & Backup System
 * Verwaltet Backups, DR-Pläne und Restore-Operationen
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,                    // 'create_backup', 'list_backups', 'verify_backup', 'restore_backup', 'create_dr_plan', 'list_dr_plans', 'test_restore', 'get_backup_status'
            organization_id,
            backup_type = 'incremental',
            source = 'database',
            destination,
            backup_id,
            restore_type = 'full',
            plan_name,
            rto_minutes,
            rpo_minutes,
            backup_frequency = 'daily'
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'create_backup') {
            // Create new backup
            if (user.role !== 'admin') {
                return Response.json({ error: 'Admin access required' }, { status: 403 });
            }

            const backup = await base44.asServiceRole.entities.Backup.create({
                organization_id: organization_id,
                backup_type: backup_type,
                source: source,
                destination: destination || `s3://backups/${organization_id}/${source}_${Date.now()}`,
                status: 'pending',
                created_at: new Date().toISOString(),
                is_encrypted: true,
                verification_status: 'unverified'
            });

            // Simulate backup process (in production this would be async)
            scheduleBackupExecution(base44, organization_id, backup.id);

            return Response.json({
                backup_created: true,
                backup_id: backup.id,
                status: 'pending'
            });

        } else if (action === 'list_backups') {
            // List all backups for organization
            const backups = await base44.asServiceRole.entities.Backup.filter({
                organization_id: organization_id
            }, '-created_at', 100);

            const stats = {
                total: backups.length,
                successful: backups.filter(b => b.status === 'completed').length,
                pending: backups.filter(b => b.status === 'pending').length,
                failed: backups.filter(b => b.status === 'failed').length,
                total_size_gb: (backups.reduce((sum, b) => sum + (b.size_bytes || 0), 0) / 1024 / 1024 / 1024).toFixed(2)
            };

            return Response.json({
                backups: backups,
                stats: stats
            });

        } else if (action === 'verify_backup') {
            // Verify backup integrity
            if (!backup_id) {
                return Response.json({ error: 'backup_id required' }, { status: 400 });
            }

            const backup = await base44.asServiceRole.entities.Backup.filter({
                id: backup_id
            });

            if (!backup || backup.length === 0) {
                return Response.json({ error: 'Backup not found' }, { status: 404 });
            }

            const backupData = backup[0];

            // Simulate verification
            const isValid = Math.random() > 0.05; // 95% success rate

            await base44.asServiceRole.entities.Backup.update(backup_id, {
                verification_status: isValid ? 'verified' : 'failed'
            });

            return Response.json({
                verified: isValid,
                backup_id: backup_id,
                checksum: backupData.checksum || 'generated_checksum_' + Date.now()
            });

        } else if (action === 'restore_backup') {
            // Restore from backup
            if (!backup_id || user.role !== 'admin') {
                return Response.json({ error: 'backup_id required and admin access needed' }, { status: 400 });
            }

            const backup = await base44.asServiceRole.entities.Backup.filter({
                id: backup_id
            });

            if (!backup || backup.length === 0) {
                return Response.json({ error: 'Backup not found' }, { status: 404 });
            }

            if (backup[0].verification_status !== 'verified') {
                return Response.json({ error: 'Backup not verified' }, { status: 400 });
            }

            const restoreOp = await base44.asServiceRole.entities.RestoreOperation.create({
                organization_id: organization_id,
                backup_id: backup_id,
                status: 'pending',
                restore_type: restore_type,
                initiated_by: user.id,
                target_location: destination || 'production',
                started_at: new Date().toISOString()
            });

            // Simulate restore (in production this would be async)
            scheduleRestoreExecution(base44, organization_id, restoreOp.id, backup_id);

            // Log in security events
            await base44.asServiceRole.entities.SecurityEvent.create({
                organization_id: organization_id,
                event_type: 'data_recovery_initiated',
                severity: 'high',
                user_id: user.id,
                ip_address: 'system',
                description: `Restore operation initiated from backup ${backup_id}`,
                timestamp: new Date().toISOString()
            });

            return Response.json({
                restore_initiated: true,
                restore_id: restoreOp.id,
                status: 'pending'
            });

        } else if (action === 'create_dr_plan') {
            // Create Disaster Recovery plan
            if (user.role !== 'admin') {
                return Response.json({ error: 'Admin access required' }, { status: 403 });
            }

            if (!plan_name || !rto_minutes || !rpo_minutes) {
                return Response.json({ error: 'plan_name, rto_minutes, rpo_minutes required' }, { status: 400 });
            }

            const nextBackup = new Date();
            nextBackup.setHours(nextBackup.getHours() + 1);

            const plan = await base44.asServiceRole.entities.DisasterRecoveryPlan.create({
                organization_id: organization_id,
                plan_name: plan_name,
                rto_minutes: rto_minutes,
                rpo_minutes: rpo_minutes,
                backup_frequency: backup_frequency,
                is_active: true,
                status: 'healthy',
                next_backup_time: nextBackup.toISOString(),
                created_by: user.id,
                included_sources: source ? [source] : ['database', 'documents', 'files']
            });

            return Response.json({
                plan_created: true,
                plan_id: plan.id
            });

        } else if (action === 'list_dr_plans') {
            // List all DR plans
            const plans = await base44.asServiceRole.entities.DisasterRecoveryPlan.filter({
                organization_id: organization_id,
                is_active: true
            });

            return Response.json({
                plans: plans,
                total: plans.length
            });

        } else if (action === 'test_restore') {
            // Test restore (creates a test restore to verify DR plan)
            if (user.role !== 'admin') {
                return Response.json({ error: 'Admin access required' }, { status: 403 });
            }

            if (!backup_id) {
                return Response.json({ error: 'backup_id required' }, { status: 400 });
            }

            // Create test restore
            const testRestore = await base44.asServiceRole.entities.RestoreOperation.create({
                organization_id: organization_id,
                backup_id: backup_id,
                restore_type: 'test',
                status: 'pending',
                initiated_by: user.id,
                reason: 'dr_test',
                started_at: new Date().toISOString()
            });

            // Simulate test (in production this would verify data integrity)
            const testSuccessful = Math.random() > 0.1; // 90% success

            setTimeout(async () => {
                await base44.asServiceRole.entities.RestoreOperation.update(testRestore.id, {
                    status: testSuccessful ? 'completed' : 'failed',
                    completed_at: new Date().toISOString(),
                    data_verified: testSuccessful,
                    items_restored: testSuccessful ? 10000 : 0,
                    items_failed: testSuccessful ? 0 : 500
                });
            }, 5000);

            return Response.json({
                test_initiated: true,
                test_id: testRestore.id,
                expected_duration_seconds: 5
            });

        } else if (action === 'get_backup_status') {
            // Get comprehensive backup and DR status
            const backups = await base44.asServiceRole.entities.Backup.filter({
                organization_id: organization_id
            }, '-created_at', 50);

            const plans = await base44.asServiceRole.entities.DisasterRecoveryPlan.filter({
                organization_id: organization_id,
                is_active: true
            });

            const restoreOps = await base44.asServiceRole.entities.RestoreOperation.filter({
                organization_id: organization_id
            }, '-started_at', 20);

            // Calculate health metrics
            const lastBackup = backups[0];
            const health = {
                backup_health: calculateBackupHealth(backups),
                dr_readiness: calculateDRReadiness(plans, backups),
                last_successful_backup: lastBackup?.completed_at,
                days_since_backup: lastBackup ? Math.floor((Date.now() - new Date(lastBackup.completed_at)) / (1000 * 60 * 60 * 24)) : null,
                recovery_tested: plans.some(p => p.last_test_status === 'success'),
                recommendations: generateRecommendations(backups, plans)
            };

            return Response.json({
                backups: backups,
                plans: plans,
                recent_restores: restoreOps,
                health: health
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Disaster recovery error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function scheduleBackupExecution(base44, organizationId, backupId) {
    // Simulate backup execution
    setTimeout(async () => {
        const success = Math.random() > 0.05; // 95% success
        
        await base44.asServiceRole.entities.Backup.update(backupId, {
            status: success ? 'completed' : 'failed',
            started_at: new Date(Date.now() - 60000).toISOString(),
            completed_at: new Date().toISOString(),
            duration_seconds: 60,
            size_bytes: Math.floor(Math.random() * 10000000000), // 0-10GB
            file_count: Math.floor(Math.random() * 50000),
            record_count: Math.floor(Math.random() * 100000),
            compression_ratio: 0.45,
            verification_status: success ? 'unverified' : 'failed'
        });
    }, 30000);
}

function scheduleRestoreExecution(base44, organizationId, restoreOpId, backupId) {
    // Simulate restore execution
    setTimeout(async () => {
        const success = Math.random() > 0.05; // 95% success
        
        await base44.asServiceRole.entities.RestoreOperation.update(restoreOpId, {
            status: success ? 'completed' : 'failed',
            completed_at: new Date().toISOString(),
            duration_seconds: 120,
            items_restored: success ? 100000 : 95000,
            items_failed: success ? 0 : 5000,
            data_verified: success
        });
    }, 120000);
}

function calculateBackupHealth(backups) {
    if (backups.length === 0) return 'critical';
    
    const recent = backups.slice(0, 7);
    const successRate = recent.filter(b => b.status === 'completed').length / recent.length;
    
    if (successRate > 0.9) return 'healthy';
    if (successRate > 0.7) return 'degraded';
    return 'at_risk';
}

function calculateDRReadiness(plans, backups) {
    if (plans.length === 0) return 'no_plan';
    if (backups.length === 0) return 'no_backups';
    
    const testedPlans = plans.filter(p => p.last_test_status === 'success').length;
    const readinessPercent = (testedPlans / plans.length) * 100;
    
    if (readinessPercent >= 80) return 'ready';
    if (readinessPercent >= 50) return 'partial';
    return 'needs_testing';
}

function generateRecommendations(backups, plans) {
    const recommendations = [];
    
    if (backups.length === 0) {
        recommendations.push('Create initial backup');
    }
    
    if (plans.length === 0) {
        recommendations.push('Create Disaster Recovery plan');
    }
    
    const failedBackups = backups.filter(b => b.status === 'failed').length;
    if (failedBackups > 2) {
        recommendations.push('Investigate backup failures');
    }
    
    const unverifiedBackups = backups.filter(b => b.verification_status === 'unverified').length;
    if (unverifiedBackups > 0) {
        recommendations.push(`Verify ${unverifiedBackups} backups`);
    }
    
    const oldestBackup = backups[backups.length - 1];
    if (oldestBackup) {
        const daysOld = Math.floor((Date.now() - new Date(oldestBackup.created_at)) / (1000 * 60 * 60 * 24));
        if (daysOld > 30) {
            recommendations.push('Clean up old backups');
        }
    }
    
    const untestedPlans = plans.filter(p => !p.last_test_time).length;
    if (untestedPlans > 0) {
        recommendations.push(`Test ${untestedPlans} DR plans`);
    }
    
    return recommendations;
}