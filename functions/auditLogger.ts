import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      action,
      entity_type,
      entity_id,
      entity_name,
      description,
      old_values = {},
      new_values = {},
      status = 'success',
      error_message = null,
      changes_summary = '',
      metadata = {}
    } = await req.json();

    const auditLog = await base44.entities.AuditLog.create({
      action,
      entity_type,
      entity_id,
      entity_name,
      user_id: user.id,
      user_email: user.email,
      description,
      old_values,
      new_values,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      status,
      error_message,
      changes_summary,
      metadata
    });

    return Response.json({ success: true, log_id: auditLog.id });
  } catch (error) {
    console.error('Audit logging error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});