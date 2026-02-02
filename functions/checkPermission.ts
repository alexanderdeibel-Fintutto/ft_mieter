import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 14: Role-Based Access Control (RBAC) & Permissions
 * Prüft ob User bestimmte Permission hat
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            permission_name,    // z.B. 'payments.create', 'documents.view'
            organization_id,
            resource_id         // Optional: für Resource-basierte Permissions
        } = await req.json();

        if (!permission_name || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Admin-User haben alle Permissions
        if (user.role === 'admin') {
            return Response.json({ has_permission: true, reason: 'admin' });
        }

        // Finde Rollen des Users in dieser Org
        const userRoles = await base44.asServiceRole.entities.UserRole.filter({
            organization_id: organization_id,
            user_id: user.id
        });

        if (userRoles.length === 0) {
            return Response.json({ has_permission: false, reason: 'no_roles' });
        }

        // Sammle alle Permissions aus allen Rollen
        const allPermissions = new Set();
        
        for (const userRole of userRoles) {
            // Prüfe ob Rolle abgelaufen ist
            if (userRole.expires_at && new Date(userRole.expires_at) < new Date()) {
                continue;
            }

            const role = await base44.asServiceRole.entities.Role.filter({
                id: userRole.role_id
            });

            if (role.length > 0) {
                role[0].permissions.forEach(permId => allPermissions.add(permId));
            }
        }

        // Finde die Permission
        const permission = await base44.asServiceRole.entities.Permission.filter({
            name: permission_name
        });

        if (permission.length === 0) {
            return Response.json({ has_permission: false, reason: 'permission_not_found' });
        }

        const permissionId = permission[0].id;
        const hasPermission = allPermissions.has(permissionId);

        return Response.json({
            has_permission: hasPermission,
            permission_name: permission_name,
            user_roles: userRoles.length
        });
    } catch (error) {
        console.error('Check permission error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});