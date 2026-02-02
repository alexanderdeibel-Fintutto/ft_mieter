import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const USAGE_DATA = [
  { date: 'Jan 20', api: 4500, storage: 250, bandwidth: 1200, cost: 850 },
  { date: 'Jan 21', api: 5200, storage: 255, bandwidth: 1350, cost: 920 },
  { date: 'Jan 22', api: 4800, storage: 260, bandwidth: 1280, cost: 890 },
  { date: 'Jan 23', api: 6100, storage: 265, bandwidth: 1450, cost: 1050 },
  { date: 'Jan 24', api: 5450, storage: 270, bandwidth: 1320, cost: 950 },
];

const BY_SERVICE = [
  { service: 'API Calls', current: '5.4K', monthly: '152K', limit: '500K', percent: 30 },
  { service: 'Storage', current: '270 GB', monthly: '8.1 TB', limit: '50 TB', percent: 16 },
  { service: 'Bandwidth', current: '1.3 GB', monthly: '38 GB', limit: '500 GB', percent: 8 },
];

export default function AdminUsageAnalytics() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <TrendingUp className="w-6 h-6" /> Usage Analytics & Metering
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Daily Cost', value: '€950', trend: '+5.6%' },
          { label: 'Monthly Projected', value: '€27,450', trend: '+2.3%' },
          { label: 'Quota Remaining', value: '€5,450', trend: '-12%' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
              <p className={`text-xs mt-1 ${metric.trend.includes('-') ? 'text-red-600' : 'text-green-600'}`}>{metric.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Cost Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={USAGE_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `€${value}`} />
              <Area type="monotone" dataKey="cost" fill="#8B5CF6" stroke="#8B5CF6" name="Daily Cost" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage by Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {BY_SERVICE.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{item.service}</h3>
                <span className="text-sm text-gray-600">{item.current}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Monthly: {item.monthly} / {item.limit}</span>
                <span className="font-bold">{item.percent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    item.percent > 80 ? 'bg-red-500' : item.percent > 50 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(item.percent, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost Projections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { period: 'Current Month (Jan)', cost: '€23,600', status: '79% of budget' },
            { period: 'Q1 Projection', cost: '€71,200', status: 'On track' },
            { period: 'Annual Projection', cost: '€288,400', status: 'Above budget' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{item.period}</p>
                <p className="text-xs text-gray-600 mt-1">{item.status}</p>
              </div>
              <p className="font-bold text-gray-900">{item.cost}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}