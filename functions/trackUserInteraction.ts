import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      interaction_type,
      element_id,
      page_name,
      time_spent_seconds,
      source,
      is_successful,
      metadata
    } = body;

    // Speichere Interaktion
    await base44.asServiceRole.entities.UserInteractionAnalytics.create({
      user_email: user.email,
      user_role: user.role,
      interaction_type,
      element_id: element_id || '',
      page_name: page_name || '',
      time_spent_seconds: time_spent_seconds || 0,
      source: source || 'direct',
      is_successful: is_successful !== undefined ? is_successful : true,
      metadata: metadata || {}
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Tracking error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});