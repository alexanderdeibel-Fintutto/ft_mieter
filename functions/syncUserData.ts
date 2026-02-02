import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * User Data Sync zwischen Apps
 * Synchronisiert Benutzer-Daten zentral, damit alle Apps konsistent sind
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, data } = await req.json();

        if (!action) {
            return Response.json({ error: 'Missing action parameter' }, { status: 400 });
        }

        switch (action) {
            case 'sync_profile':
                return await syncUserProfile(base44, user, data);
            case 'sync_preferences':
                return await syncUserPreferences(base44, user, data);
            case 'get_unified_profile':
                return await getUnifiedProfile(base44, user);
            default:
                return Response.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Sync error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function syncUserProfile(base44, user, data) {
    const { display_name, phone, avatar_url } = data;

    // Update Base44 User
    const updateData = {};
    if (display_name) updateData.full_name = display_name;
    if (phone) updateData.phone = phone;

    if (Object.keys(updateData).length > 0) {
        await base44.auth.updateMe(updateData);
    }

    // Update/Create UserProfile in DB
    const profiles = await base44.entities.UserProfile.filter({
        user_id: user.id
    });

    let profile;
    if (profiles.length > 0) {
        profile = await base44.entities.UserProfile.update(profiles[0].id, {
            display_name: display_name || profiles[0].display_name,
            phone: phone || profiles[0].phone,
            avatar_url: avatar_url || profiles[0].avatar_url
        });
    } else {
        profile = await base44.entities.UserProfile.create({
            user_id: user.id,
            email: user.email,
            display_name: display_name || user.full_name,
            phone: phone || '',
            avatar_url: avatar_url || ''
        });
    }

    return Response.json({
        message: 'Profile synced',
        profile: profile
    });
}

async function syncUserPreferences(base44, user, data) {
    const { app_preferences, theme, language } = data;

    // Update UserProfile mit Preferences
    const profiles = await base44.entities.UserProfile.filter({
        user_id: user.id
    });

    if (profiles.length === 0) {
        return Response.json({ error: 'UserProfile not found' }, { status: 404 });
    }

    const currentPrefs = profiles[0].app_preferences || {};
    const updated = await base44.entities.UserProfile.update(profiles[0].id, {
        app_preferences: {
            ...currentPrefs,
            ...app_preferences,
            theme: theme || currentPrefs.theme,
            language: language || currentPrefs.language,
            last_updated: new Date().toISOString()
        }
    });

    return Response.json({
        message: 'Preferences synced',
        preferences: updated.app_preferences
    });
}

async function getUnifiedProfile(base44, user) {
    // Hole alle Benutzer-Informationen zentral
    const profiles = await base44.entities.UserProfile.filter({
        user_id: user.id
    });

    // Hole Organisationsmitgliedschaften
    const memberships = await base44.entities.OrgMembership.filter({
        user_id: user.id,
        is_active: true
    });

    // Hole Seat Allocations
    const seats = await base44.entities.SeatAllocation.filter({
        receiving_user_id: user.id,
        is_active: true
    });

    // Lade Organisationen
    const orgDetails = await Promise.all(
        memberships.map(async (m) => {
            const orgs = await base44.entities.Organization.filter({ id: m.organization_id });
            return {
                organization: orgs[0],
                role: m.role,
                membership_id: m.id
            };
        })
    );

    return Response.json({
        user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role
        },
        profile: profiles[0] || null,
        organizations: orgDetails,
        app_seats: seats,
        last_sync: new Date().toISOString()
    });
}