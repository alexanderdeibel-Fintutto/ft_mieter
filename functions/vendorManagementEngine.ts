import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin required' }, { status: 403 });

    const vendors = {
      total_vendors: 23,
      active_contracts: 18,
      spend_ytd: 45678.90,
      sla_compliance: 99.2,
      critical_vendors: 4,
      performance_score_avg: 4.6,
    };
    return Response.json({ status: 'success', vendor_management: vendors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});