import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HardDrive, Plus } from 'lucide-react';

const QUOTAS = [
  { id: 1, name: 'API Calls', limit: '1,000,000/month', usage: '847,392', percent: 85, status: 'warning' },
  { id: 2, name: 'Storage', limit: '1 TB', usage: '620 GB', percent: 62, status: 'normal' },
  { id: 3, name: 'Bandwidth', limit: '500 GB/month', usage: '312 GB', percent: 62, status: 'normal' },
  { id: 4, name: 'Concurrent Users', limit: '5,000', usage: '2,840', percent: 57, status: 'normal' },
];

export default function AdminResourceQuotas() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HardDrive className="w-6 h-6" /> Resource Quotas
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Quota Anpassen
        </Button>
      </div>

      {showNew && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Quota bearbeiten
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>API Calls</option>
              <option>Storage</option>
              <option>Bandwidth</option>
              <option>Concurrent Users</option>
            </select>
            <input type="text" placeholder="New Limit" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>hard_limit</option>
              <option>soft_limit</option>
            </select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Speichern</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quota Usage Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {QUOTAS.map(quota => (
            <div key={quota.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{quota.name}</h3>
                <Badge className={quota.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                  {quota.percent}%
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    quota.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${quota.percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{quota.usage} / {quota.limit}</span>
                <Button size="sm" variant="outline" className="text-xs">Edit</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { quota: 'API Calls', threshold: '85%', action: 'warning' },
            { quota: 'Storage', threshold: '90%', action: 'alert' },
          ].map((item, idx) => (
            <div key={idx} className={`p-3 rounded-lg border ${
              item.action === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{item.quota} → {item.threshold}</p>
                <Button size="sm" variant="outline" className="text-xs">Edit Alert</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}