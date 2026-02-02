import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap } from 'lucide-react';

const PERFORMANCE_DATA = [
  { time: '00:00', pageLoad: 1200, apiResponse: 45, dbQuery: 125 },
  { time: '06:00', pageLoad: 980, apiResponse: 38, dbQuery: 98 },
  { time: '12:00', pageLoad: 1450, apiResponse: 62, dbQuery: 185 },
  { time: '18:00', pageLoad: 1680, apiResponse: 78, dbQuery: 220 },
  { time: '24:00', pageLoad: 1200, apiResponse: 52, dbQuery: 142 },
];

const OPTIMIZATION_TIPS = [
  { suggestion: 'Enable image lazy loading', impact: '-25% page load', priority: 'high' },
  { suggestion: 'Add Redis caching layer', impact: '-40% db queries', priority: 'high' },
  { suggestion: 'Minify bundle size', impact: '-15% bandwidth', priority: 'medium' },
];

export default function AdminPerformance() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Zap className="w-6 h-6" /> Performance Optimization
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Avg Page Load', value: '1.32s', trend: '-12%' },
          { label: 'API Response Time', value: '58ms', trend: '-8%' },
          { label: 'DB Query Time', value: '154ms', trend: '-5%' },
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
          <CardTitle>Performance Metrics (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={PERFORMANCE_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="pageLoad" stroke="#8B5CF6" name="Page Load (ms)" />
              <Line yAxisId="right" type="monotone" dataKey="apiResponse" stroke="#06B6D4" name="API (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Slow Queries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { query: 'SELECT * FROM repairs WHERE...', time: '425ms', count: 340 },
            { query: 'SELECT * FROM documents WHERE...', time: '312ms', count: 215 },
            { query: 'SELECT * FROM users WHERE...', time: '287ms', count: 145 },
          ].map((item, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <code className="text-xs text-gray-600 block truncate">{item.query}</code>
              <div className="flex items-center justify-between text-xs mt-2">
                <Badge variant="outline">{item.time}</Badge>
                <span className="text-gray-600">{item.count} calls</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {OPTIMIZATION_TIPS.map((tip, idx) => (
            <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{tip.suggestion}</p>
                  <p className="text-xs text-green-600 mt-1">Est. Impact: {tip.impact}</p>
                </div>
                <Badge className={tip.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                  {tip.priority}
                </Badge>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs mt-2">Implement</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}