import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus } from 'lucide-react';

const INCIDENTS = [
  { id: 1, title: 'API Latency Spike', severity: 'critical', status: 'investigating', created: '2026-01-24 14:32', duration: '28m' },
  { id: 2, title: 'Database Connection Timeout', severity: 'high', status: 'resolved', created: '2026-01-24 10:15', duration: '1h 45m' },
  { id: 3, title: 'Memory Leak in Cache', severity: 'medium', status: 'monitoring', created: '2026-01-23 18:00', duration: '20h 32m' },
];

const ON_CALL = [
  { engineer: 'Alice Schmidt', shift: 'Mon-Wed', phone: '+49 123 456789', status: 'available' },
  { engineer: 'Bob Müller', shift: 'Wed-Fri', phone: '+49 987 654321', status: 'on-call' },
  { engineer: 'Carol König', shift: 'Fri-Sun', phone: '+49 555 666777', status: 'available' },
];

export default function AdminIncidentManagement() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" /> Incident Management
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4" /> Incident erstellen
        </Button>
      </div>

      {showNew && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Incident melden
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Incident Title" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <textarea placeholder="Description" rows="3" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700">Melden</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Incidents', value: '1', color: 'text-red-600' },
          { label: 'Resolved (30d)', value: '8', color: 'text-green-600' },
          { label: 'Avg MTTR', value: '45m', color: 'text-blue-600' },
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
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {INCIDENTS.map(incident => (
            <div key={incident.id} className={`p-3 border rounded-lg ${
              incident.severity === 'critical' ? 'bg-red-50 border-red-200' : 
              incident.severity === 'high' ? 'bg-orange-50 border-orange-200' :
              'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{incident.title}</h3>
                <Badge className={
                  incident.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  incident.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }>
                  {incident.severity}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{incident.created}</span>
                <span>Duration: {incident.duration}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Details</Button>
                <Button size="sm" variant="outline" className="text-xs">{incident.status === 'investigating' ? 'Update' : 'Reopen'}</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>On-Call Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ON_CALL.map((person, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{person.engineer}</h3>
                <Badge className={person.status === 'on-call' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                  {person.status === 'on-call' ? '🔴 On-Call' : '✓ Available'}
                </Badge>
              </div>
              <div className="text-xs text-gray-600">
                <p>{person.shift} • {person.phone}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}