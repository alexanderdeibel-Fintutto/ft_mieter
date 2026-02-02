import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Download, Calendar } from 'lucide-react';

const REVENUE_DATA = [
  { month: 'Jan', revenue: 4000, expected: 4500 },
  { month: 'Feb', revenue: 3000, expected: 4200 },
  { month: 'Mar', revenue: 2000, expected: 4800 },
  { month: 'Apr', revenue: 2780, expected: 5100 },
  { month: 'May', revenue: 1890, expected: 5400 },
  { month: 'Jun', revenue: 2390, expected: 5800 },
];

const USER_GROWTH = [
  { week: 'W1', users: 400, active: 240 },
  { week: 'W2', users: 520, active: 310 },
  { week: 'W3', users: 680, active: 450 },
  { week: 'W4', users: 820, active: 580 },
  { week: 'W5', users: 950, active: 720 },
];

const CATEGORY_DATA = [
  { name: 'Reparaturen', value: 35 },
  { name: 'Dokumente', value: 25 },
  { name: 'Zahlungen', value: 20 },
  { name: 'Community', value: 20 },
];

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'];

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('month');

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" /> Analytics Dashboard
        </h1>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="week">Diese Woche</option>
            <option value="month">Dieser Monat</option>
            <option value="quarter">Dieses Quartal</option>
            <option value="year">Dieses Jahr</option>
          </select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Gesamteinkommen', value: '€18.4K', change: '+12.5%' },
          { label: 'Aktive Nutzer', value: '1.245', change: '+8.2%' },
          { label: 'Reparaturen', value: '34', change: '+5%' },
          { label: 'Konversionsrate', value: '3.2%', change: '+0.5%' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
              <p className="text-xs text-green-600 mt-2">↑ {metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">Einnahmen</TabsTrigger>
          <TabsTrigger value="growth">Nutzer-Wachstum</TabsTrigger>
          <TabsTrigger value="distribution">Verteilung</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Einnahmen Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={REVENUE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8B5CF6" name="Tatsächlich" />
                  <Bar dataKey="expected" fill="#E5E7EB" name="Erwartet" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>Nutzer-Wachstum</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={USER_GROWTH}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#8B5CF6" name="Registriert" strokeWidth={2} />
                  <Line type="monotone" dataKey="active" stroke="#06B6D4" name="Aktiv" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Aktivität nach Kategorie</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={CATEGORY_DATA}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {CATEGORY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detaillierte Metriken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Durchschnittliche Sitzungsdauer', value: '8m 45s', trend: '+12%' },
              { name: 'Bounce Rate', value: '42%', trend: '-5%' },
              { name: 'Seiten pro Sitzung', value: '4.2', trend: '+8%' },
              { name: 'Neue Nutzer', value: '245', trend: '+15%' },
            ].map((metric, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <p className="font-medium text-gray-900">{metric.name}</p>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{metric.value}</p>
                  <p className="text-xs text-green-600">{metric.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}