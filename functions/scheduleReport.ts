import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Scheduling für automatisierte Reports
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            organization_id,
            report_type,
            format,
            schedule,        // 'daily', 'weekly', 'monthly'
            day_of_week,     // für weekly (0-6)
            day_of_month,    // für monthly (1-31)
            recipients,      // Email-Adressen
            filters,
            title,
            is_active = true
        } = await req.json();

        if (!organization_id || !report_type || !format || !schedule) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const scheduledReport = await base44.asServiceRole.entities.ScheduledReport.create({
            organization_id: organization_id,
            created_by: user.id,
            report_type: report_type,
            format: format,
            schedule: schedule,
            day_of_week: day_of_week,
            day_of_month: day_of_month,
            recipients: recipients || [],
            filters: filters || {},
            title: title,
            is_active: is_active,
            last_sent: null,
            next_send: calculateNextSendDate(schedule, day_of_week, day_of_month)
        });

        return Response.json({
            created: true,
            scheduled_report_id: scheduledReport.id,
            next_send: scheduledReport.next_send
        });
    } catch (error) {
        console.error('Schedule report error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function calculateNextSendDate(schedule, dayOfWeek, dayOfMonth) {
    const now = new Date();
    let nextDate = new Date();

    if (schedule === 'daily') {
        nextDate.setDate(nextDate.getDate() + 1);
        nextDate.setHours(6, 0, 0, 0);
    } else if (schedule === 'weekly') {
        const daysUntilTarget = (dayOfWeek - nextDate.getDay() + 7) % 7 || 7;
        nextDate.setDate(nextDate.getDate() + daysUntilTarget);
        nextDate.setHours(6, 0, 0, 0);
    } else if (schedule === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
        nextDate.setDate(dayOfMonth || 1);
        nextDate.setHours(6, 0, 0, 0);
    }

    return nextDate.toISOString();
}