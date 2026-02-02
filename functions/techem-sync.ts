import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Techem/ista provides meter readings and utility cost data
// This function syncs consumption data and triggers billing

const TECHEM_API_BASE = 'https://api.techem.de/v1';
const TECHEM_API_KEY = Deno.env.get('TECHEM_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role === 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const payload = await req.json();
    const { building_id, sync_type = 'readings' } = payload;

    if (sync_type === 'readings') {
      // Fetch latest meter readings from Techem
      const response = await fetch(
        `${TECHEM_API_BASE}/buildings/${building_id}/meter-readings`,
        {
          headers: {
            'Authorization': `Bearer ${TECHEM_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Techem API error: ${response.statusText}`);
      }

      const readings = await response.json();

      // Store meter readings in MeterReading entity
      for (const reading of readings) {
        await base44.asServiceRole.entities.MeterReading.create({
          building_id,
          meter_id: reading.meterId,
          reading_value: reading.value,
          reading_date: reading.date,
          meter_type: reading.type, // strom, gas, wasser, heizung
          source: 'smart_meter',
          is_verified: true,
        });
      }

      console.log(`✓ Techem readings synced: ${readings.length} readings`);

      return Response.json({
        success: true,
        readings_count: readings.length,
      });
    } else if (sync_type === 'billing') {
      // Fetch utility cost data for billing
      const response = await fetch(
        `${TECHEM_API_BASE}/buildings/${building_id}/billing`,
        {
          headers: {
            'Authorization': `Bearer ${TECHEM_API_KEY}`,
          },
        }
      );

      const billing = await response.json();

      console.log(`✓ Techem billing data retrieved for building ${building_id}`);

      return Response.json({
        success: true,
        billing_data: billing,
      });
    }

    return Response.json({ error: 'Invalid sync_type' }, { status: 400 });
  } catch (error) {
    console.error(`Techem sync error: ${error.message}`);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});