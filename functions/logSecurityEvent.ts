import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 20: Audit Logging & Security Event Tracking System
 * Logged alle sicherheitsrelevanten Events und Aktivitäten
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        const {
            action,              // 'log_event', 'log_audit', 'get_events', 'acknowledge', 'analyze'
            organization_id,
            event_type,
            severity,
            user_id,
            ip_address,
            location,
            device_info,
            description,
            affected_resource,
            request_details,
            actions_taken = [],
            entity_type,
            entity_id,
            changes,
            api_key_id,
            session_id
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'log_event') {
            // Log Security Event
            if (!event_type || !severity || !ip_address) {
                return Response.json({ error: 'Missing required fields for event' }, { status: 400 });
            }

            const securityEvent = await base44.asServiceRole.entities.SecurityEvent.create({
                organization_id: organization_id,
                event_type: event_type,
                severity: severity,
                user_id: user_id,
                ip_address: ip_address,
                location: location,
                device_info: device_info,
                description: description,
                affected_resource: affected_resource,
                request_details: request_details || {},
                actions_taken: actions_taken,
                timestamp: new Date().toISOString()
            });

            // Trigger automatic responses für critical events
            if (severity === 'critical') {
                await handleCriticalEvent(base44, organization_id, securityEvent);
            }

            return Response.json({
                event_logged: true,
                event_id: securityEvent.id,
                severity: severity
            });

        } else if (action === 'log_audit') {
            // Log Audit Event
            if (!entity_type || !entity_id) {
                return Response.json({ error: 'Missing entity info' }, { status: 400 });
            }

            const auditLog = await base44.asServiceRole.entities.AuditLog.create({
                organization_id: organization_id,
                user_id: user?.id || 'system',
                action: action || 'update',
                entity_type: entity_type,
                entity_id: entity_id,
                changes: changes,
                ip_address: ip_address,
                user_agent: device_info?.user_agent,
                api_key_id: api_key_id,
                session_id: session_id,
                timestamp: new Date().toISOString(),
                status: 'success',
                status_code: 200
            });

            return Response.json({
                audit_logged: true,
                audit_id: auditLog.id
            });

        } else if (action === 'get_events') {
            // Get Security Events
            const filters = {
                organization_id: organization_id
            };
            if (event_type) filters.event_type = event_type;
            if (severity) filters.severity = severity;
            if (user_id) filters.user_id = user_id;

            const events = await base44.asServiceRole.entities.SecurityEvent.filter(
                filters,
                '-timestamp',
                100
            );

            return Response.json({
                events: events,
                total: events.length
            });

        } else if (action === 'acknowledge') {
            // Acknowledge Security Event
            if (!user || user.role !== 'admin') {
                return Response.json({ error: 'Admin access required' }, { status: 403 });
            }

            if (!event_type) {
                return Response.json({ error: 'event_type required' }, { status: 400 });
            }

            const events = await base44.asServiceRole.entities.SecurityEvent.filter({
                organization_id: organization_id,
                event_type: event_type
            });

            if (events.length > 0) {
                await base44.asServiceRole.entities.SecurityEvent.update(events[0].id, {
                    acknowledged: true,
                    acknowledged_by: user.id,
                    acknowledged_at: new Date().toISOString()
                });
            }

            return Response.json({ acknowledged: true });

        } else if (action === 'analyze') {
            // Analyze Security Trends
            const events = await base44.asServiceRole.entities.SecurityEvent.filter({
                organization_id: organization_id
            }, '-timestamp', 500);

            // Calculate stats
            const stats = {
                total_events: events.length,
                by_severity: {
                    critical: events.filter(e => e.severity === 'critical').length,
                    high: events.filter(e => e.severity === 'high').length,
                    medium: events.filter(e => e.severity === 'medium').length,
                    low: events.filter(e => e.severity === 'low').length
                },
                by_type: {},
                unacknowledged_critical: events.filter(e => e.severity === 'critical' && !e.acknowledged).length,
                top_ip_addresses: getTopItems(events.map(e => e.ip_address), 5),
                last_24h: events.filter(e => {
                    const eventTime = new Date(e.timestamp);
                    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    return eventTime > dayAgo;
                }).length
            };

            // Count by type
            for (const event of events) {
                stats.by_type[event.event_type] = (stats.by_type[event.event_type] || 0) + 1;
            }

            return Response.json({
                analysis: stats,
                events: events.slice(0, 50)
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Security logging error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function handleCriticalEvent(base44, organizationId, event) {
    // Automatische Reaktion auf kritische Events
    
    // 1. Notify admins
    const admins = await base44.asServiceRole.entities.User.filter({
        role: 'admin'
    });

    for (const admin of admins) {
        await base44.asServiceRole.entities.InAppNotification.create({
            user_id: admin.id,
            title: '🚨 Critical Security Event',
            body: event.description || `${event.event_type} from ${event.ip_address}`,
            priority: 'urgent',
            action_url: `/admin/security`
        });
    }

    // 2. Block IP if suspicious activity
    if (event.event_type === 'brute_force_attempt' || 
        event.event_type === 'multiple_failed_attempts') {
        // Could integrate with IP blocking system
    }

    return true;
}

function getTopItems(items, limit) {
    const counts = {};
    for (const item of items) {
        if (item) counts[item] = (counts[item] || 0) + 1;
    }
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([item, count]) => ({ item, count }));
}