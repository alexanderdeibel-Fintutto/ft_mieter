import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Event-basierte Benachrichtigungen
 * Wird automatisch bei Entity-Änderungen aufgerufen (via Automations)
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const {
            event_type,        // 'entity_created', 'entity_updated', 'payment_received', etc.
            entity_type,       // Building, Unit, PaymentTransaction, etc.
            entity_id,
            user_id,
            data
        } = await req.json();

        if (!event_type || !entity_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Bestimme welche Benachrichtigungen gesendet werden sollen
        const notifications = await determineNotifications(
            base44,
            event_type,
            entity_type,
            entity_id,
            user_id,
            data
        );

        // Sende alle relevanten Benachrichtigungen
        const results = [];
        for (const notification of notifications) {
            try {
                const result = await base44.functions.invoke('sendNotification', {
                    notification_type: notification.type,
                    recipient_email: notification.recipient_email,
                    template_key: notification.template_key,
                    template_data: notification.template_data,
                    priority: notification.priority
                });
                results.push(result.data);
            } catch (error) {
                console.error(`Failed to send ${notification.template_key}:`, error);
                results.push({ error: error.message, template_key: notification.template_key });
            }
        }

        return Response.json({
            event_type: event_type,
            notifications_sent: results.length,
            results: results
        });
    } catch (error) {
        console.error('Trigger notification error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function determineNotifications(base44, eventType, entityType, entityId, userId, data) {
    const notifications = [];

    // === Payment Events ===
    if (eventType === 'payment_completed') {
        const transaction = await base44.entities.PaymentTransaction.filter({ id: entityId });
        if (transaction[0]) {
            const t = transaction[0];
            // Benachrichtige Mieter
            notifications.push({
                type: 'email',
                recipient_email: t.user_id,
                template_key: 'payment_received',
                template_data: {
                    amount: t.amount,
                    date: new Date().toLocaleDateString('de-DE'),
                    reference: t.reference
                },
                priority: 'normal'
            });
        }
    }

    // === Service Request Events ===
    if (eventType === 'service_request_created') {
        const sr = await base44.entities.ServiceRequest.filter({ id: entityId });
        if (sr[0]) {
            // Benachrichtige Hausmeister
            notifications.push({
                type: 'push',
                recipient_email: sr[0].assigned_to,
                template_key: 'new_maintenance_task',
                template_data: {
                    title: sr[0].title,
                    unit: sr[0].unit_id,
                    priority: sr[0].priority
                },
                priority: 'high'
            });
        }
    }

    if (eventType === 'service_request_updated' && data?.status === 'completed') {
        const sr = await base44.entities.ServiceRequest.filter({ id: entityId });
        if (sr[0]) {
            // Benachrichtige Mieter dass Aufgabe abgeschlossen ist
            notifications.push({
                type: 'email',
                recipient_email: sr[0].user_id,
                template_key: 'maintenance_completed',
                template_data: {
                    title: sr[0].title,
                    completed_date: new Date().toLocaleDateString('de-DE')
                },
                priority: 'normal'
            });
        }
    }

    // === Billing Events ===
    if (eventType === 'billing_statement_issued') {
        const bs = await base44.entities.BillingStatement.filter({ id: entityId });
        if (bs[0]) {
            // Benachrichtige Mieter über neue Abrechnung
            notifications.push({
                type: 'email',
                recipient_email: bs[0].user_id,
                template_key: 'billing_statement_issued',
                template_data: {
                    period: bs[0].period,
                    amount: bs[0].total_amount,
                    due_date: bs[0].due_date
                },
                priority: 'high'
            });
        }
    }

    if (eventType === 'payment_overdue') {
        const t = await base44.entities.PaymentTransaction.filter({ id: entityId });
        if (t[0]) {
            // Benachrichtige Mieter dass Zahlung überfällig ist
            notifications.push({
                type: 'email',
                recipient_email: t[0].user_id,
                template_key: 'payment_overdue_reminder',
                template_data: {
                    amount: t[0].amount,
                    due_date: t[0].due_date,
                    days_overdue: Math.floor((Date.now() - new Date(t[0].due_date)) / (1000 * 60 * 60 * 24))
                },
                priority: 'urgent'
            });
        }
    }

    // === Announcement Events ===
    if (eventType === 'announcement_published') {
        const announcement = await base44.entities.Announcement.filter({ id: entityId });
        if (announcement[0]) {
            // Benachrichtige alle Mieter des Gebäudes
            const unit = await base44.entities.Building.filter({ id: announcement[0].building_id });
            if (unit[0]) {
                notifications.push({
                    type: 'in_app',
                    template_key: 'announcement_published',
                    template_data: {
                        title: announcement[0].title,
                        priority: announcement[0].priority
                    },
                    priority: announcement[0].priority === 'urgent' ? 'urgent' : 'normal'
                });
            }
        }
    }

    return notifications;
}