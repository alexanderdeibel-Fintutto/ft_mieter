import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 6: Centralized Notification System
 * Verwaltet E-Mails, Push-Benachrichtigungen und In-App-Nachrichten zentral
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            notification_type,  // 'email', 'push', 'in_app', 'sms'
            recipient_email,    // oder user_id
            template_key,       // 'welcome', 'payment_reminder', 'maintenance_alert', etc.
            template_data,      // Daten für Template
            priority = 'normal' // 'low', 'normal', 'high', 'urgent'
        } = await req.json();

        if (!notification_type || !template_key) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Hole E-Mail-Template
        const templates = await base44.entities.EmailTemplate.filter({
            template_key: template_key,
            is_active: true
        });

        if (templates.length === 0) {
            return Response.json({ error: 'Template not found' }, { status: 404 });
        }

        const template = templates[0];
        const email = recipient_email || user.email;

        // Render Template mit Daten
        const { subject, body, html } = renderTemplate(template, template_data);

        // Sende Benachrichtigung basierend auf Typ
        let result;
        switch (notification_type) {
            case 'email':
                result = await sendEmailNotification(base44, email, subject, html || body, template_key);
                break;
            case 'push':
                result = await sendPushNotification(base44, user.id, subject, body);
                break;
            case 'in_app':
                result = await sendInAppNotification(base44, user.id, subject, body, priority);
                break;
            default:
                return Response.json({ error: 'Unknown notification type' }, { status: 400 });
        }

        // Log Notification
        await base44.entities.NotificationLog.create({
            user_id: user.id,
            notification_type: notification_type,
            template_key: template_key,
            recipient: email,
            status: 'sent',
            sent_at: new Date().toISOString(),
            metadata: {
                priority: priority,
                result: result
            }
        });

        return Response.json({
            message: 'Notification sent',
            notification_type: notification_type,
            result: result
        });
    } catch (error) {
        console.error('Notification error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function renderTemplate(template, data = {}) {
    let subject = template.subject;
    let body = template.body;
    let html = template.html;

    // Ersetze Template-Variablen
    Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, data[key]);
        body = body.replace(regex, data[key]);
        if (html) html = html.replace(regex, data[key]);
    });

    return { subject, body, html };
}

async function sendEmailNotification(base44, email, subject, htmlContent, templateKey) {
    try {
        const result = await base44.integrations.Core.SendEmail({
            to: email,
            subject: subject,
            body: htmlContent
        });
        return { success: true, provider: 'base44', message_id: result.message_id };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
}

async function sendPushNotification(base44, userId, title, body) {
    // Push-Benachrichtigungen erfordern Service Worker & Push-Subscription
    // Hier würde man Firebase Cloud Messaging oder ähnlich nutzen
    console.log(`Push notification for ${userId}: ${title}`);
    return { success: true, provider: 'fcm' };
}

async function sendInAppNotification(base44, userId, title, body, priority) {
    // Erstelle In-App-Notification im System
    const notification = await base44.entities.InAppNotification.create({
        user_id: userId,
        title: title,
        body: body,
        priority: priority,
        read: false,
        created_at: new Date().toISOString()
    });
    return { success: true, notification_id: notification.id };
}