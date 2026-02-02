import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 73: Advanced Rate Limiting & Quota Management System
 * Verwaltet Rate-Limiting-Policies, Quotas und deren Nutzung
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

        if (action === 'create_rate_limit_policy') {
            const { policy_name, policy_type, target_identifier, requests_per_window, window_size_seconds, burst_size, strategy, action_on_limit } = await req.json();

            if (!policy_name || !policy_type) {
                return Response.json({ error: 'policy_name, policy_type required' }, { status: 400 });
            }

            const policy = await base44.asServiceRole.entities.RateLimitPolicy.create({
                organization_id,
                policy_name,
                policy_type,
                target_identifier: target_identifier || '',
                requests_per_window: requests_per_window || 1000,
                window_size_seconds: window_size_seconds || 60,
                burst_size: burst_size || 0,
                strategy: strategy || 'token_bucket',
                action_on_limit: action_on_limit || 'block'
            });

            return Response.json({ policy_created: true, policy_id: policy.id });

        } else if (action === 'update_rate_limit_policy') {
            const { policy_id, requests_per_window, action_on_limit, is_active } = await req.json();

            if (!policy_id) {
                return Response.json({ error: 'policy_id required' }, { status: 400 });
            }

            const updates = {};
            if (requests_per_window !== undefined) updates.requests_per_window = requests_per_window;
            if (action_on_limit) updates.action_on_limit = action_on_limit;
            if (is_active !== undefined) updates.is_active = is_active;

            await base44.asServiceRole.entities.RateLimitPolicy.update(policy_id, updates);

            return Response.json({ policy_updated: true });

        } else if (action === 'check_rate_limit') {
            const { policy_id, identifier, increment } = await req.json();

            if (!policy_id || !identifier) {
                return Response.json({ error: 'policy_id, identifier required' }, { status: 400 });
            }

            const policies = await base44.asServiceRole.entities.RateLimitPolicy.filter({
                organization_id,
                id: policy_id
            });

            if (policies.length === 0) {
                return Response.json({ error: 'Policy not found' }, { status: 404 });
            }

            const policy = policies[0];
            const incr = increment || 1;

            if (!policy.is_active) {
                return Response.json({ allowed: true, reason: 'policy_inactive' });
            }

            const now = new Date();
            const windowStart = new Date(now.getTime() - policy.window_size_seconds * 1000);

            const allowed = (policy.allowed_count || 0) + incr <= policy.requests_per_window;

            if (allowed) {
                await base44.asServiceRole.entities.RateLimitPolicy.update(policy_id, {
                    allowed_count: (policy.allowed_count || 0) + incr
                });
                return Response.json({
                    allowed: true,
                    remaining: policy.requests_per_window - ((policy.allowed_count || 0) + incr),
                    reset_at: new Date(now.getTime() + policy.window_size_seconds * 1000).toISOString()
                });
            } else {
                await base44.asServiceRole.entities.RateLimitPolicy.update(policy_id, {
                    blocked_count: (policy.blocked_count || 0) + 1
                });
                return Response.json({
                    allowed: false,
                    action: policy.action_on_limit,
                    reset_at: new Date(now.getTime() + policy.window_size_seconds * 1000).toISOString(),
                    retry_after: policy.window_size_seconds
                });
            }

        } else if (action === 'create_quota_limit') {
            const { quota_name, quota_type, subject_type, subject_id, limit_value, unit, period, is_hard_limit, alert_threshold_percentage } = await req.json();

            if (!quota_name || !quota_type || !limit_value || !unit) {
                return Response.json({ error: 'quota_name, quota_type, limit_value, unit required' }, { status: 400 });
            }

            const quota = await base44.asServiceRole.entities.QuotaLimit.create({
                organization_id,
                quota_name,
                quota_type,
                subject_type: subject_type || 'organization',
                subject_id: subject_id || organization_id,
                limit_value,
                unit,
                period: period || 'monthly',
                renewal_date: calculateRenewalDate(period || 'monthly'),
                is_hard_limit: is_hard_limit !== undefined ? is_hard_limit : true,
                alert_threshold_percentage: alert_threshold_percentage || 80
            });

            return Response.json({ quota_created: true, quota_id: quota.id });

        } else if (action === 'update_quota_usage') {
            const { quota_id, subject_id, usage_increment } = await req.json();

            if (!quota_id || !subject_id || usage_increment === undefined) {
                return Response.json({ error: 'quota_id, subject_id, usage_increment required' }, { status: 400 });
            }

            const quotas = await base44.asServiceRole.entities.QuotaLimit.filter({
                organization_id,
                id: quota_id
            });

            if (quotas.length === 0) {
                return Response.json({ error: 'Quota not found' }, { status: 404 });
            }

            const quota = quotas[0];
            const now = new Date();

            let usages = await base44.asServiceRole.entities.QuotaUsage.filter({
                organization_id,
                quota_id,
                subject_id
            });

            let usage;
            if (usages.length === 0) {
                const period_start = calculatePeriodStart(quota.period);
                const period_end = calculatePeriodEnd(quota.period);

                usage = await base44.asServiceRole.entities.QuotaUsage.create({
                    organization_id,
                    quota_id,
                    subject_id,
                    period_start,
                    period_end,
                    usage_value: usage_increment,
                    limit_value: quota.limit_value,
                    usage_percentage: Math.round((usage_increment / quota.limit_value) * 100),
                    status: usage_increment >= quota.limit_value ? 'exceeded' : 'within_limit',
                    last_updated_at: now.toISOString()
                });
            } else {
                usage = usages[0];
                const newUsage = (usage.usage_value || 0) + usage_increment;
                const usage_percentage = Math.round((newUsage / quota.limit_value) * 100);
                let status = 'within_limit';

                if (newUsage >= quota.limit_value) {
                    status = quota.is_hard_limit ? 'blocked' : 'exceeded';
                } else if (usage_percentage >= quota.alert_threshold_percentage) {
                    status = 'near_limit';
                }

                await base44.asServiceRole.entities.QuotaUsage.update(usage.id, {
                    usage_value: newUsage,
                    usage_percentage,
                    status,
                    exceeded_by: Math.max(0, newUsage - quota.limit_value),
                    last_updated_at: now.toISOString()
                });

                usage = { ...usage, usage_value: newUsage, usage_percentage, status };
            }

            return Response.json({
                usage_updated: true,
                usage_value: usage.usage_value,
                limit_value: quota.limit_value,
                usage_percentage: usage.usage_percentage,
                status: usage.status,
                allowed: usage.status !== 'blocked'
            });

        } else if (action === 'get_policies') {
            const { policy_type, is_active } = await req.json();

            let filter = { organization_id };
            if (policy_type) filter.policy_type = policy_type;
            if (is_active !== undefined) filter.is_active = is_active;

            const policies = await base44.asServiceRole.entities.RateLimitPolicy.filter(filter, '-created_date');

            return Response.json({ policies });

        } else if (action === 'get_quotas') {
            const { quota_type, subject_type, subject_id } = await req.json();

            let filter = { organization_id };
            if (quota_type) filter.quota_type = quota_type;
            if (subject_type) filter.subject_type = subject_type;
            if (subject_id) filter.subject_id = subject_id;

            const quotas = await base44.asServiceRole.entities.QuotaLimit.filter(filter, '-created_date');

            return Response.json({ quotas });

        } else if (action === 'get_usage') {
            const { quota_id, subject_id, status } = await req.json();

            let filter = { organization_id };
            if (quota_id) filter.quota_id = quota_id;
            if (subject_id) filter.subject_id = subject_id;
            if (status) filter.status = status;

            const usages = await base44.asServiceRole.entities.QuotaUsage.filter(filter, '-last_updated_at', 100);

            return Response.json({ usages });

        } else if (action === 'get_dashboard_data') {
            const [policies, quotas, usages] = await Promise.all([
                base44.asServiceRole.entities.RateLimitPolicy.filter({ organization_id }, '-created_date'),
                base44.asServiceRole.entities.QuotaLimit.filter({ organization_id }, '-created_date'),
                base44.asServiceRole.entities.QuotaUsage.filter({ organization_id }, '-last_updated_at', 100)
            ]);

            const policyStats = {
                total_policies: policies.length,
                active_policies: policies.filter(p => p.is_active).length,
                total_allowed: policies.reduce((sum, p) => sum + (p.allowed_count || 0), 0),
                total_blocked: policies.reduce((sum, p) => sum + (p.blocked_count || 0), 0),
                block_rate: policies.length > 0 
                    ? Math.round((policies.reduce((sum, p) => sum + (p.blocked_count || 0), 0) / 
                        (policies.reduce((sum, p) => sum + (p.allowed_count || 0), 0) + 
                         policies.reduce((sum, p) => sum + (p.blocked_count || 0), 0))) * 100)
                    : 0
            };

            const quotaStats = {
                total_quotas: quotas.length,
                active_quotas: quotas.filter(q => q.is_active).length,
                exceeded_quotas: usages.filter(u => u.status === 'exceeded' || u.status === 'blocked').length,
                near_limit_quotas: usages.filter(u => u.status === 'near_limit').length
            };

            const usageByStatus = {};
            usages.forEach(u => {
                usageByStatus[u.status] = (usageByStatus[u.status] || 0) + 1;
            });

            return Response.json({
                policies: policies.slice(0, 30),
                quotas: quotas.slice(0, 30),
                usages: usages.slice(0, 30),
                policy_stats: policyStats,
                quota_stats: quotaStats,
                usage_by_status: usageByStatus
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Rate limiting quota engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function calculateRenewalDate(period) {
    const now = new Date();
    const renewal = new Date(now);

    switch (period) {
        case 'hourly':
            renewal.setHours(renewal.getHours() + 1);
            break;
        case 'daily':
            renewal.setDate(renewal.getDate() + 1);
            break;
        case 'weekly':
            renewal.setDate(renewal.getDate() + 7);
            break;
        case 'monthly':
            renewal.setMonth(renewal.getMonth() + 1);
            break;
        case 'yearly':
            renewal.setFullYear(renewal.getFullYear() + 1);
            break;
    }

    return renewal.toISOString();
}

function calculatePeriodStart(period) {
    const now = new Date();

    switch (period) {
        case 'hourly':
            return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).toISOString();
        case 'daily':
            return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        case 'weekly':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            return new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()).toISOString();
        case 'monthly':
            return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        case 'yearly':
            return new Date(now.getFullYear(), 0, 1).toISOString();
        default:
            return now.toISOString();
    }
}

function calculatePeriodEnd(period) {
    const now = new Date();
    const end = new Date(now);

    switch (period) {
        case 'hourly':
            end.setHours(end.getHours() + 1);
            break;
        case 'daily':
            end.setDate(end.getDate() + 1);
            break;
        case 'weekly':
            end.setDate(end.getDate() + 7 - end.getDay());
            break;
        case 'monthly':
            end.setMonth(end.getMonth() + 1);
            end.setDate(0);
            break;
        case 'yearly':
            end.setFullYear(end.getFullYear() + 1);
            end.setMonth(0);
            end.setDate(0);
            break;
    }

    return end.toISOString();
}