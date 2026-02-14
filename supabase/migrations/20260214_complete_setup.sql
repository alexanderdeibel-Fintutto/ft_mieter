-- ================================================
-- FINTUTTO COMPLETE SETUP
-- Dieses Script in den Supabase SQL Editor kopieren
-- und einmal ausführen. Es erstellt alle Tabellen,
-- Indexes, RLS Policies und Seed-Daten.
-- ================================================

-- ================================================
-- TEIL 1: Tabellen erstellen (13 Tabellen)
-- ================================================

-- 1. Affiliate Partners
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

-- 2. Affiliate Tracking
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

-- 3. Affiliate User Preferences
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

-- 4. Ecosystem Cross-Sell Log
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

-- 5. Ecosystem Bundle Events
CREATE TABLE IF NOT EXISTS ecosystem_bundle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  bundle_id TEXT NOT NULL,
  action TEXT NOT NULL,
  billing_cycle TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Transaction Usage
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

-- 7. White-Label Tenants
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

-- 8. White-Label Units
CREATE TABLE IF NOT EXISTS white_label_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES white_label_tenants(id) ON DELETE CASCADE,
  address TEXT,
  unit_type TEXT,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. White-Label Unit Tenants
CREATE TABLE IF NOT EXISTS white_label_unit_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES white_label_tenants(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES white_label_units(id) ON DELETE SET NULL,
  tenant_user_id TEXT,
  tenant_name TEXT,
  tenant_email TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Ecosystem Bundle Config
CREATE TABLE IF NOT EXISTS ecosystem_bundle_config (
  id TEXT PRIMARY KEY,
  bundle_name TEXT NOT NULL,
  stripe_product_id TEXT,
  stripe_price_monthly TEXT,
  stripe_price_yearly TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. A/B Test Configurations
CREATE TABLE IF NOT EXISTS ab_test_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  variants JSONB NOT NULL DEFAULT '[]',
  traffic_split JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  winner_variant TEXT,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. A/B Test Assignments
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id TEXT NOT NULL REFERENCES ab_test_configs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  variant TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_id, user_id)
);

