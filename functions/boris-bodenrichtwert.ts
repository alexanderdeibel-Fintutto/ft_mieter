import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// BORIS (Bodenrichtwertinformationssystem) provides official land values
// Each federal state (Bundesland) has its own system

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { street, zip, city, bundesland } = payload;

    // Mock implementation - in production, query each state's BORIS API
    const bodenrichtwert = Math.floor(Math.random() * (500 - 100) + 100); // €/m²

    return Response.json({
      success: true,
      location: { street, zip, city, bundesland },
      bodenrichtwert_per_m2: bodenrichtwert,
      currency: 'EUR',
      unit: 'm²',
      grundsteuer_estimate: (bodenrichtwert * 0.0035).toFixed(2), // 0.35% Grundsteuer
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`BORIS error: ${error.message}`);
    return Response.json({ error: error.message }, { status: 500 });
  }
});