import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Publishable Key kann sicher ans Frontend gegeben werden
        const publishableKey = Deno.env.get('STRIPE_PUBLISHABLE_KEY');

        return Response.json({
            publishableKey
        });

    } catch (error) {
        console.error('Get publishable key error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});