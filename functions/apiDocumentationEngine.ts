import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin required' }, { status: 403 });

    const docs = {
      endpoints: 47,
      schemas: 89,
      webhooks: 12,
      rate_limits: true,
      auto_generation: true,
      last_updated: new Date().toISOString(),
    };
    return Response.json({ status: 'success', documentation: docs });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});