import React from 'react';
import { ExternalLink, ArrowRight, Sparkles, Zap, X } from 'lucide-react';
import { useCrossSell } from '@/lib/useFintutto';

/**
 * Cross-Sell Recommendation Component
 * Drop this into any Fintutto app to show context-aware recommendations.
 *
 * Usage:
 *   <CrossSellRecommendation appId="vermietify" eventType="repair_created" />
 */
export function CrossSellRecommendation({ appId = 'mieterapp', eventType }) {
  const { recommendation, showRecommendation, fetchRecommendation, trackClick, dismiss } =
    useCrossSell({ appId, eventType });

  React.useEffect(() => {
    if (eventType) fetchRecommendation(eventType);
  }, [eventType, fetchRecommendation]);

  if (!showRecommendation || !recommendation) return null;

  const { messaging, placement } = recommendation;

  const handleClick = () => {
    trackClick();
    if (messaging.cta_url) {
      window.open(messaging.cta_url, '_blank');
    }
  };

  if (placement?.location === 'toast') {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 animate-in slide-in-from-bottom-4">
        <button onClick={dismiss} className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <X className="w-4 h-4 text-gray-400" />
        </button>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{messaging.headline}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{messaging.body}</p>
            <button
              onClick={handleClick}
              className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              {messaging.cta_text} <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5 relative">
      <button onClick={dismiss} className="absolute top-3 right-3 p-1 hover:bg-white/50 rounded-full">
        <X className="w-4 h-4 text-gray-400" />
      </button>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
          <Zap className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{messaging.headline}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{messaging.body}</p>
          {messaging.benefit && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {messaging.benefit}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={handleClick}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              {messaging.cta_text} <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button onClick={dismiss} className="text-sm text-gray-500 hover:text-gray-700">
              {messaging.dismiss_text || 'Spaeter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CrossSellRecommendation;
