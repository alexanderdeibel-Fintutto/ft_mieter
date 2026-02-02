import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Users, TrendingUp } from 'lucide-react';

const ACTIVITY_DATA = [
  { date: 'Jan 20', logins: 234, documents: 120, repairs: 89, payments: 45 },
  { date: 'Jan 21', logins: 321, documents: 145, repairs: 112, payments: 58 },
  { date: 'Jan 22', logins: 289, documents: 156, repairs: 98, payments: 62 },
  { date: 'Jan 23', logins: 412, documents: 178, repairs: 134, payments: 78 },
  { date: 'Jan 24', logins: 445, documents: 192, repairs: 156, payments: 89 },
];

const RECENT_ACTIVITIES = [
  { user: 'Max M.', action: 'created repair request', timestamp: '2 min ago' },
  { user: 'Anna S.', action: 'uploaded document', timestamp: '5 min ago' },
  { user: 'Peter W.', action: 'made payment', timestamp: '12 min ago' },
  { user: 'Lisa M.', action: 'viewed announcement', timestamp: '18 min ago' },
];

export default function AdminUserActivity() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Activity className="w-6 h-6" /> User Activity & Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Users (24h)', value: '445', trend: '+8.2%' },
          { label: 'Total Interactions', value: '645', trend: '+12.5%' },
          { label: 'Avg Session Time', value: '12m 34s', trend: '+2m' },
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
          <CardTitle>User Interactions (5 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ACTIVITY_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="logins" fill="#8B5CF6" name="Logins" />
              <Bar dataKey="documents" fill="#06B6D4" name="Documents" />
              <Bar dataKey="repairs" fill="#10B981" name="Repairs" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { metric: 'New Users', value: '32', color: 'bg-blue-100' },
              { metric: 'Returning Users', value: '412', color: 'bg-green-100' },
              { metric: 'Inactive', value: '18', color: 'bg-gray-100' },
            ].map((item, idx) => (
              <div key={idx} className={`p-3 rounded-lg ${item.color}`}>
                <p className="text-sm text-gray-600">{item.metric}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { name: 'Repairs', uses: 1245 },
              { name: 'Documents', uses: 987 },
              { name: 'Chat', uses: 654 },
              { name: 'Announcements', uses: 432 },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-900">{item.name}</span>
                <Badge variant="outline">{item.uses}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity Stream</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {RECENT_ACTIVITIES.map((activity, idx) => (
            <div key={idx} className="p-3 border rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                <p className="text-xs text-gray-600">{activity.action}</p>
              </div>
              <p className="text-xs text-gray-500">{activity.timestamp}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}