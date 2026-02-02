import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { report_type, frequency, recipients } = await req.json();

    const report = {
      id: crypto.randomUUID(),
      type: report_type,
      frequency,
      recipients,
      created_by: user.email,
      status: 'scheduled',
      next_run: new Date(Date.now() + 24*60*60*1000).toISOString(),
    };
    return Response.json({ status: 'success', report });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});