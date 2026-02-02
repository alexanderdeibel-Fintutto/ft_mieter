import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Plus } from 'lucide-react';

const PROVIDERS = [
  { id: 1, name: 'Google OAuth', status: 'active', users: 245, configured: '2026-01-15', lastSync: '1m ago' },
  { id: 2, name: 'Microsoft Entra ID', status: 'active', users: 89, configured: '2025-12-01', lastSync: '3m ago' },
  { id: 3, name: 'SAML (Custom)', status: 'inactive', users: 0, configured: '2025-11-20', lastSync: 'never' },
];

const SESSIONS = [
  { id: 1, provider: 'Google', user: 'alice@example.de', loginTime: '2026-01-24 14:32', deviceOS: 'macOS' },
  { id: 2, provider: 'Microsoft', user: 'bob@company.de', loginTime: '2026-01-24 14:15', deviceOS: 'Windows' },
  { id: 3, provider: 'Google', user: 'carol@example.de', loginTime: '2026-01-24 13:45', deviceOS: 'iOS' },
];

export default function AdminSSO() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Lock className="w-6 h-6" /> OAuth & SSO Management
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Provider hinzufügen
        </Button>
      </div>

      {showNew && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              SSO Provider
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Google OAuth</option>
              <option>Microsoft Entra ID</option>
              <option>Okta</option>
              <option>Auth0</option>
              <option>Custom SAML</option>
            </select>
            <input type="text" placeholder="Client ID" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input type="password" placeholder="Client Secret" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Verbinden</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'SSO Users', value: '334', color: 'text-blue-600' },
          { label: 'Active Providers', value: '2', color: 'text-green-600' },
          { label: 'Sessions', value: '12.4K', color: 'text-violet-600' },
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
          <CardTitle>Configured Providers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {PROVIDERS.map(provider => (
            <div key={provider.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{provider.name}</h3>
                <Badge className={provider.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {provider.status === 'active' ? '✓ Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{provider.users} users</span>
                <span>Configured: {provider.configured}</span>
                <span>Synced: {provider.lastSync}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Settings</Button>
                <Button size="sm" variant="outline" className="text-xs">{provider.status === 'active' ? 'Disable' : 'Enable'}</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent SSO Sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SESSIONS.map(session => (
            <div key={session.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{session.user}</h3>
                <Badge variant="outline" className="text-xs">{session.provider}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{session.loginTime}</span>
                <span>{session.deviceOS}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}