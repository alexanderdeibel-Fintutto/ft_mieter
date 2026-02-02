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
    const { readingId, approved, notes } = body;

    if (!readingId) {
      return Response.json({ error: 'readingId erforderlich' }, { status: 400 });
    }

    // Zählerablesung genehmigen/ablehnen
    const { data: reading, error: updateError } = await supabase
      .from('meter_readings')
      .update({
        status: approved ? 'verified' : 'rejected',
        verified_by_user_id: user.id,
        verified_date: new Date().toISOString(),
        notes: notes || null
      })
      .eq('id', readingId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Email an Mieter senden
    try {
      const { data: tenant } = await supabase
        .from('v_tenant_management')
        .select('tenant_email')
        .eq('meter_reading_id', readingId)
        .single();

      if (tenant?.tenant_email) {
        await base44.integrations.Core.SendEmail({
          to: tenant.tenant_email,
          subject: approved ? 'Zählerablesung bestätigt' : 'Zählerablesung abgelehnt',
          body: `
            Deine Zählerablesung für Zähler ${reading.meter_number} wurde ${approved ? 'bestätigt' : 'abgelehnt'}.
            ${notes ? `Notiz: ${notes}` : ''}
          `
        });
      }
    } catch (emailError) {
      console.warn('Failed to send email:', emailError);
    }

    return Response.json({
      success: true,
      reading,
      message: `Zählerablesung ${approved ? 'genehmigt' : 'abgelehnt'}`
    });
  } catch (error) {
    console.error('Error in approveMeterReading:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});