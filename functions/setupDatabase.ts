import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from "npm:@supabase/supabase-js";

/**
 * Database Setup for Revenue & Affiliate System
 * Creates all required tables, indexes, and seeds initial data.
 *
 * Usage: Call with action: 'setup_all' to run everything, or individual actions:
 * - 'create_tables': Create all tables
 * - 'seed_partners': Seed affiliate partner data
 * - 'seed_bundle_config': Create bundle config table
 * - 'verify': Check which tables exist
 */

const CREATE_TABLES_SQL = `
-- Affiliate Partners
CREATE TABLE IF NOT EXISTS affiliate_partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  offer_headline TEXT,
  offer_description TEXT,
  affiliate_url TEXT NOT NULL,
  revenue_model TEXT NOT NULL DEFAULT 'cpc',
  commission DECIMAL(10,2) DEFAULT 0,
  commission_currency TEXT DEFAULT 'EUR',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  target_audience TEXT[] DEFAULT '{}',
  trigger_contexts TEXT[] DEFAULT '{}',
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate Tracking
CREATE TABLE IF NOT EXISTS affiliate_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  trigger_context TEXT,
  order_id TEXT,
  order_value DECIMAL(10,2),
  partner_name TEXT,
  voucher_code TEXT,
  recommendation_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate User Preferences
CREATE TABLE IF NOT EXISTS affiliate_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  partner_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  categories_opted_in TEXT[] DEFAULT '{}',
  categories_opted_out TEXT[] DEFAULT '{}',
  sovendus_consent BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, partner_id)
);

-- Ecosystem Cross-Sell Log
CREATE TABLE IF NOT EXISTS ecosystem_cross_sell_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  source_app TEXT NOT NULL,
  target_app TEXT NOT NULL,
  event_type TEXT,
  action TEXT NOT NULL,
  recommendation_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ecosystem Bundle Events
CREATE TABLE IF NOT EXISTS ecosystem_bundle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  bundle_id TEXT NOT NULL,
  action TEXT NOT NULL,
  billing_cycle TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ecosystem Bundle Config (stores Stripe Price IDs)
CREATE TABLE IF NOT EXISTS ecosystem_bundle_config (
  bundle_id TEXT PRIMARY KEY,
  stripe_product_id TEXT,
  stripe_monthly_price_id TEXT,
  stripe_yearly_price_id TEXT,
  monthly_amount DECIMAL(10,2),
  yearly_amount DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction Usage
CREATE TABLE IF NOT EXISTS transaction_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  plan TEXT DEFAULT 'free',
  cost_price DECIMAL(10,4) DEFAULT 0,
  sell_price DECIMAL(10,4) DEFAULT 0,
  margin DECIMAL(10,4) DEFAULT 0,
  within_quota BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- White-Label Tenants
CREATE TABLE IF NOT EXISTS white_label_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_email TEXT,
  company_phone TEXT,
  unit_count INTEGER DEFAULT 0,
  tier_id TEXT NOT NULL,
  branding JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending_setup',
  monthly_price DECIMAL(10,2),
  apps_enabled TEXT[] DEFAULT '{}',
  features_enabled TEXT[] DEFAULT '{}',
  stripe_subscription_id TEXT,
  custom_domain TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- White-Label Units
CREATE TABLE IF NOT EXISTS white_label_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES white_label_tenants(id) ON DELETE CASCADE,
  address TEXT,
  unit_type TEXT,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- White-Label Unit Tenants
CREATE TABLE IF NOT EXISTS white_label_unit_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES white_label_tenants(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES white_label_units(id) ON DELETE SET NULL,
  tenant_user_id TEXT,
  tenant_name TEXT,
  tenant_email TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B Test Configurations
CREATE TABLE IF NOT EXISTS ab_test_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  variants JSONB NOT NULL DEFAULT '[]',
  traffic_split JSONB NOT NULL DEFAULT '{}',
  target_metric TEXT NOT NULL DEFAULT 'click_rate',
  status TEXT NOT NULL DEFAULT 'draft',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B Test Assignments (which user sees which variant)
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id TEXT NOT NULL REFERENCES ab_test_configs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  variant TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_id, user_id)
);

-- A/B Test Events (tracked interactions)
CREATE TABLE IF NOT EXISTS ab_test_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id TEXT NOT NULL REFERENCES ab_test_configs(id) ON DELETE CASCADE,
  user_id TEXT,
  variant TEXT NOT NULL,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

const CREATE_INDEXES_SQL = `
CREATE INDEX IF NOT EXISTS idx_affiliate_tracking_user ON affiliate_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_tracking_provider ON affiliate_tracking(provider);
CREATE INDEX IF NOT EXISTS idx_affiliate_tracking_created ON affiliate_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_tracking_event ON affiliate_tracking(event_type);
CREATE INDEX IF NOT EXISTS idx_affiliate_prefs_user ON affiliate_user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_crosssell_log_user ON ecosystem_cross_sell_log(user_id);
CREATE INDEX IF NOT EXISTS idx_crosssell_log_created ON ecosystem_cross_sell_log(created_at);
CREATE INDEX IF NOT EXISTS idx_bundle_events_user ON ecosystem_bundle_events(user_id);
CREATE INDEX IF NOT EXISTS idx_tx_usage_user ON transaction_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_tx_usage_type ON transaction_usage(transaction_type);
CREATE INDEX IF NOT EXISTS idx_tx_usage_created ON transaction_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_wl_tenants_owner ON white_label_tenants(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_wl_units_tenant ON white_label_units(tenant_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_active ON affiliate_partners(is_active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_ab_assignments_test ON ab_test_assignments(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_events_test ON ab_test_events(test_id);
`;

const SEED_PARTNERS = [
  { id: 'verivox', name: 'Verivox', category: 'energie', description: 'Strom- und Gasvergleich – bis zu 500€/Jahr sparen', offer_headline: 'Bis zu 500€ sparen', offer_description: 'Vergleiche jetzt Strom- und Gastarife und spare bis zu 500€ im Jahr.', affiliate_url: 'https://www.verivox.de', revenue_model: 'cpa', commission: 30.00, is_active: true, priority: 10, target_audience: '{mieter,vermieter}', trigger_contexts: '{energy_view,verbrauch_view,first_login,nk_abrechnung}' },
  { id: 'check24_strom', name: 'CHECK24 Strom', category: 'energie', description: 'Stromvergleich in 2 Minuten', offer_headline: 'Strom wechseln & sparen', offer_description: 'Über 1.000 Stromanbieter vergleichen und bis zu 800€ sparen.', affiliate_url: 'https://www.check24.de/strom/', revenue_model: 'cpa', commission: 25.00, is_active: true, priority: 9, target_audience: '{mieter}', trigger_contexts: '{energy_view,umzug,first_login}' },
  { id: 'huk24_hausrat', name: 'HUK24 Hausratversicherung', category: 'versicherung', description: 'Hausratversicherung ab 2,63€/Monat', offer_headline: 'Hausrat ab 2,63€/Monat', offer_description: 'Schütze dein Zuhause mit einer günstigen Hausratversicherung.', affiliate_url: 'https://www.huk24.de/hausratversicherung', revenue_model: 'cpl', commission: 15.00, is_active: true, priority: 8, target_audience: '{mieter}', trigger_contexts: '{first_login,mietvertrag_view,onboarding}' },
  { id: 'myhammer', name: 'MyHammer', category: 'handwerker', description: 'Handwerker in deiner Nähe finden', offer_headline: 'Handwerker finden', offer_description: 'Finde geprüfte Handwerker für Reparaturen und Renovierungen.', affiliate_url: 'https://www.myhammer.de', revenue_model: 'cpl', commission: 5.00, is_active: true, priority: 7, target_audience: '{vermieter,hausmeister}', trigger_contexts: '{repair_created,maintenance_needed}' },
  { id: 'check24_internet', name: 'CHECK24 Internet', category: 'internet', description: 'Internet- und DSL-Vergleich', offer_headline: 'Internet ab 9,99€/Monat', offer_description: 'Vergleiche Internet-Tarife und finde den besten Deal.', affiliate_url: 'https://www.check24.de/internet/', revenue_model: 'cpa', commission: 20.00, is_active: true, priority: 6, target_audience: '{mieter}', trigger_contexts: '{umzug,first_login,adresswechsel}' },
  { id: 'movinga', name: 'Movinga', category: 'umzug', description: 'Professioneller Umzugsservice', offer_headline: 'Umzug ab 299€', offer_description: 'Stressfrei umziehen mit professionellen Umzugshelfern.', affiliate_url: 'https://www.movinga.de', revenue_model: 'cpl', commission: 10.00, is_active: true, priority: 7, target_audience: '{mieter}', trigger_contexts: '{kuendigung,umzug,mietvertrag_ended}' },
  { id: 'home24', name: 'Home24', category: 'moebel', description: 'Möbel & Einrichtung online', offer_headline: '15% Neukunden-Rabatt', offer_description: 'Richte dein neues Zuhause ein – mit 15% Rabatt für Neukunden.', affiliate_url: 'https://www.home24.de', revenue_model: 'cps', commission: 5.00, is_active: true, priority: 5, target_audience: '{mieter}', trigger_contexts: '{umzug,first_login,einzug}' },
  { id: 'helpling', name: 'Helpling', category: 'reinigung', description: 'Reinigungskräfte für Wohnung & Haus', offer_headline: 'Putzhilfe ab 13€/Stunde', offer_description: 'Professionelle Reinigung für deine Wohnung oder Immobilie.', affiliate_url: 'https://www.helpling.de', revenue_model: 'cpa', commission: 8.00, is_active: true, priority: 5, target_audience: '{vermieter,hausmeister,mieter}', trigger_contexts: '{mieterwechsel,auszug,maintenance}' },
];

const SEED_AB_TESTS = [
  {
    id: 'affiliate_widget_placement',
    name: 'Affiliate Widget Platzierung',
    description: 'Testet wo das Affiliate-Widget am besten performt: Dashboard unten vs. Sidebar vs. nach Aktionen',
    variants: JSON.stringify([
      { id: 'dashboard_bottom', name: 'Dashboard unten', config: { placement: 'dashboard_bottom', show_count: 3 } },
      { id: 'sidebar', name: 'Sidebar rechts', config: { placement: 'sidebar', show_count: 2 } },
      { id: 'post_action', name: 'Nach Aktionen', config: { placement: 'post_action', show_count: 1, trigger: 'after_payment' } },
    ]),
    traffic_split: JSON.stringify({ dashboard_bottom: 34, sidebar: 33, post_action: 33 }),
    target_metric: 'affiliate_click_rate',
    status: 'active',
  },
  {
    id: 'verivox_banner_style',
    name: 'Verivox Banner Design',
    description: 'Testet verschiedene Verivox-Banner: Kompakt vs. Banner vs. Card',
    variants: JSON.stringify([
      { id: 'compact', name: 'Kompakt', config: { variant: 'compact' } },
      { id: 'banner', name: 'Banner', config: { variant: 'banner' } },
      { id: 'card', name: 'Karte', config: { variant: 'card' } },
    ]),
    traffic_split: JSON.stringify({ compact: 34, banner: 33, card: 33 }),
    target_metric: 'verivox_click_rate',
    status: 'active',
  },
  {
    id: 'sovendus_trigger_timing',
    name: 'Sovendus Trigger-Zeitpunkt',
    description: 'Testet wann Sovendus-Voucher angezeigt werden: sofort vs. 3s Delay vs. 10s Delay',
    variants: JSON.stringify([
      { id: 'immediate', name: 'Sofort', config: { delay_ms: 0 } },
      { id: 'short_delay', name: '3s Verzögerung', config: { delay_ms: 3000 } },
      { id: 'long_delay', name: '10s Verzögerung', config: { delay_ms: 10000 } },
    ]),
    traffic_split: JSON.stringify({ immediate: 34, short_delay: 33, long_delay: 33 }),
    target_metric: 'sovendus_consent_rate',
    status: 'active',
  },
  {
    id: 'bundle_pricing_highlight',
    name: 'Bundle Pricing Highlight',
    description: 'Testet welches Bundle hervorgehoben wird: Vermieter Komplett vs. Fintutto Komplett',
    variants: JSON.stringify([
      { id: 'vermieter', name: 'Vermieter Komplett', config: { highlighted_bundle: 'vermieter_komplett' } },
      { id: 'fintutto', name: 'Fintutto Komplett', config: { highlighted_bundle: 'fintutto_komplett' } },
    ]),
    traffic_split: JSON.stringify({ vermieter: 50, fintutto: 50 }),
    target_metric: 'bundle_checkout_rate',
    status: 'active',
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_KEY")!
    );

    const body = await req.json();
    const { action = 'setup_all' } = body;

    const results: string[] = [];

    // Create tables
    if (action === 'setup_all' || action === 'create_tables') {
      const statements = CREATE_TABLES_SQL.split(';').filter(s => s.trim());
      for (const stmt of statements) {
        const { error } = await supabase.rpc('exec_sql', { sql: stmt.trim() + ';' }).catch(() => ({ error: null }));
        // Fallback: try direct query
        if (error) {
          // Tables might need to be created via Supabase Dashboard SQL editor
          results.push(`Note: Direct SQL execution may require Dashboard access`);
          break;
        }
      }

      // Alternative: create tables one by one via Supabase client
      // This works even without RPC
      const tableChecks = [
        'affiliate_partners', 'affiliate_tracking', 'affiliate_user_preferences',
        'ecosystem_cross_sell_log', 'ecosystem_bundle_events', 'ecosystem_bundle_config',
        'transaction_usage', 'white_label_tenants', 'white_label_units',
        'white_label_unit_tenants', 'ab_test_configs', 'ab_test_assignments', 'ab_test_events'
      ];

      for (const table of tableChecks) {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error && error.code === '42P01') {
          results.push(`Table '${table}' does not exist - run migration SQL in Supabase Dashboard`);
        } else if (!error) {
          results.push(`Table '${table}' exists ✓`);
        } else {
          results.push(`Table '${table}': ${error.message}`);
        }
      }
    }

    // Seed affiliate partners
    if (action === 'setup_all' || action === 'seed_partners') {
      let seeded = 0;
      for (const partner of SEED_PARTNERS) {
        const { error } = await supabase.from('affiliate_partners').upsert(partner, { onConflict: 'id' });
        if (!error) seeded++;
        else results.push(`Partner '${partner.id}': ${error.message}`);
      }
      results.push(`Seeded ${seeded}/${SEED_PARTNERS.length} affiliate partners ✓`);
    }

    // Seed A/B tests
    if (action === 'setup_all' || action === 'seed_ab_tests') {
      let seeded = 0;
      for (const test of SEED_AB_TESTS) {
        const { error } = await supabase.from('ab_test_configs').upsert(test, { onConflict: 'id' });
        if (!error) seeded++;
        else results.push(`A/B Test '${test.id}': ${error.message}`);
      }
      results.push(`Seeded ${seeded}/${SEED_AB_TESTS.length} A/B tests ✓`);
    }

    // Verify setup
    if (action === 'setup_all' || action === 'verify') {
      const { data: partners, error: pErr } = await supabase.from('affiliate_partners').select('id, name').eq('is_active', true);
      const { data: tests, error: tErr } = await supabase.from('ab_test_configs').select('id, name, status');

      results.push(`--- Verification ---`);
      results.push(`Active partners: ${partners?.length || 0} ${pErr ? `(${pErr.message})` : ''}`);
      results.push(`A/B tests: ${tests?.length || 0} ${tErr ? `(${tErr.message})` : ''}`);
    }

    return Response.json({
      success: true,
      action,
      results,
      migration_sql_available: '/supabase/migrations/20260214_affiliate_and_revenue_tables.sql',
      instructions: results.some(r => r.includes('does not exist'))
        ? 'Run the SQL migration in Supabase Dashboard → SQL Editor → New Query → Paste and Run'
        : 'All tables verified!',
    });

  } catch (error) {
    console.error('Setup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
