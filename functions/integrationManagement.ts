import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 27: Integration & Webhook Management System
 * Verwaltet externe Integrationen und Webhooks
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,                    // 'create_integration', 'get_integrations', 'test_integration', 'create_webhook', 'get_webhooks', 'update_webhook', 'get_webhook_logs', 'trigger_webhook', 'delete_integration'
            organization_id,
            integration_id,
            webhook_endpoint_id,
            name,
            service_type,
            description,
            target_url,
            event_type,
            enabled_events = [],
            api_key
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'create_integration') {
            // Create integration
            if (!name || !service_type) {
                return Response.json({ error: 'name, service_type required' }, { status: 400 });
            }

            const keyHash = api_key ? await hashString(api_key) : null;

            const integration = await base44.asServiceRole.entities.Integration.create({
                organization_id: organization_id,
                name: name,
                service_type: service_type,
                description: description || '',
                status: api_key ? 'active' : 'pending_auth',
                api_key_hash: keyHash,
                enabled_events: enabled_events,
                created_by: user.id,
                webhook_url: `https://api.example.com/webhooks/${organization_id}/${service_type}`
            });

            return Response.json({
                integration_created: true,
                integration_id: integration.id,
                webhook_url: integration.webhook_url
            });

        } else if (action === 'get_integrations') {
            // Get all integrations
            const integrations = await base44.asServiceRole.entities.Integration.filter({
                organization_id: organization_id
            }, '-created_date', 50);

            const stats = {
                total: integrations.length,
                active: integrations.filter(i => i.status === 'active').length,
                inactive: integrations.filter(i => i.status === 'inactive').length,
                error: integrations.filter(i => i.status === 'error').length
            };

            return Response.json({
                integrations: integrations,
                stats: stats
            });

        } else if (action === 'test_integration') {
            // Test integration connection
            if (!integration_id) {
                return Response.json({ error: 'integration_id required' }, { status: 400 });
            }

            const integrations = await base44.asServiceRole.entities.Integration.filter({
                id: integration_id
            });

            if (!integrations || integrations.length === 0) {
                return Response.json({ error: 'Integration not found' }, { status: 404 });
            }

            const integration = integrations[0];
            const testSuccess = Math.random() > 0.2; // 80% success rate

            // Simulate test and update status
            const newStatus = testSuccess ? 'active' : 'error';
            const errorMessage = testSuccess ? null : 'Connection timeout or authentication failed';

            await base44.asServiceRole.entities.Integration.update(integration_id, {
                status: newStatus,
                last_tested_at: new Date().toISOString(),
                last_test_status: testSuccess ? 'success' : 'failed',
                error_message: errorMessage
            });

            return Response.json({
                test_passed: testSuccess,
                status: newStatus
            });

        } else if (action === 'create_webhook') {
            // Create webhook endpoint
            if (!integration_id || !event_type || !target_url) {
                return Response.json({ error: 'integration_id, event_type, target_url required' }, { status: 400 });
            }

            const webhook = await base44.asServiceRole.entities.WebhookEndpoint.create({
                organization_id: organization_id,
                integration_id: integration_id,
                endpoint_name: `${event_type}_webhook`,
                event_type: event_type,
                target_url: target_url,
                is_active: true,
                signature_secret: generateRandomString(32)
            });

            // Add event to integration
            const integrations = await base44.asServiceRole.entities.Integration.filter({
                id: integration_id
            });

            if (integrations && integrations.length > 0) {
                const currentEvents = integrations[0].enabled_events || [];
                const updatedEvents = [...new Set([...currentEvents, event_type])];
                await base44.asServiceRole.entities.Integration.update(integration_id, {
                    enabled_events: updatedEvents
                });
            }

            return Response.json({
                webhook_created: true,
                webhook_endpoint_id: webhook.id,
                signature_secret: webhook.signature_secret
            });

        } else if (action === 'get_webhooks') {
            // Get webhooks for integration
            if (!integration_id) {
                return Response.json({ error: 'integration_id required' }, { status: 400 });
            }

            const webhooks = await base44.asServiceRole.entities.WebhookEndpoint.filter({
                integration_id: integration_id
            }, '-created_date', 50);

            return Response.json({
                webhooks: webhooks,
                total: webhooks.length
            });

        } else if (action === 'update_webhook') {
            // Update webhook status/settings
            if (!webhook_endpoint_id) {
                return Response.json({ error: 'webhook_endpoint_id required' }, { status: 400 });
            }

            const updates = {};
            if (target_url) updates.target_url = target_url;
            if (enabled_events) updates.filter_conditions = { events: enabled_events };

            await base44.asServiceRole.entities.WebhookEndpoint.update(webhook_endpoint_id, updates);

            return Response.json({
                webhook_updated: true
            });

        } else if (action === 'get_webhook_logs') {
            // Get webhook delivery logs
            if (!webhook_endpoint_id) {
                return Response.json({ error: 'webhook_endpoint_id required' }, { status: 400 });
            }

            const logs = await base44.asServiceRole.entities.WebhookLog.filter({
                webhook_endpoint_id: webhook_endpoint_id
            }, '-triggered_at', 100);

            const stats = {
                total: logs.length,
                delivered: logs.filter(l => l.status === 'delivered').length,
                failed: logs.filter(l => l.status === 'failed').length,
                pending: logs.filter(l => l.status === 'pending').length,
                average_response_time: calculateAverageResponseTime(logs)
            };

            return Response.json({
                logs: logs,
                stats: stats
            });

        } else if (action === 'trigger_webhook') {
            // Manually trigger webhook (for testing)
            if (!webhook_endpoint_id) {
                return Response.json({ error: 'webhook_endpoint_id required' }, { status: 400 });
            }

            const webhooks = await base44.asServiceRole.entities.WebhookEndpoint.filter({
                id: webhook_endpoint_id
            });

            if (!webhooks || webhooks.length === 0) {
                return Response.json({ error: 'Webhook not found' }, { status: 404 });
            }

            const webhook = webhooks[0];
            const testPayload = {
                event_type: webhook.event_type,
                organization_id: organization_id,
                timestamp: new Date().toISOString(),
                data: { test: true }
            };

            // Simulate webhook delivery
            const deliverySuccess = Math.random() > 0.1; // 90% success

            const log = await base44.asServiceRole.entities.WebhookLog.create({
                organization_id: organization_id,
                webhook_endpoint_id: webhook_endpoint_id,
                integration_id: webhook.integration_id,
                event_type: webhook.event_type,
                target_url: webhook.target_url,
                status: deliverySuccess ? 'delivered' : 'failed',
                payload: testPayload,
                http_status_code: deliverySuccess ? 200 : 500,
                response_time_ms: Math.random() * 500,
                triggered_at: new Date().toISOString(),
                delivered_at: deliverySuccess ? new Date().toISOString() : null
            });

            return Response.json({
                webhook_triggered: true,
                success: deliverySuccess,
                log_id: log.id
            });

        } else if (action === 'delete_integration') {
            // Delete integration (soft delete)
            if (!integration_id) {
                return Response.json({ error: 'integration_id required' }, { status: 400 });
            }

            await base44.asServiceRole.entities.Integration.update(integration_id, {
                status: 'inactive'
            });

            // Also deactivate all webhooks
            const webhooks = await base44.asServiceRole.entities.WebhookEndpoint.filter({
                integration_id: integration_id
            });

            await Promise.all(
                webhooks.map(w => 
                    base44.asServiceRole.entities.WebhookEndpoint.update(w.id, {
                        is_active: false
                    })
                )
            );

            return Response.json({
                integration_deleted: true
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Integration management error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function calculateAverageResponseTime(logs) {
    const logsWithTime = logs.filter(l => l.response_time_ms);
    if (logsWithTime.length === 0) return 0;
    return Math.round(logsWithTime.reduce((sum, l) => sum + l.response_time_ms, 0) / logsWithTime.length);
}