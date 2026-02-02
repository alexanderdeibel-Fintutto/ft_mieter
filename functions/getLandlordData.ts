import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const SUPABASE_URL = 'https://aaefocdqgdgexkcrjhks.supabase.co';
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { dataType = 'dashboard' } = body;

    let data;

    switch (dataType) {
      case 'dashboard':
        const { data: dashboard, error: dashError } = await supabase
          .from('v_landlord_dashboard')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (dashError) throw dashError;
        data = dashboard;
        break;

      case 'buildings':
        const { data: buildings, error: buildError } = await supabase
          .from('v_landlord_dashboard')
          .select('building_id, building_name, street, city, zip, total_units, occupied_units, vacancy_rate')
          .eq('user_id', user.id);
        if (buildError) throw buildError;
        data = buildings;
        break;

      case 'tenants':
        const { data: tenants, error: tenantError } = await supabase
          .from('v_tenant_management')
          .select('*')
          .eq('landlord_id', user.id);
        if (tenantError) throw tenantError;
        data = tenants;
        break;

      case 'financials':
        const { data: financials, error: finError } = await supabase
          .from('v_building_financials')
          .select('*')
          .eq('landlord_id', user.id);
        if (finError) throw finError;
        data = financials;
        break;

      case 'meter_readings':
        const { data: readings, error: readError } = await supabase
          .from('meter_readings')
          .select('*')
          .eq('status', 'pending')
          .order('created_date', { ascending: false });
        if (readError) throw readError;
        data = readings;
        break;

      case 'maintenance_tasks':
        const { data: tasks, error: taskError } = await supabase
          .from('maintenance_tasks')
          .select('*')
          .in('status', ['open', 'in_progress'])
          .order('priority', { ascending: false });
        if (taskError) throw taskError;
        data = tasks;
        break;

      default:
        return Response.json({ error: 'Invalid dataType' }, { status: 400 });
    }

    return Response.json({ data, success: true });
  } catch (error) {
    console.error('Error in getLandlordData:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});