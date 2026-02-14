import React, { useState, useEffect } from 'react';
import { Gift, ArrowRight, Zap, Tag, ExternalLink, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useABTest } from './useABTest';

/**
 * Compact affiliate widget for the main dashboard.
 * Shows 2-3 top affiliate offers relevant to the user.
 */
export default function AffiliateDashboardWidget({ userRole = 'mieter', className = '' }) {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { variant: placement, trackEvent } = useABTest('affiliate_widget_placement');

  useEffect(() => {
    loadTopOffers();
  }, [userRole]);

  // Track impression when widget becomes visible
  useEffect(() => {
    if (placement && offers.length > 0) {
      trackEvent('impression', { offer_count: offers.length });
    }
  }, [placement, offers.length]);

  const loadTopOffers = async () => {
    try {
      const response = await base44.functions.invoke('affiliatePartnerEngine', {
        action: 'get_offers',
        user_role: userRole,
        limit: 3,
      });

      if (response.data?.success) {
        setOffers(response.data.offers.slice(0, 3));
      }
    } catch (err) {
      console.error('Widget offers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOfferClick = async (offer) => {
    try {
      await base44.functions.invoke('affiliatePartnerEngine', {
        action: 'track_click',
        partner_id: offer.id,
        partner_name: offer.name,
        category: offer.category,
        source_page: 'dashboard_widget',
      });
    } catch (e) {}
    // Track A/B test click
    trackEvent('click', { partner_id: offer.id, partner_name: offer.name });
    window.open(offer.affiliate_url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (offers.length === 0) return null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-green-500" />
          <span className="font-semibold text-gray-900 dark:text-white text-sm">Vergünstigungen</span>
        </div>
        <button
          onClick={() => navigate('/AffiliatePartnerOffers')}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          Alle anzeigen <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Offers */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {offers.map((offer) => (
          <button
            key={offer.id}
            onClick={() => handleOfferClick(offer)}
            className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
          >
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
              {offer.logo_url ? (
                <img src={offer.logo_url} alt="" className="w-5 h-5 object-contain" onError={(e) => { e.target.style.display='none'; }} />
              ) : (
                <Tag className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{offer.name}</p>
              <p className="text-xs text-green-600 dark:text-green-400 truncate">{offer.offer_headline}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/30">
        <p className="text-[10px] text-gray-400 text-center">Anzeige | Exklusive Fintutto Partner-Angebote</p>
      </div>
    </div>
  );
}
