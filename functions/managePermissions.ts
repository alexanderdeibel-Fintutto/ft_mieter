import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Permission & Role Management
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const {
            action,           // 'create_role', 'update_role', 'delete_role', 'assign_role', 'remove_role', 'list_roles'
            organization_id,
            role_id,
            role_name,
            role_description,
            permissions,      // Array von Permission-IDs
            target_user_id,
            expires_at
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'create_role') {
            if (!role_name || !permissions) {
                return Response.json({ error: 'Missing role parameters' }, { status: 400 });
            }

            const role = await base44.asServiceRole.entities.Role.create({
                organization_id: organization_id,
                name: role_name,
                description: role_description,
                permissions: permissions,
                is_system_role: false
            });

            return Response.json({ created: true, role: role });

        } else if (action === 'update_role') {
            if (!role_id) {
                return Response.json({ error: 'Missing role_id' }, { status: 400 });
            }

            const updates = {};
            if (role_name) updates.name = role_name;
            if (role_description) updates.description = role_description;
            if (permissions) updates.permissions = permissions;

            const role = await base44.asServiceRole.entities.Role.update(role_id, updates);
            return Response.json({ updated: true, role: role });

        } else if (action === 'delete_role') {
            if (!role_id) {
                return Response.json({ error: 'Missing role_id' }, { status: 400 });
            }

            const roleCheck = await base44.asServiceRole.entities.Role.filter({ id: role_id });
            if (roleCheck[0]?.is_system_role) {
                return Response.json({ error: 'Cannot delete system role' }, { status: 400 });
            }

            await base44.asServiceRole.entities.Role.delete(role_id);
            return Response.json({ deleted: true });

        } else if (action === 'assign_role') {
            if (!target_user_id || !role_id) {
                return Response.json({ error: 'Missing user or role' }, { status: 400 });
            }

            const userRole = await base44.asServiceRole.entities.UserRole.create({
                organization_id: organization_id,
                user_id: target_user_id,
                role_id: role_id,
                assigned_by: user.id,
                assigned_at: new Date().toISOString(),
                expires_at: expires_at
            });

            return Response.json({ assigned: true, user_role: userRole });

        } else if (action === 'remove_role') {
            if (!target_user_id || !role_id) {
                return Response.json({ error: 'Missing user or role' }, { status: 400 });
            }

            const userRoles = await base44.asServiceRole.entities.UserRole.filter({
                organization_id: organization_id,
                user_id: target_user_id,
                role_id: role_id
            });

            if (userRoles.length > 0) {
                await base44.asServiceRole.entities.UserRole.delete(userRoles[0].id);
            }

            return Response.json({ removed: true });

        } else if (action === 'list_roles') {
            const roles = await base44.asServiceRole.entities.Role.filter({
                organization_id: organization_id
            });

            return Response.json({ roles: roles });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Manage permissions error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});