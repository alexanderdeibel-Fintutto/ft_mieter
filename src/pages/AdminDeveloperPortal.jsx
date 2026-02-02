import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Plus } from 'lucide-react';

const SDKS = [
  { id: 1, name: 'JavaScript SDK', version: '2.5.0', downloads: 15240, status: 'latest' },
  { id: 2, name: 'Python SDK', version: '1.8.3', downloads: 8920, status: 'latest' },
  { id: 3, name: 'Go SDK', version: '1.2.1', downloads: 3450, status: 'outdated' },
];

const DOCS = [
  { id: 1, title: 'Getting Started', views: 12450, lastUpdated: '2026-01-20' },
  { id: 2, title: 'API Reference', views: 8920, lastUpdated: '2026-01-18' },
  { id: 3, title: 'Webhooks', views: 5340, lastUpdated: '2026-01-15' },
];

export default function AdminDeveloperPortal() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Code className="w-6 h-6" /> Developer Portal
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Neue SDK
        </Button>
      </div>

      {showNew && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              SDK veröffentlichen
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="SDK Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input type="text" placeholder="Version (e.g., 1.0.0)" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>JavaScript</option>
              <option>Python</option>
              <option>Go</option>
              <option>Ruby</option>
            </select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Veröffentlichen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'SDK Downloads', value: '27.6K', color: 'text-blue-600' },
          { label: 'Doc Views', value: '26.7K', color: 'text-green-600' },
          { label: 'Active Developers', value: '456', color: 'text-violet-600' },
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
          <CardTitle>SDK Releases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SDKS.map(sdk => (
            <div key={sdk.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{sdk.name}</h3>
                <Badge className={sdk.status === 'latest' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {sdk.status === 'latest' ? '✓ Latest' : 'Update Available'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span className="font-mono">v{sdk.version}</span>
                <span>{sdk.downloads.toLocaleString()} downloads</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Docs</Button>
                <Button size="sm" variant="outline" className="text-xs">GitHub</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {DOCS.map(doc => (
            <div key={doc.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{doc.title}</h3>
                <span className="text-xs text-gray-600">{doc.views.toLocaleString()} views</span>
              </div>
              <p className="text-xs text-gray-600">Updated: {doc.lastUpdated}</p>
              <Button size="sm" variant="outline" className="w-full text-xs mt-2">Edit</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}