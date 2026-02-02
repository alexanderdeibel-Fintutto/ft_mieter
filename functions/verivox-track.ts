import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Verivox is a German comparison portal for energy, insurance, etc.
// This function tracks affiliate conversions

const VERIVOX_TRACKING_ID = Deno.env.get('VERIVOX_TRACKING_ID');
const VERIVOX_API_KEY = Deno.env.get('VERIVOX_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { action = 'generate_link', category = 'strom', user_id } = payload;

    if (action === 'generate_link') {
      // Generate affiliate link for Verivox
      const affiliateLink = `https://www.verivox.de/?tc=${VERIVOX_TRACKING_ID}&category=${category}&ref=${user_id}`;

      return Response.json({
        success: true,
        affiliate_link: affiliateLink,
        category,
      });
    } else if (action === 'track_conversion') {
      // Track successful conversion
      const { conversion_id, amount, category } = payload;

      const trackingPayload = {
        conversion_id,
        amount,
        category,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch('https://api.verivox.de/v1/conversions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERIVOX_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackingPayload),
      });

      if (!response.ok) {
        throw new Error(`Verivox tracking failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Store conversion in database for analytics
      console.log(`✓ Verivox conversion tracked: ${conversion_id}`);

      return Response.json({
        success: true,
        conversion_id: result.id,
        commission: result.commission,
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error(`Verivox error: ${error.message}`);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});