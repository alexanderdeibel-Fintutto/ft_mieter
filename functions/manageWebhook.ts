import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Webhook Management: Create, Update, Delete, List
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,          // 'create', 'update', 'delete', 'list', 'test'
            webhook_id,
            organization_id,
            url,
            events,          // Array von Events
            secret,
            headers,
            active,
            description,
            max_retries,
            retry_delay
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Verify user has access to organization
        const orgMembership = await base44.asServiceRole.entities.OrgMembership.filter({
            organization_id: organization_id,
            user_id: user.id
        });

        if (orgMembership.length === 0) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (action === 'create') {
            if (!url || !events || !secret) {
                return Response.json({ error: 'Missing webhook parameters' }, { status: 400 });
            }

            const webhook = await base44.asServiceRole.entities.Webhook.create({
                organization_id: organization_id,
                url: url,
                events: events,
                secret: secret,
                headers: headers || {},
                active: active !== false,
                created_by: user.id,
                description: description,
                max_retries: max_retries || 3,
                retry_delay: retry_delay || 60
            });

            return Response.json({ created: true, webhook: webhook });

        } else if (action === 'update') {
            if (!webhook_id) {
                return Response.json({ error: 'Missing webhook_id' }, { status: 400 });
            }

            const updates = {};
            if (url) updates.url = url;
            if (events) updates.events = events;
            if (secret) updates.secret = secret;
            if (headers) updates.headers = headers;
            if (active !== undefined) updates.active = active;
            if (description) updates.description = description;
            if (max_retries) updates.max_retries = max_retries;
            if (retry_delay) updates.retry_delay = retry_delay;

            const webhook = await base44.asServiceRole.entities.Webhook.update(webhook_id, updates);
            return Response.json({ updated: true, webhook: webhook });

        } else if (action === 'delete') {
            if (!webhook_id) {
                return Response.json({ error: 'Missing webhook_id' }, { status: 400 });
            }

            await base44.asServiceRole.entities.Webhook.delete(webhook_id);
            return Response.json({ deleted: true });

        } else if (action === 'list') {
            const webhooks = await base44.asServiceRole.entities.Webhook.filter({
                organization_id: organization_id
            });
            return Response.json({ webhooks: webhooks });

        } else if (action === 'test') {
            if (!webhook_id) {
                return Response.json({ error: 'Missing webhook_id' }, { status: 400 });
            }

            const webhook = await base44.asServiceRole.entities.Webhook.filter({
                id: webhook_id
            });

            if (webhook.length === 0) {
                return Response.json({ error: 'Webhook not found' }, { status: 404 });
            }

            // Send test payload
            const testPayload = {
                test: true,
                timestamp: new Date().toISOString(),
                message: 'Dies ist ein Test-Webhook'
            };

            const result = await base44.asServiceRole.functions.invoke('triggerWebhook', {
                organization_id: organization_id,
                event_type: 'webhook.test',
                payload: testPayload
            });

            return Response.json({ test_result: result });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Manage webhook error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});