/**
 * React Hooks for Fintutto SDK
 * Drop-in hooks for any Fintutto app to integrate affiliate, cross-sell, A/B testing, and bundles.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FintuttoSDK } from './fintutto-sdk';

// ─── SDK Provider Hook ──────────────────────────────────────────

export function useFintuttoSDK(appId = 'mieterapp') {
  return useMemo(() => new FintuttoSDK({ appId }), [appId]);
}

// ─── Affiliate Offers ───────────────────────────────────────────

export function useAffiliateOffers({ appId = 'mieterapp', category, userRole, context, limit = 8 } = {}) {
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const sdk = useFintuttoSDK(appId);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await sdk.getAffiliateOffers({ category, userRole, context, limit });
      if (result.success) {
        setOffers(result.offers || []);
        setCategories(result.categories || {});
      }
    } catch (e) {
      console.error('useAffiliateOffers error:', e);
    } finally {
      setLoading(false);
    }
  }, [sdk, category, userRole, context, limit]);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  const trackClick = useCallback(async (partner) => {
    await sdk.trackAffiliateClick({
      partnerId: partner.id,
      partnerName: partner.name,
      category: partner.category,
      sourcePage: window.location.pathname,
      context,
    });
  }, [sdk, context]);

  const dismiss = useCallback(async (partnerId, permanent = false) => {
    await sdk.dismissAffiliateOffer(partnerId, permanent);
    setOffers(prev => prev.filter(o => o.id !== partnerId));
  }, [sdk]);

  return { offers, categories, loading, trackClick, dismiss, refetch: fetchOffers };
}

// ─── Cross-Sell Recommendation ──────────────────────────────────

export function useCrossSell({ appId = 'mieterapp', eventType, dismissedApps = [] } = {}) {
  const [recommendation, setRecommendation] = useState(null);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const sdk = useFintuttoSDK(appId);

  const fetchRecommendation = useCallback(async (event) => {
    try {
      const result = await sdk.getCrossSellRecommendation(event || eventType, dismissedApps);
      if (result.show_recommendation) {
        setRecommendation(result);
        setShowRecommendation(true);
      }
    } catch (e) {
      console.error('useCrossSell error:', e);
    }
  }, [sdk, eventType, dismissedApps]);

  const trackClick = useCallback(async () => {
    if (recommendation) {
      await sdk.trackCrossSellClick(recommendation.target_app, recommendation.recommendation_id);
    }
  }, [sdk, recommendation]);

  const dismiss = useCallback(() => {
    setShowRecommendation(false);
    setRecommendation(null);
  }, []);

  return { recommendation, showRecommendation, fetchRecommendation, trackClick, dismiss };
}

// ─── A/B Testing ────────────────────────────────────────────────

export function useABTest(testId, appId = 'mieterapp') {
  const [variant, setVariant] = useState('control');
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const sdk = useFintuttoSDK(appId);

  useEffect(() => {
    if (!testId) return;
    let cancelled = false;

    (async () => {
      try {
        const result = await sdk.getABTestVariant(testId);
        if (!cancelled && result.success) {
          setVariant(result.variant);
          setConfig(result.config || {});
        }
      } catch (e) {
        console.error('useABTest error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [testId, sdk]);

  const trackEvent = useCallback(async (eventType, metadata = {}) => {
    await sdk.trackABTestEvent(testId, eventType, variant, metadata);
  }, [sdk, testId, variant]);

  return { variant, config, loading, trackEvent };
}

// ─── Ecosystem Bundles ──────────────────────────────────────────

export function useBundles(appId = 'mieterapp') {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const sdk = useFintuttoSDK(appId);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const result = await sdk.getBundles();
        if (!cancelled && result.success) {
          setBundles(result.bundles || []);
        }
      } catch (e) {
        console.error('useBundles error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [sdk]);

  const checkout = useCallback(async (bundleId, billingCycle = 'monthly') => {
    const result = await sdk.createBundleCheckout(bundleId, billingCycle);
    if (result.success && result.checkout_url) {
      window.location.href = result.checkout_url;
    }
    return result;
  }, [sdk]);

  return { bundles, loading, checkout };
}

// ─── Sovendus ───────────────────────────────────────────────────

export function useSovendus(appId = 'mieterapp') {
  const sdk = useFintuttoSDK(appId);

  const trackEvent = useCallback(async (eventType, data = {}) => {
    return sdk.trackSovendusEvent({ eventType, ...data });
  }, [sdk]);

  const getAnalytics = useCallback(async (period = '30d') => {
    return sdk.getSovendusAnalytics(period);
  }, [sdk]);

  return { trackEvent, getAnalytics };
}
