/**
 * MieterApp Backend Function - Schadensmeldung erstellen
 * Lädt Mieter-Daten aus Supabase und erstellt Schadensmeldung
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const SUPABASE_URL = 'https://aaefocdqgdgexkcrjhks.supabase.co';
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

Deno.serve(async (req) => {
  try {
    // Auth via Base44
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, priority = 'normal', photoUrl } = body;

    // Mieter-Daten aus Supabase laden
    const { data: tenantDashboard, error: dashError } = await supabase
      .from('v_tenant_dashboard')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (dashError || !tenantDashboard) {
      return Response.json(
        { error: 'Mieter-Daten nicht gefunden' },
        { status: 404 }
      );
    }

    // Schadensmeldung erstellen
    const { data: task, error: taskError } = await supabase
      .from('maintenance_tasks')
      .insert({
        org_id: tenantDashboard.org_id,
        building_id: tenantDashboard.building_id,
        unit_id: tenantDashboard.unit_id,
        tenant_id: tenantDashboard.tenant_id,
        title,
        description,
        priority,
        photo_url: photoUrl || null,
        status: 'open',
        task_type: 'repair',
        source_type: 'tenant_report',
        created_by_user_id: user.id
      })
      .select()
      .single();

    if (taskError) {
      return Response.json(
        { error: taskError.message },
        { status: 400 }
      );
    }

    // Email an Vermieter senden
    try {
      const landlordEmail = tenantDashboard.landlord_email;
      if (landlordEmail) {
        await base44.integrations.Core.SendEmail({
          to: landlordEmail,
          subject: `Neue Schadensmeldung: ${title}`,
          body: `
            Neue Schadensmeldung von ${user.full_name}:
            
            Titel: ${title}
            Beschreibung: ${description}
            Priorität: ${priority}
            Gebäude: ${tenantDashboard.building_name}
            Einheit: ${tenantDashboard.unit_number}
            
            Bitte kümmere dich darum.
          `
        });
      }
    } catch (emailError) {
      console.warn('Failed to send email:', emailError);
      // Nicht blockierend - Aufgabe wurde trotzdem erstellt
    }

    return Response.json({
      success: true,
      task_id: task.id,
      message: 'Schadensmeldung erfolgreich erstellt'
    });
  } catch (error) {
    console.error('Error in tenantMaintenance:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});