import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, Zap } from 'lucide-react';

export default function AICacheStatsWidget() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCacheStats();
  }, []);

  const loadCacheStats = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const logs = await base44.entities.AIUsageLog.filter({
        created_date: { $gte: startOfMonth.toISOString() },
        success: true
      });

      if (!logs || logs.length === 0) {
        setStats({ totalRequests: 0, cacheHits: 0, hitRate: 0, totalSavings: 0 });
        return;
      }

      const totalRequests = logs.length;
      const cacheHits = logs.filter(log => (log.cache_read_tokens || 0) > 0).length;
      const hitRate = Math.round((cacheHits / totalRequests) * 100);
      
      const totalSavings = logs.reduce((sum, log) => {
        const saved = (log.cost_without_cache_eur || 0) - (log.cost_eur || 0);
        return sum + Math.max(0, saved);
      }, 0);

      setStats({
        totalRequests,
        cacheHits,
        hitRate,
        totalSavings: Math.round(totalSavings * 100) / 100
      });
    } catch (error) {
      console.error('Failed to load cache stats:', error);
      setStats({ totalRequests: 0, cacheHits: 0, hitRate: 0, totalSavings: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Lade Cache-Statistik...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Cache-Effizienz
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-blue-600">{stats.hitRate}%</div>
            <div className="text-sm text-gray-500">Cache Hit Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalSavings.toFixed(2)}€
            </div>
            <div className="text-sm text-gray-500">Gespart diesen Monat</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Cache-Treffer</span>
            <span className="font-medium">{stats.cacheHits} / {stats.totalRequests}</span>
          </div>
        </div>

        {stats.hitRate > 0 && (
          <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-700 flex items-center gap-2">
            <TrendingDown className="h-3 w-3" />
            <span>Prompt-Caching reduziert Kosten um durchschnittlich {stats.hitRate}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}