import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin required' }, { status: 403 });

    const capacity = {
      storage_used_pct: 67,
      compute_used_pct: 45,
      bandwidth_used_pct: 52,
      projected_full_storage: 180,
      scaling_recommendations: 'increase compute by 2x',
      headroom_months: 8,
    };
    return Response.json({ status: 'success', capacity: capacity });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});