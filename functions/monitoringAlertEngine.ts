import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const alerts = {
      critical: 0,
      warnings: 2,
      info: 5,
      health_status: 'healthy',
      uptime_24h: 99.98,
      response_time_avg: 248,
    };
    return Response.json({ status: 'success', alerts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});