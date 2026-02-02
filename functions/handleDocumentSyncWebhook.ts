import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * WELLE 2: Real-time Document Sync Webhook
 * Synchronisiert Document Updates zwischen FinTuttO Apps
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const {
      document_id,
      event_type, // 'created', 'updated', 'deleted', 'shared'
      source_app,
      target_apps,
      document_data,
      share_data,
    } = payload;

    // Validierung
    if (!document_id || !event_type || !source_app) {
      return Response.json({
        error: 'Missing required fields',
      }, { status: 400 });
    }

    // Log der Sync-Events
    const syncLog = {
      document_id,
      event_type,
      source_app,
      target_apps: target_apps || [],
      timestamp: new Date().toISOString(),
      user_id: user.id,
      user_email: user.email,
    };

    // Broadcast zu anderen Apps (via Webhook)
    if (target_apps && target_apps.length > 0) {
      for (const targetApp of target_apps) {
        try {
          // Hier würde die Webhook an die Target-App gesendet
          // z.B. POST https://vermietify.app/webhooks/document-sync
          await fetch(`https://${targetApp}.internal/webhooks/document-sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Document-Sync-Token': Deno.env.get('DOCUMENT_SYNC_TOKEN'),
            },
            body: JSON.stringify({
              ...syncLog,
              document_data,
              share_data,
            }),
          }).catch(() => null); // Fehler ignorieren wenn Webhook nicht erreichbar
        } catch (e) {
          console.error(`Sync to ${targetApp} failed:`, e);
        }
      }
    }

    return Response.json({
      status: 'success',
      sync_log: syncLog,
      synced_to: target_apps?.length || 0,
    });
  } catch (error) {
    console.error('Error handling document sync:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});