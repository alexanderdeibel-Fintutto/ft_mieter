import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AIUsageChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsageData();
  }, []);

  const loadUsageData = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const logs = await base44.entities.AIUsageLog.filter({
        created_date: { $gte: startOfMonth.toISOString() }
      }, '-created_date', 1000);

      // Gruppiere nach Tag
      const dailyData = {};
      logs?.forEach(log => {
        const date = new Date(log.created_date).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { date, cost: 0, requests: 0, tokens: 0 };
        }
        dailyData[date].cost += log.cost_eur || 0;
        dailyData[date].requests += 1;
        dailyData[date].tokens += (log.input_tokens || 0) + (log.output_tokens || 0);
      });

      const chartData = Object.values(dailyData).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );

      setData(chartData);
    } catch (error) {
      console.error('Failed to load usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Lade Nutzungsdaten...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Nutzung diesen Monat</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).getDate().toString()}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              labelFormatter={(date) => new Date(date).toLocaleDateString('de-DE')}
              formatter={(value, name) => {
                if (name === 'Kosten') return `${value.toFixed(4)}€`;
                if (name === 'Tokens') return `${Math.round(value)}`;
                return value;
              }}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="cost" 
              stroke="#3b82f6" 
              name="Kosten" 
              strokeWidth={2}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="requests" 
              stroke="#10b981" 
              name="Anfragen" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}