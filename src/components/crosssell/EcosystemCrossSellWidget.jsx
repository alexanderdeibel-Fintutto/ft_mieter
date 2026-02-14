import React, { useState } from 'react';
import { ArrowRight, X, Building2, Home, Wrench, BarChart3, Globe, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FINTUTTO_APPS, ECOSYSTEM_BUNDLES } from './EcosystemApps';

const APP_ICONS = {
  mieterapp: Home,
  vermietify: Building2,
  hausmeisterpro: Wrench,
  ablesung: BarChart3,
  portal: Globe,
};

/**
 * Ecosystem Cross-Sell Widget
 * Shows other Fintutto apps the user might benefit from.
 * Placed on dashboard or sidebar.
 */
export default function EcosystemCrossSellWidget({
  currentApp = 'mieterapp',
  userRole = 'mieter',
  className = '',
}) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Get apps relevant for this user role
  const relevantApps = Object.entries(FINTUTTO_APPS)
    .filter(([id]) => id !== currentApp)
    .filter(([, app]) => app.targetAudience.includes(userRole))
    .slice(0, 3);

  // Find best bundle
  const bestBundle = Object.entries(ECOSYSTEM_BUNDLES).find(([, b]) =>
    b.apps.includes(currentApp)
  );

  if (relevantApps.length === 0) return null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="font-semibold text-gray-900 dark:text-white text-sm">Fintutto Ökosystem</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
        >
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      {/* Apps */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {relevantApps.map(([appId, app]) => {
          const Icon = APP_ICONS[appId] || Globe;
          return (
            <a
              key={appId}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: app.color + '15' }}
              >
                <Icon className="w-4.5 h-4.5" style={{ color: app.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{app.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{app.tagline}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </a>
          );
        })}
      </div>

      {/* Bundle CTA */}
      {bestBundle && (
        <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-t border-purple-100 dark:border-purple-800">
          <button
            onClick={() => navigate('/EcosystemPricing')}
            className="w-full flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                {bestBundle[1].name} – {bestBundle[1].pricing.savings_vs_individual} sparen
              </p>
              <p className="text-[11px] text-purple-600/70 dark:text-purple-400/70">
                Ab {'\u20AC'}{bestBundle[1].pricing.monthly}/Monat für {bestBundle[1].apps.length} Apps
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-500" />
          </button>
        </div>
      )}
    </div>
  );
}
