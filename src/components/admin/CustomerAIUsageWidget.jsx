import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap, DollarSign } from 'lucide-react';

export default function CustomerAIUsageWidget({ userEmail }) {
  const [stats, setStats] = useState({
    totalCost: 0,
    totalRequests: 0,
    thisMonthCost: 0,
    thisMonthRequests: 0,
    topFeature: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [userEmail]);

  const loadStats = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Lade alle Logs des Nutzers
      const allLogs = await base44.entities.AIUsageLog.filter({
        user_email: userEmail,
        success: true
      });

      // Lade diesen Monat
      const monthLogs = allLogs.filter(log => new Date(log.created_date) >= startOfMonth);

      const totalCost = allLogs.reduce((sum, log) => sum + (log.cost_eur || 0), 0);
      const totalRequests = allLogs.length;
      const thisMonthCost = monthLogs.reduce((sum, log) => sum + (log.cost_eur || 0), 0);
      const thisMonthRequests = monthLogs.length;

      // Top Feature diesen Monat
      const featureCosts = {};
      monthLogs.forEach(log => {
        const feature = log.feature || 'unknown';
        featureCosts[feature] = (featureCosts[feature] || 0) + (log.cost_eur || 0);
      });
      const topFeature = Object.entries(featureCosts).sort((a, b) => b[1] - a[1])[0];

      setStats({
        totalCost,
        totalRequests,
        thisMonthCost,
        thisMonthRequests,
        topFeature: topFeature ? { name: topFeature[0], cost: topFeature[1] } : null
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Laden...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            Gesamtkosten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCost.toFixed(2)}€</div>
          <p className="text-xs text-gray-500 mt-1">Alle Zeit</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            Anfragen gesamt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRequests}</div>
          <p className="text-xs text-gray-500 mt-1">Alle Zeit</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-600" />
            Kosten diesen Monat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.thisMonthCost.toFixed(2)}€</div>
          <p className="text-xs text-gray-500 mt-1">{stats.thisMonthRequests} Anfragen</p>
        </CardContent>
      </Card>

      {stats.topFeature && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Feature</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="mb-2">{stats.topFeature.name}</Badge>
            <div className="text-2xl font-bold">{stats.topFeature.cost.toFixed(2)}€</div>
            <p className="text-xs text-gray-500 mt-1">Diesen Monat</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}