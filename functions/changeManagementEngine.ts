import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin required' }, { status: 403 });

    const changes = {
      pending_approvals: 3,
      deployed_this_week: 12,
      rollback_rate: 0.5,
      avg_deployment_time: 1243,
      change_success_rate: 99.8,
      blackout_windows: 2,
    };
    return Response.json({ status: 'success', change_management: changes });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});