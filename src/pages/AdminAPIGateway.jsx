import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GATEWAY_DATA = [
  { time: '00:00', throughput: 450, latency: 25, errors: 2 },
  { time: '06:00', throughput: 280, latency: 18, errors: 1 },
  { time: '12:00', throughput: 890, latency: 42, errors: 5 },
  { time: '18:00', throughput: 1200, latency: 58, errors: 8 },
];

const ROUTES = [
  { path: '/api/repairs', method: 'GET', rateLimit: '1000/min', status: 'active' },
  { path: '/api/repairs', method: 'POST', rateLimit: '100/min', status: 'active' },
  { path: '/api/documents', method: 'GET', rateLimit: '500/min', status: 'active' },
  { path: '/api/auth', method: 'POST', rateLimit: '50/min', status: 'throttled' },
];

export default function AdminAPIGateway() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Share2 className="w-6 h-6" /> API Gateway
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Request/Sec', value: '1.2K', trend: '+15%' },
          { label: 'Avg Latency', value: '42ms', trend: '-8ms' },
          { label: 'Error Rate', value: '0.4%', trend: '-0.1%' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
              <p className="text-xs text-green-600 mt-1">{metric.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gateway Throughput (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={GATEWAY_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="throughput" stroke="#8B5CF6" name="Requests/Sec" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Routes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ROUTES.map((route, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{route.method}</Badge>
                  <code className="text-sm font-mono text-gray-900">{route.path}</code>
                </div>
                <Badge className={route.status === 'throttled' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                  {route.status}
                </Badge>
              </div>
              <p className="text-xs text-gray-600">Rate Limit: {route.rateLimit}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gateway Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { policy: 'CORS', enabled: true },
            { policy: 'Request Validation', enabled: true },
            { policy: 'Response Caching', enabled: true },
            { policy: 'API Versioning', enabled: true },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <p className="font-medium text-gray-900">{item.policy}</p>
              <Badge className={item.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {item.enabled ? '✓ Enabled' : 'Disabled'}
              </Badge>
            </div>
          ))}
          <Button className="w-full bg-violet-600 hover:bg-violet-700">Edit Policies</Button>
        </CardContent>
      </Card>
    </div>
  );
}