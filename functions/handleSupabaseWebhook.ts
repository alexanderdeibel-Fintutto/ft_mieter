import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const WEBHOOK_SECRET = Deno.env.get('SUPABASE_WEBHOOK_SECRET');

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

async function verifyWebhookSignature(req, secret) {
  const signature = req.headers.get('x-signature');
  if (!signature) return false;

  const body = await req.text();
  const encoder = new TextEncoder();
  const data = encoder.encode(secret + body);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex === signature;
}

Deno.serve(async (req) => {
  try {
    // Verify webhook signature
    const isValid = await verifyWebhookSignature(req, WEBHOOK_SECRET);
    if (!isValid) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = await req.json();
    const { type, table, record, old_record } = payload;

    const entityName = TABLE_ENTITY_MAP[table];
    if (!entityName) {
      console.log(`Skipping unknown table: ${table}`);
      return Response.json({ success: true });
    }

    const base44 = createClientFromRequest(req);
    const startTime = Date.now();

    try {
      // Check sync config
      const syncConfigs = await base44.asServiceRole.entities.SyncConfig.filter({ 
        supabase_table: table,
        sync_enabled: true 
      });

      if (!syncConfigs || syncConfigs.length === 0) {
        console.log(`⊘ Sync disabled for table: ${table}`);
        return Response.json({ success: true, message: 'Sync disabled' });
      }

      const config = syncConfigs[0];
      if (config.sync_direction === 'base44_to_supabase' || config.sync_direction === 'disabled') {
        console.log(`⊘ Webhook ignored (sync direction: ${config.sync_direction})`);
        return Response.json({ success: true, message: 'Sync direction mismatch' });
      }

      // Handle webhook event
      let result;
      if (type === 'INSERT') {
        const { id, created_at, updated_at, base44_id, synced_at, ...entityData } = record;
        result = await base44.asServiceRole.entities[entityName].create(entityData);
        
        // Update Supabase with Base44 ID
        await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/${table}?id=eq.${record.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ base44_id: result.id, synced_at: new Date().toISOString() }),
        });

        console.log(`✓ Webhook: Created ${entityName} (${result.id})`);
      } else if (type === 'UPDATE') {
        const { id, created_at, updated_at, base44_id, synced_at, ...entityData } = record;
        if (base44_id) {
          result = await base44.asServiceRole.entities[entityName].update(base44_id, entityData);
          console.log(`✓ Webhook: Updated ${entityName} (${base44_id})`);
        }
      } else if (type === 'DELETE') {
        if (old_record?.base44_id) {
          await base44.asServiceRole.entities[entityName].delete(old_record.base44_id);
          console.log(`✓ Webhook: Deleted ${entityName} (${old_record.base44_id})`);
        }
      }

      const duration = Date.now() - startTime;

      // Log success
      await base44.asServiceRole.entities.SyncLog.create({
        sync_direction: 'supabase_to_base44',
        entity_name: entityName,
        record_id: record?.id || old_record?.id,
        operation: type.toLowerCase(),
        status: 'success',
        duration_ms: duration,
      });

      return Response.json({
        success: true,
        entity: entityName,
        table,
        operation: type,
        duration_ms: duration,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`✗ Webhook error for ${entityName}:`, error);

      // Log error
      await base44.asServiceRole.entities.SyncLog.create({
        sync_direction: 'supabase_to_base44',
        entity_name: entityName,
        record_id: record?.id || old_record?.id,
        operation: type.toLowerCase(),
        status: 'failed',
        error_message: error.message,
        error_details: { stack: error.stack },
        duration_ms: duration,
      });

      throw error;
    }
  } catch (error) {
    console.error(`Webhook error: ${error.message}`);
    return Response.json({ error: error.message }, { status: 500 });
  }
});