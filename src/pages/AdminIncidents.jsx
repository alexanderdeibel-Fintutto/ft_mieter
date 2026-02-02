import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingDown } from 'lucide-react';

const INCIDENTS = [
  { id: 1, title: 'Hohe Fehlerquote', severity: 'critical', status: 'open', started: '2026-01-24 08:30', impact: '245 Benutzer' },
  { id: 2, title: 'Datenbank-Latenz', severity: 'high', status: 'investigating', started: '2026-01-24 10:15', impact: '1.2K Benutzer' },
  { id: 3, title: 'API-Timeout', severity: 'medium', status: 'resolved', started: '2026-01-23 14:20', impact: 'Behoben' },
  { id: 4, title: 'Speicherplatz niedrig', severity: 'medium', status: 'open', started: '2026-01-22 09:00', impact: 'Überwacht' },
];

export default function AdminIncidents() {
  const [filter, setFilter] = useState('all');

  const filteredIncidents = INCIDENTS.filter(incident =>
    filter === 'all' || incident.status === filter
  );

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <AlertCircle className="w-6 h-6" /> Vorfälle & Störungen
      </h1>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Kritisch', count: INCIDENTS.filter(i => i.severity === 'critical').length, color: 'bg-red-100 text-red-800' },
          { label: 'Hoch', count: INCIDENTS.filter(i => i.severity === 'high').length, color: 'bg-orange-100 text-orange-800' },
          { label: 'Mittel', count: INCIDENTS.filter(i => i.severity === 'medium').length, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Behoben', count: INCIDENTS.filter(i => i.status === 'resolved').length, color: 'bg-green-100 text-green-800' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
              <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        {['all', 'open', 'investigating', 'resolved'].map(status => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status)}
            className={filter === status ? 'bg-violet-600' : ''}
          >
            {status === 'all' ? 'Alle' : status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredIncidents.map(incident => (
          <Card key={incident.id} className="hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{incident.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge className={`${
                      incident.severity === 'critical' ? 'bg-red-600' :
                      incident.severity === 'high' ? 'bg-orange-600' :
                      'bg-yellow-600'
                    }`}>
                      {incident.severity}
                    </Badge>
                    <Badge variant="outline">{incident.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Auswirkung: <span className="font-medium">{incident.impact}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Gestartet: {incident.started}</p>
                </div>
                <Button size="sm" variant="outline">
                  Ansehen
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}