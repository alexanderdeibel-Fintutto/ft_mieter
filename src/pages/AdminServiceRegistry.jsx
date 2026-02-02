import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid3X3 } from 'lucide-react';

const SERVICES = [
  { id: 1, name: 'Auth Service', version: '1.2.3', status: 'running', instances: 3, health: 'healthy' },
  { id: 2, name: 'API Gateway', version: '2.1.0', status: 'running', instances: 5, health: 'healthy' },
  { id: 3, name: 'Notification Service', version: '1.0.5', status: 'running', instances: 2, health: 'degraded' },
  { id: 4, name: 'Analytics Service', version: '0.9.2', status: 'stopped', instances: 0, health: 'offline' },
];

const DEPENDENCIES = [
  { from: 'API Gateway', to: 'Auth Service', status: 'healthy' },
  { from: 'API Gateway', to: 'Database', status: 'healthy' },
  { from: 'Notification Service', to: 'Message Queue', status: 'healthy' },
];

export default function AdminServiceRegistry() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Grid3X3 className="w-6 h-6" /> Service Registry & Discovery
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          Service starten
        </Button>
      </div>

      {showNew && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Service starten
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Analytics Service</option>
              <option>Search Service</option>
              <option>Cache Service</option>
            </select>
            <input type="text" placeholder="Version" className="w-full px-3 py-2 border rounded-lg text-sm" defaultValue="latest" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Starten</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Services', value: '4', color: 'text-blue-600' },
          { label: 'Running', value: '3', color: 'text-green-600' },
          { label: 'Total Instances', value: '10', color: 'text-violet-600' },
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
          <CardTitle>Registered Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SERVICES.map(svc => (
            <div key={svc.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{svc.name}</h3>
                <Badge className={
                  svc.status === 'running' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }>
                  {svc.status === 'running' ? '✓ Running' : 'Stopped'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span className="font-mono">v{svc.version}</span>
                <span>{svc.instances} instances</span>
                <Badge variant="outline" className={svc.health === 'healthy' ? 'text-green-700' : 'text-yellow-700'}>
                  {svc.health}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  {svc.status === 'running' ? 'Stop' : 'Start'}
                </Button>
                <Button size="sm" variant="outline" className="text-xs">Logs</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Dependencies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {DEPENDENCIES.map((dep, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-900">{dep.from}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium text-gray-900">{dep.to}</span>
                </div>
                <Badge className="bg-green-100 text-green-800 text-xs">✓ {dep.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}