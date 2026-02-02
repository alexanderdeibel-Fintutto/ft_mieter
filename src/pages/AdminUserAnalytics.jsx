import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

const GROWTH_DATA = [
  { month: 'Jan', users: 1240, active: 980, retained: 850 },
  { month: 'Feb', users: 1520, active: 1245, retained: 1120 },
  { month: 'Mar', users: 1890, active: 1560, retained: 1420 },
];

const COHORTS = [
  { cohort: 'Jan 2026', users: 450, week1: '95%', week4: '78%', week12: '62%' },
  { cohort: 'Feb 2026', users: 620, week1: '92%', week4: '75%', week12: '58%' },
  { cohort: 'Mar 2026', users: 580, week1: '88%', week4: '72%', week12: '45%' },
];

export default function AdminUserAnalytics() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Users className="w-6 h-6" /> User Analytics & Behavior
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: '1,890', trend: '+28.5%' },
          { label: 'Active Users', value: '1,560', trend: '+59%' },
          { label: 'Retention (30d)', value: '75.2%', trend: '+2.3%' },
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
          <CardTitle>User Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={GROWTH_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#8B5CF6" name="Total Users" />
              <Bar dataKey="active" fill="#10B981" name="Active Users" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cohort Retention Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {COHORTS.map((cohort, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{cohort.cohort}</h3>
                <span className="text-xs text-gray-600">{cohort.users} users</span>
              </div>
              <div className="flex gap-2 text-xs">
                <div className="flex-1">
                  <p className="text-gray-600 mb-1">Week 1</p>
                  <p className="font-bold text-green-600">{cohort.week1}</p>
                </div>
                <div className="flex-1">
                  <p className="text-gray-600 mb-1">Week 4</p>
                  <p className="font-bold text-blue-600">{cohort.week4}</p>
                </div>
                <div className="flex-1">
                  <p className="text-gray-600 mb-1">Week 12</p>
                  <p className="font-bold text-orange-600">{cohort.week12}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Adoption</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { feature: 'Document Upload', adoption: '78%', users: 1470 },
            { feature: 'Repair Tracking', adoption: '65%', users: 1228 },
            { feature: 'Payment Integration', adoption: '42%', users: 794 },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{item.feature}</p>
                <p className="text-sm font-bold text-gray-900">{item.adoption}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: `${parseInt(item.adoption)}%` }} />
              </div>
              <p className="text-xs text-gray-600">{item.users.toLocaleString()} users</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}