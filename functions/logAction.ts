import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Utility function to log actions to audit trail
 * Can be called from other functions or automated via webhooks
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const {
      action,
      entity_type,
      entity_id,
      entity_name,
      description,
      old_values = {},
      new_values = {},
      changes_summary = '',
      metadata = {},
      status = 'success',
      error_message = null
    } = await req.json();

    const user = await base44.auth.me();

    // Create audit log entry
    await base44.entities.AuditLog.create({
      action,
      entity_type,
      entity_id,
      entity_name,
      user_id: user?.id || 'system',
      user_email: user?.email || 'system@app.local',
      description,
      old_values,
      new_values,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      status,
      error_message,
      changes_summary,
      metadata
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Action logging error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});