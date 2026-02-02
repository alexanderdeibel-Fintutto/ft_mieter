import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

const REVENUE_DATA = [
  { month: 'Jan', revenue: 12000, users: 245, churn: 5 },
  { month: 'Feb', revenue: 15200, users: 287, churn: 3 },
  { month: 'Mar', revenue: 18500, users: 334, churn: 2 },
];

const CONVERSION = [
  { name: 'Signups', value: 340, color: '#8B5CF6' },
  { name: 'Trial', value: 280, color: '#06B6D4' },
  { name: 'Paid', value: 125, color: '#10B981' },
  { name: 'Churned', value: 8, color: '#EF4444' },
];

export default function AdminAdvancedAnalytics() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <TrendingUp className="w-6 h-6" /> Advanced Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Monthly Revenue', value: '€18.5K', trend: '+21.7%' },
          { label: 'Customer LTV', value: '€2,450', trend: '+15%' },
          { label: 'Churn Rate', value: '1.2%', trend: '-2%' },
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
          <CardTitle>Revenue & Growth (3 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `€${value}`} />
              <Bar dataKey="revenue" fill="#8B5CF6" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={CONVERSION}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {CONVERSION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { metric: 'CAC', value: '€45', change: '-8%' },
              { metric: 'MRR Growth', value: '+18%', change: '+3%' },
              { metric: 'Net Retention', value: '118%', change: '+5%' },
            ].map((item, idx) => (
              <div key={idx} className="p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{item.metric}</p>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs text-green-600">{item.change}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}