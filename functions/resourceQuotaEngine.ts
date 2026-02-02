import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const quotas = {
      documents_created: { limit: 1000, used: 234, remaining: 766 },
      storage_gb: { limit: 100, used: 34.5, remaining: 65.5 },
      api_calls: { limit: 100000, used: 45234, remaining: 54766 },
      shares_per_month: { limit: 5000, used: 1234, remaining: 3766 },
    };
    return Response.json({ status: 'success', quotas });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});