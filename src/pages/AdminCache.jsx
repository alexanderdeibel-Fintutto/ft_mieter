import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Trash2 } from 'lucide-react';

const CACHE_ENTRIES = [
  { key: 'user:*', size: '45 MB', ttl: '1 hour', hits: 12450, misses: 340, hitRate: '97.3%' },
  { key: 'repair:*', size: '128 MB', ttl: '30 min', hits: 8923, misses: 567, hitRate: '94.0%' },
  { key: 'document:*', size: '256 MB', ttl: '2 hours', hits: 5234, misses: 445, hitRate: '92.1%' },
];

export default function AdminCache() {
  const [selectedCache, setSelectedCache] = useState(null);

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Zap className="w-6 h-6" /> Cache Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Cache Size', value: '429 MB', limit: '500 MB' },
          { label: 'Overall Hit Rate', value: '94.5%', trend: '+2.1%' },
          { label: 'Memory Used', value: '85.8%', status: 'warning' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
              <p className="text-xs text-gray-500 mt-1">{metric.limit || metric.trend || metric.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Cache Entries
            <Button size="sm" variant="outline" className="gap-2">
              <Trash2 className="w-4 h-4" /> Clear All Cache
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {CACHE_ENTRIES.map(cache => (
            <div
              key={cache.key}
              onClick={() => setSelectedCache(cache.key)}
              className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-sm font-medium text-gray-900">{cache.key}</h3>
                <Badge variant="outline" className="text-xs">{cache.size}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-gray-600">Hit Rate</p>
                  <p className="font-semibold text-green-600">{cache.hitRate}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-gray-600">Hits</p>
                  <p className="font-semibold text-gray-900">{cache.hits.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-gray-600">TTL</p>
                  <p className="font-semibold text-gray-900">{cache.ttl}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs">
                <Trash2 className="w-3 h-3 mr-1" /> Clear
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cache Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { policy: 'Eviction Strategy', value: 'LRU (Least Recently Used)' },
            { policy: 'Max Memory', value: '500 MB' },
            { policy: 'Default TTL', value: '1 hour' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <p className="font-medium text-gray-900">{item.policy}</p>
              <p className="text-sm text-gray-600">{item.value}</p>
            </div>
          ))}
          <Button className="w-full bg-violet-600 hover:bg-violet-700">Update Policy</Button>
        </CardContent>
      </Card>
    </div>
  );
}