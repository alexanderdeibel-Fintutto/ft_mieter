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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get user's building
    const { data: buildingMember } = await supabase
      .from('mieter_building_members')
      .select('building_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!buildingMember) {
      return Response.json({ success: true, documents: [] });
    }

    // Get documents visible to tenant
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('building_id', buildingMember.building_id)
      .eq('visible_to_tenant', true)
      .order('created_date', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching documents:', error);
      return Response.json({ success: true, documents: [] });
    }

    return Response.json({
      success: true,
      documents: documents || [],
      buildingId: buildingMember.building_id
    });
  } catch (error) {
    console.error('Error in getVisibleTenantDocuments:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});