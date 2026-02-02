import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { notification_type, channels = ['email', 'in_app'], enabled = true } = await req.json();

    const settings = {
      user_id: user.id,
      notification_type,
      channels,
      enabled,
      frequency: 'immediate',
      updated_at: new Date().toISOString(),
    };
    return Response.json({ status: 'success', notification_settings: settings });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});