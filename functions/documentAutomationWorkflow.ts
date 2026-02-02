import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * WELLE 17: Document Automation Workflow
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      workflow_name,
      trigger_event,
      actions,
    } = await req.json();

    const workflow = {
      id: crypto.randomUUID(),
      name: workflow_name,
      trigger: trigger_event,
      actions: actions || [],
      created_by: user.email,
      created_at: new Date().toISOString(),
      status: 'active',
      executions: 0,
    };

    return Response.json({
      status: 'success',
      workflow,
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});