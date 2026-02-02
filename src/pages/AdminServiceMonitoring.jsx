import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AlertCircle, TrendingUp, DollarSign, Zap } from 'lucide-react';

export default function AdminServiceMonitoring() {
  const [selectedService, setSelectedService] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Mock data - in production: fetch from service_usage_log table
  const usageData = [
    { date: '2026-01-20', stripe: 450, brevo: 280, openai: 150, mapbox: 90 },
    { date: '2026-01-21', stripe: 520, brevo: 310, openai: 180, mapbox: 110 },
    { date: '2026-01-22', stripe: 480, brevo: 290, openai: 160, mapbox: 95 },
    { date: '2026-01-23', stripe: 610, brevo: 340, openai: 200, mapbox: 130 },
    { date: '2026-01-24', stripe: 550, brevo: 320, openai: 190, mapbox: 115 },
  ];

  const costData = [
    { name: 'Stripe', value: 320, percent: 35 },
    { name: 'LetterXpress', value: 280, percent: 30 },
    { name: 'OpenAI', value: 180, percent: 20 },
    { name: 'Brevo', value: 90, percent: 10 },
    { name: 'Other', value: 50, percent: 5 },
  ];

  const services = [
    {
      key: 'stripe',
      name: 'Stripe Payments',
      status: 'active',
      calls_today: 450,
      success_rate: 99.8,
      avg_latency_ms: 145,
      cost_today: 65.32,
    },
    {
      key: 'brevo',
      name: 'Brevo Email',
      status: 'active',
      calls_today: 320,
      success_rate: 99.9,
      avg_latency_ms: 280,
      cost_today: 0,
    },
    {
      key: 'openai',
      name: 'OpenAI API',
      status: 'active',
      calls_today: 190,
      success_rate: 98.5,
      avg_latency_ms: 1200,
      cost_today: 8.40,
    },
    {
      key: 'mapbox',
      name: 'Mapbox Maps',
      status: 'active',
      calls_today: 115,
      success_rate: 100,
      avg_latency_ms: 95,
      cost_today: 2.15,
    },
    {
      key: 'letterxpress',
      name: 'LetterXpress',
      status: 'active',
      calls_today: 12,
      success_rate: 100,
      avg_latency_ms: 2500,
      cost_today: 18.50,
    },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-red-600">
        Admin access required
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Service Monitoring</h1>
          <Badge className="bg-green-100 text-green-800">All Systems Operational</Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Total API Calls Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">1,087</p>
              <p className="text-xs text-gray-500 mt-1">+12% vs yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Total Costs Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">€94.37</p>
              <p className="text-xs text-gray-500 mt-1">Budget: €500/day</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Avg Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">99.7%</p>
              <p className="text-xs text-gray-500 mt-1">5 failed calls</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Avg Latency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">524ms</p>
              <p className="text-xs text-gray-500 mt-1">Acceptable range</p>
            </CardContent>
          </Card>
        </div>

        {/* API Calls Chart */}
        <Card>
          <CardHeader>
            <CardTitle>API Calls Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="stripe" stroke="#0088FE" />
                <Line type="monotone" dataKey="brevo" stroke="#00C49F" />
                <Line type="monotone" dataKey="openai" stroke="#FFBB28" />
                <Line type="monotone" dataKey="mapbox" stroke="#FF8042" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={costData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `€${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.key}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{service.name}</p>
                      <p className="text-xs text-gray-600">
                        {service.calls_today} calls • {service.success_rate}% success
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Service Table */}
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Service</th>
                    <th className="text-center p-3 font-semibold">Calls Today</th>
                    <th className="text-center p-3 font-semibold">Success Rate</th>
                    <th className="text-center p-3 font-semibold">Latency (ms)</th>
                    <th className="text-right p-3 font-semibold">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.key} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{service.name}</td>
                      <td className="text-center p-3 text-gray-700">{service.calls_today}</td>
                      <td className="text-center p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            service.success_rate >= 99
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {service.success_rate}%
                        </span>
                      </td>
                      <td className="text-center p-3 text-gray-700">{service.avg_latency_ms}</td>
                      <td className="text-right p-3 font-semibold text-gray-900">
                        €{service.cost_today.toFixed(2)}
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