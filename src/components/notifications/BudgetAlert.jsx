import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

export default function BudgetAlert() {
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    checkBudgetStatus();
    // Prüfe alle 5 Minuten
    const interval = setInterval(checkBudgetStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkBudgetStatus = async () => {
    try {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return;

      const settings = await base44.entities.AISettings.list();
      if (settings.length === 0) return;

      const config = settings[0];
      const monthlyBudget = config.monthly_budget_eur || 50;
      const warningThreshold = config.budget_warning_threshold || 80;

      // Lade Nutzung diesen Monat
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const logs = await base44.entities.AIUsageLog.filter({
        created_date: { $gte: startOfMonth.toISOString() },
        success: true
      });

      const monthCost = logs.reduce((sum, log) => sum + (log.cost_eur || 0), 0);
      const usage = (monthCost / monthlyBudget) * 100;

      const newAlerts = [];

      // Budget überschritten
      if (usage > 100 && !dismissed.has('budget_exceeded')) {
        newAlerts.push({
          id: 'budget_exceeded',
          type: 'critical',
          title: '⚠️ Budget überschritten!',
          message: `Sie haben Ihr monatliches AI-Budget von ${monthlyBudget}€ um ${(monthCost - monthlyBudget).toFixed(2)}€ überschritten.`,
          action: 'Zur Kontrolle'
        });
      }

      // Budget-Warnung
      if (usage > warningThreshold && usage <= 100 && !dismissed.has('budget_warning')) {
        newAlerts.push({
          id: 'budget_warning',
          type: 'warning',
          title: '⚠️ Budget-Warnung',
          message: `Sie haben ${usage.toFixed(1)}% Ihres monatlichen Budgets verbraucht. Aktuell: ${monthCost.toFixed(2)}€ / ${monthlyBudget}€`,
          action: 'Zur Übersicht'
        });
      }

      setAlerts(newAlerts);
    } catch (error) {
      console.error('Failed to check budget:', error);
    }
  };

  const dismiss = (id) => {
    setDismissed(prev => new Set([...prev, id]));
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-md">
      {alerts.map(alert => (
        <Card 
          key={alert.id} 
          className={`border-2 ${
            alert.type === 'critical' 
              ? 'border-red-300 bg-red-50' 
              : 'border-yellow-300 bg-yellow-50'
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <AlertTriangle 
                  className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                    alert.type === 'critical' ? 'text-red-600' : 'text-yellow-600'
                  }`}
                />
                <div className="flex-1">
                  <h4 className={`font-semibold ${
                    alert.type === 'critical' ? 'text-red-900' : 'text-yellow-900'
                  }`}>
                    {alert.title}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    alert.type === 'critical' ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismiss(alert.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}