import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HardDrive, Plus } from 'lucide-react';

const BACKUPS = [
  { id: 1, name: 'Daily Backup', frequency: 'Daily', lastRun: '2026-01-24 02:00', size: '125 GB', status: 'success', retention: '30 days' },
  { id: 2, name: 'Weekly Full', frequency: 'Weekly', lastRun: '2026-01-21 03:00', size: '189 GB', status: 'success', retention: '90 days' },
  { id: 3, name: 'Monthly Archive', frequency: 'Monthly', lastRun: '2026-01-01 04:00', size: '245 GB', status: 'success', retention: '1 year' },
];

const RECOVERY_POINTS = [
  { date: '2026-01-24', time: '02:00', databases: 42, size: '125 GB', rto: '30m', rpo: '1h' },
  { date: '2026-01-21', time: '03:00', databases: 42, size: '189 GB', rto: '45m', rpo: '24h' },
  { date: '2026-01-01', time: '04:00', databases: 42, size: '245 GB', rto: '1h', rpo: '30d' },
];

export default function AdminBackupRecovery() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HardDrive className="w-6 h-6" /> Backup & Disaster Recovery
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Backup starten
        </Button>
      </div>

      {showNew && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Backup erstellen
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Full Backup</option>
              <option>Incremental</option>
              <option>Differential</option>
            </select>
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Local Storage</option>
              <option>Cloud Storage</option>
              <option>Both</option>
            </select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Starten</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Backups', value: '3', color: 'text-blue-600' },
          { label: 'Total Size', value: '559 GB', color: 'text-green-600' },
          { label: 'Last Backup', value: '22h ago', color: 'text-violet-600' },
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
          <CardTitle>Backup Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {BACKUPS.map(backup => (
            <div key={backup.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{backup.name}</h3>
                <Badge className="bg-green-100 text-green-800">✓ {backup.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{backup.frequency} • {backup.lastRun}</span>
                <span>{backup.size}</span>
                <span>Retained: {backup.retention}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Edit</Button>
                <Button size="sm" variant="outline" className="text-xs">Download</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recovery Points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {RECOVERY_POINTS.map((point, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{point.date} {point.time}</h3>
                <Badge variant="outline" className="text-xs">{point.size}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{point.databases} databases</span>
                <span>RTO: {point.rto} | RPO: {point.rpo}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Restore</Button>
                <Button size="sm" variant="outline" className="text-xs">Details</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disaster Recovery Plan (DRP)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { metric: 'RTO (Recovery Time Objective)', value: '30 minutes' },
            { metric: 'RPO (Recovery Point Objective)', value: '1 hour' },
            { metric: 'Backup Storage Location', value: 'Multi-region AWS' },
            { metric: 'Last DR Test', value: '2026-01-15' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <p className="font-medium text-gray-900">{item.metric}</p>
              <Badge variant="outline" className="text-xs">{item.value}</Badge>
            </div>
          ))}
          <Button className="w-full mt-2 bg-violet-600 hover:bg-violet-700">DR Test starten</Button>
        </CardContent>
      </Card>
    </div>
  );
}