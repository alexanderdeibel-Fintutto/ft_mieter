import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 89: Advanced Rate Limiting & Quota Management System
 * Verwaltet Rate Limits, Quotas und zugehörige Events
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

        if (action === 'create_rate_limit') {
            const { bucket_name, identifier, limit_type, requests_limit, window_seconds, strategy } = await req.json();

            if (!bucket_name || !identifier || !limit_type) {
                return Response.json({ error: 'bucket_name, identifier, limit_type required' }, { status: 400 });
            }

            const bucket_id = crypto.randomUUID();
            const now = new Date();

            const bucket = await base44.asServiceRole.entities.RateLimitBucket.create({
                organization_id,
                bucket_id,
                bucket_name,
                identifier,
                limit_type,
                requests_limit: requests_limit || 1000,
                window_seconds: window_seconds || 3600,
                strategy: strategy || 'token_bucket',
                current_tokens: requests_limit || 1000,
                last_refill_time: now.toISOString(),
                reset_time: new Date(now.getTime() + (window_seconds || 3600) * 1000).toISOString(),
                created_at: now.toISOString()
            });

            return Response.json({ bucket_created: true, bucket_id: bucket.id });

        } else if (action === 'check_rate_limit') {
            const { identifier, requests_to_make } = await req.json();

            if (!identifier) {
                return Response.json({ error: 'identifier required' }, { status: 400 });
            }

            const buckets = await base44.asServiceRole.entities.RateLimitBucket.filter({
                organization_id,
                identifier
            }, '-last_refill_time', 1);

            if (buckets.length === 0) {
                return Response.json({ allowed: true, reason: 'No limit configured' });
            }

            const bucket = buckets[0];
            const now = new Date();
            const requestCount = requests_to_make || 1;

            let allowed = true;
            let tokens_available = bucket.current_tokens || bucket.requests_limit;

            if (bucket.is_blocked && bucket.blocked_until && new Date(bucket.blocked_until) > now) {
                allowed = false;
            } else if (tokens_available >= requestCount) {
                tokens_available -= requestCount;
                allowed = true;
            } else {
                allowed = false;
            }

            if (allowed) {
                await base44.asServiceRole.entities.RateLimitBucket.update(bucket.id, {
                    current_tokens: tokens_available,
                    requests_made: (bucket.requests_made || 0) + requestCount
                });
            } else {
                const eventId = crypto.randomUUID();
                await base44.asServiceRole.entities.RateLimitEvent.create({
                    organization_id,
                    event_id: eventId,
                    event_type: 'rate_limit_exceeded',
                    bucket_id: bucket.id,
                    identifier,
                    limit_value: bucket.requests_limit,
                    current_value: bucket.requests_made || 0,
                    exceeded_by: requestCount - tokens_available,
                    action_taken: 'blocked',
                    severity: 'error',
                    timestamp: now.toISOString()
                });

                await base44.asServiceRole.entities.RateLimitBucket.update(bucket.id, {
                    is_blocked: true,
                    blocked_until: new Date(now.getTime() + 60000).toISOString()
                });
            }

            return Response.json({ allowed, tokens_remaining: Math.max(0, tokens_available) });

        } else if (action === 'create_quota') {
            const { quota_name, subject_id, subject_type, quota_type, limit, unit, renewal_period } = await req.json();

            if (!quota_name || !subject_id || !subject_type || !quota_type || !limit) {
                return Response.json({ error: 'quota_name, subject_id, subject_type, quota_type, limit required' }, { status: 400 });
            }

            const quota_id = crypto.randomUUID();
            const now = new Date();
            const renewalDate = new Date(now);
            
            if (renewal_period === 'daily') renewalDate.setDate(renewalDate.getDate() + 1);
            else if (renewal_period === 'weekly') renewalDate.setDate(renewalDate.getDate() + 7);
            else if (renewal_period === 'yearly') renewalDate.setFullYear(renewalDate.getFullYear() + 1);
            else renewalDate.setMonth(renewalDate.getMonth() + 1);

            const quota = await base44.asServiceRole.entities.QuotaLimit.create({
                organization_id,
                quota_id,
                quota_name,
                subject_id,
                subject_type,
                quota_type,
                limit,
                unit: unit || '',
                usage: 0,
                usage_percentage: 0,
                renewal_period: renewal_period || 'monthly',
                renewal_date: renewalDate.toISOString(),
                status: 'active',
                created_at: now.toISOString()
            });

            return Response.json({ quota_created: true, quota_id: quota.id });

        } else if (action === 'update_quota_usage') {
            const { quota_id, usage_delta } = await req.json();

            if (!quota_id || usage_delta === undefined) {
                return Response.json({ error: 'quota_id, usage_delta required' }, { status: 400 });
            }

            const quotas = await base44.asServiceRole.entities.QuotaLimit.filter({
                organization_id,
                id: quota_id
            });

            if (quotas.length === 0) {
                return Response.json({ error: 'Quota not found' }, { status: 404 });
            }

            const quota = quotas[0];
            const newUsage = (quota.usage || 0) + usage_delta;
            const usagePercent = ((newUsage / quota.limit) * 100).toFixed(2);

            let newStatus = 'active';
            let eventType = null;

            if (usagePercent >= 100) {
                newStatus = 'exceeded';
                eventType = 'quota_exceeded';
            } else if (usagePercent >= quota.warning_threshold_percent) {
                newStatus = 'warning';
                eventType = 'warning_threshold';
            }

            const updateData = {
                usage: newUsage,
                usage_percentage: parseFloat(usagePercent),
                status: newStatus
            };

            await base44.asServiceRole.entities.QuotaLimit.update(quota_id, updateData);

            if (eventType) {
                const eventId = crypto.randomUUID();
                await base44.asServiceRole.entities.RateLimitEvent.create({
                    organization_id,
                    event_id: eventId,
                    event_type: eventType,
                    quota_id,
                    identifier: quota.subject_id,
                    resource: quota.quota_type,
                    limit_value: quota.limit,
                    current_value: newUsage,
                    exceeded_by: Math.max(0, newUsage - quota.limit),
                    action_taken: newStatus === 'exceeded' && quota.hard_limit ? 'blocked' : 'notified',
                    severity: newStatus === 'exceeded' ? 'critical' : 'warning',
                    timestamp: new Date().toISOString()
                });
            }

            return Response.json({ quota_updated: true, new_usage: newUsage, usage_percentage: usagePercent });

        } else if (action === 'get_dashboard_data') {
            const [buckets, quotas, events] = await Promise.all([
                base44.asServiceRole.entities.RateLimitBucket.filter({ organization_id }, '-created_at', 50),
                base44.asServiceRole.entities.QuotaLimit.filter({ organization_id }, '-created_at', 50),
                base44.asServiceRole.entities.RateLimitEvent.filter({ organization_id }, '-timestamp', 100)
            ]);

            const bucketStats = {
                total_buckets: buckets.length,
                active_buckets: buckets.filter(b => !b.is_blocked).length,
                blocked_buckets: buckets.filter(b => b.is_blocked).length,
                by_type: {},
                total_requests: buckets.reduce((sum, b) => sum + (b.requests_made || 0), 0)
            };

            buckets.forEach(b => {
                bucketStats.by_type[b.limit_type] = (bucketStats.by_type[b.limit_type] || 0) + 1;
            });

            const quotaStats = {
                total_quotas: quotas.length,
                active_quotas: quotas.filter(q => q.status === 'active').length,
                warning_quotas: quotas.filter(q => q.status === 'warning').length,
                exceeded_quotas: quotas.filter(q => q.status === 'exceeded').length,
                by_type: {},
                avg_usage_percent: 0
            };

            quotas.forEach(q => {
                quotaStats.by_type[q.quota_type] = (quotaStats.by_type[q.quota_type] || 0) + 1;
            });

            if (quotas.length > 0) {
                quotaStats.avg_usage_percent = (quotas.reduce((sum, q) => sum + (q.usage_percentage || 0), 0) / quotas.length).toFixed(2);
            }

            const eventStats = {
                total_events: events.length,
                rate_limit_exceeded: events.filter(e => e.event_type === 'rate_limit_exceeded').length,
                quota_exceeded: events.filter(e => e.event_type === 'quota_exceeded').length,
                warnings: events.filter(e => e.event_type === 'warning_threshold').length,
                by_severity: {}
            };

            events.forEach(e => {
                eventStats.by_severity[e.severity] = (eventStats.by_severity[e.severity] || 0) + 1;
            });

            return Response.json({
                buckets: buckets.slice(0, 30),
                quotas: quotas.slice(0, 30),
                events: events.slice(0, 50),
                bucket_stats: bucketStats,
                quota_stats: quotaStats,
                event_stats: eventStats
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Rate limit quota engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});