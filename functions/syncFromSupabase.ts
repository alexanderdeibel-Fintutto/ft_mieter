import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY');

const TABLE_ENTITY_MAP = {
  'user_profiles': 'UserProfile',
  'mieter_buildings': 'MieterBuilding',
  'mieter_building_members': 'MieterBuildingMember',
  'community_posts': 'CommunityPost',
  'community_comments': 'CommunityComment',
  'community_likes': 'CommunityLike',
  'package_notifications': 'PackageNotification',
  'meter_readings': 'MeterReading',
  'messages': 'Message',
  'letter_orders': 'LetterOrder',
  'schufa_orders': 'SchufaOrder',
  'mietrecht_chats': 'MietrechtChat',
};

async function fetchFromSupabase(tableName, limit = 100) {
  const headers = {
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  };

  const url = `${SUPABASE_URL}/rest/v1/${tableName}?limit=${limit}&order=updated_at.desc`;

  try {
    const response = await fetch(url, { headers });
    return await response.json();
  } catch (error) {
    console.error(`Supabase fetch error: ${error.message}`);
    throw error;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { table_name } = await req.json();

    const entityName = TABLE_ENTITY_MAP[table_name];
    if (!entityName) {
      return Response.json({ error: `Unknown table: ${table_name}` }, { status: 400 });
    }

    // Fetch from Supabase
    const supabaseData = await fetchFromSupabase(table_name);

    if (!Array.isArray(supabaseData)) {
      return Response.json({ error: 'Failed to fetch from Supabase' }, { status: 500 });
    }

    // Sync to Base44
    const results = [];
    const errors = [];
    const startTime = Date.now();

    for (const record of supabaseData) {
      const recordStartTime = Date.now();
      try {
        const { base44_id, synced_at, id, created_at, updated_at, ...entityData } = record;

        // Check if record exists in Base44
        let base44Record;
        if (base44_id) {
          try {
            base44Record = await base44.asServiceRole.entities[entityName].get(base44_id);
          } catch (e) {
            // Record not found, will create new
          }
        }

        let result;
        if (base44Record) {
          // Update existing
          result = await base44.asServiceRole.entities[entityName].update(base44_id, entityData);
          results.push({ base44_id, operation: 'update', supabase_id: record.id });
        } else {
          // Create new
          result = await base44.asServiceRole.entities[entityName].create(entityData);
          results.push({ base44_id: result.id, operation: 'create', supabase_id: record.id });

          // Update Supabase with Base44 ID
          await fetch(`${SUPABASE_URL}/rest/v1/${table_name}?id=eq.${record.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ base44_id: result.id, synced_at: new Date().toISOString() }),
          });
        }

        // Log success
        await base44.asServiceRole.entities.SyncLog.create({
          sync_direction: 'supabase_to_base44',
          entity_name: entityName,
          record_id: record.id,
          operation: base44Record ? 'update' : 'create',
          status: 'success',
          duration_ms: Date.now() - recordStartTime,
        });

      } catch (error) {
        errors.push({
          record_id: record.id,
          error: error.message,
        });

        // Log error
        await base44.asServiceRole.entities.SyncLog.create({
          sync_direction: 'supabase_to_base44',
          entity_name: entityName,
          record_id: record.id,
          operation: 'unknown',
          status: 'failed',
          error_message: error.message,
          error_details: { stack: error.stack },
          duration_ms: Date.now() - recordStartTime,
        });
      }
    }

    const totalDuration = Date.now() - startTime;
    console.log(`✓ Synced ${results.length} records from Supabase (${entityName}) in ${totalDuration}ms`);
    if (errors.length > 0) {
      console.error(`✗ ${errors.length} errors during sync:`, errors);
    }

    return Response.json({
      success: errors.length === 0,
      entity: entityName,
      table: table_name,
      synced_count: results.length,
      error_count: errors.length,
      duration_ms: totalDuration,
      records: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});