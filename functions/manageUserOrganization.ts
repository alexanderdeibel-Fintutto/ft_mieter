import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 3: Benutzer- & Organisationsmanagement
 * Verwaltet Organisation, Mitgliedschaften, Rollen und Team-Verwaltung
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            action,           // 'get_org', 'create_org', 'add_member', 'remove_member', 'update_role', 'list_members'
            org_id,           // Organization ID
            user_email,       // E-Mail des Users (für add_member)
            new_role,         // Neue Rolle (owner, admin, member)
            member_user_id    // User ID des zu verwaltenden Members
        } = await req.json();

        if (!action) {
            return Response.json({ error: 'Missing action parameter' }, { status: 400 });
        }

        switch (action) {
            case 'get_org':
                return await getOrganization(base44, user, org_id);
            case 'create_org':
                return await createOrganization(base44, user, await req.json());
            case 'add_member':
                return await addMember(base44, user, org_id, user_email, await req.json());
            case 'remove_member':
                return await removeMember(base44, user, org_id, member_user_id);
            case 'update_role':
                return await updateMemberRole(base44, user, org_id, member_user_id, new_role);
            case 'list_members':
                return await listMembers(base44, user, org_id);
            default:
                return Response.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function getOrganization(base44, user, orgId) {
    // Prüfe Zugriff: User muss Mitglied sein
    const membership = await base44.entities.OrgMembership.filter({
        user_id: user.id,
        organization_id: orgId,
        is_active: true
    });

    if (membership.length === 0) {
        return Response.json({ error: 'Not a member of this organization' }, { status: 403 });
    }

    const org = await base44.entities.Organization.filter({ id: orgId });
    return Response.json({ 
        organization: org[0],
        user_role: membership[0].role
    });
}

async function createOrganization(base44, user, data) {
    const { name, description } = data;

    if (!name) {
        return Response.json({ error: 'Organization name required' }, { status: 400 });
    }

    // Erstelle Organisation
    const org = await base44.entities.Organization.create({
        name: name,
        description: description || '',
        owner_user_id: user.id
    });

    // Erstelle Membership als Owner
    await base44.entities.OrgMembership.create({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner',
        is_active: true
    });

    return Response.json({ 
        organization: org,
        message: 'Organization created successfully'
    });
}

async function addMember(base44, user, orgId, userEmail, data) {
    // Prüfe Admin-Zugriff
    const membership = await base44.entities.OrgMembership.filter({
        user_id: user.id,
        organization_id: orgId,
        is_active: true
    });

    if (membership.length === 0 || !['owner', 'admin'].includes(membership[0].role)) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const newRole = data.role || 'member';

    // Finde User via E-Mail
    const users = await base44.entities.User.filter({
        email: userEmail
    });

    if (users.length === 0) {
        return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const newUser = users[0];

    // Prüfe ob bereits Mitglied
    const existing = await base44.entities.OrgMembership.filter({
        organization_id: orgId,
        user_id: newUser.id
    });

    if (existing.length > 0) {
        return Response.json({ error: 'User already member' }, { status: 400 });
    }

    // Erstelle Membership
    const newMembership = await base44.entities.OrgMembership.create({
        organization_id: orgId,
        user_id: newUser.id,
        role: newRole,
        is_active: true
    });

    return Response.json({ 
        membership: newMembership,
        message: 'Member added successfully'
    });
}

async function removeMember(base44, user, orgId, memberUserId) {
    // Prüfe Admin-Zugriff
    const membership = await base44.entities.OrgMembership.filter({
        user_id: user.id,
        organization_id: orgId,
        is_active: true
    });

    if (membership.length === 0 || !['owner', 'admin'].includes(membership[0].role)) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Deaktiviere Membership
    await base44.entities.OrgMembership.update(
        memberUserId,
        { is_active: false }
    );

    return Response.json({ message: 'Member removed successfully' });
}

async function updateMemberRole(base44, user, orgId, memberUserId, newRole) {
    // Prüfe Owner-Zugriff (nur Owner kann Rollen ändern)
    const membership = await base44.entities.OrgMembership.filter({
        user_id: user.id,
        organization_id: orgId,
        is_active: true
    });

    if (membership.length === 0 || membership[0].role !== 'owner') {
        return Response.json({ error: 'Only owner can change roles' }, { status: 403 });
    }

    if (!['owner', 'admin', 'member'].includes(newRole)) {
        return Response.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Update Membership
    const updated = await base44.entities.OrgMembership.update(memberUserId, {
        role: newRole
    });

    return Response.json({ 
        membership: updated,
        message: 'Role updated successfully'
    });
}

async function listMembers(base44, user, orgId) {
    // Prüfe Zugriff
    const membership = await base44.entities.OrgMembership.filter({
        user_id: user.id,
        organization_id: orgId,
        is_active: true
    });

    if (membership.length === 0) {
        return Response.json({ error: 'Not a member of this organization' }, { status: 403 });
    }

    // Hole alle aktiven Members
    const members = await base44.entities.OrgMembership.filter({
        organization_id: orgId,
        is_active: true
    });

    // Lade User-Details
    const memberDetails = await Promise.all(
        members.map(async (m) => {
            const users = await base44.entities.User.filter({ id: m.user_id });
            return {
                membership: m,
                user: users[0] || { id: m.user_id, email: 'unknown' }
            };
        })
    );

    return Response.json({ members: memberDetails });
}