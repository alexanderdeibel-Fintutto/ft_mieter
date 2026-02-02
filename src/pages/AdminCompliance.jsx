import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus } from 'lucide-react';

const POLICIES = [
  { id: 1, name: 'GDPR Data Processing', status: 'compliant', lastCheck: '2026-01-24', nextCheck: '2026-02-24' },
  { id: 2, name: 'Data Retention Policy', status: 'compliant', lastCheck: '2026-01-20', nextCheck: '2026-02-20' },
  { id: 3, name: 'Security Audit', status: 'warning', lastCheck: '2026-01-15', nextCheck: '2026-01-30' },
];

const AUDIT_LOG = [
  { id: 1, action: 'Data export', user: 'admin@team.de', timestamp: '2026-01-24 14:32', status: 'success' },
  { id: 2, action: 'User deletion', user: 'admin@team.de', timestamp: '2026-01-24 12:15', status: 'success' },
  { id: 3, action: 'Config change', user: 'dev@team.de', timestamp: '2026-01-24 10:00', status: 'success' },
];

export default function AdminCompliance() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6" /> Compliance & Audit Logs
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Audit Export
        </Button>
      </div>

      {showNew && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Audit Export
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="date" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input type="date" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>CSV</option>
              <option>JSON</option>
              <option>PDF</option>
            </select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Exportieren</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Policies', value: '3', color: 'text-blue-600' },
          { label: 'Compliant', value: '2', color: 'text-green-600' },
          { label: 'Audit Entries', value: '1.2K', color: 'text-violet-600' },
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
          <CardTitle>Compliance Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {POLICIES.map(policy => (
            <div key={policy.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{policy.name}</h3>
                <Badge className={policy.status === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {policy.status === 'compliant' ? '✓ Compliant' : '⚠️ Warning'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Checked: {policy.lastCheck}</span>
                <span>Next: {policy.nextCheck}</span>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs">Review</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {AUDIT_LOG.map(entry => (
            <div key={entry.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 capitalize">{entry.action}</h3>
                <Badge className="bg-green-100 text-green-800 text-xs">✓ {entry.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{entry.user}</span>
                <span>{entry.timestamp}</span>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full text-xs">View All Logs</Button>
        </CardContent>
      </Card>
    </div>
  );
}