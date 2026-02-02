import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown } from 'lucide-react';

const COST_DATA = [
  { month: 'Jan', cost: 12450, budget: 15000 },
  { month: 'Feb', cost: 14320, budget: 15000 },
  { month: 'Mar', cost: 13890, budget: 15000 },
  { month: 'Apr', cost: 16200, budget: 15000 },
  { month: 'May', cost: 15450, budget: 15000 },
];

const BREAKDOWN = [
  { service: 'Compute', cost: '€4,850', percent: 32 },
  { service: 'Storage', cost: '€2,340', percent: 15 },
  { service: 'Bandwidth', cost: '€1,890', percent: 12 },
  { service: 'Database', cost: '€3,420', percent: 23 },
  { service: 'Other', cost: '€2,500', percent: 18 },
];

export default function AdminCostManagement() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <TrendingDown className="w-6 h-6" /> Cost Management & Optimization
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Current Month', value: '€15,450', status: 'over' },
          { label: 'Monthly Budget', value: '€15,000', status: 'set' },
          { label: 'YTD Spending', value: '€56,310', status: 'info' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className={`text-2xl font-bold mt-2 ${
                metric.status === 'over' ? 'text-red-600' : 'text-gray-900'
              }`}>
                {metric.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Spending Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={COST_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `€${value}`} />
              <Line type="monotone" dataKey="cost" stroke="#EF4444" name="Actual" strokeWidth={2} />
              <Line type="monotone" dataKey="budget" stroke="#10B981" name="Budget" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown (Current Month)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {BREAKDOWN.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">{item.service}</p>
                <p className="font-bold text-gray-900">{item.cost}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-violet-500" style={{ width: `${item.percent}%` }} />
              </div>
              <p className="text-xs text-gray-600">{item.percent}% of total</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost Optimization Opportunities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { opportunity: 'Reserve Compute Instances', savings: '-€1,200/month', complexity: 'medium' },
            { opportunity: 'Enable S3 Intelligent Tiering', savings: '-€340/month', complexity: 'low' },
            { opportunity: 'Optimize Database Queries', savings: '-€450/month', complexity: 'high' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{item.opportunity}</h3>
                <Badge variant="outline" className="text-green-700 text-xs">{item.savings}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Complexity: {item.complexity}</span>
                <Button size="sm" variant="outline" className="text-xs">Implement</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}