import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap } from 'lucide-react';

const CACHE_DATA = [
  { time: '00:00', hitRate: 82, memory: 45 },
  { time: '06:00', hitRate: 85, memory: 52 },
  { time: '12:00', hitRate: 78, memory: 68 },
  { time: '18:00', hitRate: 88, memory: 71 },
  { time: '24:00', hitRate: 84, memory: 62 },
];

const CACHE_KEYS = [
  { pattern: 'user:*', entries: 2840, size: '12 MB', ttl: '24h', hitRate: '92%' },
  { pattern: 'repair:*', entries: 5420, size: '28 MB', ttl: '12h', hitRate: '87%' },
  { pattern: 'document:*', entries: 1240, size: '8 MB', ttl: '6h', hitRate: '74%' },
];

export default function AdminCaching() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-6 h-6" /> Advanced Caching
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          Cache Invalidieren
        </Button>
      </div>

      {showNew && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Cache Invalidierung
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>user:*</option>
              <option>repair:*</option>
              <option>document:*</option>
            </select>
            <textarea placeholder="Pattern (regex allowed)" rows="2" className="w-full px-3 py-2 border rounded-lg text-sm font-mono" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Invalidieren</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Hit Rate', value: '84.3%', color: 'text-green-600' },
          { label: 'Cache Size', value: '48 MB', color: 'text-blue-600' },
          { label: 'Total Entries', value: '9.5K', color: 'text-violet-600' },
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
          <CardTitle>Cache Performance (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={CACHE_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="hitRate" fill="#10B981" name="Hit Rate (%)" />
              <Bar yAxisId="right" dataKey="memory" fill="#F59E0B" name="Memory (MB)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cache Patterns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {CACHE_KEYS.map((key, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <code className="text-sm font-mono text-gray-900">{key.pattern}</code>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">{key.hitRate}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{key.entries} entries</span>
                <span>{key.size}</span>
                <span>TTL: {key.ttl}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Clear</Button>
                <Button size="sm" variant="outline" className="text-xs">Settings</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}