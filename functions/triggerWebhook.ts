import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 13: API Webhook Management System
 * Löst Webhooks aus basierend auf Systemevents
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const {
            organization_id,
            event_type,    // 'payment.created', 'payment.completed', 'document.uploaded', etc.
            payload,       // Event-Daten
            entity_id,
            entity_type
        } = await req.json();

        if (!organization_id || !event_type || !payload) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Finde alle aktiven Webhooks für dieses Event
        const webhooks = await base44.asServiceRole.entities.Webhook.filter({
            organization_id: organization_id,
            active: true
        });

        const relevantWebhooks = webhooks.filter(w => 
            w.events.includes(event_type) || w.events.includes('*')
        );

        if (relevantWebhooks.length === 0) {
            return Response.json({ triggered: 0 });
        }

        // Trigger alle relevanten Webhooks
        const results = [];
        for (const webhook of relevantWebhooks) {
            const result = await triggerSingleWebhook(base44, webhook, event_type, payload);
            results.push(result);
        }

        return Response.json({
            triggered: results.length,
            results: results
        });
    } catch (error) {
        console.error('Trigger webhook error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function triggerSingleWebhook(base44, webhook, eventType, payload) {
    let lastError = null;
    let lastStatusCode = null;
    let lastResponseBody = null;

    for (let attempt = 1; attempt <= webhook.max_retries; attempt++) {
        try {
            const startTime = Date.now();

            // Erstelle signierte Request mit HMAC
            const bodyString = JSON.stringify(payload);
            const signature = createHMAC(bodyString, webhook.secret);

            const response = await fetch(webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': signature,
                    'X-Webhook-Event': eventType,
                    'X-Webhook-Attempt': String(attempt),
                    ...webhook.headers
                },
                body: bodyString,
                signal: AbortSignal.timeout(30000) // 30 Sekunden Timeout
            });

            const duration = Date.now() - startTime;
            const responseBody = await response.text();

            lastStatusCode = response.status;
            lastResponseBody = responseBody;

            // Log Success
            if (response.ok) {
                await base44.asServiceRole.entities.WebhookLog.create({
                    webhook_id: webhook.id,
                    event_type: eventType,
                    payload: payload,
                    status_code: response.status,
                    response_body: responseBody,
                    attempt: attempt,
                    duration_ms: duration,
                    timestamp: new Date().toISOString(),
                    success: true
                });

                // Update webhook's last_triggered
                await base44.asServiceRole.entities.Webhook.update(webhook.id, {
                    last_triggered: new Date().toISOString(),
                    failure_count: 0
                });

                return { webhook_id: webhook.id, success: true, attempt: attempt };
            }

            lastError = `HTTP ${response.status}`;

            // Log Failed Attempt
            await base44.asServiceRole.entities.WebhookLog.create({
                webhook_id: webhook.id,
                event_type: eventType,
                payload: payload,
                status_code: response.status,
                response_body: responseBody,
                attempt: attempt,
                error_message: lastError,
                duration_ms: duration,
                timestamp: new Date().toISOString(),
                success: false
            });

            // Retry mit Verzögerung
            if (attempt < webhook.max_retries) {
                await new Promise(resolve => 
                    setTimeout(resolve, webhook.retry_delay * 1000 * attempt)
                );
            }

        } catch (error) {
            lastError = error.message;

            await base44.asServiceRole.entities.WebhookLog.create({
                webhook_id: webhook.id,
                event_type: eventType,
                payload: payload,
                attempt: attempt,
                error_message: lastError,
                timestamp: new Date().toISOString(),
                success: false
            });

            if (attempt < webhook.max_retries) {
                await new Promise(resolve => 
                    setTimeout(resolve, webhook.retry_delay * 1000 * attempt)
                );
            }
        }
    }

    // Alle Versuche fehlgeschlagen
    await base44.asServiceRole.entities.Webhook.update(webhook.id, {
        failure_count: webhook.failure_count + 1
    });

    return {
        webhook_id: webhook.id,
        success: false,
        error: lastError,
        last_status_code: lastStatusCode
    };
}

function createHMAC(data, secret) {
    const encoder = new TextEncoder();
    const key = encoder.encode(secret);
    const message = encoder.encode(data);

    // Deno crypto für HMAC-SHA256
    return crypto.subtle.sign('HMAC', 
        crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']),
        message
    ).then(sig => {
        const bytes = new Uint8Array(sig);
        return Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    });
}