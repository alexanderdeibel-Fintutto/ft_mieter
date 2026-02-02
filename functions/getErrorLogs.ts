import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Error Logs Retrieval für Admin-Dashboard
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const {
            severity,
            app_source,
            error_type,
            resolved,
            date_from,
            date_to,
            limit = 100
        } = await req.json();

        // Basis-Filter
        let filters = {};
        if (severity) filters.severity = severity;
        if (app_source) filters.app_source = app_source;
        if (error_type) filters.error_type = error_type;
        if (resolved !== undefined) filters.resolved = resolved;

        let errors = await base44.asServiceRole.entities.ErrorLog.filter(filters);

        // Datum-Filter
        if (date_from) {
            errors = errors.filter(e => new Date(e.timestamp) >= new Date(date_from));
        }
        if (date_to) {
            errors = errors.filter(e => new Date(e.timestamp) <= new Date(date_to));
        }

        // Sortiere nach Timestamp (neueste zuerst)
        errors.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Limit
        errors = errors.slice(0, limit);

        // Statistiken
        const stats = {
            total: errors.length,
            by_severity: {
                low: errors.filter(e => e.severity === 'low').length,
                medium: errors.filter(e => e.severity === 'medium').length,
                high: errors.filter(e => e.severity === 'high').length,
                critical: errors.filter(e => e.severity === 'critical').length
            },
            by_type: {
                frontend: errors.filter(e => e.error_type === 'frontend').length,
                backend: errors.filter(e => e.error_type === 'backend').length,
                api: errors.filter(e => e.error_type === 'api').length
            },
            resolved: errors.filter(e => e.resolved).length,
            unresolved: errors.filter(e => !e.resolved).length
        };

        return Response.json({
            errors: errors,
            stats: stats
        });
    } catch (error) {
        console.error('Get error logs error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});