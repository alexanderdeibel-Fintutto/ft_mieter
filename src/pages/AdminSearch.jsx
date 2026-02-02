import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';

const INDICES = [
  { id: 1, name: 'users_index', status: 'healthy', docs: 2840, size: '45 MB', lastSync: '2m ago' },
  { id: 2, name: 'repairs_index', status: 'healthy', docs: 15420, size: '189 MB', lastSync: '5m ago' },
  { id: 3, name: 'documents_index', status: 'degraded', docs: 8920, size: '124 MB', lastSync: '1h ago' },
];

const QUERIES = [
  { query: 'repair status:open', count: 340, avgTime: '45ms' },
  { query: 'apartment address:berlin', count: 215, avgTime: '38ms' },
  { query: 'document type:contract', count: 128, avgTime: '52ms' },
];

export default function AdminSearch() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Search className="w-6 h-6" /> Search & Indexing
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Neuer Index
        </Button>
      </div>

      {showNew && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Index erstellen
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Index Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Elasticsearch</option>
              <option>Meilisearch</option>
              <option>Algolia</option>
            </select>
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>users</option>
              <option>repairs</option>
              <option>documents</option>
            </select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Indices', value: '3', color: 'text-blue-600' },
          { label: 'Total Docs', value: '27.2K', color: 'text-green-600' },
          { label: 'Avg Query Time', value: '45ms', color: 'text-violet-600' },
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
          <CardTitle>Search Indices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {INDICES.map(idx => (
            <div key={idx.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <code className="text-sm font-mono text-gray-900">{idx.name}</code>
                <Badge className={idx.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {idx.status === 'healthy' ? '✓ Healthy' : '⚠️ Degraded'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{idx.docs.toLocaleString()} docs</span>
                <span>{idx.size}</span>
                <span>Synced {idx.lastSync}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Reindex</Button>
                <Button size="sm" variant="outline" className="text-xs">Settings</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Popular Searches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {QUERIES.map((q, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <code className="text-sm font-mono text-gray-900">{q.query}</code>
                <Badge variant="outline" className="text-xs">{q.count} results</Badge>
              </div>
              <p className="text-xs text-gray-600">Avg time: {q.avgTime}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}