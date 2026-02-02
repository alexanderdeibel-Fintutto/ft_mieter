import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Euro, TrendingUp } from 'lucide-react';

const COST_DATA = [
  { month: 'Jan', compute: 4200, storage: 1200, bandwidth: 800, other: 600 },
  { month: 'Feb', compute: 4500, storage: 1300, bandwidth: 850, other: 700 },
  { month: 'Mar', compute: 5100, storage: 1400, bandwidth: 920, other: 750 },
];

const COST_BREAKDOWN = [
  { name: 'Compute', value: 45, color: '#8B5CF6' },
  { name: 'Storage', value: 30, color: '#06B6D4' },
  { name: 'Bandwidth', value: 15, color: '#10B981' },
  { name: 'Other', value: 10, color: '#F59E0B' },
];

export default function AdminCostAnalytics() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Euro className="w-6 h-6" /> Cost Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Monthly Cost', value: '€6,700', trend: '+8.2%' },
          { label: 'Daily Avg', value: '€223', forecast: 'Stable' },
          { label: 'Cost per User', value: '€0.45', trend: '-2.1%' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
              <p className="text-xs text-gray-600 mt-1">{metric.trend || metric.forecast}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Trend (3 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={COST_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `€${value}`} />
              <Bar dataKey="compute" fill="#8B5CF6" name="Compute" />
              <Bar dataKey="storage" fill="#06B6D4" name="Storage" />
              <Bar dataKey="bandwidth" fill="#10B981" name="Bandwidth" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={COST_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COST_BREAKDOWN.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Costs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {COST_BREAKDOWN.map(item => (
              <div key={item.name} className="p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                </div>
                <Badge variant="outline">{item.value}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Optimization Opportunities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { suggestion: 'Consolidate unused databases', savings: '€200/month' },
            { suggestion: 'Enable compression for storage', savings: '€150/month' },
            { suggestion: 'Optimize CDN cache TTL', savings: '€80/month' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start justify-between">
                <p className="text-sm text-gray-900">{item.suggestion}</p>
                <Badge className="bg-green-100 text-green-800 text-xs">{item.savings}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}