import React, { useState } from 'react';
import { Zap, TrendingDown, ArrowRight, X, Loader2, Lightbulb, Flame, Droplets } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * Enhanced Verivox Affiliate Widget
 * Shows contextual energy comparison offers to users.
 * Supports: Strom, Gas, Internet, Versicherung
 *
 * Revenue: CPA €20-80 per successful provider switch
 */

const CATEGORIES = {
  strom: {
    id: 'strom',
    name: 'Stromvergleich',
    icon: Zap,
    color: 'amber',
    headline: 'Bis zu 500€/Jahr beim Strom sparen',
    description: 'Vergleiche über 1.000 Stromanbieter und wechsle in 5 Minuten.',
    savings: '500€',
    cta: 'Jetzt Strom vergleichen',
  },
  gas: {
    id: 'gas',
    name: 'Gasvergleich',
    icon: Flame,
    color: 'orange',
    headline: 'Günstiger heizen – Gasanbieter wechseln',
    description: 'Finde den günstigsten Gastarif und spare mehrere Hundert Euro.',
    savings: '400€',
    cta: 'Jetzt Gas vergleichen',
  },
  internet: {
    id: 'internet',
    name: 'Internet & DSL',
    icon: Lightbulb,
    color: 'blue',
    headline: 'Schnelleres Internet zum besten Preis',
    description: 'DSL, Kabel und Glasfaser – finde den optimalen Tarif.',
    savings: '200€',
    cta: 'Jetzt Internet vergleichen',
  },
};

export default function VerivoxWidget({
  category = 'strom',
  variant = 'card', // 'card', 'banner', 'inline', 'compact'
  context = 'generic',
  onClose,
  className = '',
}) {
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const cat = CATEGORIES[category] || CATEGORIES.strom;
  const Icon = cat.icon;

  const handleClick = async () => {
    setLoading(true);
    try {
      // Generate affiliate link via backend
      const response = await base44.functions.invoke('verivox-track', {
        action: 'generate_link',
        category: cat.id,
      });

      if (response.data?.affiliate_link) {
        // Track the click
        await base44.functions.invoke('affiliatePartnerEngine', {
          action: 'track_click',
          partner_id: 'verivox',
          partner_name: 'Verivox',
          category: cat.id,
          source_page: context,
          context: `verivox_${cat.id}`,
        }).catch(() => {});

        window.open(response.data.affiliate_link, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Verivox link error:', err);
      // Fallback: open direct URL
      window.open(`https://www.verivox.de/${cat.id}/`, '_blank', 'noopener,noreferrer');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    onClose?.();
  };

  if (dismissed) return null;

  // Compact variant (for dashboard sidebar)
  if (variant === 'compact') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`w-4 h-4 text-${cat.color}-500`} />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
        </div>
        <p className="text-xs text-gray-500 mb-2">Bis zu {cat.savings}/Jahr sparen</p>
        <button
          onClick={handleClick}
          disabled={loading}
          className={`w-full py-1.5 text-xs font-medium bg-${cat.color}-50 text-${cat.color}-700 hover:bg-${cat.color}-100 rounded-md transition-colors`}
        >
          {loading ? 'Laden...' : cat.cta}
        </button>
        <p className="text-[10px] text-gray-400 mt-1 text-center">Anzeige</p>
      </div>
    );
  }

  // Banner variant (for page headers)
  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{cat.headline}</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">{cat.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClick}
              disabled={loading}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{cat.cta} <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
            {onClose && (
              <button onClick={handleDismiss} className="p-1.5 hover:bg-amber-100 dark:hover:bg-amber-800 rounded-md">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
        <p className="text-[10px] text-gray-400 mt-2">Anzeige | In Partnerschaft mit Verivox</p>
      </div>
    );
  }

  // Card variant (default, for offers page)
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Icon className="w-5 h-5" />
            <span className="font-semibold">{cat.name}</span>
          </div>
          <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            Spare bis zu {cat.savings}/Jahr
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{cat.headline}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{cat.description}</p>

        <div className="flex gap-2 mb-3">
          {Object.keys(CATEGORIES).map(catKey => (
            <button
              key={catKey}
              onClick={() => {}} // Category selection handled by parent
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                catKey === category
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {CATEGORIES[catKey].name}
            </button>
          ))}
        </div>

        <button
          onClick={handleClick}
          disabled={loading}
          className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {cat.cta}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
        <p className="text-[10px] text-gray-400 mt-2 text-center">Anzeige | Kostenlos & unverbindlich | Powered by Verivox</p>
      </div>
    </div>
  );
}

/**
 * Multi-category Verivox comparison widget
 */
export function VerivoxMultiWidget({ context = 'generic', className = '' }) {
  const [activeCategory, setActiveCategory] = useState('strom');

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <TrendingDown className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Nebenkosten senken</h3>
      </div>
      <div className="flex gap-2">
        {Object.entries(CATEGORIES).map(([catId, cat]) => {
          const CatIcon = cat.icon;
          return (
            <button
              key={catId}
              onClick={() => setActiveCategory(catId)}
              className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                activeCategory === catId
                  ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <CatIcon className={`w-5 h-5 mx-auto mb-1 ${activeCategory === catId ? 'text-amber-600' : 'text-gray-400'}`} />
              <span className={`text-xs font-medium ${activeCategory === catId ? 'text-amber-700 dark:text-amber-400' : 'text-gray-500'}`}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
      <VerivoxWidget category={activeCategory} variant="banner" context={context} />
    </div>
  );
}
