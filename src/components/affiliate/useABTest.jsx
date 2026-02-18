import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook for A/B test variant assignment and event tracking.
 *
 * Usage:
 *   const { variant, config, trackEvent } = useABTest('affiliate_widget_placement');
 *
 *   // variant = 'dashboard_bottom' | 'sidebar' | 'post_action'
 *   // config = { placement: 'dashboard_bottom', show_count: 3 }
 *
 *   trackEvent('impression');
 *   trackEvent('click', { partner_id: 'verivox' });
 */
export function useABTest(testId) {
  const [variant, setVariant] = useState(null);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!testId) {
      setLoading(false);
      return;
    }

    // Check localStorage cache first for instant render
    const cacheKey = `ab_test_${testId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setVariant(data.variant);
        setConfig(data.config || {});
      } catch (e) {}
    }

    // Then fetch from backend
    base44.functions.invoke('abTestEngine', {
      action: 'get_variant',
      test_id: testId,
    }).then(response => {
      if (response.data?.success) {
        setVariant(response.data.variant);
        setConfig(response.data.config || {});
        localStorage.setItem(cacheKey, JSON.stringify({
          variant: response.data.variant,
          config: response.data.config,
        }));
      }
    }).catch(err => {
      console.error('A/B test error:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, [testId]);

  const trackEvent = useCallback(async (eventType, metadata = {}) => {
    if (!testId || !variant) return;

    try {
      await base44.functions.invoke('abTestEngine', {
        action: 'track_event',
        test_id: testId,
        event_type: eventType,
        variant,
        metadata,
      });
    } catch (e) {
      console.error('A/B tracking error:', e);
    }
  }, [testId, variant]);

  return { variant, config, loading, trackEvent };
}

/**
 * Hook for fetching multiple test variants at once.
 *
 * Usage:
 *   const { variants, trackEvent } = useABTests([
 *     'affiliate_widget_placement',
 *     'verivox_banner_style',
 *   ]);
 *
 *   variants.affiliate_widget_placement?.config?.placement
 */
export function useABTests(testIds = []) {
  const [variants, setVariants] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!testIds.length) {
      setLoading(false);
      return;
    }

    base44.functions.invoke('abTestEngine', {
      action: 'get_all_variants',
      test_ids: testIds,
    }).then(response => {
      if (response.data?.success) {
        setVariants(response.data.variants || {});
      }
    }).catch(err => {
      console.error('A/B tests error:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, [testIds.join(',')]);

  const trackEvent = useCallback(async (testId, eventType, metadata = {}) => {
    const variant = variants[testId]?.variant;
    if (!testId || !variant) return;

    try {
      await base44.functions.invoke('abTestEngine', {
        action: 'track_event',
        test_id: testId,
        event_type: eventType,
        variant,
        metadata,
      });
    } catch (e) {}
  }, [variants]);

  return { variants, loading, trackEvent };
}

export default useABTest;
