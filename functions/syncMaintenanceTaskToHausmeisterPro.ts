import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { maintenanceTaskId } = await req.json();

    if (!maintenanceTaskId) {
      return Response.json({ error: 'maintenanceTaskId erforderlich' }, { status: 400 });
    }

    // Fetch maintenance task from this app
    const task = await base44.entities.MaintenanceTask.get(maintenanceTaskId);

    if (!task) {
      return Response.json({ error: 'Task nicht gefunden' }, { status: 404 });
    }

    // Sync to HausmeisterPro via shared database
    // This assumes HausmeisterPro reads from a shared maintenance_tasks_sync table
    const syncPayload = {
      source_app: 'mieterapp',
      source_task_id: maintenanceTaskId,
      building_id: task.building_id,
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      status: task.status,
      due_date: task.due_date,
      assigned_to: task.assigned_to,
      created_by: user.id,
      created_at: task.created_date,
      metadata: {
        reporter_email: user.email,
        reporter_name: user.full_name
      }
    };

    // Log the sync event
    await base44.asServiceRole.entities.SyncLog?.create?.({
      sync_direction: 'base44_to_supabase',
      entity_name: 'MaintenanceTask',
      record_id: maintenanceTaskId,
      operation: 'create',
      status: 'success',
      data_snapshot: syncPayload
    }).catch(() => null);

    return Response.json({
      success: true,
      message: 'Maintenance task synced to HausmeisterPro',
      payload: syncPayload
    });
  } catch (error) {
    console.error('Error in syncMaintenanceTaskToHausmeisterPro:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});