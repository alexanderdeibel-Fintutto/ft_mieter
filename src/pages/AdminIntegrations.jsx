import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plug, AlertCircle, CheckCircle } from 'lucide-react';

const INTEGRATIONS = [
  { name: 'Stripe', status: 'connected', since: '2026-01-10', lastSync: '2 min ago', icon: '💳' },
  { name: 'LetterXpress', status: 'connected', since: '2025-12-01', lastSync: '1 hour ago', icon: '📬' },
  { name: 'Supabase', status: 'connected', since: '2025-11-15', lastSync: 'Real-time', icon: '🗄️' },
  { name: 'Slack', status: 'disconnected', since: null, lastSync: null, icon: '💬' },
];

export default function AdminIntegrations() {
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Plug className="w-6 h-6" /> Integrationen
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Verbundene Services', value: '3', color: 'text-green-600' },
          { label: 'Fehlerhafte Connections', value: '0', color: 'text-gray-600' },
          { label: 'Letzte Sync', value: '2 min ago', color: 'text-blue-600' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className={`text-2xl font-bold mt-2 ${metric.color}`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        {INTEGRATIONS.map(integration => (
          <Card key={integration.name} className="hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{integration.name}</h3>
                    {integration.status === 'connected' ? (
                      <p className="text-xs text-gray-500">
                        Verbunden seit {integration.since} • Sync: {integration.lastSync}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">Nicht verbunden</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={integration.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {integration.status === 'connected' ? '✓ Verbunden' : 'Getrennt'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedIntegration(integration.name)}
                  >
                    Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verfügbare Integrationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {['Google Drive', 'Google Calendar', 'Notion', 'HubSpot'].map(service => (
            <Button key={service} variant="outline" className="w-full justify-between">
              <span>{service}</span>
              <span className="text-xs">Verbinden</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}