import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { webhook_url, events, retries = 3 } = await req.json();
    
    const webhook = {
      id: crypto.randomUUID(),
      url: webhook_url,
      events,
      retries,
      status: 'active',
      created_at: new Date().toISOString(),
      deliveries: 0,
      failures: 0,
    };
    return Response.json({ status: 'success', webhook });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});