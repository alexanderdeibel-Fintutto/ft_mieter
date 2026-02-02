import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const errorStats = {
      errors_24h: 23,
      critical_errors: 0,
      error_rate: 0.021,
      mttd: 45,
      mttr: 234,
      top_errors: [
        { type: 'timeout', count: 12 },
        { type: 'rate_limit', count: 8 },
        { type: 'validation', count: 3 },
      ],
    };
    return Response.json({ status: 'success', error_stats: errorStats });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});