-- ================================================
-- Fintutto Revenue & Affiliate System
-- Database migration for all 7 revenue priorities
-- ================================================

-- 1. Affiliate Partners (Direct partnerships)
CREATE TABLE IF NOT EXISTS affiliate_partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  offer_headline TEXT,
  offer_description TEXT,
  affiliate_url TEXT NOT NULL,
  revenue_model TEXT NOT NULL DEFAULT 'cpc', -- cpc, cpl, cpa, cps
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

-- 2. Affiliate Tracking (clicks, impressions, conversions)
CREATE TABLE IF NOT EXISTS affiliate_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  provider TEXT NOT NULL, -- 'sovendus', 'direct', 'verivox', 'awin'
  event_type TEXT NOT NULL, -- 'impression', 'click', 'conversion', 'conversion_confirmed', 'consent_given'
  trigger_context TEXT,
  order_id TEXT,
  order_value DECIMAL(10,2),
  partner_name TEXT,
  voucher_code TEXT,
  recommendation_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Affiliate User Preferences (opt-in/out, dismissed offers)
CREATE TABLE IF NOT EXISTS affiliate_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  partner_id TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'dismissed', 'hidden_temporarily'
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
  action TEXT NOT NULL, -- 'impression', 'click', 'dismiss', 'conversion'
  recommendation_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Ecosystem Bundle Events
CREATE TABLE IF NOT EXISTS ecosystem_bundle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  bundle_id TEXT NOT NULL,
  action TEXT NOT NULL, -- 'view', 'checkout_started', 'checkout_completed', 'canceled'
  billing_cycle TEXT, -- 'monthly', 'yearly'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Transaction Usage (for transaction-based revenue)
CREATE TABLE IF NOT EXISTS transaction_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL, -- 'letterxpress', 'schufa_check', 'ocr_scan', 'digital_signature', 'ai_credit', 'sms_notification'
  plan TEXT DEFAULT 'free',
  cost_price DECIMAL(10,4) DEFAULT 0,
  sell_price DECIMAL(10,4) DEFAULT 0,
  margin DECIMAL(10,4) DEFAULT 0,
  within_quota BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. White-Label Tenants (B2B Hausverwaltungen)
CREATE TABLE IF NOT EXISTS white_label_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_email TEXT,
  company_phone TEXT,
  unit_count INTEGER DEFAULT 0,
  tier_id TEXT NOT NULL, -- 'small', 'medium', 'large', 'enterprise'
  branding JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending_setup', -- 'pending_setup', 'active', 'suspended', 'canceled'
  monthly_price DECIMAL(10,2),
  apps_enabled TEXT[] DEFAULT '{}',
  features_enabled TEXT[] DEFAULT '{}',
  stripe_subscription_id TEXT,
  custom_domain TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. White-Label Units (properties managed by WL tenant)
CREATE TABLE IF NOT EXISTS white_label_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES white_label_tenants(id) ON DELETE CASCADE,
  address TEXT,
  unit_type TEXT, -- 'apartment', 'house', 'commercial'
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. White-Label Unit Tenants (tenants in WL units)
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

-- 10. Ecosystem Bundle Config (stores Stripe Price IDs for bundles)
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
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed'
  winner_variant TEXT,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. A/B Test Assignments (which variant a user sees)
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id TEXT NOT NULL REFERENCES ab_test_configs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  variant TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_id, user_id)
);

-- 13. A/B Test Events (impressions, clicks, conversions per variant)
CREATE TABLE IF NOT EXISTS ab_test_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id TEXT NOT NULL REFERENCES ab_test_configs(id) ON DELETE CASCADE,
  user_id TEXT,
  variant TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'impression', 'click', 'conversion'
  event_value DECIMAL(10,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Indexes for performance
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
-- RLS Policies
-- ================================================

ALTER TABLE affiliate_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecosystem_cross_sell_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecosystem_bundle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_tenants ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role full access" ON affiliate_tracking FOR ALL USING (true);
CREATE POLICY "Service role full access" ON affiliate_user_preferences FOR ALL USING (true);
CREATE POLICY "Service role full access" ON ecosystem_cross_sell_log FOR ALL USING (true);
CREATE POLICY "Service role full access" ON ecosystem_bundle_events FOR ALL USING (true);
CREATE POLICY "Service role full access" ON transaction_usage FOR ALL USING (true);
CREATE POLICY "Service role full access" ON white_label_tenants FOR ALL USING (true);
CREATE POLICY "Service role full access" ON affiliate_partners FOR ALL USING (true);

ALTER TABLE ecosystem_bundle_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON ecosystem_bundle_config FOR ALL USING (true);
CREATE POLICY "Service role full access" ON ab_test_configs FOR ALL USING (true);
CREATE POLICY "Service role full access" ON ab_test_assignments FOR ALL USING (true);
CREATE POLICY "Service role full access" ON ab_test_events FOR ALL USING (true);
