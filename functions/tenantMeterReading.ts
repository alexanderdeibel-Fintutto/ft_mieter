/**
 * MieterApp Backend Function - Zählerstand übermitteln
 * Speichert Zählerablesung mit Foto aus Supabase
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
    const { meterNumber, meterType, readingValue, photoUrl } = body;

    // Validierung
    if (!meterNumber || !readingValue || readingValue < 0) {
      return Response.json(
        { error: 'Ungültige Eingaben: meterNumber und readingValue erforderlich' },
        { status: 400 }
      );
    }

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

    // Zählerablesung speichern
    const { data: reading, error: readingError } = await supabase
      .from('meter_readings')
      .insert({
        org_id: tenantDashboard.org_id,
        building_id: tenantDashboard.building_id,
        unit_id: tenantDashboard.unit_id,
        meter_number: meterNumber,
        meter_type: meterType || 'electricity',
        reading_value: readingValue,
        reading_date: new Date().toISOString().split('T')[0],
        photo_url: photoUrl || null,
        submitted_by_user_id: user.id,
        status: 'pending' // Muss vom Vermieter bestätigt werden
      })
      .select()
      .single();

    if (readingError) {
      return Response.json(
        { error: readingError.message },
        { status: 400 }
      );
    }

    // Email an Vermieter senden
    try {
      const landlordEmail = tenantDashboard.landlord_email;
      if (landlordEmail) {
        await base44.integrations.Core.SendEmail({
          to: landlordEmail,
          subject: `Neue Zählerablesung: ${meterNumber} (${meterType})`,
          body: `
            Neue Zählerablesung von ${user.full_name}:
            
            Zähler: ${meterNumber}
            Typ: ${meterType}
            Stand: ${readingValue}
            Datum: ${new Date().toLocaleDateString('de-DE')}
            Gebäude: ${tenantDashboard.building_name}
            Einheit: ${tenantDashboard.unit_number}
            
            Bitte überprüfe und bestätige die Ablesung.
          `
        });
      }
    } catch (emailError) {
      console.warn('Failed to send email:', emailError);
      // Nicht blockierend - Ablesung wurde trotzdem gespeichert
    }

    return Response.json({
      success: true,
      reading_id: reading.id,
      message: 'Zählerstand erfolgreich übermittelt. Vermieter muss dies noch bestätigen.'
    });
  } catch (error) {
    console.error('Error in tenantMeterReading:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});