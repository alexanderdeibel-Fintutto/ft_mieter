import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 10: Centralized Error Logging
 * Alle Fehler aus allen Apps werden hier geloggt
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Error Logging erlaubt auch ohne Auth (für Frontend-Errors)
        let user = null;
        try {
            user = await base44.auth.me();
        } catch (e) {
            // User not authenticated - that's ok for error logging
        }

        const {
            error_type,      // 'frontend', 'backend', 'api'
            severity,        // 'low', 'medium', 'high', 'critical'
            message,
            stack_trace,
            context,         // Zusätzlicher Context
            app_source,      // 'mieterapp', 'vermietify', 'hausmeisterpro'
            function_name,
            user_agent,
            url
        } = await req.json();

        if (!error_type || !message) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Log in Database
        const errorLog = await base44.asServiceRole.entities.ErrorLog.create({
            user_id: user?.id || null,
            error_type: error_type,
            severity: severity || 'medium',
            message: message,
            stack_trace: stack_trace,
            context: context || {},
            app_source: app_source,
            function_name: function_name,
            user_agent: user_agent,
            url: url,
            timestamp: new Date().toISOString(),
            resolved: false
        });

        // Bei kritischen Fehlern: Benachrichtige Admins
        if (severity === 'critical') {
            try {
                await notifyAdmins(base44, errorLog);
            } catch (e) {
                console.error('Failed to notify admins:', e);
            }
        }

        return Response.json({ 
            logged: true,
            error_id: errorLog.id 
        });
    } catch (error) {
        console.error('Error logging failed:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function notifyAdmins(base44, errorLog) {
    // Finde alle Admin-User
    const admins = await base44.asServiceRole.entities.User.filter({
        role: 'admin'
    });

    for (const admin of admins) {
        await base44.asServiceRole.functions.invoke('sendNotification', {
            notification_type: 'email',
            recipient_email: admin.email,
            template_key: 'critical_error_alert',
            template_data: {
                error_message: errorLog.message,
                app_source: errorLog.app_source,
                timestamp: new Date(errorLog.timestamp).toLocaleString('de-DE'),
                error_id: errorLog.id
            },
            priority: 'urgent'
        });
    }
}