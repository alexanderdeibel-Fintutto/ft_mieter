import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, FileText, AlertTriangle } from 'lucide-react';

const COMPLIANCE_ITEMS = [
  { id: 1, name: 'DSGVO Datenschutz', status: 'compliant', lastChecked: '2026-01-24', score: '98%' },
  { id: 2, name: 'Datenverschlüsselung', status: 'compliant', lastChecked: '2026-01-24', score: '100%' },
  { id: 3, name: 'Zugriffskontrolle', status: 'warning', lastChecked: '2026-01-22', score: '85%' },
  { id: 4, name: 'Audit Logging', status: 'compliant', lastChecked: '2026-01-20', score: '95%' },
];

const AUDIT_LOG = [
  { id: 1, action: 'User created', user: 'admin@example.com', timestamp: '2026-01-24 14:32' },
  { id: 2, action: 'API key rotated', user: 'admin@example.com', timestamp: '2026-01-24 13:15' },
  { id: 3, action: 'Security policy updated', user: 'admin@example.com', timestamp: '2026-01-23 10:00' },
];

export default function AdminComplianceAudit() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Shield className="w-6 h-6" /> Compliance & Audit
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Compliance Score', value: '94.5%', color: 'text-green-600' },
          { label: 'Open Issues', value: '1', color: 'text-orange-600' },
          { label: 'Last Audit', value: '2 hours ago', color: 'text-blue-600' },
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
          <CardTitle>Compliance Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {COMPLIANCE_ITEMS.map(item => (
            <div key={item.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <Badge className={item.status === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                  {item.status === 'compliant' ? '✓ Konform' : '⚠️ Warnung'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Geprüft: {item.lastChecked}</span>
                <span className="font-semibold text-gray-900">{item.score}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" /> Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {AUDIT_LOG.map(log => (
            <div key={log.id} className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{log.action}</p>
                  <p className="text-xs text-gray-600">{log.user}</p>
                </div>
                <p className="text-xs text-gray-500 whitespace-nowrap">{log.timestamp}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {['DSGVO Report', 'Security Audit', 'Data Privacy Review'].map((report, idx) => (
            <Button key={idx} variant="outline" className="w-full justify-between">
              <span>{report}</span>
              <span className="text-xs">Download</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}