import DynamicPricing from '@/components/pricing/DynamicPricing';

// Mapping von Stripe Product IDs zu Tier IDs
const STRIPE_PRODUCT_TO_TIER = {
  'vermietify_starter': 'free',
  'vermietify_basic': 'basic',
  'vermietify_pro': 'pro',
  'vermietify_enterprise': 'enterprise'
};

// Feature Labels für lesbare Anzeige
const FEATURE_LABELS = {
  'bank_sync': 'Bank-Synchronisation',
  'accounting': 'Buchhaltung',
  'tax': 'Steuerberichte',
  'contracts': 'Mietverträge',
  'dunning': 'Mahnwesen',
  'dms': 'Dokumentenmanagement',
  'ocr': 'OCR Belegerkennung',
  'tenant_portal': 'Mieterportal',
  'communication': 'Mieter-Kommunikation',
  'datev': 'DATEV-Export',
  'weg': 'WEG-Verwaltung',
  'reports': 'Erweiterte Reports',
  'priority_support': 'Priority Support',
  'basic_management': 'Basis-Verwaltung',
  'calculators': 'Rechner-Tools',
  'knowledge_base': 'Wissensdatenbank'
};

// Formatiere Limit-Werte (9999 = Unbegrenzt)
const formatLimit = (value) => {
  if (value === 9999 || value === '9999' || value === Infinity || value === 'unlimitet') return 'Unbegrenzt';
  return value;
};

// Default tier definitions (als Fallback)
export const SUBSCRIPTION_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      'Basis Dashboard',
      '1 Benutzer',
      'Grundlegende Berichte',
      'Email Support'
    ],
    limits: {
      users: 1,
      storage: '1GB',
      apiCalls: 100
    }
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 19.90,
    priceId: null,
    features: [],
    limits: {
      users: 3,
      storage: '10GB',
      apiCalls: 500
    }
  }
};

// Erstelle Tiers aus Stripe Produkten
export function buildTiersFromStripe(stripePrices) {
  const tiers = { ...SUBSCRIPTION_TIERS };
  
  stripePrices.forEach(price => {
    if (!price.product || !price.active) return;
    
    const product = price.product;
    // Nutze product_id aus metadata statt product_name
    const productId = product.metadata?.product_id || product.name.toLowerCase();
    const tierId = STRIPE_PRODUCT_TO_TIER[productId];
    
    if (!tierId) {
      console.warn(`No tier mapping found for product: ${productId}`, product);
      return;
    }
    
    const priceAmount = price.unit_amount / 100;
    
    // Parse limits from metadata
    const usersLimit = product.metadata?.users_limit ? 
      parseInt(product.metadata.users_limit) : 
      getDefaultLimits(tierId).users;
    
    const storageLimit = product.metadata?.storage_limit || 
      getDefaultLimits(tierId).storage;
    
    const apiCallsLimit = product.metadata?.api_calls_limit ? 
      parseInt(product.metadata.api_calls_limit) : 
      getDefaultLimits(tierId).apiCalls;
    
    tiers[tierId] = {
      id: tierId,
      name: product.name,
      price: priceAmount,
      priceId: price.id,
      popular: tierId === 'pro',
      features: product.metadata?.features ? 
        product.metadata.features.split(',').map(f => FEATURE_LABELS[f.trim()] || f.trim()) : 
        getDefaultFeatures(tierId),
      limits: {
        users: formatLimit(usersLimit),
        storage: formatLimit(storageLimit),
        apiCalls: formatLimit(apiCallsLimit)
      }
    };
  });
  
  return tiers;
}

function getDefaultFeatures(tierId) {
  const features = {
    basic: [
      'Basis-Verwaltung',
      'Bis zu 3 Benutzer',
      'Buchhaltung',
      'Email Support'
    ],
    starter: [
      'Alles aus Free',
      'Bis zu 5 Benutzer',
      'Analytics Dashboard',
      'CSV Export',
      'Email Support'
    ],
    pro: [
      'Alles aus Basic',
      'Unbegrenzte Benutzer',
      'Erweiterte Reports',
      'API Zugang',
      'Priority Email Support',
      'Datenexport'
    ],
    enterprise: [
      'Alles aus Pro',
      'White Label',
      'Dedizierter Support',
      'Custom Features',
      'SLA Garantie',
      'Onboarding Support'
    ]
  };
  return features[tierId] || [];
}

function getDefaultLimits(tierId) {
  const limits = {
    basic: {
      users: 3,
      storage: '10GB',
      apiCalls: 500
    },
    starter: {
      users: 5,
      storage: '10GB',
      apiCalls: 1000
    },
    pro: {
      users: Infinity,
      storage: '100GB',
      apiCalls: 10000
    },
    enterprise: {
      users: Infinity,
      storage: 'Unbegrenzt',
      apiCalls: Infinity
    }
  };
  return limits[tierId] || { users: 1, storage: '1GB', apiCalls: 100 };
}

export function getTierById(tiers, tierId) {
  return tiers[tierId] || tiers.free;
}

export function canAccessFeature(tiers, currentTier, requiredTier) {
  const tierOrder = ['free', 'basic', 'starter', 'pro', 'enterprise'];
  const currentIndex = tierOrder.indexOf(currentTier);
  const requiredIndex = tierOrder.indexOf(requiredTier);
  return currentIndex >= requiredIndex;
}

export function checkLimit(tiers, currentTier, limitType, currentValue) {
  const tier = getTierById(tiers, currentTier);
  const limit = tier.limits[limitType];
  
  if (limit === Infinity || limit === 'Unbegrenzt' || limit === 9999) return true;
  
  if (typeof limit === 'string' && limit.includes('GB')) {
    const limitGB = parseInt(limit);
    return currentValue < limitGB;
  }
  
  return currentValue < limit;
}

export function getUpgradeRecommendation(tiers, currentTier, reason) {
  const tierOrder = ['free', 'basic', 'starter', 'pro', 'enterprise'];
  const currentIndex = tierOrder.indexOf(currentTier);
  
  if (currentIndex < tierOrder.length - 1) {
    return tierOrder[currentIndex + 1];
  }
  
  return null;
}