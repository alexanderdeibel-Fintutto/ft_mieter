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

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Load app context
    const { data: appContext, error: appError } = await supabase
      .from('v_ai_app_context')
      .select('*')
      .eq('app_id', APP_ID)
      .single();

    if (appError) {
      console.error('Error loading app context:', appError);
      return Response.json({ error: appError.message }, { status: 500 });
    }

    // Load all personas
    const { data: personas, error: personasError } = await supabase
      .from('v_ai_persona_context')
      .select('*');

    if (personasError) {
      console.error('Error loading personas:', personasError);
    }

    // Load system prompts
    const { data: prompts, error: promptsError } = await supabase
      .from('v_ai_system_prompts')
      .select('*');

    if (promptsError) {
      console.error('Error loading system prompts:', promptsError);
    }

    return Response.json({
      success: true,
      appContext: appContext,
      personas: personas || [],
      systemPrompts: prompts || []
    });
  } catch (error) {
    console.error('Error in loadAIContext:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});