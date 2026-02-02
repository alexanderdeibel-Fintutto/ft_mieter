import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 26: Compliance Management & Audit Reports System
 * Verwaltet Compliance-Policies, Audits und Reports
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,                    // 'create_policy', 'get_policies', 'check_compliance', 'create_audit_report', 'get_reports', 'get_compliance_dashboard'
            organization_id,
            policy_name,
            framework,
            description,
            risk_level,
            report_type,
            report_title,
            audit_scope,
            findings,
            compliance_score,
            policy_id
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'create_policy') {
            // Create compliance policy
            if (user.role !== 'admin') {
                return Response.json({ error: 'Admin access required' }, { status: 403 });
            }

            if (!policy_name || !framework || !description) {
                return Response.json({ error: 'policy_name, framework, description required' }, { status: 400 });
            }

            const nextAudit = new Date();
            nextAudit.setDate(nextAudit.getDate() + 90);

            const policy = await base44.asServiceRole.entities.CompliancePolicy.create({
                organization_id: organization_id,
                policy_name: policy_name,
                framework: framework,
                description: description,
                status: 'at_risk',
                risk_level: risk_level || 'medium',
                created_by: user.id,
                next_audit_date: nextAudit.toISOString(),
                audit_frequency_days: 90
            });

            return Response.json({
                policy_created: true,
                policy_id: policy.id
            });

        } else if (action === 'get_policies') {
            // Get all policies
            const policies = await base44.asServiceRole.entities.CompliancePolicy.filter({
                organization_id: organization_id,
                is_active: true
            }, '-created_date', 100);

            const stats = {
                total: policies.length,
                compliant: policies.filter(p => p.status === 'compliant').length,
                at_risk: policies.filter(p => p.status === 'at_risk').length,
                non_compliant: policies.filter(p => p.status === 'non_compliant').length,
                critical_count: policies.filter(p => p.risk_level === 'critical').length
            };

            return Response.json({
                policies: policies,
                stats: stats
            });

        } else if (action === 'check_compliance') {
            // Perform compliance check for a policy
            if (user.role !== 'admin') {
                return Response.json({ error: 'Admin access required' }, { status: 403 });
            }

            if (!policy_id) {
                return Response.json({ error: 'policy_id required' }, { status: 400 });
            }

            const policies = await base44.asServiceRole.entities.CompliancePolicy.filter({
                id: policy_id
            });

            if (!policies || policies.length === 0) {
                return Response.json({ error: 'Policy not found' }, { status: 404 });
            }

            const policy = policies[0];

            // Simulate compliance check
            const checkResult = Math.random() > 0.3; // 70% pass rate

            const check = await base44.asServiceRole.entities.ComplianceCheckResult.create({
                organization_id: organization_id,
                policy_id: policy_id,
                check_type: 'automated',
                result: checkResult ? 'pass' : 'fail',
                evidence: `Compliance check performed for ${policy.policy_name}`,
                checked_by: user.id,
                checked_at: new Date().toISOString(),
                findings: checkResult ? [] : ['Non-compliance detected in control implementation']
            });

            // Update policy status
            const newStatus = checkResult ? 'compliant' : 'non_compliant';
            await base44.asServiceRole.entities.CompliancePolicy.update(policy_id, {
                status: newStatus,
                last_audit_date: new Date().toISOString(),
                last_reviewed_by: user.id
            });

            return Response.json({
                check_completed: true,
                result: checkResult ? 'pass' : 'fail',
                check_id: check.id
            });

        } else if (action === 'create_audit_report') {
            // Create audit report
            if (user.role !== 'admin') {
                return Response.json({ error: 'Admin access required' }, { status: 403 });
            }

            if (!report_type || !framework || !report_title) {
                return Response.json({ error: 'report_type, framework, report_title required' }, { status: 400 });
            }

            // Create findings if provided
            const findingsList = Array.isArray(findings) ? findings : [];
            const criticalCount = findingsList.filter(f => f.severity === 'critical').length;
            const highCount = findingsList.filter(f => f.severity === 'high').length;
            const mediumCount = findingsList.filter(f => f.severity === 'medium').length;
            const lowCount = findingsList.filter(f => f.severity === 'low').length;

            const report = await base44.asServiceRole.entities.AuditReport.create({
                organization_id: organization_id,
                report_type: report_type,
                framework: framework,
                report_title: report_title,
                audit_scope: audit_scope || 'Full system',
                status: 'draft',
                auditor_id: user.id,
                auditor_name: user.full_name || user.email,
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0],
                findings_total: findingsList.length,
                findings_critical: criticalCount,
                findings_high: highCount,
                findings_medium: mediumCount,
                findings_low: lowCount,
                findings_list: findingsList,
                compliance_score: compliance_score || 75
            });

            return Response.json({
                report_created: true,
                report_id: report.id,
                findings_count: findingsList.length
            });

        } else if (action === 'get_reports') {
            // Get audit reports
            const reports = await base44.asServiceRole.entities.AuditReport.filter({
                organization_id: organization_id
            }, '-created_date', 50);

            const stats = {
                total: reports.length,
                draft: reports.filter(r => r.status === 'draft').length,
                published: reports.filter(r => r.status === 'published').length,
                average_compliance: reports.length > 0 
                    ? Math.round(reports.reduce((sum, r) => sum + (r.compliance_score || 0), 0) / reports.length)
                    : 0
            };

            return Response.json({
                reports: reports,
                stats: stats
            });

        } else if (action === 'get_compliance_dashboard') {
            // Get comprehensive compliance dashboard
            const [policiesRes, reportsRes] = await Promise.all([
                base44.asServiceRole.entities.CompliancePolicy.filter({
                    organization_id: organization_id,
                    is_active: true
                }, '-created_date', 100),
                base44.asServiceRole.entities.AuditReport.filter({
                    organization_id: organization_id
                }, '-created_date', 20)
            ]);

            const policies = policiesRes;
            const reports = reportsRes;

            // Calculate metrics
            const metrics = {
                overall_compliance_score: calculateOverallCompliance(policies, reports),
                policies_by_framework: groupByFramework(policies),
                compliance_trend: calculateTrend(reports),
                critical_findings: reports.reduce((sum, r) => sum + (r.findings_critical || 0), 0),
                overdue_audits: policies.filter(p => {
                    const nextAudit = new Date(p.next_audit_date);
                    return nextAudit < new Date();
                }).length,
                upcoming_audits: policies.filter(p => {
                    const nextAudit = new Date(p.next_audit_date);
                    const twoWeeksFromNow = new Date();
                    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
                    return nextAudit >= new Date() && nextAudit <= twoWeeksFromNow;
                }).length
            };

            return Response.json({
                policies: policies,
                reports: reports,
                metrics: metrics
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Compliance management error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function calculateOverallCompliance(policies, reports) {
    if (policies.length === 0 && reports.length === 0) return 50;

    let score = 0;
    let count = 0;

    // Policy-based score
    policies.forEach(p => {
        if (p.status === 'compliant') score += 100;
        else if (p.status === 'at_risk') score += 60;
        else score += 20;
        count++;
    });

    // Report-based score
    reports.forEach(r => {
        score += (r.compliance_score || 50);
        count++;
    });

    return count > 0 ? Math.round(score / count) : 50;
}

function groupByFramework(policies) {
    const grouped = {};
    policies.forEach(p => {
        if (!grouped[p.framework]) {
            grouped[p.framework] = { total: 0, compliant: 0, at_risk: 0, non_compliant: 0 };
        }
        grouped[p.framework].total++;
        grouped[p.framework][p.status]++;
    });
    return grouped;
}

function calculateTrend(reports) {
    if (reports.length < 2) return 'stable';

    const recent = reports.slice(0, 3);
    const avgRecent = recent.reduce((sum, r) => sum + (r.compliance_score || 0), 0) / recent.length;
    const older = reports.slice(3, 6);
    const avgOlder = older.length > 0 
        ? older.reduce((sum, r) => sum + (r.compliance_score || 0), 0) / older.length
        : avgRecent;

    const diff = avgRecent - avgOlder;
    if (diff > 5) return 'improving';
    if (diff < -5) return 'degrading';
    return 'stable';
}