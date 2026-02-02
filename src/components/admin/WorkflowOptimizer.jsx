import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingDown, Zap, RefreshCw, CheckCircle } from 'lucide-react';

export default function WorkflowOptimizer() {
  const [optimizations, setOptimizations] = useState([]);
  const [loading, setLoading] = useState(false);

  const analyzeOptimizations = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('analyzeWorkflowOptimizations');
      if (response.data?.success) {
        setOptimizations(response.data.optimizations);
      }
    } catch (error) {
      console.error('Failed to analyze:', error);
      alert('Fehler bei der Analyse');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeOptimizations();
  }, []);

  const getQualityColor = (impact) => {
    const colors = {
      none: 'bg-green-100 text-green-800',
      minimal: 'bg-blue-100 text-blue-800',
      slight: 'bg-yellow-100 text-yellow-800',
      moderate: 'bg-orange-100 text-orange-800',
      significant: 'bg-red-100 text-red-800'
    };
    return colors[impact] || colors.minimal;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      trivial: 'bg-green-50 border-green-200',
      easy: 'bg-blue-50 border-blue-200',
      moderate: 'bg-yellow-50 border-yellow-200',
      hard: 'bg-red-50 border-red-200'
    };
    return colors[difficulty] || colors.easy;
  };

  const totalSavings = optimizations.reduce((sum, opt) => sum + opt.potential_monthly_savings, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Workflow-Optimierungen
          </CardTitle>
          <Button onClick={analyzeOptimizations} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Neu analysieren
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {totalSavings > 0 && (
          <Alert className="bg-green-50 border-green-200">
            <TrendingDown className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Potenzielle monatliche Ersparnis: {totalSavings.toFixed(2)}€</strong>
            </AlertDescription>
          </Alert>
        )}

        {optimizations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Keine Optimierungen gefunden
          </div>
        ) : (
          <div className="space-y-3">
            {optimizations.map((opt, i) => (
              <div key={i} className={`border rounded-lg p-4 ${getDifficultyColor(opt.implementation_difficulty)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{opt.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{opt.description}</p>
                  </div>
                  <Badge className="ml-4" variant="outline">
                    {opt.optimization_type}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-4 my-3 text-sm">
                  <div className="bg-white/50 rounded p-2">
                    <div className="text-xs text-gray-600">Aktuelle Kosten</div>
                    <div className="font-semibold">{opt.current_cost_per_run.toFixed(4)}€</div>
                  </div>
                  <div className="bg-white/50 rounded p-2">
                    <div className="text-xs text-gray-600">Nach Optimierung</div>
                    <div className="font-semibold text-green-600">{opt.optimized_cost_per_run.toFixed(4)}€</div>
                  </div>
                  <div className="bg-white/50 rounded p-2">
                    <div className="text-xs text-gray-600">Einsparung</div>
                    <div className="font-semibold text-green-600">{opt.potential_savings_percent}%</div>
                  </div>
                  <div className="bg-white/50 rounded p-2">
                    <div className="text-xs text-gray-600">Monatlich</div>
                    <div className="font-semibold">{opt.potential_monthly_savings.toFixed(2)}€</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600">Qualitätsimpact:</span>
                  <Badge className={getQualityColor(opt.impact_on_quality)}>
                    {opt.impact_on_quality}
                  </Badge>
                  <span className="text-gray-600 ml-2">Schwierigkeit:</span>
                  <Badge variant="outline">
                    {opt.implementation_difficulty}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}