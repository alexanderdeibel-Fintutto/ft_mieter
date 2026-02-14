/**
 * Fintutto Ecosystem App Registry
 * Central registry of all Fintutto apps for cross-sell, bundling, and ecosystem features.
 */

export const FINTUTTO_APPS = {
  mieterapp: {
    id: 'mieterapp',
    name: 'MieterApp',
    tagline: 'Alles für Mieter in einer App',
    description: 'Mietvertrag, Zahlungen, Reparaturen, Dokumente und Kommunikation mit deinem Vermieter.',
    icon: '🏠',
    color: '#3B82F6',
    url: 'https://app.mieterapp.de',
    pricing: { free: 0, basic: 9.99, pro: 29, enterprise: 89 },
    targetAudience: ['mieter'],
    features: ['Mietverwaltung', 'Zahlungstracking', 'Reparaturmeldung', 'Dokumentenmanagement', 'Mietrecht-Chat'],
    crossSellTriggers: {
      from_vermietify: { event: 'tenant_added', message: 'Laden Sie Ihren Mieter ein, die MieterApp zu nutzen!' },
      from_hausmeisterpro: { event: 'repair_completed', message: 'Mieter direkt über die MieterApp benachrichtigen' },
    }
  },
  vermietify: {
    id: 'vermietify',
    name: 'Vermietify',
    tagline: 'Immobilienverwaltung leicht gemacht',
    description: 'Verwalte Immobilien, Mieter, Verträge, Zahlungen und Nebenkosten – alles in einer Plattform.',
    icon: '🏢',
    color: '#8B5CF6',
    url: 'https://app.vermietify.de',
    pricing: { free: 0, basic: 19.90, pro: 39.90, enterprise: 89.90 },
    targetAudience: ['vermieter', 'hausverwaltung'],
    features: ['Immobilienverwaltung', 'Mieterverwaltung', 'Nebenkostenabrechnung', 'ELSTER-Integration', 'FinAPI Banking'],
    crossSellTriggers: {
      from_mieterapp: { event: 'user_is_landlord', message: 'Du vermietest auch? Vermietify macht es einfach!' },
      from_ablesung: { event: 'readings_imported', message: 'Zählerständen direkt in die NK-Abrechnung übernehmen' },
    }
  },
  hausmeisterpro: {
    id: 'hausmeisterpro',
    name: 'HausmeisterPro',
    tagline: 'Professionelle Hausverwaltung für Hausmeister',
    description: 'Aufgaben, Rundgänge, Reparaturen und Kommunikation – alles im Griff.',
    icon: '🔧',
    color: '#F59E0B',
    url: 'https://app.hausmeisterpro.de',
    pricing: { free: 0, starter: 9.99, pro: 24.99 },
    targetAudience: ['hausmeister', 'facilitymanager'],
    features: ['Aufgabenverwaltung', 'Rundgangprotokoll', 'Reparaturmanagement', 'Zeiterfassung', 'Materialverwaltung'],
    crossSellTriggers: {
      from_vermietify: { event: 'repair_created', message: 'Reparatur direkt an Ihren Hausmeister weiterleiten' },
      from_mieterapp: { event: 'repair_reported', message: 'Mangelmeldung effizient an HausmeisterPro übergeben' },
    }
  },
  ablesung: {
    id: 'ablesung',
    name: 'Ablesung',
    tagline: 'Zählerablesung digital & einfach',
    description: 'Strom, Gas, Wasser und Heizung – alle Zähler digital erfassen mit OCR.',
    icon: '📊',
    color: '#10B981',
    url: 'https://app.ablesung.fintutto.de',
    pricing: { free: 0, basic: 4.99, pro: 14.99 },
    targetAudience: ['vermieter', 'hausmeister', 'mieter'],
    features: ['OCR Zählererfassung', 'Verbrauchsanalyse', 'Automatische Erinnerungen', 'Export für NK-Abrechnung'],
    crossSellTriggers: {
      from_vermietify: { event: 'nk_abrechnung_started', message: 'Zählerstände fehlen? Mit Ablesung digital erfassen!' },
      from_mieterapp: { event: 'meter_reading_due', message: 'Zählerstand einfach per Foto erfassen' },
    }
  },
  portal: {
    id: 'portal',
    name: 'Fintutto Portal',
    tagline: 'Das zentrale Portal für Mieter und Vermieter',
    description: 'Ein gemeinsamer Ort für alle Interaktionen zwischen Mieter und Vermieter.',
    icon: '🌐',
    color: '#6366F1',
    url: 'https://portal.fintutto.de',
    pricing: { free: 0 },
    targetAudience: ['mieter', 'vermieter'],
    features: ['Zentrale Kommunikation', 'Dokumentenaustausch', 'Statusübersicht', 'Terminplanung'],
    crossSellTriggers: {}
  }
};

