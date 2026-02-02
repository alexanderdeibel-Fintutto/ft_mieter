import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY');

const ENTITY_TABLE_MAP = {
  'UserProfile': 'user_profiles',
  'MieterBuilding': 'mieter_buildings',
  'MieterBuildingMember': 'mieter_building_members',
  'CommunityPost': 'community_posts',
  'CommunityComment': 'community_comments',
  'CommunityLike': 'community_likes',
  'PackageNotification': 'package_notifications',
  'MeterReading': 'meter_readings',
  'Message': 'messages',
  'LetterOrder': 'letter_orders',
  'SchufaOrder': 'schufa_orders',
  'MietrechtChat': 'mietrecht_chats',
};

async function syncToSupabase(tableName, data, operation) {
  const headers = {
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };

  const url = `${SUPABASE_URL}/rest/v1/${tableName}`;

  try {
    if (operation === 'create' || operation === 'update') {
      const method = operation === 'create' ? 'POST' : 'PATCH';
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(data),
      });
      return await response.json();
    } else if (operation === 'delete') {
      await fetch(`${url}?id=eq.${data.id}`, {
        method: 'DELETE',
        headers,
      });
      return { success: true };
    }
  } catch (error) {
    console.error(`Supabase sync error: ${error.message}`);
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

    const payload = await req.json();
    const { entity_name, entity_id, operation, data } = payload;

    const tableName = ENTITY_TABLE_MAP[entity_name];
    if (!tableName) {
      return Response.json({ error: `Unknown entity: ${entity_name}` }, { status: 400 });
    }

    const startTime = Date.now();

    try {
      // Add metadata
      const syncData = {
        ...data,
        base44_id: entity_id,
        synced_at: new Date().toISOString(),
      };

      const result = await syncToSupabase(tableName, syncData, operation);
      const duration = Date.now() - startTime;

      console.log(`✓ Synced ${entity_name} to Supabase (${operation}) in ${duration}ms`);

      // Log success
      await base44.asServiceRole.entities.SyncLog.create({
        sync_direction: 'base44_to_supabase',
        entity_name: entity_name,
        record_id: entity_id,
        operation,
        status: 'success',
        duration_ms: duration,
      });

      return Response.json({
        success: true,
        entity: entity_name,
        table: tableName,
        operation,
        duration_ms: duration,
        result,
      });
    } catch (syncError) {
      const duration = Date.now() - startTime;
      console.error(`✗ Failed to sync ${entity_name} to Supabase:`, syncError);

      // Log error
      await base44.asServiceRole.entities.SyncLog.create({
        sync_direction: 'base44_to_supabase',
        entity_name: entity_name,
        record_id: entity_id,
        operation,
        status: 'failed',
        error_message: syncError.message,
        error_details: { stack: syncError.stack },
        duration_ms: duration,
      });

      throw syncError;
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});