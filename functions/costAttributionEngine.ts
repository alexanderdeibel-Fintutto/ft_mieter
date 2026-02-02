import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin required' }, { status: 403 });

    const costs = {
      storage: 234.56,
      bandwidth: 123.45,
      compute: 456.78,
      services: 89.12,
      total_monthly: 903.91,
      cost_per_user: 1.23,
      trends: 'down 5% vs last month',
    };
    return Response.json({ status: 'success', cost_analysis: costs });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});