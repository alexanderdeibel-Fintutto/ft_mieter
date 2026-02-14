import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, Loader2, Crown, Zap, Building2, Home, Wrench, BarChart3, Globe, ArrowRight, Star } from 'lucide-react';
import useAuth from '../components/useAuth';
import { FINTUTTO_APPS, ECOSYSTEM_BUNDLES, calculateBundleSavings } from '../components/crosssell/EcosystemApps';
import { base44 } from '@/api/base44Client';

const APP_ICONS = {
  mieterapp: Home,
  vermietify: Building2,
  hausmeisterpro: Wrench,
  ablesung: BarChart3,
  portal: Globe,
};

const BUNDLE_COLORS = {
  mieter_plus: 'from-blue-500 to-cyan-500',
  vermieter_komplett: 'from-purple-500 to-indigo-500',
  fintutto_komplett: 'from-amber-500 to-orange-500',
};

export default function EcosystemPricing() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loadingBundle, setLoadingBundle] = useState(null);
  const [error, setError] = useState(null);

  const handleSelectBundle = async (bundleId) => {
    setLoadingBundle(bundleId);
    setError(null);

    try {
      const response = await base44.functions.invoke('ecosystemBundlePricing', {
        action: 'create_bundle_checkout',
        bundle_id: bundleId,
        billing_cycle: billingCycle,
      });

      if (response.data?.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        setError('Checkout konnte nicht erstellt werden. Bitte versuche es erneut.');
      }
    } catch (err) {
      console.error('Bundle checkout error:', err);
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setLoadingBundle(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Crown className="w-4 h-4" />
            Spare bis zu 40% mit einem Bundle
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Fintutto Ecosystem Bundles
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Kombiniere unsere Apps und spare. Alle Bundles beinhalten Cross-App-Sync,
            gemeinsames Dashboard und Priority Support.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monatlich
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Jährlich
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                2 Monate gratis
              </span>
            </button>
          </div>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Bundle Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {Object.entries(ECOSYSTEM_BUNDLES).map(([bundleId, bundle]) => {
            const savings = calculateBundleSavings(bundleId);
            const isPopular = bundleId === 'vermieter_komplett';
            const gradientClass = BUNDLE_COLORS[bundleId] || 'from-gray-500 to-gray-600';
            const price = billingCycle === 'yearly'
              ? (bundle.pricing.yearly / 12).toFixed(2)
              : bundle.pricing.monthly;
            const totalPrice = billingCycle === 'yearly'
              ? bundle.pricing.yearly
              : bundle.pricing.monthly * 12;

            return (
              <div
                key={bundleId}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isPopular ? 'ring-2 ring-purple-500 scale-[1.02]' : 'border border-gray-200 dark:border-gray-700'
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-center py-1.5 text-sm font-medium flex items-center justify-center gap-1">
                    <Star className="w-4 h-4" />
                    Meistgewählt
                  </div>
                )}

                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${gradientClass} p-6 ${isPopular ? 'pt-10' : ''}`}>
                  <h3 className="text-2xl font-bold text-white mb-1">{bundle.name}</h3>
                  <p className="text-white/80 text-sm">{bundle.tagline}</p>
                  <div className="flex items-center gap-3 mt-4">
                    {bundle.apps.map(appId => {
                      const Icon = APP_ICONS[appId] || Globe;
                      return (
                        <div key={appId} className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center" title={FINTUTTO_APPS[appId]?.name}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6">
                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {'\u20AC'}{price}
                      </span>
                      <span className="text-gray-500 text-sm">/Monat</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        {'\u20AC'}{bundle.pricing.yearly}/Jahr (2 Monate gespart)
                      </p>
                    )}
                    {savings && (
                      <div className="mt-2 inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm">
                        <Zap className="w-3 h-3" />
                        {savings.savingsPercent}% gespart vs. Einzelkauf
                      </div>
                    )}
                  </div>

                  {/* Apps included */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Enthaltene Apps
                    </p>
                    <div className="space-y-1.5">
                      {bundle.apps.map(appId => (
                        <div key={appId} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {FINTUTTO_APPS[appId]?.name || appId}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Bundle-Vorteile
                    </p>
                    <ul className="space-y-1.5">
                      {bundle.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleSelectBundle(bundleId)}
                    disabled={loadingBundle !== null}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      isPopular
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/30'
                        : 'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900'
                    } ${loadingBundle !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loadingBundle === bundleId ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Wird geladen...
                      </>
                    ) : (
                      <>
                        Bundle starten
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Einzelne Apps Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Oder einzelne Apps nutzen
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(FINTUTTO_APPS).map(([appId, app]) => {
              const Icon = APP_ICONS[appId] || Globe;
              const maxPrice = Math.max(...Object.values(app.pricing));
              return (
                <div
                  key={appId}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: app.color + '20' }}>
                      <Icon className="w-5 h-5" style={{ color: app.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{app.name}</h3>
                      <p className="text-xs text-gray-500">{app.tagline}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Ab <span className="font-semibold text-gray-900 dark:text-white">{'\u20AC'}{Math.min(...Object.values(app.pricing).filter(p => p > 0)) || 'Gratis'}</span>/Monat
                  </p>
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline flex items-center gap-1"
                    style={{ color: app.color }}
                  >
                    Mehr erfahren <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ / Trust */}
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm space-y-2">
          <p>Alle Preise verstehen sich zzgl. MwSt. | Monatlich kündbar | Sichere Zahlung via Stripe</p>
          <p>Bundle-Upgrade jederzeit möglich | Bestehende Abos werden angerechnet</p>
        </div>

      </div>
    </div>
  );
}
