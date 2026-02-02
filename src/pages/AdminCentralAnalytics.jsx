import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Users, FileText, DollarSign, Activity } from 'lucide-react';

export default function AdminCentralAnalytics() {
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Mock data - in production: fetch from analytics tables
  const appStats = [
    {
      name: 'Vermietify',
      active_users: 2340,
      revenue: 8500,
      api_calls: 45000,
      growth: 12.5,
    },
    {
      name: 'MieterApp',
      active_users: 1850,
      revenue: 2100,
      api_calls: 28000,
      growth: 18.3,
    },
    {
      name: 'HausmeisterPro',
      active_users: 620,
      revenue: 3400,
      api_calls: 12000,
      growth: 9.2,
    },
    {
      name: 'Calc/Tools',
      active_users: 4200,
      revenue: 1200,
      api_calls: 35000,
      growth: 24.1,
    },
    {
      name: 'FinTuttO',
      active_users: 450,
      revenue: 5200,
      api_calls: 18000,
      growth: 6.8,
    },
  ];

  const dailyStats = [
    { date: '2026-01-20', revenue: 18000, users: 8300, api_calls: 125000 },
    { date: '2026-01-21', revenue: 19200, users: 8450, api_calls: 132000 },
    { date: '2026-01-22', revenue: 17800, users: 8200, api_calls: 128000 },
    { date: '2026-01-23', revenue: 21500, users: 8650, api_calls: 145000 },
    { date: '2026-01-24', revenue: 20300, users: 8500, api_calls: 138000 },
  ];

  const totalRevenue = appStats.reduce((sum, app) => sum + app.revenue, 0);
  const totalUsers = appStats.reduce((sum, app) => sum + app.active_users, 0);
  const totalApiCalls = appStats.reduce((sum, app) => sum + app.api_calls, 0);

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-red-600">Admin access required</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Central Analytics</h1>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="p-2 border rounded-lg text-sm"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="year">Last 12 months</option>
          </select>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">€{(totalRevenue / 1000).toFixed(1)}k</p>
              <p className="text-xs text-gray-500 mt-1">This period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" /> Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{(totalUsers / 1000).toFixed(1)}k</p>
              <p className="text-xs text-gray-500 mt-1">Across all apps</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="w-4 h-4" /> API Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{(totalApiCalls / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-gray-500 mt-1">API requests processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Avg Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">
                {(appStats.reduce((sum, a) => sum + a.growth, 0) / appStats.length).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Month over month</p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue & API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  name="Revenue (€)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="api_calls"
                  stroke="#8b5cf6"
                  name="API Calls"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* App Performance */}
        <Card>
          <CardHeader>
            <CardTitle>App Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="active_users" fill="#3b82f6" name="Active Users" />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue (€)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* App Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed App Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">App</th>
                    <th className="text-center p-3 font-semibold">Users</th>
                    <th className="text-center p-3 font-semibold">Revenue</th>
                    <th className="text-center p-3 font-semibold">API Calls</th>
                    <th className="text-center p-3 font-semibold">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {appStats.map((app) => (
                    <tr key={app.name} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{app.name}</td>
                      <td className="text-center p-3 text-gray-700">{app.active_users.toLocaleString()}</td>
                      <td className="text-center p-3 font-semibold text-green-600">€{app.revenue}</td>
                      <td className="text-center p-3 text-gray-700">{(app.api_calls / 1000).toFixed(0)}k</td>
                      <td className="text-center p-3">
                        <Badge className="bg-blue-100 text-blue-800">+{app.growth}%</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}