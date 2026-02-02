import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SmartTooltip from '../onboarding/SmartTooltip';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function AIMonthlySpendChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonthlyData();
  }, []);

  const loadMonthlyData = async () => {
    try {
      const now = new Date();
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(now.getMonth() - 6);

      const logs = await base44.entities.AIUsageLog.filter({
        created_date: { $gte: sixMonthsAgo.toISOString() },
        success: true
      });

      // Gruppiere nach Monat
      const monthlyData = {};
      logs.forEach(log => {
        const date = new Date(log.created_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthKey, cost: 0, requests: 0 };
        }
        monthlyData[monthKey].cost += log.cost_eur || 0;
        monthlyData[monthKey].requests += 1;
      });

      const chartData = Object.values(monthlyData)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map(item => ({
          month: item.month,
          cost: Math.round(item.cost * 100) / 100,
          requests: item.requests
        }));

      setData(chartData);
    } catch (error) {
      console.error('Failed to load monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Lade Monatsdaten...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <SmartTooltip
      elementId="monthly_spend_chart"
      title="Monatliche Ausgaben"
      content="Sehen Sie auf einen Blick, wie sich Ihre AI-Kosten über die letzten 6 Monate entwickelt haben. Nutzen Sie diese Daten zur Budget-Planung."
      tips={[
        'Spitzenwerte deuten auf intensive AI-Nutzung hin',
        'Vergleichen Sie mit früheren Monaten für Trends'
      ]}
      isNew={true}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Monatliche AI-Ausgaben
          </CardTitle>
        </CardHeader>
        <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'cost' ? `${value}€` : value,
                name === 'cost' ? 'Kosten' : 'Anfragen'
              ]}
            />
            <Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        </CardContent>
      </Card>
    </SmartTooltip>
  );
}