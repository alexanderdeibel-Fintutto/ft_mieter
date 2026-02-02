import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 25: Incident Management & Response System
 * Verwaltet Incidents, Responses und Post-Mortem Reviews
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,                    // 'create_incident', 'get_incidents', 'update_incident', 'create_response', 'get_timeline', 'acknowledge_incident', 'resolve_incident', 'get_statistics'
            organization_id,
            incident_id,
            title,
            description,
            severity,
            category,
            affected_systems = [],
            response_type,
            response_description,
            root_cause,
            resolution,
            lessons_learned
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'create_incident') {
            // Create new incident
            if (!title || !severity || !category) {
                return Response.json({ error: 'title, severity, category required' }, { status: 400 });
            }

            const incidentNum = Math.floor(Math.random() * 10000);
            const incidentIdGenerated = `INC-${new Date().getFullYear()}-${String(incidentNum).padStart(4, '0')}`;

            const incident = await base44.asServiceRole.entities.Incident.create({
                organization_id: organization_id,
                incident_id: incidentIdGenerated,
                title: title,
                description: description || '',
                severity: severity,
                category: category,
                status: 'open',
                affected_systems: affected_systems,
                detected_at: new Date().toISOString(),
                reported_by: user.id,
                opened_at: new Date().toISOString()
            });

            // Create initial timeline entry
            await base44.asServiceRole.entities.IncidentTimeline.create({
                organization_id: organization_id,
                incident_id: incident.id,
                event_type: 'detected',
                title: `Incident ${incidentIdGenerated} detected`,
                description: title,
                actor_id: user.id,
                severity_level: mapSeverityToLevel(severity),
                timestamp: new Date().toISOString(),
                sequence_number: 1
            });

            // Create security event
            await base44.asServiceRole.entities.SecurityEvent.create({
                organization_id: organization_id,
                event_type: 'incident_created',
                severity: mapSeverityToSecuritySeverity(severity),
                user_id: user.id,
                ip_address: 'system',
                description: `Incident ${incidentIdGenerated}: ${title}`,
                timestamp: new Date().toISOString()
            });

            // Send notifications
            await sendIncidentNotification(base44, organization_id, incidentIdGenerated, title, severity);

            return Response.json({
                incident_created: true,
                incident_id: incident.id,
                incident_number: incidentIdGenerated,
                severity: severity
            });

        } else if (action === 'get_incidents') {
            // Get all incidents
            const incidents = await base44.asServiceRole.entities.Incident.filter({
                organization_id: organization_id
            }, '-detected_at', 100);

            const stats = {
                total: incidents.length,
                open: incidents.filter(i => i.status === 'open' || i.status === 'investigating').length,
                critical: incidents.filter(i => i.severity === 'critical').length,
                average_mttr_minutes: calculateAverageMTTR(incidents)
            };

            return Response.json({
                incidents: incidents,
                stats: stats
            });

        } else if (action === 'update_incident') {
            // Update incident (assign, acknowledge, resolve, close)
            if (!incident_id) {
                return Response.json({ error: 'incident_id required' }, { status: 400 });
            }

            const incident = await base44.asServiceRole.entities.Incident.filter({
                id: incident_id
            });

            if (!incident || incident.length === 0) {
                return Response.json({ error: 'Incident not found' }, { status: 404 });
            }

            const updates = {};
            const timelineEvent = {
                organization_id: organization_id,
                incident_id: incident_id,
                actor_id: user.id,
                timestamp: new Date().toISOString(),
                sequence_number: (incident[0].sequence_number || 0) + 1
            };

            if (severity) {
                updates.severity = severity;
            }

            if (root_cause) {
                updates.root_cause = root_cause;
                timelineEvent.event_type = 'cause_identified';
                timelineEvent.title = 'Root cause identified';
                timelineEvent.description = root_cause;
            }

            if (resolution) {
                updates.status = 'resolved';
                updates.resolution = resolution;
                updates.resolved_at = new Date().toISOString();
                updates.time_to_resolve_minutes = incident[0].detected_at 
                    ? Math.floor((new Date() - new Date(incident[0].detected_at)) / 60000)
                    : undefined;
                timelineEvent.event_type = 'resolved';
                timelineEvent.title = 'Incident resolved';
                timelineEvent.description = resolution;
            }

            if (lessons_learned) {
                updates.lessons_learned = lessons_learned;
                updates.status = 'closed';
                updates.closed_at = new Date().toISOString();
                timelineEvent.event_type = 'closed';
                timelineEvent.title = 'Incident closed';
            }

            await base44.asServiceRole.entities.Incident.update(incident_id, updates);
            await base44.asServiceRole.entities.IncidentTimeline.create(timelineEvent);

            return Response.json({
                updated: true,
                incident_id: incident_id
            });

        } else if (action === 'create_response') {
            // Create incident response
            if (!incident_id || !response_type || !response_description) {
                return Response.json({ error: 'incident_id, response_type, response_description required' }, { status: 400 });
            }

            const response = await base44.asServiceRole.entities.IncidentResponse.create({
                organization_id: organization_id,
                incident_id: incident_id,
                response_type: response_type,
                description: response_description,
                status: 'planned',
                executed_by: user.id,
                started_at: new Date().toISOString()
            });

            // Add to timeline
            await base44.asServiceRole.entities.IncidentTimeline.create({
                organization_id: organization_id,
                incident_id: incident_id,
                event_type: 'response_initiated',
                title: `Response initiated: ${response_type}`,
                description: response_description,
                actor_id: user.id,
                severity_level: 'info',
                timestamp: new Date().toISOString(),
                actions_taken: [response_type]
            });

            return Response.json({
                response_created: true,
                response_id: response.id
            });

        } else if (action === 'get_timeline') {
            // Get incident timeline
            if (!incident_id) {
                return Response.json({ error: 'incident_id required' }, { status: 400 });
            }

            const timeline = await base44.asServiceRole.entities.IncidentTimeline.filter({
                incident_id: incident_id
            }, 'timestamp', 100);

            return Response.json({
                timeline: timeline,
                total_events: timeline.length
            });

        } else if (action === 'get_statistics') {
            // Get incident statistics
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const incidents = await base44.asServiceRole.entities.Incident.filter({
                organization_id: organization_id,
                detected_at: { $gte: thirtyDaysAgo.toISOString() }
            });

            const stats = {
                total: incidents.length,
                by_severity: {
                    critical: incidents.filter(i => i.severity === 'critical').length,
                    high: incidents.filter(i => i.severity === 'high').length,
                    medium: incidents.filter(i => i.severity === 'medium').length,
                    low: incidents.filter(i => i.severity === 'low').length
                },
                by_category: {},
                by_status: {
                    open: incidents.filter(i => i.status === 'open').length,
                    investigating: incidents.filter(i => i.status === 'investigating').length,
                    resolved: incidents.filter(i => i.status === 'resolved').length,
                    closed: incidents.filter(i => i.status === 'closed').length
                },
                average_detection_time: calculateAverageDetectionTime(incidents),
                average_resolution_time: calculateAverageResolutionTime(incidents),
                trends: calculateTrends(incidents)
            };

            // Count by category
            incidents.forEach(i => {
                stats.by_category[i.category] = (stats.by_category[i.category] || 0) + 1;
            });

            return Response.json(stats);
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Incident management error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function mapSeverityToLevel(severity) {
    const mapping = {
        low: 'info',
        medium: 'warning',
        high: 'critical',
        critical: 'critical'
    };
    return mapping[severity] || 'warning';
}

function mapSeverityToSecuritySeverity(severity) {
    const mapping = {
        low: 'low',
        medium: 'medium',
        high: 'high',
        critical: 'critical'
    };
    return mapping[severity] || 'medium';
}

async function sendIncidentNotification(base44, organizationId, incidentId, title, severity) {
    // Send notification to admins
    const message = `🚨 New Incident: ${incidentId} - ${title} (${severity.toUpperCase()})`;
    
    try {
        await base44.asServiceRole.entities.InAppNotification?.create({
            organization_id: organizationId,
            user_id: 'admins', // Would be sent to all admins in production
            title: `Incident ${incidentId}`,
            message: message,
            type: severity === 'critical' ? 'urgent' : 'alert',
            action_url: `/incidents/${incidentId}`
        });
    } catch (e) {
        console.log('Notification not sent:', e.message);
    }
}

function calculateAverageMTTR(incidents) {
    const resolved = incidents.filter(i => i.time_to_resolve_minutes);
    if (resolved.length === 0) return 0;
    const total = resolved.reduce((sum, i) => sum + i.time_to_resolve_minutes, 0);
    return Math.round(total / resolved.length);
}

function calculateAverageDetectionTime(incidents) {
    const incidents_array = Array.isArray(incidents) ? incidents : [incidents];
    const with_times = incidents_array.filter(i => i.time_to_detect_minutes);
    if (with_times.length === 0) return 0;
    return Math.round(with_times.reduce((sum, i) => sum + i.time_to_detect_minutes, 0) / with_times.length);
}

function calculateAverageResolutionTime(incidents) {
    const incidents_array = Array.isArray(incidents) ? incidents : [incidents];
    const with_times = incidents_array.filter(i => i.time_to_resolve_minutes);
    if (with_times.length === 0) return 0;
    return Math.round(with_times.reduce((sum, i) => sum + i.time_to_resolve_minutes, 0) / with_times.length);
}

function calculateTrends(incidents) {
    const trends = {};
    const dailyCount = {};
    
    incidents.forEach(i => {
        const date = new Date(i.detected_at).toISOString().split('T')[0];
        dailyCount[date] = (dailyCount[date] || 0) + 1;
    });
    
    return {
        total_this_month: incidents.length,
        daily_average: Math.round(incidents.length / 30),
        peak_day: Object.entries(dailyCount).reduce((a, b) => b[1] > a[1] ? b : a, ['', 0])[0]
    };
}