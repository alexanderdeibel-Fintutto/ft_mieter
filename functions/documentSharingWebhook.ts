import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * WELLE 3: Advanced Document Sharing Webhook
 * Webhooks für externe Systeme (Zapier, Make, etc)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_type, document_id, shared_with_emails, access_level, callback_url } = await req.json();

    if (!event_type || !document_id) {
      return Response.json({
        error: 'event_type and document_id required',
      }, { status: 400 });
    }

    // Webhook Payload erstellen
    const payload = {
      event: event_type, // 'document_shared', 'document_revoked', 'document_downloaded', etc
      document_id,
      shared_with: shared_with_emails || [],
      access_level: access_level || 'view',
      triggered_by: user.email,
      timestamp: new Date().toISOString(),
      webhook_id: crypto.randomUUID(),
    };

    // Sende Webhook an externe URL falls vorhanden
    if (callback_url) {
      try {
        const res = await fetch(callback_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Document-Sharing-Signature': generateSignature(payload),
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          console.error(`Webhook delivery failed: ${res.status}`);
        }
      } catch (e) {
        console.error('Webhook delivery error:', e);
      }
    }

    return Response.json({
      status: 'success',
      webhook_delivered: !!callback_url,
      payload,
    });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateSignature(payload) {
  const secret = Deno.env.get('WEBHOOK_SECRET') || 'default-secret';
  const message = JSON.stringify(payload);
  const encoder = new TextEncoder();
  // Vereinfachte Signatur (in Production würde HMAC verwendet)
  return `sha256=${btoa(message + secret).substring(0, 32)}`;
}