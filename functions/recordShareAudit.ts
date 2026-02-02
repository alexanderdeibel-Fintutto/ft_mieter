import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * WELLE 6: Record Share Audit Trail
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      document_id, 
      action, // 'shared', 'viewed', 'downloaded', 'revoked'
      shared_with_email,
      access_level,
      metadata 
    } = await req.json();

    if (!document_id || !action) {
      return Response.json({
        error: 'document_id and action required',
      }, { status: 400 });
    }

    // Log Audit Event
    const auditEntry = {
      document_id,
      action,
      user_email: user.email,
      shared_with_email,
      access_level,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
    };

    // Hier würde der Audit-Eintrag in DB gespeichert
    console.log('[AUDIT]', JSON.stringify(auditEntry));

    return Response.json({
      status: 'success',
      audit_id: crypto.randomUUID(),
      recorded_at: auditEntry.timestamp,
    });
  } catch (error) {
    console.error('Error recording audit:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});