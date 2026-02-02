import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { reading_id, confirmed_value, was_manually_corrected } = body;

        if (!reading_id) {
            return Response.json({ error: 'reading_id erforderlich' }, { status: 400 });
        }

        // Update MeterReading Entity (falls vorhanden)
        try {
            await base44.entities.MeterReading.update(reading_id, {
                reading_value: confirmed_value,
                was_manually_corrected: was_manually_corrected || false,
                status: 'confirmed',
                confirmed_at: new Date().toISOString(),
                confirmed_by: user.id
            });

            return Response.json({
                success: true,
                message: 'Ablesung bestätigt'
            });
        } catch (error) {
            console.log('MeterReading entity not found:', error.message);
            return Response.json({
                success: false,
                error: 'MeterReading Entity existiert nicht'
            }, { status: 404 });
        }

    } catch (error) {
        console.error('Error confirming meter reading:', error);
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});