import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const SQL_SCHEMA = `
-- Create services_registry table for centralized service configuration
CREATE TABLE IF NOT EXISTS services_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_key TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('base44_workspace', 'supabase_edge')),
  base44_integration_name TEXT,
  edge_function_name TEXT,
  openapi_spec_url TEXT,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  apps_enabled TEXT[] DEFAULT ARRAY[]::TEXT[],
  pricing JSONB DEFAULT '{}',
  cost_per_call DECIMAL(10,4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create service_usage_log table
CREATE TABLE IF NOT EXISTS service_usage_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_key TEXT NOT NULL REFERENCES services_registry(service_key),
  app_name TEXT NOT NULL,
  user_email TEXT,
  call_timestamp TIMESTAMPTZ DEFAULT NOW(),
  cost DECIMAL(10,4),
  status TEXT CHECK (status IN ('success', 'failed', 'pending')),
  metadata JSONB DEFAULT '{}'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_key ON services_registry(service_key);
CREATE INDEX IF NOT EXISTS idx_is_active ON services_registry(is_active);
CREATE INDEX IF NOT EXISTS idx_service_usage_app ON service_usage_log(app_name);
CREATE INDEX IF NOT EXISTS idx_service_usage_timestamp ON service_usage_log(call_timestamp);
`;

Deno.serve(async (req) => {
  try {
    // Execute schema
    const { error: schemaError } = await supabase.rpc('execute_raw_sql', {
      sql: SQL_SCHEMA,
    }).catch(async () => {
      // Fallback: use raw SQL query
      return await supabase.from('_sql').select('*');
    });

    if (schemaError) console.log('Schema creation note:', schemaError.message);

    // Insert services
    const services = [
      {
        service_key: 'stripe',
        display_name: 'Stripe Payments',
        description: 'Payment processing and subscriptions',
        integration_type: 'base44_workspace',
        base44_integration_name: 'stripe',
        is_active: true,
        apps_enabled: ['vermietify', 'hausmeisterpro', 'mieterapp', 'calc', 'fintutto'],
        pricing: { transaction_fee_percent: 2.9 },
      },
      {
        service_key: 'brevo',
        display_name: 'Brevo Email Service',
        description: 'Email marketing and transactional emails',
        integration_type: 'base44_workspace',
        base44_integration_name: 'brevo',
        is_active: true,
        apps_enabled: ['vermietify', 'hausmeisterpro', 'mieterapp', 'calc', 'fintutto'],
      },
      {
        service_key: 'openai',
        display_name: 'OpenAI API',
        description: 'ChatGPT and DALL-E for AI features',
        integration_type: 'base44_workspace',
        base44_integration_name: 'openai',
        is_active: true,
        apps_enabled: ['vermietify', 'hausmeisterpro', 'mieterapp', 'calc', 'fintutto'],
        pricing: { per_1k_tokens: 0.01 },
      },
      {
        service_key: 'mapbox',
        display_name: 'Mapbox Maps',
        description: 'Maps, geocoding, directions',
        integration_type: 'base44_workspace',
        base44_integration_name: 'mapbox',
        is_active: true,
        apps_enabled: ['vermietify', 'hausmeisterpro', 'mieterapp'],
        pricing: { per_api_call: 0.0005 },
      },
      {
        service_key: 'letterxpress',
        display_name: 'LetterXpress Briefversand',
        description: 'Digital letter shipping service',
        integration_type: 'supabase_edge',
        edge_function_name: 'letterxpress-send',
        is_active: true,
        apps_enabled: ['vermietify', 'mieterapp'],
        pricing: { brief: 1.49, einschreiben: 4.99, rueckschein: 6.99 },
        cost_per_call: 0.70,
      },
      {
        service_key: 'schufa',
        display_name: 'SCHUFA BonitätsCheck',
        description: 'Credit check and score',
        integration_type: 'supabase_edge',
        edge_function_name: 'schufa-check',
        is_active: true,
        apps_enabled: ['vermietify', 'mieterapp'],
        pricing: { einmalig: 29.95, monitoring_monat: 4.95 },
        cost_per_call: 15.00,
      },
      {
        service_key: 'finapi',
        display_name: 'finAPI Banking',
        description: 'Open Banking and payment data',
        integration_type: 'supabase_edge',
        edge_function_name: 'finapi-sync',
        is_active: true,
        apps_enabled: ['vermietify', 'fintutto'],
        pricing: { per_transaction: 0.10 },
        cost_per_call: 0.08,
      },
    ];

    const { error: insertError, data } = await supabase
      .from('services_registry')
      .upsert(services, { onConflict: 'service_key' });

    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: 'Services registry setup completed',
      services_count: services.length,
      data,
    });
  } catch (error) {
    console.error('Setup error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});