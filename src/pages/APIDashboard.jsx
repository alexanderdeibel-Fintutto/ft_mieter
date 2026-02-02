import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Shield, AlertCircle } from 'lucide-react';
import useAuth from '../components/useAuth';
import APIKeyManager from '../components/admin/APIKeyManager';

export default function APIDashboard() {
  const { user } = useAuth();
  const [usage, setUsage] = useState([]);
  const [stats, setStats] = useState({ total_requests: 0, errors: 0, avg_response_time: 0 });
  const [loading, setLoading] = useState(true);

  if (user && user.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-800">
              <Shield className="h-8 w-8" />
              <div>
                <h3 className="font-semibold text-lg">Zugriff verweigert</h3>
                <p>Nur Administratoren können das API-Dashboard einsehen.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const logs = await base44.entities.APIKeyUsageLog.list('-created_date', 1000);
      
      // Aggregate by hour
      const byHour = {};
      logs.forEach(log => {
        const date = new Date(log.created_date);
        const hour = date.toISOString().substring(0, 13) + ':00';
        if (!byHour[hour]) {
          byHour[hour] = { requests: 0, errors: 0, totalTime: 0, count: 0 };
        }
        byHour[hour].requests++;
        if (!log.success) byHour[hour].errors++;
        byHour[hour].totalTime += log.response_time_ms || 0;
        byHour[hour].count++;
      });

      const chartData = Object.entries(byHour)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .slice(-24)
        .map(([hour, data]) => ({
          hour: new Date(hour).toLocaleDateString('de-DE', { month: '2-digit', day: '2-digit', hour: '2-digit' }),
          requests: data.requests,
          errors: data.errors,
          avg_response_time: Math.round(data.totalTime / data.count)
        }));

      setUsage(chartData);

      // Stats
      const totalRequests = logs.length;
      const errors = logs.filter(l => !l.success).length;
      const avgTime = Math.round(logs.reduce((s, l) => s + (l.response_time_ms || 0), 0) / logs.length);

      setStats({
        total_requests: totalRequests,
        errors,
        avg_response_time: avgTime,
        error_rate: totalRequests > 0 ? Math.round((errors / totalRequests) * 100) : 0
      });
    } catch (error) {
      console.error('Failed to load usage:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">🔌 API Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 mb-1">Requests (24h)</div>
            <div className="text-3xl font-bold">{stats.total_requests}</div>
            <div className="text-xs text-green-600 mt-2">✓ API aktiv</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 mb-1">Fehlerquote</div>
            <div className="text-3xl font-bold text-red-600">{stats.error_rate}%</div>
            <div className="text-xs text-gray-500 mt-2">{stats.errors} Fehler</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 mb-1">Ø Antwortzeit</div>
            <div className="text-3xl font-bold">{stats.avg_response_time}ms</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 mb-1">Endpoint</div>
            <div className="text-lg font-mono text-blue-600">/api/v1</div>
            <div className="text-xs text-gray-500 mt-2">REST API</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {usage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Request-Trend (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="requests" stroke="#3b82f6" name="Requests" />
                <Line yAxisId="left" type="monotone" dataKey="errors" stroke="#ef4444" name="Errors" />
                <Line yAxisId="right" type="monotone" dataKey="avg_response_time" stroke="#8b5cf6" name="Ø ms" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* API Key Manager */}
      <APIKeyManager />

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>📖 API-Dokumentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded p-4 space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Authentication</h4>
              <code className="block bg-white p-2 rounded text-xs border font-mono">
                curl -H "x-api-key: YOUR_API_KEY" https://app.example.com/api/v1/usage
              </code>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-2">Endpoints</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                  <code className="font-mono text-xs">/api/v1/usage?days=30&feature=chat</code>
                  <p className="text-xs text-gray-600 mt-1">Nutzungslogs abrufen</p>
                </div>
                <div>
                  <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                  <code className="font-mono text-xs">/api/v1/costs?month=2025-01</code>
                  <p className="text-xs text-gray-600 mt-1">Kosten pro Feature</p>
                </div>
                <div>
                  <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                  <code className="font-mono text-xs">/api/v1/forecast</code>
                  <p className="text-xs text-gray-600 mt-1">Kosten-Prognose abrufen</p>
                </div>
                <div>
                  <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                  <code className="font-mono text-xs">/api/v1/features</code>
                  <p className="text-xs text-gray-600 mt-1">Verfügbare AI-Features</p>
                </div>
                <div>
                  <Badge className="bg-green-100 text-green-800">POST</Badge>
                  <code className="font-mono text-xs">/api/v1/jobs</code>
                  <p className="text-xs text-gray-600 mt-1">AI-Job auslösen</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-2">Job-Beispiel</h4>
              <code className="block bg-white p-2 rounded text-xs border font-mono">
{`curl -X POST https://app.example.com/api/v1/jobs \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "analysis",
    "params": {"document": "text to analyze"}
  }'`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}