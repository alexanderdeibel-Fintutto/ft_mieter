import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, RefreshCw } from 'lucide-react';

export default function CostForecastWidget() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateForecast();
  }, []);

  const generateForecast = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateCostForecast');
      if (response.data?.success) {
        setForecast(response.data.forecast);
      }
    } catch (error) {
      console.error('Failed to generate forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !forecast) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Berechne Prognose...</div>
        </CardContent>
      </Card>
    );
  }

  const statusColor = forecast.will_exceed_budget ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  const statusTextColor = forecast.will_exceed_budget ? 'text-red-800' : 'text-green-800';

  return (
    <Card className={`border-2 ${statusColor}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            📊 Kosten-Prognose für {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={generateForecast}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded p-3 border">
            <div className="text-xs text-gray-600">Verbraucht</div>
            <div className="text-2xl font-bold">{forecast.cost_so_far.toFixed(2)}€</div>
            <div className="text-xs text-gray-500">{forecast.days_passed} Tage</div>
          </div>
          
          <div className="bg-white rounded p-3 border">
            <div className="text-xs text-gray-600">Prognose</div>
            <div className={`text-2xl font-bold ${forecast.will_exceed_budget ? 'text-red-600' : 'text-blue-600'}`}>
              {forecast.projected_total_cost.toFixed(2)}€
            </div>
            <div className="text-xs text-gray-500">{forecast.days_remaining} Tage übrig</div>
          </div>

          <div className="bg-white rounded p-3 border">
            <div className="text-xs text-gray-600">Budget</div>
            <div className="text-2xl font-bold">{forecast.global_budget.toFixed(2)}€</div>
            <div className={`text-xs font-semibold ${forecast.will_exceed_budget ? 'text-red-600' : 'text-green-600'}`}>
              {forecast.will_exceed_budget 
                ? `+${forecast.budget_overage.toFixed(2)}€ zu viel`
                : `-${(forecast.global_budget - forecast.projected_total_cost).toFixed(2)}€ verfügbar`
              }
            </div>
          </div>
        </div>

        {/* Warnings */}
        {forecast.warnings.length > 0 && (
          <div className="space-y-2">
            {forecast.warnings.map((warning, i) => (
              <div
                key={i}
                className={`p-3 rounded border-l-4 flex gap-2 ${
                  warning.severity === 'critical'
                    ? 'bg-red-50 border-red-400'
                    : 'bg-orange-50 border-orange-400'
                }`}
              >
                <AlertCircle className={`h-5 w-5 flex-shrink-0 ${
                  warning.severity === 'critical' ? 'text-red-600' : 'text-orange-600'
                }`} />
                <p className={`text-sm ${
                  warning.severity === 'critical' ? 'text-red-800' : 'text-orange-800'
                }`}>
                  {warning.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Feature Breakdown */}
        <div className="bg-white rounded border p-3 space-y-2">
          <h4 className="font-semibold text-sm">Top Features (Prognose)</h4>
          {forecast.features.slice(0, 5).map((feature, i) => (
            <div key={i} className="flex items-center justify-between text-sm pb-2 border-b last:border-0 last:pb-0">
              <div className="flex-1">
                <div className="font-medium">{feature.feature_key}</div>
                <div className="text-xs text-gray-500">
                  {feature.requests} Anfragen, Ø {feature.avg_cost_per_request.toFixed(4)}€
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-600">{feature.projected_cost.toFixed(2)}€</div>
                {feature.has_budget && (
                  <Badge variant={feature.will_exceed_feature_budget ? 'destructive' : 'outline'} className="text-xs mt-1">
                    {feature.feature_budget_usage}% Budget
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
          {forecast.will_exceed_budget ? (
            <>
              ⚠️ <strong>Sofortmaßnahmen erforderlich:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Überprüfen Sie Feature-Budgets für Top-Features</li>
                <li>Migrieren Sie zu günstigeren Modellen (z.B. Claude Haiku)</li>
                <li>Reduzieren Sie max_tokens-Limits</li>
              </ul>
            </>
          ) : (
            <>
              ✓ Budget ist im grünen Bereich. Aktuelles Verbrauchstempo führt zu {forecast.budget_status}% Auslastung.
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}