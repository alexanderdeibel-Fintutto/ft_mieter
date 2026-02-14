/**
 * Fintutto App-Specific Configurations
 * Each app imports this and passes its appId to the SDK.
 *
 * This file provides pre-configured settings for each of the 5 apps.
 */

export const APP_CONFIGS = {
  mieterapp: {
    id: 'mieterapp',
    name: 'MieterApp',
    url: 'https://app.mieterapp.de',
    userRole: 'mieter',
    affiliateCategories: ['energie', 'versicherung', 'internet', 'umzug', 'einrichtung', 'reinigung'],
    affiliateContexts: ['dashboard', 'nebenkosten', 'onboarding', 'einzug', 'kuendigung', 'auszug'],
    crossSellTargets: ['vermietify', 'ablesung', 'portal'],
    abTests: [
      'affiliate_widget_placement',
      'verivox_banner_style',
      'sovendus_trigger_timing',
      'bundle_pricing_highlight',
    ],
    sovendus: {
      enabled: true,
      triggers: ['checkout_success', 'upgrade_success', 'plan_activated'],
    },
    bundles: ['mieter_plus', 'fintutto_komplett'],
    stripeConfig: {
      tiers: ['free', 'basic', 'pro', 'business'],
      defaultTier: 'free',
    },
  },

  vermietify: {
    id: 'vermietify',
    name: 'Vermietify',
    url: 'https://app.vermietify.de',
    userRole: 'vermieter',
    affiliateCategories: ['handwerk', 'versicherung', 'energie', 'reinigung', 'sicherheit', 'garten'],
    affiliateContexts: ['dashboard', 'reparatur', 'nk_abrechnung', 'mangel', 'mieterwechsel'],
    crossSellTargets: ['hausmeisterpro', 'ablesung', 'mieterapp', 'portal'],
    abTests: [
      'affiliate_widget_placement',
      'bundle_pricing_highlight',
    ],
    sovendus: {
      enabled: true,
      triggers: ['checkout_success', 'upgrade_success'],
    },
    bundles: ['vermieter_komplett', 'fintutto_komplett'],
    stripeConfig: {
      tiers: ['free', 'basic', 'pro', 'enterprise'],
      defaultTier: 'free',
    },
  },

  hausmeisterpro: {
    id: 'hausmeisterpro',
    name: 'HausmeisterPro',
    url: 'https://app.hausmeisterpro.de',
    userRole: 'hausmeister',
    affiliateCategories: ['handwerk', 'reinigung', 'sicherheit', 'garten'],
    affiliateContexts: ['dashboard', 'reparatur', 'rundgang', 'mangel'],
    crossSellTargets: ['vermietify', 'ablesung'],
    abTests: [
      'affiliate_widget_placement',
    ],
    sovendus: {
      enabled: true,
      triggers: ['checkout_success'],
    },
    bundles: ['vermieter_komplett', 'fintutto_komplett'],
    stripeConfig: {
      tiers: ['free', 'starter', 'pro'],
      defaultTier: 'free',
    },
  },

  ablesung: {
    id: 'ablesung',
    name: 'Ablesung',
    url: 'https://app.ablesung.fintutto.de',
    userRole: 'mieter', // default, depends on user
    affiliateCategories: ['energie'],
    affiliateContexts: ['dashboard', 'zaehler', 'verbrauch'],
    crossSellTargets: ['vermietify', 'mieterapp'],
    abTests: [
      'affiliate_widget_placement',
    ],
    sovendus: {
      enabled: true,
      triggers: ['checkout_success'],
    },
    bundles: ['mieter_plus', 'vermieter_komplett', 'fintutto_komplett'],
    stripeConfig: {
      tiers: ['free', 'basic', 'pro'],
      defaultTier: 'free',
    },
  },

  portal: {
    id: 'portal',
    name: 'Fintutto Portal',
    url: 'https://portal.fintutto.de',
    userRole: 'mieter',
    affiliateCategories: ['energie', 'versicherung'],
    affiliateContexts: ['dashboard'],
    crossSellTargets: ['mieterapp', 'vermietify'],
    abTests: [],
    sovendus: {
      enabled: false,
      triggers: [],
    },
    bundles: ['fintutto_komplett'],
    stripeConfig: {
      tiers: ['free'],
      defaultTier: 'free',
    },
  },
};

export function getAppConfig(appId) {
  return APP_CONFIGS[appId] || APP_CONFIGS.mieterapp;
}

export default APP_CONFIGS;
