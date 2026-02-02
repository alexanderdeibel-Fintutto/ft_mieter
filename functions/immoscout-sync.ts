import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ImmoScout24 is Germany's largest real estate portal
// This function handles OAuth and listing sync

const IMMOSCOUT_API_BASE = 'https://api.immobilienscout24.de/v1';
const IMMOSCOUT_CLIENT_ID = Deno.env.get('IMMOSCOUT_CLIENT_ID');
const IMMOSCOUT_CLIENT_SECRET = Deno.env.get('IMMOSCOUT_CLIENT_SECRET');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { action = 'sync', building_id, listing_data } = payload;

    if (action === 'create' && listing_data) {
      // Create listing on ImmoScout24
      const response = await fetch(`${IMMOSCOUT_API_BASE}/expose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${IMMOSCOUT_CLIENT_ID}`,
        },
        body: JSON.stringify({
          title: listing_data.title,
          description: listing_data.description,
          address: {
            street: listing_data.street,
            houseNumber: listing_data.house_number,
            postalCode: listing_data.zip,
            city: listing_data.city,
          },
          price: listing_data.price,
          numberOfRooms: listing_data.rooms,
          livingSpace: listing_data.space,
        }),
      });

      if (!response.ok) {
        throw new Error(`ImmoScout24 API error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✓ Listing created on ImmoScout24: ${result.id}`);

      return Response.json({
        success: true,
        listing_id: result.id,
        url: result.url,
      });
    } else if (action === 'sync') {
      // Sync existing listings from ImmoScout24
      const response = await fetch(`${IMMOSCOUT_API_BASE}/user/me/exposes`, {
        headers: {
          'Authorization': `Bearer ${IMMOSCOUT_CLIENT_ID}`,
        },
      });

      if (!response.ok) {
        throw new Error(`ImmoScout24 sync failed: ${response.statusText}`);
      }

      const listings = await response.json();
      console.log(`✓ ImmoScout24 sync completed: ${listings.length} listings`);

      return Response.json({
        success: true,
        listings_count: listings.length,
        listings,
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error(`ImmoScout24 error: ${error.message}`);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});