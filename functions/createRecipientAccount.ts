import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const {
            name,
            payment_provider,
            stripe_account_id,
            paypal_email,
            bank_details,
            default_for_property
        } = await req.json();

        // RecipientAccount erstellen
        const recipientAccount = await base44.asServiceRole.entities.RecipientAccount.create({
            name,
            owner_user_id: user.id,
            payment_provider,
            stripe_account_id: stripe_account_id || null,
            paypal_email: paypal_email || null,
            bank_details: bank_details || null,
            is_active: true,
            verification_status: 'nicht_verifiziert',
            default_for_property: default_for_property || null,
            metadata: {
                created_at: new Date().toISOString(),
                created_by: user.email
            }
        });

        return Response.json({
            success: true,
            recipient_account: recipientAccount
        });

    } catch (error) {
        console.error('Create recipient account error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});