import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Zap, HardDrive } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DB_STATS = [
  { time: '00:00', size: 120, queries: 450, latency: 25 },
  { time: '04:00', size: 125, queries: 280, latency: 18 },
  { time: '08:00', size: 128, queries: 890, latency: 42 },
  { time: '12:00', size: 135, queries: 1200, latency: 58 },
  { time: '16:00', size: 140, queries: 950, latency: 48 },
  { time: '20:00', size: 145, queries: 680, latency: 32 },
];

const TABLES = [
  { name: 'users', rows: 1240, size: '24 MB', status: 'optimized' },
  { name: 'repairs', rows: 5342, size: '156 MB', status: 'optimized' },
  { name: 'documents', rows: 8923, size: '2.3 GB', status: 'fragmented' },
  { name: 'notifications', rows: 45234, size: '342 MB', status: 'needs_optimization' },
];

export default function AdminDatabase() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Database className="w-6 h-6" /> Database Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Database Size', value: '145 GB', trend: '+2.1%' },
          { label: 'Queries/Sec', value: '456', trend: '+8.5%' },
          { label: 'Avg Latency', value: '32ms', trend: '-5ms' },
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
          <CardTitle>Database Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={DB_STATS}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="queries" stroke="#8B5CF6" name="Queries" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tables & Indexes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {TABLES.map(table => (
            <div key={table.name} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-sm font-medium text-gray-900">{table.name}</h3>
                <Badge className={
                  table.status === 'optimized' ? 'bg-green-100 text-green-800' :
                  table.status === 'fragmented' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-orange-100 text-orange-800'
                }>
                  {table.status === 'optimized' ? '✓ Optimized' : table.status === 'fragmented' ? '⚠️ Fragmented' : '🔧 Needs Optimization'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{table.rows.toLocaleString()} rows</span>
                <span>{table.size}</span>
              </div>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" className="text-xs">Analyze</Button>
                <Button size="sm" variant="outline" className="text-xs">Optimize</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { task: 'Vacuum Database', lastRun: '2026-01-24 02:00', interval: 'Daily' },
            { task: 'Reindex Tables', lastRun: '2026-01-22 00:00', interval: 'Weekly' },
            { task: 'Backup', lastRun: '2026-01-24 02:30', interval: 'Daily' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 border rounded-lg flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{item.task}</p>
                <p className="text-xs text-gray-500">Last: {item.lastRun} • {item.interval}</p>
              </div>
              <Button size="sm" variant="outline">Run Now</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}