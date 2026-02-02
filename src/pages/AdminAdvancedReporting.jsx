import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Plus } from 'lucide-react';

const REPORTS = [
  { id: 1, name: 'Monthly Revenue', type: 'Financial', frequency: 'Monthly', lastRun: '2026-01-24', recipients: 8, status: 'active' },
  { id: 2, name: 'User Growth', type: 'Analytics', frequency: 'Weekly', lastRun: '2026-01-22', recipients: 5, status: 'active' },
  { id: 3, name: 'System Health', type: 'Operations', frequency: 'Daily', lastRun: '2026-01-24', recipients: 3, status: 'active' },
];

const REPORT_DATA = [
  { name: 'Jan', revenue: 45000, users: 1240, uptime: 99.8 },
  { name: 'Feb', revenue: 52000, users: 1520, uptime: 99.9 },
  { name: 'Mar', revenue: 48500, users: 1890, uptime: 99.7 },
];

export default function AdminAdvancedReporting() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6" /> Advanced Reporting & Dashboards
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Report erstellen
        </Button>
      </div>

      {showNew && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Report erstellen
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Report Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Financial</option>
              <option>Analytics</option>
              <option>Operations</option>
              <option>Security</option>
            </select>
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Reports', value: '3', color: 'text-blue-600' },
          { label: 'Total Recipients', value: '16', color: 'text-green-600' },
          { label: 'Reports Generated', value: '142', color: 'text-indigo-600' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className={`text-2xl font-bold mt-2 ${metric.color}`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Metrics Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={REPORT_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="revenue" fill="#8B5CF6" name="Revenue (€)" />
              <Bar yAxisId="right" dataKey="users" fill="#10B981" name="Users" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {REPORTS.map(report => (
            <div key={report.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{report.name}</h3>
                <Badge className="bg-green-100 text-green-800">✓ {report.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{report.type} • {report.frequency}</span>
                <span>Last: {report.lastRun}</span>
                <span>{report.recipients} recipients</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Edit</Button>
                <Button size="sm" variant="outline" className="text-xs">Run Now</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}