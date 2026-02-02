import React from 'react';
import { Coins, TrendingDown } from 'lucide-react';

export default function AICostDisplay({ usage }) {
  if (!usage) return null;

  const hasSavings = usage.savings_eur > 0;

  return (
    <div className="flex items-center gap-3 text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
      <Coins className="h-3 w-3" />
      <div className="flex gap-4">
        <span>
          Kosten: <strong>{usage.cost_eur?.toFixed(4)}€</strong>
        </span>
        {hasSavings && (
          <>
            <span className="text-green-600 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Ersparnis durch Cache: {usage.savings_eur?.toFixed(4)}€
            </span>
          </>
        )}
        <span className="text-gray-400">
          {usage.input_tokens + usage.output_tokens} Tokens
        </span>
      </div>
    </div>
  );
}