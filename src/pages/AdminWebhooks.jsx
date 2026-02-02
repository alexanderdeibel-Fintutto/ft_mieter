import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Webhook, Plus } from 'lucide-react';

const ENDPOINTS = [
  { id: 1, url: 'https://app.example.de/webhooks/repair', events: 3, active: true, failures: 0, lastFire: '2026-01-24 15:32' },
  { id: 2, url: 'https://app.example.de/webhooks/payment', events: 2, active: true, failures: 2, lastFire: '2026-01-24 14:15' },
  { id: 3, url: 'https://legacy.example.de/api', events: 1, active: false, failures: 45, lastFire: '2026-01-20 08:30' },
];

const EVENTS = [
  'repair.created', 'repair.updated', 'repair.closed',
  'payment.received', 'payment.failed',
  'document.uploaded', 'document.deleted',
  'user.registered', 'user.deleted'
];

const DELIVERIES = [
  { id: 1, event: 'repair.created', endpoint: 'https://app.example.de/webhooks/repair', status: 'success', timestamp: '2026-01-24 15:32', latency: '142ms' },
  { id: 2, event: 'payment.received', endpoint: 'https://app.example.de/webhooks/payment', status: 'failed', timestamp: '2026-01-24 14:15', latency: '5200ms' },
];

export default function AdminWebhooks() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Webhook className="w-6 h-6" /> Webhooks & Event Delivery
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Webhook hinzufügen
        </Button>
      </div>

      {showNew && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Webhook Endpoint
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Webhook URL" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <div className="space-y-2">
              <label className="text-sm font-medium">Events:</label>
              {EVENTS.map(event => (
                <label key={event} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" /> {event}
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Endpoints', value: '3', color: 'text-blue-600' },
          { label: 'Events', value: '9', color: 'text-green-600' },
          { label: 'Success Rate', value: '97.8%', color: 'text-indigo-600' },
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
          <CardTitle>Webhook Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ENDPOINTS.map(ep => (
            <div key={ep.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <p className="font-mono text-sm text-gray-700">{ep.url}</p>
                <Badge className={ep.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {ep.active ? '✓ Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{ep.events} events</span>
                <span className={ep.failures > 0 ? 'text-red-600 font-bold' : ''}>{ep.failures} failures</span>
                <span>Last: {ep.lastFire}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Test</Button>
                <Button size="sm" variant="outline" className="text-xs">Edit</Button>
                <Button size="sm" variant="outline" className="text-xs">Delete</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {DELIVERIES.map(delivery => (
            <div key={delivery.id} className={`p-3 rounded-lg ${delivery.status === 'success' ? 'bg-green-50 border-l-4 border-green-400' : 'bg-red-50 border-l-4 border-red-400'}`}>
              <div className="flex items-start justify-between mb-1">
                <p className="font-mono text-xs text-gray-700">{delivery.event}</p>
                <Badge className={delivery.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {delivery.status}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-1">{delivery.endpoint}</p>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{delivery.timestamp}</span>
                <span className="font-mono">{delivery.latency}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}