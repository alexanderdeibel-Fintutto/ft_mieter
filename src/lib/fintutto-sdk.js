/**
 * Fintutto Shared SDK
 * Reusable integration layer for all 5 Fintutto apps:
 * MieterApp, Vermietify, HausmeisterPro, Ablesung, Portal
 *
 * Usage in any app:
 *   import { FintuttoSDK } from '@/lib/fintutto-sdk';
 *   const sdk = new FintuttoSDK({ appId: 'mieterapp', supabaseUrl: '...', supabaseAnonKey: '...' });
 */

const DEFAULT_SUPABASE_URL = 'https://aaefocdqgdgexkcrjhks.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZWZvY2RxZ2RnZXhrY3JqaGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjA0NzAsImV4cCI6MjA4NDMzNjQ3MH0.qsLTEZo7shbafWY9w4Fo7is9GDW-1Af1wup_iCy2vVQ';

export class FintuttoSDK {
  constructor({ appId, supabaseUrl, supabaseAnonKey, authToken } = {}) {
    this.appId = appId || 'mieterapp';
    this.supabaseUrl = supabaseUrl || DEFAULT_SUPABASE_URL;
    this.supabaseAnonKey = supabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY;
    this.authToken = authToken || null;
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  async _invoke(functionName, body) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken || this.supabaseAnonKey}`,
      'apikey': this.supabaseAnonKey,
    };

    const response = await fetch(`${this.supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  // ─── Affiliate Partner Offers ──────────────────────────────────

  async getAffiliateOffers({ category, userRole, context, limit = 12 } = {}) {
    return this._invoke('affiliatePartnerEngine', {
      action: 'get_offers',
      category,
      user_role: userRole || 'mieter',
      context,
      limit,
      app_id: this.appId,
    });
  }

  async trackAffiliateClick({ partnerId, partnerName, category, sourcePage, context }) {
    return this._invoke('affiliatePartnerEngine', {
      action: 'track_click',
      partner_id: partnerId,
      partner_name: partnerName,
      category,
      source_page: sourcePage,
      context,
    });
  }

  async dismissAffiliateOffer(partnerId, permanent = false) {
    return this._invoke('affiliatePartnerEngine', {
      action: 'dismiss_offer',
      partner_id: partnerId,
      permanent,
    });
  }

  async getAffiliateAnalytics(period = '30d') {
    return this._invoke('affiliatePartnerEngine', {
      action: 'get_revenue_analytics',
      period,
    });
  }

  // ─── Sovendus ─────────────────────────────────────────────────

  async trackSovendusEvent({ eventType, trigger, orderId, orderValue, partnerName, voucherCode }) {
    return this._invoke('sovendusTracking', {
      action: 'track_event',
      event_type: eventType,
      trigger,
      orderId,
      orderValue,
      partner_name: partnerName,
      voucher_code: voucherCode,
    });
  }

  async getSovendusAnalytics(period = '30d') {
    return this._invoke('sovendusTracking', {
      action: 'get_analytics',
      period,
    });
  }

  // ─── Ecosystem Bundles ────────────────────────────────────────

  async getBundles() {
    return this._invoke('ecosystemBundlePricing', {
      action: 'get_bundles',
      current_app: this.appId,
    });
  }

  async createBundleCheckout(bundleId, billingCycle = 'monthly') {
    return this._invoke('ecosystemBundlePricing', {
      action: 'create_bundle_checkout',
      bundle_id: bundleId,
      billing_cycle: billingCycle,
    });
  }

  async getBundleRecommendation() {
    return this._invoke('ecosystemBundlePricing', {
      action: 'get_bundle_recommendation',
      current_app: this.appId,
    });
  }

  // ─── Ecosystem Cross-Sell ─────────────────────────────────────

  async getCrossSellRecommendation(eventType, dismissedApps = []) {
    return this._invoke('ecosystemCrossSell', {
      action: 'get_recommendation',
      source_app: this.appId,
      event_type: eventType,
      dismissed_apps: dismissedApps,
    });
  }

  async trackCrossSellClick(targetApp, recommendationId) {
    return this._invoke('ecosystemCrossSell', {
      action: 'track_click',
      source_app: this.appId,
      target_app: targetApp,
      recommendation_id: recommendationId,
    });
  }

  async getEcosystemStats() {
    return this._invoke('ecosystemCrossSell', {
      action: 'get_ecosystem_stats',
    });
  }

  // ─── A/B Testing ──────────────────────────────────────────────

  async getABTestVariant(testId) {
    return this._invoke('abTestEngine', {
      action: 'get_variant',
      test_id: testId,
    });
  }

  async getAllABTestVariants(testIds) {
    return this._invoke('abTestEngine', {
      action: 'get_all_variants',
      test_ids: testIds,
    });
  }

  async trackABTestEvent(testId, eventType, variant, metadata = {}) {
    return this._invoke('abTestEngine', {
      action: 'track_event',
      test_id: testId,
      event_type: eventType,
      variant,
      metadata,
    });
  }

  async getABTestResults(testId) {
    return this._invoke('abTestEngine', {
      action: 'get_results',
      test_id: testId,
    });
  }

  // ─── Billing ──────────────────────────────────────────────────

  async createCheckoutSession({ priceId, email, successUrl, cancelUrl }) {
    return this._invoke('billing', {
      action: 'createCheckoutSession',
      priceId,
      email,
      successUrl,
      cancelUrl,
    });
  }

  async getSubscription(customerId) {
    return this._invoke('billing', {
      action: 'getSubscription',
      customerId,
    });
  }

  async listPrices() {
    return this._invoke('billing', {
      action: 'listPrices',
    });
  }

  // ─── Admin: Setup ─────────────────────────────────────────────

  async setupStripeBundles() {
    return this._invoke('setupStripeBundles', { action: 'setup_bundles' });
  }

  async listStripeBundles() {
    return this._invoke('setupStripeBundles', { action: 'list_bundles' });
  }

  async seedPartners() {
    return this._invoke('setupDatabase', { action: 'seed_partners' });
  }

  async seedABTests() {
    return this._invoke('setupDatabase', { action: 'seed_ab_tests' });
  }

  async verifySetup() {
    return this._invoke('setupDatabase', { action: 'verify' });
  }
}

// Singleton instance with default config
let _instance = null;

export function getFintuttoSDK(appId) {
  if (!_instance || _instance.appId !== appId) {
    _instance = new FintuttoSDK({ appId });
  }
  return _instance;
}

export default FintuttoSDK;
