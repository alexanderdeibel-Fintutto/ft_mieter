import React, { useState, useEffect } from 'react';
import { Building2, Users, Home, CreditCard, Palette, Globe, Shield, Zap, ArrowRight, Loader2, Check, Settings, BarChart3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AdminWhiteLabel() {
  const [tiers, setTiers] = useState([]);
  const [unitCount, setUnitCount] = useState(50);
  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    company_email: '',
    company_phone: '',
    branding: {
      primary_color: '#3B82F6',
      secondary_color: '#1E40AF',
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [revenue, setRevenue] = useState(null);

  useEffect(() => {
    loadPricing();
  }, [unitCount]);

  const loadPricing = async () => {
    setLoading(true);
    try {
      const [pricingRes, revenueRes] = await Promise.all([
        base44.functions.invoke('whiteLabelEngine', {
          action: 'get_pricing',
          unit_count: unitCount,
        }),
        base44.functions.invoke('whiteLabelEngine', {
          action: 'get_wl_revenue',
        }).catch(() => ({ data: null })),
      ]);

      if (pricingRes.data?.success) {
        setTiers(pricingRes.data.tiers);
        setRecommended(pricingRes.data.recommended);
      }
      if (revenueRes.data?.success) {
        setRevenue(revenueRes.data.revenue);
      }
    } catch (err) {
      console.error('White-label pricing error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (tierId) => {
    setSubmitting(true);
    try {
      const response = await base44.functions.invoke('whiteLabelEngine', {
        action: 'create_tenant',
        ...formData,
        unit_count: unitCount,
        tier_id: tierId,
      });

      if (response.data?.success) {
        setShowForm(false);
        // Show success
        alert('White-Label Konfiguration erfolgreich erstellt! Nächste Schritte werden angezeigt.');
      }
    } catch (err) {
      console.error('Create tenant error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const TIER_COLORS = {
    small: 'from-blue-500 to-cyan-500',
    medium: 'from-purple-500 to-indigo-500',
    large: 'from-amber-500 to-orange-500',
    enterprise: 'from-gray-700 to-gray-900',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              White-Label für Hausverwaltungen
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Fintutto unter eigenem Branding anbieten
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Overview (Admin) */}
      {revenue && (
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">Aktive Tenants</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{revenue.active_tenants}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">Verwaltete Einheiten</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{revenue.total_units}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-gray-500">MRR</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{'\u20AC'}{revenue.monthly_recurring_revenue?.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-gray-500">ARR</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{'\u20AC'}{revenue.annual_recurring_revenue?.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Unit Count Slider */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Wie viele Einheiten verwalten Sie?</h2>
        <div className="flex items-center gap-6">
          <input
            type="range"
            min="1"
            max="1000"
            step="1"
            value={unitCount}
            onChange={(e) => setUnitCount(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={unitCount}
              onChange={(e) => setUnitCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-center text-sm font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <span className="text-sm text-gray-500">Einheiten</span>
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {tiers.map((tier) => {
          const isRecommended = tier.id === recommended;
          const gradient = TIER_COLORS[tier.id] || 'from-gray-500 to-gray-600';

          return (
            <div
              key={tier.id}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${
                isRecommended
                  ? 'ring-2 ring-purple-500 shadow-lg'
                  : 'border border-gray-200 dark:border-gray-700 shadow-md'
              }`}
            >
              {isRecommended && (
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-center py-1.5 text-xs font-medium">
                  Empfohlen für {unitCount} Einheiten
                </div>
              )}

              <div className={`bg-gradient-to-r ${gradient} p-5`}>
                <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                <p className="text-white/80 text-xs">{tier.min_units}-{tier.max_units > 99999 ? '∞' : tier.max_units} Einheiten</p>
              </div>

              <div className="p-5">
                <div className="mb-4">
                  {tier.calculated_monthly !== null ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {'\u20AC'}{tier.calculated_monthly?.toFixed(0)}
                        </span>
                        <span className="text-gray-500 text-sm">/Monat</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {'\u20AC'}{tier.price_per_unit?.toFixed(2)} pro Einheit/Monat
                      </p>
                    </>
                  ) : (
                    <p className="text-xl font-bold text-gray-900 dark:text-white">Auf Anfrage</p>
                  )}
                </div>

                <ul className="space-y-2 mb-5">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Enthaltene Apps:</p>
                  <div className="flex gap-1 flex-wrap">
                    {tier.apps_included.map(app => (
                      <span key={app} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (tier.id === 'enterprise') {
                      window.location.href = 'mailto:enterprise@fintutto.de?subject=White-Label Enterprise Anfrage';
                    } else {
                      setShowForm(true);
                    }
                  }}
                  className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                    isRecommended
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900'
                  }`}
                >
                  {tier.id === 'enterprise' ? 'Kontakt aufnehmen' : 'Jetzt starten'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Setup Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">White-Label einrichten</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Firmenname</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Mustermann Hausverwaltung GmbH"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-Mail</label>
                <input
                  type="email"
                  value={formData.company_email}
                  onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="info@hausverwaltung.de"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={formData.company_phone}
                  onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="+49 123 456789"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primärfarbe</label>
                  <input
                    type="color"
                    value={formData.branding.primary_color}
                    onChange={(e) => setFormData({ ...formData, branding: { ...formData.branding, primary_color: e.target.value } })}
                    className="w-full h-10 rounded-lg cursor-pointer border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sekundärfarbe</label>
                  <input
                    type="color"
                    value={formData.branding.secondary_color}
                    onChange={(e) => setFormData({ ...formData, branding: { ...formData.branding, secondary_color: e.target.value } })}
                    className="w-full h-10 rounded-lg cursor-pointer border border-gray-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleCreateTenant(recommended || 'small')}
                disabled={submitting || !formData.company_name || !formData.company_email}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Einrichten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Value Props */}
      <div className="grid sm:grid-cols-3 gap-6 mt-8">
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Palette className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Eigenes Branding</h3>
          <p className="text-gray-500 text-sm">Logo, Farben, Domain – alles unter Ihrem Namen.</p>
        </div>
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Sofort einsatzbereit</h3>
          <p className="text-gray-500 text-sm">Keine Entwicklung nötig. In Minuten konfiguriert.</p>
        </div>
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">DSGVO-konform</h3>
          <p className="text-gray-500 text-sm">Hosting in Deutschland. Volle DSGVO-Konformität.</p>
        </div>
      </div>
    </div>
  );
}
