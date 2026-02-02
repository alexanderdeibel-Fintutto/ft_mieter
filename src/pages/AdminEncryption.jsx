import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Plus } from 'lucide-react';

const SECRETS = [
  { id: 1, name: 'STRIPE_API_KEY', created: '2026-01-15', updated: '2026-01-20', status: 'active', rotated: '30 days ago' },
  { id: 2, name: 'DATABASE_PASSWORD', created: '2026-01-01', updated: '2026-01-10', status: 'active', rotated: '14 days ago' },
  { id: 3, name: 'LETTERXPRESS_KEY', created: '2025-12-20', updated: '2026-01-15', status: 'active', rotated: '9 days ago' },
];

export default function AdminEncryption() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Lock className="w-6 h-6" /> Encryption & Secrets
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Neuer Secret
        </Button>
      </div>

      {showNew && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Secret hinzufügen
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Secret Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <textarea placeholder="Secret Value" rows="3" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Speichern</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Secrets', value: '3', color: 'text-green-600' },
          { label: 'Encryption', value: 'AES-256', color: 'text-blue-600' },
          { label: 'Last Rotation', value: '9 days ago', color: 'text-violet-600' },
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
          <CardTitle>Secrets Vault</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SECRETS.map(secret => (
            <div key={secret.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <code className="text-sm font-mono text-gray-900">{secret.name}</code>
                <Badge className="bg-green-100 text-green-800">✓ {secret.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Created: {secret.created}</span>
                <span>Updated: {secret.updated}</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">Last rotated: {secret.rotated}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Rotate</Button>
                <Button size="sm" variant="outline" className="text-xs">View</Button>
                <Button size="sm" variant="outline" className="text-xs">Delete</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Encryption Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { setting: 'Algorithm', value: 'AES-256-GCM' },
            { setting: 'Key Rotation', value: '90 days' },
            { setting: 'TLS Version', value: '1.3' },
            { setting: 'Certificate Expiry', value: '2026-06-15' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <p className="font-medium text-gray-900">{item.setting}</p>
              <Badge variant="outline" className="text-xs">{item.value}</Badge>
            </div>
          ))}
          <Button className="w-full bg-violet-600 hover:bg-violet-700">Update Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}