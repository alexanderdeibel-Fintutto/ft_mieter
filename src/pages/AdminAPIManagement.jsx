import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Plus, Trash2 } from 'lucide-react';

const API_KEYS = [
  { id: 1, name: 'Stripe Integration', created: '2026-01-10', lastUsed: '2026-01-24 14:32', status: 'active' },
  { id: 2, name: 'LetterXpress API', created: '2025-12-01', lastUsed: '2026-01-20 10:15', status: 'active' },
  { id: 3, name: 'Development Key', created: '2026-01-01', lastUsed: '2026-01-15 08:00', status: 'inactive' },
];

const WEBHOOKS = [
  { id: 1, url: 'https://app.example.com/webhooks/stripe', events: ['payment_success', 'payment_failed'], status: 'healthy', lastCall: '2 min ago' },
  { id: 2, url: 'https://app.example.com/webhooks/letterxpress', events: ['letter_delivered'], status: 'healthy', lastCall: '1 hour ago' },
];

export default function AdminAPIManagement() {
  const [showNewKey, setShowNewKey] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Key className="w-6 h-6" /> API Management
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            API Keys
            <Button size="sm" onClick={() => setShowNewKey(!showNewKey)} className="gap-2 bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4" /> Neue Key
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {showNewKey && (
            <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg mb-3">
              <input type="text" placeholder="Key Name" className="w-full px-2 py-1 text-sm border rounded mb-2" />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowNewKey(false)}>Cancel</Button>
                <Button size="sm" className="flex-1 bg-violet-600 hover:bg-violet-700">Create</Button>
              </div>
            </div>
          )}

          {API_KEYS.map(key => (
            <div key={key.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{key.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Erstellt: {key.created} • Zuletzt: {key.lastUsed}
                  </p>
                </div>
                <Badge className={key.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {key.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                </Badge>
              </div>
              <div className="flex gap-2 text-xs">
                <Button size="sm" variant="outline">Rotieren</Button>
                <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:text-red-700">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {WEBHOOKS.map(webhook => (
            <div key={webhook.id} className="p-3 border rounded-lg">
              <p className="font-mono text-sm text-gray-900 mb-2">{webhook.url}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {webhook.events.map(event => (
                  <Badge key={event} variant="outline" className="text-xs">
                    {event}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                  {webhook.lastCall}
                </span>
                <Button size="sm" variant="outline">Test</Button>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full gap-2">
            <Plus className="w-4 h-4" /> Webhook hinzufügen
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Requests', value: '45,234 / 100,000', percent: 45 },
              { name: 'Bandwidth', value: '2.4 GB / 10 GB', percent: 24 },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-900">{stat.name}</span>
                  <span className="text-gray-600">{stat.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-violet-600 h-2 rounded-full transition-all"
                    style={{ width: `${stat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}