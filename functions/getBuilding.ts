import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { buildingId } = await req.json();

    if (!buildingId) {
      return Response.json({ error: 'buildingId erforderlich' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Fetch building from central buildings table
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('*')
      .eq('id', buildingId)
      .single();

    if (buildingError) {
      return Response.json({ error: 'Building nicht gefunden' }, { status: 404 });
    }

    // Fetch MieterBuilding for community settings
    const { data: mieterBuilding } = await supabase
      .from('mieter_buildings')
      .select('*')
      .eq('building_id', buildingId)
      .single();

    // Combine data
    const result = {
      ...building,
      community_settings: mieterBuilding?.settings || {},
      community_enabled: mieterBuilding?.community_enabled !== false
    };

    return Response.json({ success: true, building: result });
  } catch (error) {
    console.error('Error in getBuilding:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});