import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            email,
            app_id,
            seat_type,
            organization_id
        } = await req.json();

        if (!email || !app_id || !seat_type || !organization_id) {
            return Response.json({
                error: 'Missing required: email, app_id, seat_type, organization_id'
            }, { status: 400 });
        }

        // Create invitation token
        const token = crypto.randomUUID();

        // Create invitation record
        const invitation = await base44.entities.Invitation.create({
            email,
            inviting_org_id: organization_id,
            inviting_user_id: user.id,
            app_id,
            seat_type,
            token,
            status: 'pending',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

        // Get organization name for email
        const org = await base44.entities.Organization.filter({
            id: organization_id
        });

        const orgName = org.length > 0 ? org[0].name : 'FinTuttO';

        // Send invitation email
        const inviteUrl = `${Deno.env.get('APP_BASE_URL')}/invite?token=${token}&app=${app_id}`;

        await base44.integrations.Core.SendEmail({
            to: email,
            subject: `Du wurdest zu ${orgName} in ${app_id} eingeladen!`,
            body: `
Hallo!

Du wurdest eingeladen, bei ${orgName} beizutreten.

Klicke hier um die Einladung anzunehmen:
${inviteUrl}

Diese Einladung gilt 7 Tage.

Liebe Grüße,
${user.full_name || 'Dein Team'}
            `
        });

        return Response.json({
            invitation_id: invitation.id,
            token,
            email_sent: true
        });

    } catch (error) {
        console.error('sendInvitationEmail error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});