-- 13. A/B Test Events
CREATE TABLE IF NOT EXISTS ab_test_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id TEXT NOT NULL REFERENCES ab_test_configs(id) ON DELETE CASCADE,
  user_id TEXT,
  variant TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_value DECIMAL(10,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- TEIL 2: Indexes
-- ================================================

CREATE INDEX IF NOT EXISTS idx_affiliate_tracking_user ON affiliate_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_tracking_provider ON affiliate_tracking(provider);
CREATE INDEX IF NOT EXISTS idx_affiliate_tracking_created ON affiliate_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_tracking_event ON affiliate_tracking(event_type);
CREATE INDEX IF NOT EXISTS idx_affiliate_prefs_user ON affiliate_user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_crosssell_log_user ON ecosystem_cross_sell_log(user_id);
CREATE INDEX IF NOT EXISTS idx_crosssell_log_source ON ecosystem_cross_sell_log(source_app);
CREATE INDEX IF NOT EXISTS idx_crosssell_log_created ON ecosystem_cross_sell_log(created_at);
CREATE INDEX IF NOT EXISTS idx_bundle_events_user ON ecosystem_bundle_events(user_id);
CREATE INDEX IF NOT EXISTS idx_bundle_events_bundle ON ecosystem_bundle_events(bundle_id);
CREATE INDEX IF NOT EXISTS idx_tx_usage_user ON transaction_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_tx_usage_type ON transaction_usage(transaction_type);
CREATE INDEX IF NOT EXISTS idx_tx_usage_created ON transaction_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_wl_tenants_owner ON white_label_tenants(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_wl_tenants_status ON white_label_tenants(status);
CREATE INDEX IF NOT EXISTS idx_wl_units_tenant ON white_label_units(tenant_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_active ON affiliate_partners(is_active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_category ON affiliate_partners(category);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_test ON ab_test_assignments(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_user ON ab_test_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_test ON ab_test_events(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_variant ON ab_test_events(test_id, variant);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_created ON ab_test_events(created_at);

-- ================================================
-- TEIL 3: Row Level Security
-- ================================================

ALTER TABLE affiliate_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecosystem_cross_sell_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecosystem_bundle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecosystem_bundle_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_events ENABLE ROW LEVEL SECURITY;

-- Service role full access (for Edge Functions)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'affiliate_partners', 'affiliate_tracking', 'affiliate_user_preferences',
    'ecosystem_cross_sell_log', 'ecosystem_bundle_events', 'transaction_usage',
    'white_label_tenants', 'ecosystem_bundle_config',
    'ab_test_configs', 'ab_test_assignments', 'ab_test_events'
  ])
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS "service_role_full_access" ON %I; CREATE POLICY "service_role_full_access" ON %I FOR ALL TO service_role USING (true) WITH CHECK (true);',
      tbl, tbl
    );
    -- Also allow anon role to INSERT (for tracking from client)
    EXECUTE format(
      'DROP POLICY IF EXISTS "anon_insert" ON %I; CREATE POLICY "anon_insert" ON %I FOR INSERT TO anon WITH CHECK (true);',
      tbl, tbl
    );
    -- Allow anon to SELECT from config tables
    IF tbl IN ('affiliate_partners', 'ab_test_configs', 'ecosystem_bundle_config') THEN
      EXECUTE format(
        'DROP POLICY IF EXISTS "anon_select" ON %I; CREATE POLICY "anon_select" ON %I FOR SELECT TO anon USING (true);',
        tbl, tbl
      );
    END IF;
  END LOOP;
END $$;

-- ================================================
-- TEIL 4: Seed Data - 8 Affiliate Partners
-- ================================================

INSERT INTO affiliate_partners (id, name, category, description, offer_headline, offer_description, affiliate_url, revenue_model, commission, priority, target_audience, trigger_contexts)
VALUES
  ('verivox_strom', 'Verivox Stromvergleich', 'energie', 'Deutschlands Nr. 1 Vergleichsportal fuer Strom', 'Bis zu 500 Euro/Jahr beim Strom sparen', 'Vergleiche ueber 1.000 Stromanbieter und wechsle in nur 5 Minuten. Bonus fuer Neukunden.', 'https://www.verivox.de/strom/', 'cpa', 45.00, 100, '{mieter,vermieter}', '{dashboard,nebenkosten,onboarding}'),

  ('check24_strom', 'CHECK24 Strom', 'energie', 'Ueber 850 Stromanbieter vergleichen', 'Stromanbieterwechsel in 5 Minuten', 'Finde den guenstigsten Stromanbieter und spare sofort. TUeV-geprueft.', 'https://www.check24.de/strom/', 'cpa', 40.00, 90, '{mieter,vermieter}', '{dashboard,nebenkosten}'),

  ('huk24', 'HUK24 Hausratversicherung', 'versicherung', 'Guenstiger Hausratschutz vom Testsieger', 'Hausrat ab 2,93 Euro/Monat', 'Testsieger-Hausratversicherung zu Top-Konditionen. Online-Vorteil sichern.', 'https://www.huk24.de/hausratversicherung', 'cpl', 12.00, 80, '{mieter}', '{onboarding,einzug,dashboard}'),

  ('myhammer', 'MyHammer', 'handwerk', 'Handwerker in deiner Naehe finden', 'Handwerker einfach und schnell finden', 'Erhalte bis zu 5 Angebote von geprueften Handwerkern. Kostenlos vergleichen.', 'https://www.my-hammer.de/', 'cpl', 8.00, 70, '{mieter,vermieter,hausmeister}', '{reparatur,mangel,dashboard}'),

  ('check24_internet', 'CHECK24 Internet', 'telekommunikation', 'DSL und Kabel Internet vergleichen', 'Internet-Tarife ab 9,99 Euro/Monat', 'Finde den besten Internet-Tarif fuer deine Adresse. Cashback-Garantie.', 'https://www.check24.de/internet/', 'cpa', 35.00, 75, '{mieter}', '{einzug,onboarding,dashboard}'),

  ('movinga', 'Movinga', 'umzug', 'Stressfreier Umzug zum Festpreis', 'Umzugsangebote ab 299 Euro', 'Professioneller Umzugsservice zum garantierten Festpreis. Online buchen.', 'https://www.movinga.de/', 'cpl', 15.00, 60, '{mieter}', '{einzug,kuendigung}'),

  ('home24', 'home24', 'einrichtung', 'Moebel und Einrichtung online kaufen', 'Bis zu 60% Rabatt auf Moebel', 'Ueber 100.000 Moebel und Wohnaccessoires. Gratis Lieferung ab 30 Euro.', 'https://www.home24.de/', 'cps', 6.00, 50, '{mieter}', '{einzug,onboarding}'),

  ('helpling', 'Helpling', 'reinigung', 'Professionelle Reinigungskraefte buchen', 'Putzfrau ab 13 Euro/Stunde', 'Gepruefte und versicherte Reinigungskraefte in deiner Naehe. Online buchen.', 'https://www.helpling.de/', 'cpa', 20.00, 55, '{mieter,vermieter}', '{auszug,dashboard}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  offer_headline = EXCLUDED.offer_headline,
  offer_description = EXCLUDED.offer_description,
  affiliate_url = EXCLUDED.affiliate_url,
  revenue_model = EXCLUDED.revenue_model,
  commission = EXCLUDED.commission,
  priority = EXCLUDED.priority,
  target_audience = EXCLUDED.target_audience,
  trigger_contexts = EXCLUDED.trigger_contexts,
  updated_at = NOW();

-- ================================================
-- TEIL 5: Seed Data - 4 A/B Test Configurations
-- ================================================

INSERT INTO ab_test_configs (id, name, description, variants, traffic_split)
VALUES
  ('affiliate_widget_placement', 'Affiliate Widget Platzierung', 'Testet verschiedene Positionen des Affiliate-Widgets im Dashboard', '["dashboard_bottom", "sidebar", "post_action"]'::jsonb, '{"dashboard_bottom": 34, "sidebar": 33, "post_action": 33}'::jsonb),

  ('verivox_banner_style', 'Verivox Banner Stil', 'Testet verschiedene Darstellungen des Verivox-Widgets', '["savings_focus", "comparison_focus", "urgency_focus"]'::jsonb, '{"savings_focus": 34, "comparison_focus": 33, "urgency_focus": 33}'::jsonb),

  ('sovendus_trigger_timing', 'Sovendus Trigger Zeitpunkt', 'Testet verschiedene Zeitpunkte fuer die Sovendus-Einblendung', '["immediate", "delayed_5s", "delayed_scroll"]'::jsonb, '{"immediate": 34, "delayed_5s": 33, "delayed_scroll": 33}'::jsonb),

  ('bundle_pricing_highlight', 'Bundle Pricing Hervorhebung', 'Testet welches Bundle am meisten konvertiert wenn hervorgehoben', '["mieter_plus", "vermieter_komplett", "fintutto_komplett"]'::jsonb, '{"mieter_plus": 34, "vermieter_komplett": 33, "fintutto_komplett": 33}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  variants = EXCLUDED.variants,
  traffic_split = EXCLUDED.traffic_split,
  updated_at = NOW();

-- ================================================
-- TEIL 6: Seed Data - Bundle Configs (Platzhalter)
-- ================================================

INSERT INTO ecosystem_bundle_config (id, bundle_name, metadata)
VALUES
  ('mieter_plus', 'Mieter Plus', '{"price_monthly": 12.99, "price_yearly": 124.90, "apps": ["mieter", "ablesung"]}'::jsonb),
  ('vermieter_komplett', 'Vermieter Komplett', '{"price_monthly": 49.99, "price_yearly": 479.90, "apps": ["vermieter", "hausmeisterpro", "ablesung"]}'::jsonb),
  ('fintutto_komplett', 'Fintutto Komplett', '{"price_monthly": 69.99, "price_yearly": 671.90, "apps": ["mieter", "vermieter", "hausmeisterpro", "ablesung", "portal"]}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  bundle_name = EXCLUDED.bundle_name,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- ================================================
-- FERTIG! Alle 13 Tabellen, Indexes, RLS und
-- Seed-Daten wurden erfolgreich erstellt.
-- ================================================

-- Verifizierung: Zeige alle erstellten Tabellen
SELECT table_name, (SELECT count(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name AND table_schema = 'public') as columns
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'affiliate_partners', 'affiliate_tracking', 'affiliate_user_preferences',
  'ecosystem_cross_sell_log', 'ecosystem_bundle_events', 'transaction_usage',
  'white_label_tenants', 'white_label_units', 'white_label_unit_tenants',
  'ecosystem_bundle_config', 'ab_test_configs', 'ab_test_assignments', 'ab_test_events'
)
ORDER BY table_name;
