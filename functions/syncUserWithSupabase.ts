import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !user.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Prüfe ob User bereits Supabase UUID hat
    if (user.supabase_user_id) {
      return Response.json({
        success: true,
        supabase_user_id: user.supabase_user_id,
        isNew: false,
        alreadySynced: true
      });
    }

    // 2. Prüfe ob User in Supabase existiert
    const { data: existingUser, error: selectError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', user.email.toLowerCase())
      .single();

    if (existingUser) {
      // User existiert - UUID speichern
      await base44.auth.updateMe({
        supabase_user_id: existingUser.id
      });

      return Response.json({
        success: true,
        supabase_user_id: existingUser.id,
        isNew: false
      });
    }

    // 3. User existiert nicht - neu anlegen
    const { data: newUser, error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        email: user.email.toLowerCase(),
        first_name: user.first_name || null,
        last_name: user.last_name || null,
        display_name: user.full_name || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return Response.json({ success: false, error: insertError.message }, { status: 500 });
    }

    // Supabase UUID auf Base44 User speichern
    await base44.auth.updateMe({
      supabase_user_id: newUser.id
    });

    return Response.json({
      success: true,
      supabase_user_id: newUser.id,
      isNew: true
    });

  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});