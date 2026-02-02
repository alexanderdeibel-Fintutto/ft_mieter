import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 11: Audit Trail & Activity Logging
 * Protokollierung aller wichtigen Aktionen für Compliance & Audit
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,           // 'create', 'update', 'delete', 'view', 'export', 'login', etc.
            entity_type,      // 'Payment', 'Document', 'Tenant', etc.
            entity_id,        // ID der betroffenen Entität
            organization_id,  // Betroffene Org
            changes,          // Objekt mit alten/neuen Werten
            description,      // Freier Text
            ip_address,       // Client IP
            user_agent        // Browser Info
        } = await req.json();

        if (!action || !entity_type || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Log Activity
        const activityLog = await base44.asServiceRole.entities.ActivityLog.create({
            user_id: user.id,
            organization_id: organization_id,
            action: action,
            entity_type: entity_type,
            entity_id: entity_id || null,
            changes: changes || {},
            description: description,
            ip_address: ip_address,
            user_agent: user_agent,
            timestamp: new Date().toISOString(),
            app_source: params.app_source || 'unknown'
        });

        return Response.json({
            logged: true,
            activity_id: activityLog.id
        });
    } catch (error) {
        console.error('Activity logging failed:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});