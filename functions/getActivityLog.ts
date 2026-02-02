import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Activity Log Retrieval für Audit-Trail
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const {
            organization_id,
            action,
            entity_type,
            user_id,
            date_from,
            date_to,
            limit = 100,
            offset = 0
        } = await req.json();

        let filters = {};
        if (organization_id) filters.organization_id = organization_id;
        if (action) filters.action = action;
        if (entity_type) filters.entity_type = entity_type;
        if (user_id) filters.user_id = user_id;

        let activities = await base44.asServiceRole.entities.ActivityLog.filter(filters);

        // Datum-Filter
        if (date_from) {
            activities = activities.filter(a => new Date(a.timestamp) >= new Date(date_from));
        }
        if (date_to) {
            activities = activities.filter(a => new Date(a.timestamp) <= new Date(date_to));
        }

        // Sortiere nach Timestamp (neueste zuerst)
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Pagination
        const total = activities.length;
        activities = activities.slice(offset, offset + limit);

        // Füge User-Infos hinzu
        const usersMap = new Map();
        for (const activity of activities) {
            if (!usersMap.has(activity.user_id)) {
                const userData = await base44.asServiceRole.entities.User.filter({
                    id: activity.user_id
                });
                usersMap.set(activity.user_id, userData[0]);
            }
        }

        const enrichedActivities = activities.map(a => ({
            ...a,
            user: usersMap.get(a.user_id)
        }));

        // Statistiken
        const stats = {
            total: total,
            by_action: {},
            by_entity_type: {},
            by_user: {}
        };

        activities.forEach(a => {
            stats.by_action[a.action] = (stats.by_action[a.action] || 0) + 1;
            stats.by_entity_type[a.entity_type] = (stats.by_entity_type[a.entity_type] || 0) + 1;
            stats.by_user[a.user_id] = (stats.by_user[a.user_id] || 0) + 1;
        });

        return Response.json({
            activities: enrichedActivities,
            stats: stats,
            pagination: {
                total: total,
                offset: offset,
                limit: limit,
                hasMore: offset + limit < total
            }
        });
    } catch (error) {
        console.error('Get activity log error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});