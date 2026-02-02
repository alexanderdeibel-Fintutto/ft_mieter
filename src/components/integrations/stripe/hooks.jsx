import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { getSubscriptionStatus, getStripePrices } from './api';
import { STRIPE_CONFIG } from './config';

const { TIER_HIERARCHY, TIER_FEATURES } = STRIPE_CONFIG;
const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children, userEmail, currentAppId }) {
  const [state, setState] = useState({
    loading: true, tier: "free", kiAccess: false, hasBundle: false,
    hasSubscription: false, customerId: null, subscriptions: [], activeApps: [],
    features: TIER_FEATURES.free
  });

  const fetchStatus = useCallback(async () => {
    if (!userEmail) {
      setState(prev => ({ ...prev, loading: false, features: TIER_FEATURES.free }));
      return;
    }
    try {
      const status = await getSubscriptionStatus(userEmail);
      const tierFeatures = TIER_FEATURES[status.tier] || TIER_FEATURES.free;
      setState({
        loading: false, tier: status.tier, kiAccess: status.kiAccess || status.hasBundle,
        hasBundle: status.hasBundle, hasSubscription: status.hasSubscription,
        customerId: status.customerId, subscriptions: status.subscriptions,
        activeApps: status.activeApps, features: tierFeatures
      });
    } catch (error) {
      console.error("fetchStatus error:", error);
      setState(prev => ({ ...prev, loading: false, features: TIER_FEATURES.free }));
    }
  }, [userEmail]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const refresh = useCallback(() => {
    setState(prev => ({ ...prev, loading: true }));
    fetchStatus();
  }, [fetchStatus]);

  const hasAppAccess = useCallback((appId = currentAppId) => {
    if (state.hasBundle) return true;
    if (!appId) return true;
    return state.activeApps.includes(appId);
  }, [state.hasBundle, state.activeApps, currentAppId]);

  const hasTierAccess = useCallback((requiredTier) => {
    if (state.hasBundle) return true;
    const currentLevel = TIER_HIERARCHY[state.tier] || 0;
    const requiredLevel = TIER_HIERARCHY[requiredTier] || 0;
    return currentLevel >= requiredLevel;
  }, [state.tier, state.hasBundle]);

  return (
    <SubscriptionContext.Provider value={{ ...state, refresh, hasAppAccess, hasTierAccess, userEmail, currentAppId }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription must be used within SubscriptionProvider");
  return context;
}

export function useFeatureAccess(requiredTier, appId = null) {
  const { loading, tier, kiAccess, hasBundle, hasTierAccess, hasAppAccess, features } = useSubscription();
  if (loading) return { hasAccess: false, loading: true, reason: "loading" };
  if (hasBundle) return { hasAccess: true, loading: false, tier: "bundle", kiAccess: true, features: TIER_FEATURES.bundle };
  if (appId && !hasAppAccess(appId)) return { hasAccess: false, loading: false, reason: "no_app_access", currentTier: tier };
  const hasAccess = hasTierAccess(requiredTier);
  return { hasAccess, loading: false, currentTier: tier, requiredTier, kiAccess, features, reason: hasAccess ? null : "tier_too_low" };
}

export function useKIAccess() {
  const { loading, kiAccess, hasBundle, tier } = useSubscription();
  return { hasAccess: kiAccess || hasBundle, loading, tier };
}

export function useObjectLimit() {
  const { loading, features, hasBundle, tier } = useSubscription();
  const maxObjects = hasBundle ? -1 : (features?.maxObjects || 1);
  return { maxObjects, isUnlimited: maxObjects === -1, loading, tier, canAdd: (currentCount) => maxObjects === -1 || currentCount < maxObjects };
}

export function usePrices(appId) {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      setLoading(true);
      const products = await getStripePrices(appId);
      setPrices(products);
      setLoading(false);
    }
    load();
  }, [appId]);
  return { prices, loading };
}