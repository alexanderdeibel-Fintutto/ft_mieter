import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AIBudgetWarningBanner() {
  const [warning, setWarning] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkBudget();
  }, []);

  const checkBudget = async () => {
    try {
      const settings = await base44.entities.AISettings.list();
      if (!settings?.[0]) return;

      const { monthly_budget_eur, budget_warning_threshold, api_status } = settings[0];

      // Budget-Status prüfen
      if (api_status === 'budget_exceeded') {
        setWarning({
          level: 'error',
          message: `AI-Features deaktiviert: Monatsbudget von ${monthly_budget_eur}€ überschritten.`,
        });
        return;
      }

      // Aktuelle Kosten berechnen
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const logs = await base44.entities.AIUsageLog.filter({
        created_date: { $gte: startOfMonth.toISOString() }
      });
      
      const totalCost = logs?.reduce((sum, log) => sum + (log.cost_eur || 0), 0) || 0;
      const percent = (totalCost / monthly_budget_eur) * 100;

      if (percent >= budget_warning_threshold) {
        setWarning({
          level: percent >= 95 ? 'error' : 'warning',
          message: `AI-Budget zu ${Math.round(percent)}% verbraucht (${totalCost.toFixed(2)}€ von ${monthly_budget_eur}€)`,
        });
      }
    } catch (error) {
      console.error('Budget check failed:', error);
    }
  };

  if (!warning || dismissed) return null;

  return (
    <Alert 
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl ${
        warning.level === 'error' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
      }`}
    >
      <AlertTriangle className={`h-4 w-4 ${warning.level === 'error' ? 'text-red-600' : 'text-yellow-600'}`} />
      <AlertDescription className="flex items-center justify-between">
        <span className={warning.level === 'error' ? 'text-red-800' : 'text-yellow-800'}>
          {warning.message}
        </span>
        <button onClick={() => setDismissed(true)} className="ml-4">
          <X className="h-4 w-4" />
        </button>
      </AlertDescription>
    </Alert>
  );
}