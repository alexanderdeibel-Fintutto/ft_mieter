import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, HardDrive } from 'lucide-react';

const BACKUPS = [
  { id: 1, type: 'Full Database', size: '145 GB', timestamp: '2026-01-24 02:00', status: 'completed' },
  { id: 2, type: 'Incremental', size: '8.3 GB', timestamp: '2026-01-24 14:00', status: 'in_progress' },
  { id: 3, type: 'Application Data', size: '2.1 GB', timestamp: '2026-01-23 02:00', status: 'completed' },
];

export default function AdminDisasterRecovery() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Shield className="w-6 h-6" /> Disaster Recovery
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'RTO Target', value: '4 hours', icon: Clock },
          { label: 'RPO Target', value: '15 minutes', icon: HardDrive },
          { label: 'Total Backup Size', value: '155 GB', icon: Shield },
        ].map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-violet-600" />
                  <div>
                    <p className="text-sm text-gray-600">{metric.label}</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{metric.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {BACKUPS.map(backup => (
            <div key={backup.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{backup.type}</h3>
                <Badge className={backup.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                  {backup.status === 'in_progress' ? '⏳ In Progress' : '✓ Completed'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{backup.size}</span>
                <span>{backup.timestamp}</span>
              </div>
              {backup.status === 'in_progress' && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }} />
                </div>
              )}
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">Restore</Button>
                <Button size="sm" variant="outline">Delete</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recovery Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { setting: 'Backup Frequency', value: 'Every 6 hours' },
            { setting: 'Retention Period', value: '90 days' },
            { setting: 'Geographic Replication', value: '2 regions' },
            { setting: 'Last Test', value: '2026-01-20' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <p className="font-medium text-gray-900">{item.setting}</p>
              <p className="text-sm text-gray-600">{item.value}</p>
            </div>
          ))}
          <Button className="w-full bg-violet-600 hover:bg-violet-700">Test Recovery Plan</Button>
        </CardContent>
      </Card>
    </div>
  );
}