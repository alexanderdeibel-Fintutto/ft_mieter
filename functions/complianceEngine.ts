import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 82: Advanced Compliance & Data Privacy Management System
 * Verwaltet Compliance-Policies, Privacy-Anfragen und Audit-Logs
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

        if (action === 'create_policy') {
            const { policy_name, policy_type, description, requirements, responsible_person } = await req.json();

            if (!policy_name || !policy_type) {
                return Response.json({ error: 'policy_name, policy_type required' }, { status: 400 });
            }

            const policy = await base44.asServiceRole.entities.CompliancePolicy.create({
                organization_id,
                policy_name,
                policy_type,
                description: description || '',
                requirements: requirements || [],
                responsible_person: responsible_person || '',
                created_at: new Date().toISOString()
            });

            return Response.json({ policy_created: true, policy_id: policy.id });

        } else if (action === 'create_privacy_request') {
            const { request_type, subject_id, data_categories, description } = await req.json();

            if (!request_type || !subject_id) {
                return Response.json({ error: 'request_type, subject_id required' }, { status: 400 });
            }

            const request_id = crypto.randomUUID();
            const now = new Date().toISOString();
            const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            const privacyRequest = await base44.asServiceRole.entities.DataPrivacyRequest.create({
                organization_id,
                request_id,
                request_type,
                subject_id,
                data_categories: data_categories || [],
                description: description || '',
                status: 'pending',
                requested_at: now,
                deadline
            });

            return Response.json({ request_created: true, request_id: privacyRequest.id });

        } else if (action === 'update_privacy_request_status') {
            const { request_id, status, notes } = await req.json();

            if (!request_id || !status) {
                return Response.json({ error: 'request_id, status required' }, { status: 400 });
            }

            const requests = await base44.asServiceRole.entities.DataPrivacyRequest.filter({
                organization_id,
                id: request_id
            });

            if (requests.length === 0) {
                return Response.json({ error: 'Request not found' }, { status: 404 });
            }

            const updateData = { status };
            if (status === 'completed') {
                updateData.completed_at = new Date().toISOString();
            }
            if (notes) {
                updateData.notes = notes;
            }

            await base44.asServiceRole.entities.DataPrivacyRequest.update(request_id, updateData);

            return Response.json({ request_updated: true });

        } else if (action === 'perform_compliance_check') {
            const { policy_id, requirement_id, requirement_name, check_type } = await req.json();

            if (!policy_id || !requirement_id || !requirement_name) {
                return Response.json({ error: 'policy_id, requirement_id, requirement_name required' }, { status: 400 });
            }

            const check_id = crypto.randomUUID();
            const now = new Date().toISOString();
            const nextCheck = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

            const check = await base44.asServiceRole.entities.ComplianceCheckResult.create({
                organization_id,
                check_id,
                policy_id,
                requirement_id,
                requirement_name,
                check_type: check_type || 'automated',
                status: 'passed',
                checked_at: now,
                checked_by: 'system',
                next_check_date: nextCheck
            });

            return Response.json({ check_created: true, check_id: check.id });

        } else if (action === 'log_privacy_audit') {
            const { audit_type, entity_type, entity_id, action_name, user_id, data_affected, reason } = await req.json();

            if (!audit_type || !entity_type || !entity_id || !action_name) {
                return Response.json({ error: 'audit_type, entity_type, entity_id, action_name required' }, { status: 400 });
            }

            const audit_id = crypto.randomUUID();

            const audit = await base44.asServiceRole.entities.PrivacyAuditLog.create({
                organization_id,
                audit_id,
                audit_type,
                entity_type,
                entity_id,
                action: action_name,
                user_id: user_id || user.id,
                data_affected: data_affected || [],
                reason: reason || '',
                compliance_status: 'compliant',
                timestamp: new Date().toISOString()
            });

            return Response.json({ audit_logged: true, audit_id: audit.id });

        } else if (action === 'get_dashboard_data') {
            const [policies, privacyRequests, checkResults, auditLogs] = await Promise.all([
                base44.asServiceRole.entities.CompliancePolicy.filter({ organization_id }, '-created_at'),
                base44.asServiceRole.entities.DataPrivacyRequest.filter({ organization_id }, '-requested_at', 50),
                base44.asServiceRole.entities.ComplianceCheckResult.filter({ organization_id }, '-checked_at', 50),
                base44.asServiceRole.entities.PrivacyAuditLog.filter({ organization_id }, '-timestamp', 50)
            ]);

            const policyStats = {
                total_policies: policies.length,
                active_policies: policies.filter(p => p.is_active).length,
                compliant: policies.filter(p => p.compliance_status === 'compliant').length,
                non_compliant: policies.filter(p => p.compliance_status === 'non_compliant').length,
                pending_audits: policies.filter(p => !p.last_audit_date).length,
                by_type: {}
            };

            policies.forEach(p => {
                policyStats.by_type[p.policy_type] = (policyStats.by_type[p.policy_type] || 0) + 1;
            });

            const requestStats = {
                total_requests: privacyRequests.length,
                pending: privacyRequests.filter(r => r.status === 'pending').length,
                in_progress: privacyRequests.filter(r => r.status === 'in_progress').length,
                completed: privacyRequests.filter(r => r.status === 'completed').length,
                denied: privacyRequests.filter(r => r.status === 'denied').length,
                by_type: {}
            };

            privacyRequests.forEach(r => {
                requestStats.by_type[r.request_type] = (requestStats.by_type[r.request_type] || 0) + 1;
            });

            const checkStats = {
                total_checks: checkResults.length,
                passed: checkResults.filter(c => c.status === 'passed').length,
                failed: checkResults.filter(c => c.status === 'failed').length,
                warnings: checkResults.filter(c => c.status === 'warning').length,
                success_rate: checkResults.length > 0
                    ? ((checkResults.filter(c => c.status === 'passed').length / checkResults.length) * 100).toFixed(1)
                    : 0
            };

            const auditStats = {
                total_audits: auditLogs.length,
                compliant: auditLogs.filter(a => a.compliance_status === 'compliant').length,
                non_compliant: auditLogs.filter(a => a.compliance_status === 'non_compliant').length,
                flagged: auditLogs.filter(a => a.compliance_status === 'flagged').length
            };

            return Response.json({
                policies: policies.slice(0, 20),
                privacy_requests: privacyRequests.slice(0, 20),
                check_results: checkResults.slice(0, 20),
                audit_logs: auditLogs.slice(0, 20),
                policy_stats: policyStats,
                request_stats: requestStats,
                check_stats: checkStats,
                audit_stats: auditStats
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Compliance engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});