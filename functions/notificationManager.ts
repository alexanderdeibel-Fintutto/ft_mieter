import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 79: Advanced Notification Management System
 * Verwaltet Benachrichtigungsvorlagen, Kanäle und Benutzereinstellungen
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

        if (action === 'create_template') {
            const { template_name, template_type, trigger_event, subject, body, variables, priority } = await req.json();

            if (!template_name || !template_type || !body) {
                return Response.json({ error: 'template_name, template_type, body required' }, { status: 400 });
            }

            const template = await base44.asServiceRole.entities.NotificationTemplate.create({
                organization_id,
                template_name,
                template_type,
                trigger_event: trigger_event || '',
                subject: subject || '',
                body,
                variables: variables || [],
                priority: priority || 'normal',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            return Response.json({ template_created: true, template_id: template.id });

        } else if (action === 'create_channel') {
            const { channel_name, channel_type, provider, config, is_primary, rate_limit_per_hour } = await req.json();

            if (!channel_name || !channel_type || !provider) {
                return Response.json({ error: 'channel_name, channel_type, provider required' }, { status: 400 });
            }

            const channel = await base44.asServiceRole.entities.NotificationChannel.create({
                organization_id,
                channel_name,
                channel_type,
                provider,
                config: config || {},
                is_primary: is_primary || false,
                rate_limit_per_hour: rate_limit_per_hour || 1000,
                created_at: new Date().toISOString()
            });

            return Response.json({ channel_created: true, channel_id: channel.id });

        } else if (action === 'send_notification') {
            const { template_id, recipient_id, recipient_address, channel_type, variables } = await req.json();

            if (!template_id || !recipient_id || !recipient_address || !channel_type) {
                return Response.json({ error: 'template_id, recipient_id, recipient_address, channel_type required' }, { status: 400 });
            }

            // Get template
            const templates = await base44.asServiceRole.entities.NotificationTemplate.filter({
                organization_id,
                id: template_id
            });

            if (templates.length === 0) {
                return Response.json({ error: 'Template not found' }, { status: 404 });
            }

            const template = templates[0];

            // Check user preferences
            const prefs = await base44.asServiceRole.entities.UserNotificationPreference.filter({
                organization_id,
                user_id: recipient_id,
                notification_type: channel_type
            });

            if (prefs.length > 0 && !prefs[0].is_enabled) {
                return Response.json({ notification_skipped: true, reason: 'User has disabled this notification type' });
            }

            // Render template with variables
            let subject = template.subject;
            let body = template.body;
            if (variables) {
                for (const [key, value] of Object.entries(variables)) {
                    subject = subject.replace(`{{${key}}}`, value);
                    body = body.replace(`{{${key}}}`, value);
                }
            }

            const notification_id = crypto.randomUUID();
            const now = new Date().toISOString();

            // Create notification log
            const log = await base44.asServiceRole.entities.NotificationLog.create({
                organization_id,
                notification_id,
                template_id,
                recipient_id,
                recipient_address,
                notification_type: channel_type,
                subject,
                body,
                status: 'pending',
                metadata: variables || {},
                sent_at: now
            });

            // Update template stats
            await base44.asServiceRole.entities.NotificationTemplate.update(template_id, {
                total_sent: (template.total_sent || 0) + 1
            });

            return Response.json({
                notification_sent: true,
                notification_id,
                log_id: log.id
            });

        } else if (action === 'update_notification_status') {
            const { log_id, status, error_message } = await req.json();

            if (!log_id || !status) {
                return Response.json({ error: 'log_id, status required' }, { status: 400 });
            }

            const logs = await base44.asServiceRole.entities.NotificationLog.filter({
                organization_id,
                id: log_id
            });

            if (logs.length === 0) {
                return Response.json({ error: 'Notification log not found' }, { status: 404 });
            }

            const log = logs[0];
            const updateData = { status };

            if (status === 'delivered') {
                updateData.delivered_at = new Date().toISOString();
            } else if (status === 'failed' || status === 'bounced') {
                updateData.error_message = error_message || 'Unknown error';
                updateData.retry_count = (log.retry_count || 0) + 1;
            }

            await base44.asServiceRole.entities.NotificationLog.update(log_id, updateData);

            // Update template success/failure count
            const templates = await base44.asServiceRole.entities.NotificationTemplate.filter({
                organization_id,
                id: log.template_id
            });

            if (templates.length > 0) {
                const template = templates[0];
                const update = {};
                if (status === 'delivered' || status === 'sent') {
                    update.success_count = (template.success_count || 0) + 1;
                } else if (status === 'failed' || status === 'bounced') {
                    update.failure_count = (template.failure_count || 0) + 1;
                }
                if (Object.keys(update).length > 0) {
                    await base44.asServiceRole.entities.NotificationTemplate.update(log.template_id, update);
                }
            }

            return Response.json({ status_updated: true });

        } else if (action === 'set_user_preferences') {
            const { user_id, notification_type, is_enabled, frequency, quiet_hours_enabled, quiet_hours_start, quiet_hours_end } = await req.json();

            if (!user_id || !notification_type) {
                return Response.json({ error: 'user_id, notification_type required' }, { status: 400 });
            }

            const prefs = await base44.asServiceRole.entities.UserNotificationPreference.filter({
                organization_id,
                user_id,
                notification_type
            });

            const now = new Date().toISOString();
            let pref;

            if (prefs.length > 0) {
                await base44.asServiceRole.entities.UserNotificationPreference.update(prefs[0].id, {
                    is_enabled: is_enabled !== undefined ? is_enabled : true,
                    frequency: frequency || 'instant',
                    quiet_hours_enabled: quiet_hours_enabled || false,
                    quiet_hours_start: quiet_hours_start || '',
                    quiet_hours_end: quiet_hours_end || '',
                    updated_at: now
                });
                pref = prefs[0];
            } else {
                pref = await base44.asServiceRole.entities.UserNotificationPreference.create({
                    organization_id,
                    user_id,
                    notification_type,
                    is_enabled: is_enabled !== undefined ? is_enabled : true,
                    frequency: frequency || 'instant',
                    quiet_hours_enabled: quiet_hours_enabled || false,
                    quiet_hours_start: quiet_hours_start || '',
                    quiet_hours_end: quiet_hours_end || '',
                    updated_at: now
                });
            }

            return Response.json({ preferences_updated: true, pref_id: pref.id });

        } else if (action === 'get_dashboard_data') {
            const [templates, logs, channels, preferences] = await Promise.all([
                base44.asServiceRole.entities.NotificationTemplate.filter({ organization_id }, '-created_at'),
                base44.asServiceRole.entities.NotificationLog.filter({ organization_id }, '-sent_at', 100),
                base44.asServiceRole.entities.NotificationChannel.filter({ organization_id }, '-created_at'),
                base44.asServiceRole.entities.UserNotificationPreference.filter({ organization_id }, '-updated_at', 50)
            ]);

            const templateStats = {
                total_templates: templates.length,
                active_templates: templates.filter(t => t.is_active).length,
                total_sent: templates.reduce((sum, t) => sum + (t.total_sent || 0), 0),
                success_count: templates.reduce((sum, t) => sum + (t.success_count || 0), 0),
                failure_count: templates.reduce((sum, t) => sum + (t.failure_count || 0), 0)
            };

            const successRate = templateStats.total_sent > 0
                ? ((templateStats.success_count / templateStats.total_sent) * 100).toFixed(2)
                : 0;

            const logStats = {
                total_logs: logs.length,
                pending: logs.filter(l => l.status === 'pending').length,
                sent: logs.filter(l => l.status === 'sent').length,
                delivered: logs.filter(l => l.status === 'delivered').length,
                failed: logs.filter(l => l.status === 'failed').length,
                bounced: logs.filter(l => l.status === 'bounced').length
            };

            const channelStats = {
                total_channels: channels.length,
                active_channels: channels.filter(c => c.is_active).length,
                primary_channels: channels.filter(c => c.is_primary).length
            };

            const typeDistribution = {};
            templates.forEach(t => {
                typeDistribution[t.template_type] = (typeDistribution[t.template_type] || 0) + 1;
            });

            return Response.json({
                templates: templates.slice(0, 20),
                logs: logs.slice(0, 30),
                channels: channels,
                preferences: preferences,
                template_stats: templateStats,
                log_stats: logStats,
                channel_stats: channelStats,
                type_distribution: typeDistribution,
                success_rate: successRate
            });

        } else if (action === 'get_template_analytics') {
            const { template_id } = await req.json();

            if (!template_id) {
                return Response.json({ error: 'template_id required' }, { status: 400 });
            }

            const logs = await base44.asServiceRole.entities.NotificationLog.filter({
                organization_id,
                template_id
            }, '-sent_at', 200);

            const stats = {
                total_sent: logs.length,
                delivered: logs.filter(l => l.status === 'delivered').length,
                failed: logs.filter(l => l.status === 'failed').length,
                bounced: logs.filter(l => l.status === 'bounced').length,
                opened: logs.filter(l => l.opened_at).length,
                clicked: logs.filter(l => l.clicked_at).length
            };

            stats.delivery_rate = stats.total_sent > 0
                ? ((stats.delivered / stats.total_sent) * 100).toFixed(2)
                : 0;

            stats.open_rate = stats.delivered > 0
                ? ((stats.opened / stats.delivered) * 100).toFixed(2)
                : 0;

            stats.click_rate = stats.delivered > 0
                ? ((stats.clicked / stats.delivered) * 100).toFixed(2)
                : 0;

            return Response.json({ logs, stats });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Notification manager error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});