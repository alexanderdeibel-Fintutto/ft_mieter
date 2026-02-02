import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { event_type, severity, description } = await req.json();
    
    const audit = {
      id: crypto.randomUUID(),
      user_id: user.id,
      event_type,
      severity,
      description,
      timestamp: new Date().toISOString(),
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
    };
    return Response.json({ status: 'success', audit });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});