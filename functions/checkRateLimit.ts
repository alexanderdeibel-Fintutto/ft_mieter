import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 18: API Rate Limiting & Throttling System
 * Prüft und durchsetzt Rate Limits auf API-Endpoints
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,           // 'check', 'increment', 'reset', 'get_status', 'configure'
            organization_id,
            endpoint,
            limit_type = 'requests_per_minute',  // Default
            max_requests,
            ip_address,
            request_method
        } = await req.json();

        if (!action || !organization_id || !endpoint) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'check') {
            // Check ob Rate Limit überschritten ist
            const rateLimit = await base44.asServiceRole.entities.RateLimit.filter({
                organization_id: organization_id,
                user_id: user.id,
                endpoint: endpoint,
                limit_type: limit_type,
                is_active: true
            });

            if (rateLimit.length === 0) {
                // Keine Rate Limit konfiguriert
                return Response.json({
                    allowed: true,
                    reason: 'no_limit_configured'
                });
            }

            const limit = rateLimit[0];
            const now = new Date();

            // Check ob Zeitfenster abgelaufen ist
            if (new Date(limit.reset_at) < now) {
                // Reset counter
                await base44.asServiceRole.entities.RateLimit.update(limit.id, {
                    current_requests: 0,
                    reset_at: getNextResetTime(now, limit_type)
                });
                
                return Response.json({
                    allowed: true,
                    current: 0,
                    max: limit.max_requests,
                    reset_in_seconds: getSecondsUntilReset(limit_type)
                });
            }

            // Check ob Limit überschritten
            if (limit.current_requests >= limit.max_requests) {
                return Response.json({
                    allowed: false,
                    current: limit.current_requests,
                    max: limit.max_requests,
                    reset_at: limit.reset_at,
                    reset_in_seconds: Math.ceil((new Date(limit.reset_at) - now) / 1000)
                });
            }

            return Response.json({
                allowed: true,
                current: limit.current_requests,
                max: limit.max_requests,
                remaining: limit.max_requests - limit.current_requests,
                reset_at: limit.reset_at,
                reset_in_seconds: Math.ceil((new Date(limit.reset_at) - now) / 1000)
            });

        } else if (action === 'increment') {
            // Erhöhe Request Counter
            const rateLimit = await base44.asServiceRole.entities.RateLimit.filter({
                organization_id: organization_id,
                user_id: user.id,
                endpoint: endpoint,
                limit_type: limit_type,
                is_active: true
            });

            if (rateLimit.length === 0) {
                return Response.json({
                    incremented: false,
                    reason: 'no_limit_configured'
                });
            }

            const limit = rateLimit[0];
            const now = new Date();

            // Reset wenn nötig
            let currentCount = limit.current_requests;
            let resetAt = limit.reset_at;

            if (new Date(limit.reset_at) < now) {
                currentCount = 0;
                resetAt = getNextResetTime(now, limit_type);
            }

            currentCount++;

            // Log request
            await base44.asServiceRole.entities.RateLimitLog.create({
                organization_id: organization_id,
                user_id: user.id,
                endpoint: endpoint,
                request_count: currentCount,
                max_allowed: limit.max_requests,
                exceeded: currentCount > limit.max_requests,
                excess_requests: Math.max(0, currentCount - limit.max_requests),
                ip_address: ip_address,
                request_method: request_method,
                timestamp: now.toISOString()
            });

            // Update rate limit
            await base44.asServiceRole.entities.RateLimit.update(limit.id, {
                current_requests: currentCount,
                reset_at: resetAt,
                last_request_at: now.toISOString(),
                exceeded_count: currentCount > limit.max_requests ? (limit.exceeded_count || 0) + 1 : limit.exceeded_count
            });

            return Response.json({
                incremented: true,
                current: currentCount,
                max: limit.max_requests,
                exceeded: currentCount > limit.max_requests
            });

        } else if (action === 'reset') {
            // Manuelles Reset
            const rateLimit = await base44.asServiceRole.entities.RateLimit.filter({
                organization_id: organization_id,
                user_id: user.id,
                endpoint: endpoint
            });

            if (rateLimit.length > 0) {
                await base44.asServiceRole.entities.RateLimit.update(rateLimit[0].id, {
                    current_requests: 0,
                    reset_at: getNextResetTime(new Date(), limit_type),
                    exceeded_count: 0
                });
            }

            return Response.json({ reset: true });

        } else if (action === 'get_status') {
            // Zeige alle Rate Limits für Org
            const limits = await base44.asServiceRole.entities.RateLimit.filter({
                organization_id: organization_id,
                is_active: true
            });

            return Response.json({
                rate_limits: limits,
                total: limits.length
            });

        } else if (action === 'configure') {
            // Konfiguriere oder erstelle Rate Limit
            if (!max_requests) {
                return Response.json({ error: 'max_requests required' }, { status: 400 });
            }

            const existing = await base44.asServiceRole.entities.RateLimit.filter({
                organization_id: organization_id,
                user_id: user.id,
                endpoint: endpoint,
                limit_type: limit_type
            });

            if (existing.length > 0) {
                // Update
                await base44.asServiceRole.entities.RateLimit.update(existing[0].id, {
                    max_requests: max_requests
                });

                return Response.json({
                    configured: true,
                    action: 'updated'
                });
            } else {
                // Create
                const limit = await base44.asServiceRole.entities.RateLimit.create({
                    organization_id: organization_id,
                    user_id: user.id,
                    endpoint: endpoint,
                    limit_type: limit_type,
                    max_requests: max_requests,
                    reset_at: getNextResetTime(new Date(), limit_type)
                });

                return Response.json({
                    configured: true,
                    action: 'created',
                    rate_limit: limit
                });
            }
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Rate limit error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function getNextResetTime(now, limitType) {
    const next = new Date(now);

    if (limitType === 'requests_per_minute') {
        next.setSeconds(0);
        next.setMilliseconds(0);
        next.setMinutes(next.getMinutes() + 1);
    } else if (limitType === 'requests_per_hour') {
        next.setMinutes(0);
        next.setSeconds(0);
        next.setMilliseconds(0);
        next.setHours(next.getHours() + 1);
    } else if (limitType === 'requests_per_day') {
        next.setHours(0);
        next.setMinutes(0);
        next.setSeconds(0);
        next.setMilliseconds(0);
        next.setDate(next.getDate() + 1);
    }

    return next.toISOString();
}

function getSecondsUntilReset(limitType) {
    if (limitType === 'requests_per_minute') return 60;
    if (limitType === 'requests_per_hour') return 3600;
    if (limitType === 'requests_per_day') return 86400;
    return 60;
}