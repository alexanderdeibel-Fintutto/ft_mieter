import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 80: Advanced Activity & Audit Logging System
 * Verwaltet Benutzeraktivitäten, Audit-Logs und System-Events
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

        if (action === 'log_activity') {
            const { user_id, activity_type, resource_type, resource_id, action_description, ip_address, user_agent, metadata, status, duration_ms } = await req.json();

            if (!user_id || !activity_type) {
                return Response.json({ error: 'user_id, activity_type required' }, { status: 400 });
            }

            const activity_id = crypto.randomUUID();

            // Determine device type
            let device_type = 'unknown';
            if (user_agent) {
                if (/mobile|android|iphone|ipad/i.test(user_agent)) device_type = 'mobile';
                else if (/tablet|ipad/i.test(user_agent)) device_type = 'tablet';
                else device_type = 'desktop';
            }

            const log = await base44.asServiceRole.entities.ActivityLog.create({
                organization_id,
                activity_id,
                user_id,
                activity_type,
                resource_type: resource_type || '',
                resource_id: resource_id || '',
                action_description: action_description || '',
                ip_address: ip_address || '',
                user_agent: user_agent || '',
                device_type,
                status: status || 'success',
                metadata: metadata || {},
                duration_ms: duration_ms || 0,
                timestamp: new Date().toISOString()
            });

            return Response.json({ activity_logged: true, activity_id });

        } else if (action === 'log_audit') {
            const { user_id, entity_type, entity_id, action_name, old_values, new_values, reason, severity, ip_address } = await req.json();

            if (!user_id || !entity_type || !entity_id || !action_name) {
                return Response.json({ error: 'user_id, entity_type, entity_id, action_name required' }, { status: 400 });
            }

            const audit_id = crypto.randomUUID();

            // Calculate changes
            const changes = [];
            if (new_values && old_values) {
                for (const key of Object.keys(new_values)) {
                    if (old_values[key] !== new_values[key]) {
                        changes.push({
                            field: key,
                            old_value: old_values[key],
                            new_value: new_values[key]
                        });
                    }
                }
            }

            const audit = await base44.asServiceRole.entities.AuditLog.create({
                organization_id,
                audit_id,
                user_id,
                action: action_name,
                entity_type,
                entity_id,
                old_values: old_values || {},
                new_values: new_values || {},
                changes,
                reason: reason || '',
                severity: severity || 'info',
                ip_address: ip_address || '',
                timestamp: new Date().toISOString()
            });

            return Response.json({ audit_logged: true, audit_id });

        } else if (action === 'start_session') {
            const { user_id, ip_address, user_agent, device_name } = await req.json();

            if (!user_id || !ip_address) {
                return Response.json({ error: 'user_id, ip_address required' }, { status: 400 });
            }

            const session_id = crypto.randomUUID();
            const session_token = crypto.randomUUID();

            // Parse user agent
            let browser = 'Unknown';
            let os = 'Unknown';

            if (user_agent) {
                if (/Chrome/.test(user_agent)) browser = 'Chrome';
                else if (/Firefox/.test(user_agent)) browser = 'Firefox';
                else if (/Safari/.test(user_agent)) browser = 'Safari';
                else if (/Edge/.test(user_agent)) browser = 'Edge';

                if (/Windows/.test(user_agent)) os = 'Windows';
                else if (/Mac/.test(user_agent)) os = 'macOS';
                else if (/Linux/.test(user_agent)) os = 'Linux';
                else if (/Android/.test(user_agent)) os = 'Android';
                else if (/iPhone|iPad/.test(user_agent)) os = 'iOS';
            }

            const session = await base44.asServiceRole.entities.UserSession.create({
                organization_id,
                session_id,
                user_id,
                session_token,
                ip_address,
                device_name: device_name || 'Unknown Device',
                user_agent: user_agent || '',
                browser,
                os,
                location: 'Unknown',
                started_at: new Date().toISOString(),
                last_activity_at: new Date().toISOString(),
                is_active: true
            });

            return Response.json({ session_created: true, session_id });

        } else if (action === 'end_session') {
            const { session_id } = await req.json();

            if (!session_id) {
                return Response.json({ error: 'session_id required' }, { status: 400 });
            }

            const sessions = await base44.asServiceRole.entities.UserSession.filter({
                organization_id,
                id: session_id
            });

            if (sessions.length === 0) {
                return Response.json({ error: 'Session not found' }, { status: 404 });
            }

            const session = sessions[0];
            const endTime = new Date();
            const startTime = new Date(session.started_at);
            const durationSeconds = Math.round((endTime - startTime) / 1000);

            await base44.asServiceRole.entities.UserSession.update(session_id, {
                is_active: false,
                ended_at: endTime.toISOString(),
                session_duration_seconds: durationSeconds
            });

            return Response.json({ session_ended: true });

        } else if (action === 'record_system_event') {
            const { event_type, title, description, source, affected_component, severity, metadata } = await req.json();

            if (!event_type || !title) {
                return Response.json({ error: 'event_type, title required' }, { status: 400 });
            }

            const event_id = crypto.randomUUID();

            const event = await base44.asServiceRole.entities.SystemEvent.create({
                organization_id,
                event_id,
                event_type,
                severity: severity || 'low',
                title,
                description: description || '',
                source: source || '',
                affected_component: affected_component || '',
                status: 'open',
                metadata: metadata || {},
                timestamp: new Date().toISOString()
            });

            return Response.json({ event_recorded: true, event_id });

        } else if (action === 'get_dashboard_data') {
            const [activities, audits, sessions, events] = await Promise.all([
                base44.asServiceRole.entities.ActivityLog.filter({ organization_id }, '-timestamp', 100),
                base44.asServiceRole.entities.AuditLog.filter({ organization_id }, '-timestamp', 100),
                base44.asServiceRole.entities.UserSession.filter({ organization_id }, '-started_at', 50),
                base44.asServiceRole.entities.SystemEvent.filter({ organization_id }, '-timestamp', 50)
            ]);

            // Activity stats
            const activityStats = {
                total_activities: activities.length,
                successful_activities: activities.filter(a => a.status === 'success').length,
                failed_activities: activities.filter(a => a.status === 'failed').length,
                by_type: {}
            };

            activities.forEach(a => {
                activityStats.by_type[a.activity_type] = (activityStats.by_type[a.activity_type] || 0) + 1;
            });

            // Audit stats
            const auditStats = {
                total_audits: audits.length,
                by_severity: {},
                by_action: {}
            };

            audits.forEach(a => {
                auditStats.by_severity[a.severity] = (auditStats.by_severity[a.severity] || 0) + 1;
                auditStats.by_action[a.action] = (auditStats.by_action[a.action] || 0) + 1;
            });

            // Session stats
            const activeSessions = sessions.filter(s => s.is_active).length;
            const avgSessionDuration = sessions.length > 0
                ? Math.round(sessions.reduce((sum, s) => sum + (s.session_duration_seconds || 0), 0) / sessions.length)
                : 0;

            // Event stats
            const openEvents = events.filter(e => e.status === 'open').length;
            const criticalEvents = events.filter(e => e.severity === 'critical').length;

            return Response.json({
                activities: activities.slice(0, 30),
                audits: audits.slice(0, 30),
                sessions: sessions.slice(0, 20),
                events: events.slice(0, 20),
                activity_stats: activityStats,
                audit_stats: auditStats,
                session_stats: {
                    total_sessions: sessions.length,
                    active_sessions: activeSessions,
                    avg_duration_seconds: avgSessionDuration
                },
                event_stats: {
                    total_events: events.length,
                    open_events: openEvents,
                    critical_events: criticalEvents
                }
            });

        } else if (action === 'get_user_activity') {
            const { user_id } = await req.json();

            if (!user_id) {
                return Response.json({ error: 'user_id required' }, { status: 400 });
            }

            const [activities, sessions, audits] = await Promise.all([
                base44.asServiceRole.entities.ActivityLog.filter({ organization_id, user_id }, '-timestamp', 50),
                base44.asServiceRole.entities.UserSession.filter({ organization_id, user_id }, '-started_at', 20),
                base44.asServiceRole.entities.AuditLog.filter({ organization_id, user_id }, '-timestamp', 30)
            ]);

            return Response.json({
                activities,
                sessions,
                audits
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Activity audit engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});