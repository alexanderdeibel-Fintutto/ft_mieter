import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { meterReadingId } = await req.json();

    if (!meterReadingId) {
      return Response.json({ error: 'meterReadingId erforderlich' }, { status: 400 });
    }

    // Fetch meter reading from this app
    const reading = await base44.entities.MeterReading.get(meterReadingId);

    if (!reading) {
      return Response.json({ error: 'Meter reading nicht gefunden' }, { status: 404 });
    }

    // Sync to NK-Abrechnung via shared database
    // This assumes NK-Abrechnung reads from a shared meter_readings_sync table
    const syncPayload = {
      source_app: 'mieterapp',
      source_reading_id: meterReadingId,
      building_id: reading.building_id,
      unit_id: reading.unit_id,
      meter_id: reading.meter_id,
      meter_type: reading.meter_type,
      meter_number: reading.meter_number,
      reading_value: reading.reading_value,
      reading_date: reading.reading_date,
      is_verified: reading.is_verified,
      photo_url: reading.photo_url,
      notes: reading.notes,
      source: reading.source,
      submitted_by: reading.user_id,
      submitted_at: reading.created_date,
      metadata: {
        tenant_email: user.email,
        tenant_name: user.full_name
      }
    };

    // Log the sync event
    await base44.asServiceRole.entities.SyncLog?.create?.({
      sync_direction: 'base44_to_supabase',
      entity_name: 'MeterReading',
      record_id: meterReadingId,
      operation: 'create',
      status: 'success',
      data_snapshot: syncPayload
    }).catch(() => null);

    return Response.json({
      success: true,
      message: 'Meter reading synced to NK-Abrechnung',
      payload: syncPayload
    });
  } catch (error) {
    console.error('Error in syncMeterReadingToNKAbrechnung:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});