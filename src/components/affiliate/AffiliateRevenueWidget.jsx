import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, MousePointer, ArrowUpRight, RefreshCw } from 'lucide-react';
import { getFintuttoSDK } from '@/lib/fintutto-sdk';

/**
 * Combined Affiliate Revenue Widget
 * Shows total affiliate revenue across all channels (direct partners + Sovendus).
 * Use in admin dashboards.
 */
export default function AffiliateRevenueWidget({ appId = 'mieterapp', period = '30d' }) {
  const [directAnalytics, setDirectAnalytics] = useState(null);
  const [sovendusAnalytics, setSovendusAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const sdk = getFintuttoSDK(appId);
      const [direct, sovendus] = await Promise.all([
        sdk.getAffiliateAnalytics(period),
        sdk.getSovendusAnalytics(period),
      ]);
      if (direct.success) setDirectAnalytics(direct.analytics);
      if (sovendus.success) setSovendusAnalytics(sovendus.analytics);
    } catch (e) {
      console.error('Revenue widget error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [appId, period]);

  const totalClicks = (directAnalytics?.total_clicks || 0) + (sovendusAnalytics?.clicks || 0);
  const totalConversions = (directAnalytics?.total_conversions || 0) + (sovendusAnalytics?.conversions || 0);
  const totalRevenue = (directAnalytics?.total_revenue || 0) + (sovendusAnalytics?.estimated_revenue || 0);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Affiliate Revenue</h3>
            <p className="text-xs text-gray-500">Letzte {period.replace('d', ' Tage')}</p>
          </div>
        </div>
        <button
          onClick={fetchAll}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      {/* Total Revenue */}
      <div className="mb-4">
        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
          {totalRevenue.toFixed(2)} EUR
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-600 mt-0.5">
          <TrendingUp className="w-3 h-3" />
          <span>Geschaetzter Gesamtumsatz</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
            <MousePointer className="w-3.5 h-3.5" /> Klicks gesamt
          </span>
          <span className="font-medium text-gray-900 dark:text-white">{totalClicks}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> Conversions gesamt
          </span>
          <span className="font-medium text-gray-900 dark:text-white">{totalConversions}</span>
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Direkt-Partner</span>
            <span className="text-gray-700 dark:text-gray-300">{(directAnalytics?.total_revenue || 0).toFixed(2)} EUR</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Sovendus</span>
            <span className="text-gray-700 dark:text-gray-300">{(sovendusAnalytics?.estimated_revenue || 0).toFixed(2)} EUR</span>
          </div>
        </div>
      </div>
    </div>
  );
}
