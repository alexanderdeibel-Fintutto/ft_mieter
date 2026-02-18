import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, MousePointer, Eye, BarChart3, Users, RefreshCw } from 'lucide-react';
import { getFintuttoSDK } from '@/lib/fintutto-sdk';

/**
 * Sovendus Revenue Dashboard Widget
 * Shows real-time Sovendus analytics: impressions, clicks, conversions, revenue.
 * Use in admin dashboards.
 */
export default function SovendusRevenueDashboard({ appId = 'mieterapp', period = '30d' }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const sdk = getFintuttoSDK(appId);
      const result = await sdk.getSovendusAnalytics(selectedPeriod);
      if (result.success) {
        setAnalytics(result.analytics);
      }
    } catch (e) {
      console.error('Sovendus analytics error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod, appId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Sovendus Revenue</h3>
            <p className="text-xs text-gray-500">Wird geladen...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Impressionen',
      value: analytics?.impressions || 0,
      icon: Eye,
      color: 'blue',
    },
    {
      label: 'Klicks',
      value: analytics?.clicks || 0,
      icon: MousePointer,
      color: 'green',
    },
    {
      label: 'Conversions',
      value: analytics?.conversions || 0,
      icon: Users,
      color: 'purple',
    },
    {
      label: 'Gesch. Revenue',
      value: `${(analytics?.estimated_revenue || 0).toFixed(2)} EUR`,
      icon: DollarSign,
      color: 'emerald',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Sovendus Revenue</h3>
            <p className="text-xs text-gray-500">Voucher-Wall Performance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <option value="7d">7 Tage</option>
            <option value="30d">30 Tage</option>
            <option value="90d">90 Tage</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-${stat.color}-50 dark:bg-${stat.color}-900/10 rounded-lg p-3`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3.5 h-3.5 text-${stat.color}-500`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</span>
              </div>
              <div className={`text-lg font-bold text-${stat.color}-700 dark:text-${stat.color}-300`}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rates */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Click-Through-Rate</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {analytics?.ctr || '0'}%
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Conversion-Rate</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {analytics?.conversion_rate || '0'}%
          </div>
        </div>
      </div>

      {/* Top Partners */}
      {analytics?.top_partners && analytics.top_partners.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" />
            Top Partner
          </h4>
          <div className="space-y-1.5">
            {analytics.top_partners.slice(0, 5).map((partner, idx) => (
              <div key={partner.name} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {idx + 1}. {partner.name}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {partner.clicks} Klicks
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consents */}
      {analytics?.consents > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="text-xs text-gray-500">
            Consent-Rate: {analytics.impressions > 0
              ? ((analytics.consents / analytics.impressions) * 100).toFixed(1)
              : '0'}% ({analytics.consents} Zustimmungen)
          </div>
        </div>
      )}
    </div>
  );
}
