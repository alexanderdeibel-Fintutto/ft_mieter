import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';

const INDICES = [
  { id: 1, name: 'Repairs Index', entities: 2840, indexed: '99.8%', lastSync: '2026-01-24 15:30', status: 'healthy', size: '250 MB' },
  { id: 2, name: 'Documents Index', entities: 5120, indexed: '98.5%', lastSync: '2026-01-24 15:25', status: 'healthy', size: '480 MB' },
  { id: 3, name: 'Community Posts', entities: 1240, indexed: '96.2%', lastSync: '2026-01-24 14:50', status: 'indexing', size: '180 MB' },
];

const QUERIES = [
  { id: 1, query: 'Reparatur + Status:offen', hits: 245, avgTime: '42ms', popularity: 'high' },
  { id: 2, query: 'Dokument + Typ:Mietvertrag', hits: 128, avgTime: '38ms', popularity: 'medium' },
  { id: 3, query: 'Community + Tag:Parkplatz', hits: 67, avgTime: '52ms', popularity: 'low' },
];

export default function AdminAdvancedSearch() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Search className="w-6 h-6" /> Advanced Search & Indexing
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4" /> Index erstellen
        </Button>
      </div>

      {showNew && (
        <Card className="border-teal-200 bg-teal-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Search Index
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Index Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Repair</option>
              <option>Document</option>
              <option>Community Post</option>
              <option>User</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked /> Auto-index neue Records
            </label>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-teal-600 hover:bg-teal-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Indices', value: '3', color: 'text-blue-600' },
          { label: 'Indexed Documents', value: '9.2K', color: 'text-green-600' },
          { label: 'Avg Query Time', value: '44ms', color: 'text-teal-600' },
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
          {INDICES.map(index => (
            <div key={index.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{index.name}</h3>
                <Badge className={index.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  {index.status === 'healthy' ? '✓ Healthy' : '◌ Indexing'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{index.entities.toLocaleString()} entities</span>
                <span>{index.indexed} indexed</span>
                <span>{index.size}</span>
                <span>Last sync: {index.lastSync}</span>
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
          <CardTitle>Popular Queries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {QUERIES.map(q => (
            <div key={q.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="font-mono text-xs text-gray-700">{q.query}</p>
                <Badge variant="outline" className={`text-xs ${
                  q.popularity === 'high' ? 'bg-red-100' : q.popularity === 'medium' ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  {q.popularity}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{q.hits} results</span>
                <span>{q.avgTime} avg</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}