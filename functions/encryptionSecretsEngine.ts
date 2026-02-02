import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin required' }, { status: 403 });

    const secrets = {
      master_key_status: 'active',
      key_rotation_days: 90,
      last_rotation: new Date(Date.now() - 45*24*60*60*1000).toISOString(),
      next_rotation: new Date(Date.now() + 45*24*60*60*1000).toISOString(),
      hsm_status: 'connected',
      backup_location: 'secure-vault-eu',
    };
    return Response.json({ status: 'success', encryption_secrets: secrets });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});