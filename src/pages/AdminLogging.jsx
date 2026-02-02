import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText } from 'lucide-react';

const LOG_DATA = [
  { level: 'DEBUG', count: 450, color: '#06B6D4' },
  { level: 'INFO', count: 1200, color: '#10B981' },
  { level: 'WARN', count: 145, color: '#F59E0B' },
  { level: 'ERROR', count: 34, color: '#EF4444' },
];

const LOGS = [
  { id: 1, level: 'ERROR', message: 'Database connection timeout', service: 'repair-service', timestamp: '2026-01-24 14:32:15' },
  { id: 2, level: 'WARN', message: 'High memory usage detected', service: 'chat-service', timestamp: '2026-01-24 14:30:42' },
  { id: 3, level: 'INFO', message: 'User login successful', service: 'auth-service', timestamp: '2026-01-24 14:28:09' },
  { id: 4, level: 'ERROR', message: 'Payment API rate limit exceeded', service: 'payment-service', timestamp: '2026-01-24 14:25:33' },
];

export default function AdminLogging() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <FileText className="w-6 h-6" /> Logging & Tracing
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {LOG_DATA.map((log, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{log.level}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{log.count}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="h-2 rounded-full" style={{ width: '100%', backgroundColor: log.color }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={LOG_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            type="text"
            placeholder="Search logs..."
            className="w-full px-3 py-2 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            {['all', 'DEBUG', 'INFO', 'WARN', 'ERROR'].map(level => (
              <Button
                key={level}
                size="sm"
                variant={selectedLevel === level ? 'default' : 'outline'}
                onClick={() => setSelectedLevel(level)}
                className="text-xs"
              >
                {level}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {LOGS.map(log => (
            <div key={log.id} className={`p-3 rounded-lg border ${
              log.level === 'ERROR' ? 'bg-red-50 border-red-200' :
              log.level === 'WARN' ? 'bg-yellow-50 border-yellow-200' :
              'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={
                      log.level === 'ERROR' ? 'bg-red-100 text-red-800 text-xs' :
                      log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800 text-xs' :
                      'bg-gray-100 text-gray-800 text-xs'
                    }>
                      {log.level}
                    </Badge>
                    <code className="text-xs text-gray-600 font-mono">{log.service}</code>
                  </div>
                  <p className="text-sm text-gray-900">{log.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                </div>
                <Button size="sm" variant="outline" className="text-xs">Details</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log Retention Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { level: 'DEBUG', retention: '7 days' },
            { level: 'INFO', retention: '30 days' },
            { level: 'WARN', retention: '90 days' },
            { level: 'ERROR', retention: '1 year' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <p className="font-medium text-gray-900">{item.level}</p>
              <input type="text" defaultValue={item.retention} className="px-2 py-1 border rounded text-xs w-24" />
            </div>
          ))}
          <Button className="w-full bg-violet-600 hover:bg-violet-700">Update Retention</Button>
        </CardContent>
      </Card>
    </div>
  );
}