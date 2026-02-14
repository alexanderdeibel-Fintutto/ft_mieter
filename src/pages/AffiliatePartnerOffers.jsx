import React, { useState, useEffect, useCallback } from 'react';
import { Gift, Search, Filter, ExternalLink, X, Tag, Sparkles, TrendingUp, Loader2, ChevronRight, Star, Shield } from 'lucide-react';
import useAuth from '../components/useAuth';
import { base44 } from '@/api/base44Client';
import SovendusIntegration from '../components/affiliate/SovendusIntegration';

const CATEGORY_ICONS = {
  umzug: '📦', energie: '⚡', versicherung: '🛡️', internet: '📡',
  handwerker: '🔨', moebel: '🛋️', reinigung: '🧹', finanzen: '💰',
  sicherheit: '🔒', garten: '🌿',
};

export default function AffiliatePartnerOffers() {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSovendus, setShowSovendus] = useState(false);

  const userRole = user?.role === 'user' ? 'mieter' : (user?.role === 'admin' ? 'vermieter' : user?.role || 'mieter');

  const loadOffers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('affiliatePartnerEngine', {
        action: 'get_offers',
        category: selectedCategory,
        user_role: userRole,
        limit: 20,
      });

      if (response.data?.success) {
        setOffers(response.data.offers);
        setCategories(response.data.categories || {});
      }
    } catch (err) {
      console.error('Error loading offers:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, userRole]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const handleOfferClick = async (offer) => {
    // Track click
    try {
      await base44.functions.invoke('affiliatePartnerEngine', {
        action: 'track_click',
        partner_id: offer.id,
        partner_name: offer.name,
        category: offer.category,
        source_page: 'affiliate_offers',
        context: 'browse',
      });
    } catch (e) {
      console.error('Click tracking error:', e);
    }

    // Open affiliate URL
    window.open(offer.affiliate_url, '_blank', 'noopener,noreferrer');
  };

  const handleDismiss = async (offerId) => {
    try {
      await base44.functions.invoke('affiliatePartnerEngine', {
        action: 'dismiss_offer',
        partner_id: offerId,
        permanent: false,
      });
      setOffers(prev => prev.filter(o => o.id !== offerId));
    } catch (e) {
      console.error('Dismiss error:', e);
    }
  };

  // Filter by search query
  const filteredOffers = offers.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return o.name?.toLowerCase().includes(q)
      || o.description?.toLowerCase().includes(q)
      || o.offer_headline?.toLowerCase().includes(q)
      || o.category?.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Exklusive Vergünstigungen
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Spare mit unseren handverlesenen Partnern
            </p>
          </div>
        </div>
      </div>

      {/* Highlighted Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Fintutto Vorteilsprogramm</span>
            </div>
            <p className="text-white/90 text-sm max-w-xl">
              Als Fintutto-Nutzer erhältst du exklusive Rabatte und Sonderkonditionen
              bei ausgewählten Partnern. Alle Angebote sind handverlesen und auf
              Mieter, Vermieter und Hausmeister zugeschnitten.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{offers.length}+</p>
              <p className="text-white/80 text-xs">Partner</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">500€</p>
              <p className="text-white/80 text-xs">Spar-Potential/Jahr</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Suche nach Partnern oder Kategorien..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            !selectedCategory
              ? 'bg-green-600 text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
          }`}
        >
          Alle
        </button>
        {Object.entries(categories).map(([catId, cat]) => (
          <button
            key={catId}
            onClick={() => setSelectedCategory(selectedCategory === catId ? null : catId)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
              selectedCategory === catId
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            }`}
          >
            <span>{CATEGORY_ICONS[catId] || '📌'}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      )}

      {/* Offer Cards Grid */}
      {!loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              {/* Category Badge */}
              <div className="px-4 pt-4 flex items-center justify-between">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  {CATEGORY_ICONS[offer.category] || '📌'} {categories[offer.category]?.name || offer.category}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDismiss(offer.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-opacity"
                  title="Nicht interessiert"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>

              <div className="p-4">
                {/* Partner Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {offer.logo_url ? (
                      <img src={offer.logo_url} alt={offer.name} className="w-6 h-6 object-contain" onError={(e) => { e.target.style.display='none'; }} />
                    ) : (
                      <span className="text-lg">{CATEGORY_ICONS[offer.category] || '🎁'}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{offer.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{offer.description}</p>
                  </div>
                </div>

                {/* Offer Highlight */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Tag className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-700 dark:text-green-400 font-semibold text-sm">{offer.offer_headline}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{offer.offer_description}</p>
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleOfferClick(offer)}
                  className="w-full py-2.5 px-4 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Zum Angebot
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredOffers.length === 0 && (
        <div className="text-center py-12">
          <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? 'Keine Angebote gefunden. Versuche einen anderen Suchbegriff.' : 'Aktuell keine Angebote verfügbar.'}
          </p>
        </div>
      )}

      {/* Sovendus Section */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weitere Gutscheine unserer Partner</h2>
        </div>
        <SovendusIntegration
          userEmail={user?.email || ''}
          trigger="affiliate_page_view"
          consumerFirstName={user?.full_name?.split(' ')[0] || ''}
          consumerLastName={user?.full_name?.split(' ').slice(1).join(' ') || ''}
          onClose={() => setShowSovendus(false)}
        />
      </div>

      {/* Trust Footer */}
      <div className="mt-12 flex items-center justify-center gap-6 text-xs text-gray-400 dark:text-gray-500">
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4" />
          DSGVO-konform
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4" />
          Handverlesene Partner
        </div>
        <div className="flex items-center gap-1.5">
          <Tag className="w-4 h-4" />
          Exklusive Konditionen
        </div>
      </div>

      {/* Advertising Disclosure */}
      <p className="text-center text-xs text-gray-400 mt-4">
        Anzeige: Einige Angebote enthalten Affiliate-Links. Bei Abschluss erhalten wir eine Provision, die den Preis für dich nicht erhöht.
      </p>
    </div>
  );
}