// Cross-sell matrix: which app recommends which
export const CROSS_SELL_MATRIX = {
  mieterapp: {
    primary: ['vermietify', 'ablesung'],
    secondary: ['hausmeisterpro', 'portal'],
    triggers: [
      { event: 'first_payment', target: 'vermietify', priority: 'medium', message: 'Du vermietest auch? Teste Vermietify!' },
      { event: 'meter_reading', target: 'ablesung', priority: 'high', message: 'Zähler per Foto ablesen mit Ablesung' },
      { event: 'repair_reported', target: 'hausmeisterpro', priority: 'low', message: 'Für Hausmeister: HausmeisterPro' },
      { event: 'limit_reached', target: 'vermietify', priority: 'high', message: 'Mehr Funktionen mit Vermietify' },
    ]
  },
  vermietify: {
    primary: ['hausmeisterpro', 'ablesung'],
    secondary: ['mieterapp', 'portal'],
    triggers: [
      { event: 'repair_created', target: 'hausmeisterpro', priority: 'high', message: 'Reparatur an HausmeisterPro übergeben' },
      { event: 'nk_abrechnung', target: 'ablesung', priority: 'high', message: 'Zähler digital erfassen mit Ablesung' },
      { event: 'tenant_added', target: 'mieterapp', priority: 'medium', message: 'Laden Sie Ihren Mieter zur MieterApp ein' },
    ]
  },
  hausmeisterpro: {
    primary: ['vermietify', 'ablesung'],
    secondary: ['mieterapp'],
    triggers: [
      { event: 'inspection_completed', target: 'ablesung', priority: 'high', message: 'Zähler gleich digital ablesen?' },
      { event: 'task_completed', target: 'vermietify', priority: 'medium', message: 'Aufgabe erledigt – automatisch an Vermieter melden' },
    ]
  },
  ablesung: {
    primary: ['vermietify'],
    secondary: ['hausmeisterpro', 'mieterapp'],
    triggers: [
      { event: 'readings_exported', target: 'vermietify', priority: 'high', message: 'Direkt in die NK-Abrechnung übernehmen' },
    ]
  }
};

// Ecosystem bundle configurations
export const ECOSYSTEM_BUNDLES = {
  vermieter_komplett: {
    id: 'vermieter_komplett',
    name: 'Vermieter Komplett',
    tagline: 'Alles was Vermieter brauchen',
    apps: ['vermietify', 'hausmeisterpro', 'ablesung'],
    pricing: {
      monthly: 49.99,
      yearly: 479.90, // 2 Monate gratis
      savings_vs_individual: '33%'
    },
    features: [
      'Alle Pro-Features aller 3 Apps',
      'Cross-App Datensync',
      'Gemeinsames Dashboard',
      'Priority Support',
      'Unbegrenzte Objekte'
    ]
  },
  fintutto_komplett: {
    id: 'fintutto_komplett',
    name: 'Fintutto Komplett',
    tagline: 'Das komplette Immobilien-Ökosystem',
    apps: ['mieterapp', 'vermietify', 'hausmeisterpro', 'ablesung', 'portal'],
    pricing: {
      monthly: 69.99,
      yearly: 671.90, // 2 Monate gratis
      savings_vs_individual: '40%'
    },
    features: [
      'Zugang zu allen 5 Apps',
      'Alle Premium-Features',
      'Cross-App Sync & Automatisierung',
      'Dedizierter Support',
      'White-Label Option',
      'API-Zugang',
      'Onboarding-Support'
    ]
  },
  mieter_plus: {
    id: 'mieter_plus',
    name: 'Mieter Plus',
    tagline: 'MieterApp + Ablesung im Bundle',
    apps: ['mieterapp', 'ablesung'],
    pricing: {
      monthly: 12.99,
      yearly: 124.90,
      savings_vs_individual: '25%'
    },
    features: [
      'MieterApp Pro',
      'Ablesung Basic',
      'OCR Zählererfassung',
      'Verbrauchsanalyse',
      'Alles aus MieterApp Pro'
    ]
  }
};

export function getAppById(appId) {
  return FINTUTTO_APPS[appId] || null;
}

export function getCrossSellTargets(sourceAppId) {
  const matrix = CROSS_SELL_MATRIX[sourceAppId];
  if (!matrix) return [];
  return [...matrix.primary, ...matrix.secondary].map(id => FINTUTTO_APPS[id]).filter(Boolean);
}

export function getCrossSellTriggers(sourceAppId, eventType) {
  const matrix = CROSS_SELL_MATRIX[sourceAppId];
  if (!matrix) return [];
  return matrix.triggers.filter(t => t.event === eventType);
}

export function getBundlesForApp(appId) {
  return Object.values(ECOSYSTEM_BUNDLES).filter(b => b.apps.includes(appId));
}

export function calculateBundleSavings(bundleId) {
  const bundle = ECOSYSTEM_BUNDLES[bundleId];
  if (!bundle) return null;

  const individualTotal = bundle.apps.reduce((sum, appId) => {
    const app = FINTUTTO_APPS[appId];
    const highestPrice = app ? Math.max(...Object.values(app.pricing)) : 0;
    return sum + highestPrice;
  }, 0);

  return {
    individual: individualTotal,
    bundle: bundle.pricing.monthly,
    savings: individualTotal - bundle.pricing.monthly,
    savingsPercent: Math.round((1 - bundle.pricing.monthly / individualTotal) * 100)
  };
}
