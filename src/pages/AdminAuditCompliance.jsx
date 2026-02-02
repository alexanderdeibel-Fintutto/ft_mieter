import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Plus } from 'lucide-react';

const LOGS = [
  { id: 1, action: 'User created', entity: 'User', user: 'admin@example.de', timestamp: '2026-01-24 15:30', status: 'success', changes: 8 },
  { id: 2, action: 'Repair updated', entity: 'Repair', user: 'technician@example.de', timestamp: '2026-01-24 15:15', status: 'success', changes: 3 },
  { id: 3, action: 'Payment processed', entity: 'Payment', user: 'system', timestamp: '2026-01-24 14:45', status: 'success', changes: 5 },
];

const POLICIES = [
  { id: 1, name: 'GDPR Compliance', status: 'active', lastCheck: '2026-01-24 10:00', score: 98 },
  { id: 2, name: 'Data Retention', status: 'active', lastCheck: '2026-01-23 18:30', score: 95 },
  { id: 3, name: 'Access Control', status: 'active', lastCheck: '2026-01-24 12:15', score: 99 },
];

export default function AdminAuditCompliance() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileCheck className="w-6 h-6" /> Audit Logs & Compliance
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Report erstellen
        </Button>
      </div>

      {showNew && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Compliance Report
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Report Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>GDPR</option>
              <option>HIPAA</option>
              <option>SOC 2</option>
              <option>Custom</option>
            </select>
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Logs', value: '12.4K', color: 'text-blue-600' },
          { label: 'Compliance Score', value: '97.3%', color: 'text-green-600' },
          { label: 'Issues', value: '2', color: 'text-orange-600' },
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
          <CardTitle>Recent Audit Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {LOGS.map(log => (
            <div key={log.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{log.action}</h3>
                <Badge className="bg-green-100 text-green-800">✓ {log.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{log.entity}</span>
                <span>{log.user}</span>
                <span>{log.timestamp}</span>
                <span>{log.changes} changes</span>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs">View Details</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {POLICIES.map(policy => (
            <div key={policy.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{policy.name}</h3>
                <Badge className={policy.score >= 95 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {policy.score}%
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Status: {policy.status}</span>
                <span>Last check: {policy.lastCheck}</span>
                <Button size="sm" variant="outline" className="text-xs">View Report</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}