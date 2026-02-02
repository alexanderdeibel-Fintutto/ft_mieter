import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Scheduled function to check for overdue tasks and send alerts
 * Should be triggered daily or multiple times per day
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all open tasks
    const now = new Date();
    const tasks = await base44.asServiceRole.entities.MaintenanceTask.filter({
      status: 'open'
    });

    for (const task of tasks || []) {
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        
        // Check if overdue
        if (dueDate < now) {
          const assignedUser = task.assigned_to;
          
          if (assignedUser) {
            // Check if we already notified about this
            const existingNotif = await base44.asServiceRole.entities.Notification.filter({
              user_id: assignedUser,
              related_id: task.id,
              type: 'alert',
              is_read: false
            });

            if (existingNotif?.length === 0) {
              // Create overdue alert
              await base44.functions.invoke('createNotification', {
                user_id: assignedUser,
                type: 'alert',
                title: 'Aufgabe überfällig',
                message: `"${task.title}" ist überfällig seit ${formatDate(dueDate)}`,
                priority: 'high',
                related_entity: 'MaintenanceTask',
                related_id: task.id,
                action_url: `/tasks/${task.id}`,
                action_label: 'Anschauen'
              });
            }
          }
        }

        // Check if due soon (within 24 hours)
        const oneDayMs = 24 * 60 * 60 * 1000;
        if (dueDate - now < oneDayMs && dueDate > now) {
          const assignedUser = task.assigned_to;
          
          if (assignedUser) {
            const existingNotif = await base44.asServiceRole.entities.Notification.filter({
              user_id: assignedUser,
              related_id: task.id,
              type: 'alert',
              is_read: false
            });

            if (existingNotif?.length === 0) {
              await base44.functions.invoke('createNotification', {
                user_id: assignedUser,
                type: 'alert',
                title: 'Aufgabe fällig bald',
                message: `"${task.title}" fällt am ${formatDate(dueDate)}`,
                priority: 'normal',
                related_entity: 'MaintenanceTask',
                related_id: task.id,
                action_url: `/tasks/${task.id}`,
                action_label: 'Anschauen'
              });
            }
          }
        }
      }
    }

    return Response.json({ success: true, checked: tasks?.length || 0 });
  } catch (error) {
    console.error('Overdue task check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function formatDate(date) {
  return new Date(date).toLocaleDateString('de-DE');
}