import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Radio, Plus } from 'lucide-react';

const POLICIES = [
  { id: 1, name: 'Premium Users', priority: 'high', limit: '10K req/min', throttle: '0%', status: 'active' },
  { id: 2, name: 'Standard Users', priority: 'medium', limit: '1K req/min', throttle: '0%', status: 'active' },
  { id: 3, name: 'Free Users', priority: 'low', limit: '100 req/min', throttle: '5%', status: 'active' },
];

const CURRENT_TRAFFIC = [
  { endpoint: 'POST /api/repairs', rps: 234, limit: 500, status: 'normal' },
  { endpoint: 'GET /api/documents', rps: 892, limit: 1000, status: 'normal' },
  { endpoint: 'POST /api/payments', rps: 45, limit: 100, status: 'normal' },
];

export default function AdminTrafficShaping() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Radio className="w-6 h-6" /> Traffic Shaping & Rate Limiting
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Neue Policy
        </Button>
      </div>

      {showNew && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Rate Limiting Policy
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Policy Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>High (Premium)</option>
              <option>Medium (Standard)</option>
              <option>Low (Free)</option>
            </select>
            <input type="text" placeholder="Limit (e.g., 1000 req/min)" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Policies', value: '3', color: 'text-blue-600' },
          { label: 'Throttled', value: '2.4%', color: 'text-orange-600' },
          { label: 'Blocked', value: '0.1%', color: 'text-red-600' },
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
          <CardTitle>Rate Limiting Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {POLICIES.map(policy => (
            <div key={policy.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{policy.name}</h3>
                <Badge className="bg-green-100 text-green-800">✓ {policy.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Priority: {policy.priority}</span>
                <span>Limit: {policy.limit}</span>
                <span>Throttle: {policy.throttle}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Edit</Button>
                <Button size="sm" variant="outline" className="text-xs">Analytics</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Traffic (Live)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {CURRENT_TRAFFIC.map((traffic, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <code className="text-xs font-mono text-gray-900">{traffic.endpoint}</code>
                <Badge variant="outline" className="text-xs">{traffic.rps} req/s</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${(traffic.rps / traffic.limit) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-600">Capacity: {Math.round((traffic.rps / traffic.limit) * 100)}%</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}