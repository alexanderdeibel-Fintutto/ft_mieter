import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database } from 'lucide-react';

const DATABASES = [
  { id: 1, name: 'Production', size: '125 GB', tables: 42, connections: 145, status: 'healthy' },
  { id: 2, name: 'Analytics', size: '89 GB', tables: 28, connections: 34, status: 'healthy' },
  { id: 3, name: 'Staging', size: '42 GB', tables: 42, connections: 8, status: 'healthy' },
];

const QUERIES = [
  { query: 'SELECT * FROM repairs WHERE...', time: '1243ms', rows: 5420, calls: 342 },
  { query: 'SELECT * FROM documents WHERE...', time: '892ms', rows: 2150, calls: 215 },
  { query: 'SELECT * FROM users WHERE...', time: '756ms', rows: 1845, calls: 145 },
];

export default function AdminDatabaseManagement() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Database className="w-6 h-6" /> Database Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Size', value: '256 GB', color: 'text-blue-600' },
          { label: 'Total Tables', value: '112', color: 'text-green-600' },
          { label: 'Active Connections', value: '187', color: 'text-violet-600' },
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
          <CardTitle>Database Instances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {DATABASES.map(db => (
            <div key={db.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{db.name}</h3>
                <Badge className="bg-green-100 text-green-800">✓ {db.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{db.size} • {db.tables} tables</span>
                <span>{db.connections} connections</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Backup</Button>
                <Button size="sm" variant="outline" className="text-xs">Monitor</Button>
                <Button size="sm" variant="outline" className="text-xs">Optimize</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Slow Queries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {QUERIES.map((q, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <code className="text-xs text-gray-600 block truncate mb-2">{q.query}</code>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span className="font-mono">{q.time}</span>
                <span>{q.rows.toLocaleString()} rows</span>
                <span>{q.calls} calls</span>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs">Analyze</Button>
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
            { task: 'Run VACUUM', lastRun: '2h ago', nextRun: '24h' },
            { task: 'Analyze Tables', lastRun: '1h ago', nextRun: '12h' },
            { task: 'Reindex', lastRun: '3h ago', nextRun: '48h' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.task}</p>
                <p className="text-xs text-gray-600 mt-1">Last: {item.lastRun} • Next: {item.nextRun}</p>
              </div>
              <Button size="sm" variant="outline" className="text-xs">Run Now</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}