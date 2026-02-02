import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';

const TRAFFIC_DATA = [
  { time: '00:00', requests: 2450, errors: 8, latency: 45 },
  { time: '04:00', requests: 1240, errors: 3, latency: 38 },
  { time: '08:00', requests: 5620, errors: 15, latency: 52 },
  { time: '12:00', requests: 7840, errors: 24, latency: 58 },
  { time: '16:00', requests: 6520, errors: 18, latency: 55 },
  { time: '20:00', requests: 4890, errors: 12, latency: 48 },
];

const TOP_ENDPOINTS = [
  { path: '/api/repairs', calls: 24500, errors: 24, latency: '45ms', errorRate: '0.1%' },
  { path: '/api/documents', calls: 18240, errors: 18, latency: '52ms', errorRate: '0.1%' },
  { path: '/api/search', calls: 14560, errors: 42, latency: '125ms', errorRate: '0.3%' },
];

const ERROR_CODES = [
  { code: '200', name: 'Success', count: 48215, percent: '98.4%' },
  { code: '400', name: 'Bad Request', count: 412, percent: '0.8%' },
  { code: '500', name: 'Server Error', count: 172, percent: '0.4%' },
  { code: '429', name: 'Rate Limited', count: 201, percent: '0.4%' },
];

export default function AdminAPIAnalytics() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <BarChart3 className="w-6 h-6" /> API Analytics & Performance
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: '48.3K', color: 'text-blue-600', subtext: '+12% vs yesterday' },
          { label: 'Error Rate', value: '0.39%', color: 'text-green-600', subtext: '-0.1% vs yesterday' },
          { label: 'Avg Latency', value: '52ms', color: 'text-blue-600', subtext: '+2ms vs avg' },
          { label: 'Uptime', value: '99.97%', color: 'text-green-600', subtext: 'vs 99.9% SLA' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className={`text-2xl font-bold mt-2 ${metric.color}`}>{metric.value}</p>
              <p className="text-xs text-gray-500 mt-1">{metric.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Traffic & Errors</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={TRAFFIC_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="requests" stroke="#3B82F6" name="Requests" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="errors" stroke="#EF4444" name="Errors" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {TOP_ENDPOINTS.map((ep, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-sm font-medium">{ep.path}</p>
                <Badge variant="outline" className="text-xs">{ep.calls.toLocaleString()} calls</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Latency: {ep.latency}</span>
                <span>Errors: {ep.errors}</span>
                <span className={ep.errorRate === '0.1%' ? 'text-green-600' : 'text-orange-600'}>Error Rate: {ep.errorRate}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Response Status Codes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ERROR_CODES.map((err, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{err.code} {err.name}</h3>
                <Badge variant="outline">{err.count.toLocaleString()} requests</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: err.percent }} />
              </div>
              <p className="text-xs text-gray-600 mt-1">{err.percent}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}