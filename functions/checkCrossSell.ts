import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const APP_ID = 'mieterapp';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userMessage } = await req.json();

    if (!userMessage) {
      return Response.json({ success: true, recommendation: null });
    }

    const messageLower = userMessage.toLowerCase();

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Load cross-sell triggers
    const { data: triggers, error: triggersError } = await supabase
      .from('ai_cross_sell_triggers')
      .select('*')
      .eq('from_app_id', APP_ID)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (triggersError) {
      console.error('Error loading cross-sell triggers:', triggersError);
      return Response.json({ success: true, recommendation: null });
    }

    if (!triggers || triggers.length === 0) {
      return Response.json({ success: true, recommendation: null });
    }

    // Check if keywords match
    for (const trigger of triggers) {
      const keywords = trigger.trigger_keywords || [];
      const hasMatch = keywords.some(kw =>
        messageLower.includes(kw.toLowerCase())
      );

      if (hasMatch) {
        return Response.json({
          success: true,
          recommendation: {
            toApp: trigger.to_app_id,
            message: trigger.message_template,
            icon: trigger.icon,
            priority: trigger.priority
          }
        });
      }
    }

    return Response.json({ success: true, recommendation: null });
  } catch (error) {
    console.error('Error in checkCrossSell:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});