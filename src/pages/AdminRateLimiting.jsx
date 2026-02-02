import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus } from 'lucide-react';

const POLICIES = [
  { id: 1, name: 'Standard API', limit: '1000 req/min', clients: 245, violations: 12, status: 'active' },
  { id: 2, name: 'Premium API', limit: '5000 req/min', clients: 85, violations: 2, status: 'active' },
  { id: 3, name: 'Internal API', limit: 'Unlimited', clients: 8, violations: 0, status: 'active' },
];

const RATE_LIMITS = [
  { endpoint: '/api/repairs', limit: '100 req/min', window: '1 min', burst: 20 },
  { endpoint: '/api/documents', limit: '50 req/min', window: '1 min', burst: 10 },
  { endpoint: '/api/search', limit: '30 req/min', window: '1 min', burst: 5 },
];

export default function AdminRateLimiting() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-6 h-6" /> Rate Limiting & Throttling
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4" /> Policy erstellen
        </Button>
      </div>

      {showNew && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Rate Limit Policy
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Policy Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input type="text" placeholder="Limit (e.g., 1000 req/min)" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>1 minute</option>
              <option>5 minutes</option>
              <option>1 hour</option>
              <option>1 day</option>
            </select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-orange-600 hover:bg-orange-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Policies', value: '3', color: 'text-blue-600' },
          { label: 'Violations', value: '14', color: 'text-red-600' },
          { label: 'Blocked Requests', value: '342', color: 'text-orange-600' },
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
          <CardTitle>Rate Limit Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {POLICIES.map(policy => (
            <div key={policy.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{policy.name}</h3>
                <Badge className="bg-green-100 text-green-800">✓ {policy.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">{policy.limit}</span>
                <span>{policy.clients} clients</span>
                <span className={policy.violations > 0 ? 'text-red-600 font-bold' : ''}>{policy.violations} violations</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Edit</Button>
                <Button size="sm" variant="outline" className="text-xs">Monitor</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endpoint Rate Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {RATE_LIMITS.map((rl, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <p className="font-mono text-sm text-gray-700">{rl.endpoint}</p>
                <Badge variant="outline" className="text-xs">{rl.window}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Limit: <strong>{rl.limit}</strong></span>
                <span>Burst: <strong>{rl.burst}</strong></span>
                <Button size="sm" variant="outline" className="text-xs">Edit</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}