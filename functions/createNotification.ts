import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Creates notifications for workflow, document, task, and alert events
 * Called from various automations and events
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const {
      user_id,
      type,
      title,
      message,
      priority = 'normal',
      related_entity,
      related_id,
      action_url,
      action_label,
      metadata = {}
    } = await req.json();

    if (!user_id || !type || !title || !message) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check user preferences
    const prefs = await base44.asServiceRole.entities.NotificationPreference.filter({
      user_id,
      notification_type: type
    });

    const isEnabled = prefs?.length > 0 
      ? prefs[0].enabled 
      : true; // Default to enabled if no preference exists

    if (!isEnabled) {
      return Response.json({ success: true, skipped: true });
    }

    // Create notification
    const notification = await base44.asServiceRole.entities.Notification.create({
      user_id,
      type,
      title,
      message,
      priority,
      related_entity,
      related_id,
      action_url,
      action_label,
      metadata,
      is_read: false
    });

    // Send email if enabled
    if (prefs?.length > 0 && prefs[0].email_enabled) {
      const user = await base44.asServiceRole.entities.User.list();
      const userEmail = user?.find(u => u.id === user_id)?.email;

      if (userEmail) {
        await base44.integrations.Core.SendEmail({
          to: userEmail,
          subject: title,
          body: message
        });
      }
    }

    return Response.json({ success: true, notification_id: notification.id });
  } catch (error) {
    console.error('Notification creation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});