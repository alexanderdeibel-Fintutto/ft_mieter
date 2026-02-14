import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, BarChart3, CreditCard, Mail, Shield, FileText, Brain, MessageSquare, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TRANSACTION_ICONS = {
  letterxpress: Mail,
  schufa_check: Shield,
  ocr_scan: FileText,
  digital_signature: CreditCard,
  ai_credit: Brain,
  sms_notification: MessageSquare,
};

export default function AdminTransactionRevenue() {
  const [report, setReport] = useState(null);
  const [affiliateAnalytics, setAffiliateAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [txResponse, affResponse] = await Promise.all([
        base44.functions.invoke('transactionRevenueEngine', {
          action: 'get_revenue_report',
          period,
        }),
        base44.functions.invoke('affiliatePartnerEngine', {
          action: 'get_revenue_analytics',
          period,
        }),
      ]);

      if (txResponse.data?.success) setReport(txResponse.data.report);
      if (affResponse.data?.success) setAffiliateAnalytics(affResponse.data.analytics);
    } catch (err) {
      console.error('Revenue data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalRevenue = (report?.total_revenue || 0) + (affiliateAnalytics?.total_revenue || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Transaktions- und Affiliate-Einnahmen im Überblick
          </p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {p.replace('d', ' Tage')}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Gesamtumsatz</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {'\u20AC'}{totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Transaktionen</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {report?.total_transactions || 0}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Marge</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {report?.margin_percent || 0}%
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">Affiliate Klicks</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {affiliateAnalytics?.total_clicks || 0}
          </p>
        </div>
      </div>

      {/* Transaction Revenue Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-8">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Transaktions-Revenue nach Typ</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {report?.by_type && Object.entries(report.by_type).map(([type, data]) => {
            const Icon = TRANSACTION_ICONS[type] || CreditCard;
            return (
              <div key={type} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{data.name}</p>
                    <p className="text-xs text-gray-500">{data.count} Transaktionen ({data.paid_count} kostenpflichtig, {data.free_count} im Kontingent)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">{'\u20AC'}{data.revenue?.toFixed(2)}</p>
                  <p className="text-xs text-green-600">Marge: {'\u20AC'}{data.margin?.toFixed(2)}</p>
                </div>
              </div>
            );
          })}
          {(!report?.by_type || Object.keys(report.by_type).length === 0) && (
            <div className="p-8 text-center text-gray-500">
              Noch keine Transaktions-Daten im gewählten Zeitraum.
            </div>
          )}
        </div>
      </div>

      {/* Affiliate Revenue */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Affiliate & Partner Revenue</h2>
        </div>
        <div className="p-5">
          {affiliateAnalytics ? (
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{affiliateAnalytics.total_clicks}</p>
                <p className="text-sm text-gray-500">Klicks</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{affiliateAnalytics.total_conversions}</p>
                <p className="text-sm text-gray-500">Conversions</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{'\u20AC'}{affiliateAnalytics.total_revenue?.toFixed(2) || '0.00'}</p>
                <p className="text-sm text-gray-500">Einnahmen</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">Keine Affiliate-Daten verfügbar.</p>
          )}
        </div>
      </div>
    </div>
  );
}
