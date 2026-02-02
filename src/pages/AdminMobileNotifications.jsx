import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Plus } from 'lucide-react';

const DEVICES = [
  { id: 1, type: 'iOS', count: 4240, active: 3890, version: '17.2', updated: '2026-01-24' },
  { id: 2, type: 'Android', count: 3120, active: 2745, version: '14.0', updated: '2026-01-24' },
];

const CAMPAIGNS = [
  { id: 1, title: 'Repair Update', target: 'iOS + Android', sent: 7450, opened: 5240, clicked: 1820 },
  { id: 2, title: 'Document Shared', target: 'iOS', sent: 3890, opened: 2560, clicked: 640 },
  { id: 3, title: 'Payment Reminder', target: 'Android', sent: 3120, opened: 1850, clicked: 420 },
];

export default function AdminMobileNotifications() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Smartphone className="w-6 h-6" /> Mobile & Push Notifications
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Neue Kampagne
        </Button>
      </div>

      {showNew && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Push Notification Kampagne
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Campaign Title" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <textarea placeholder="Message" rows="2" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <div className="flex gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked /> iOS
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked /> Android
              </label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Versenden</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Devices', value: '7.36K', color: 'text-blue-600' },
          { label: 'Active', value: '6.64K', color: 'text-green-600' },
          { label: 'Avg Open Rate', value: '68.5%', color: 'text-violet-600' },
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
          <CardTitle>Device Registry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {DEVICES.map(device => (
            <div key={device.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{device.type}</h3>
                <Badge className="bg-blue-100 text-blue-800">{device.count.toLocaleString()} devices</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{device.active.toLocaleString()} active ({Math.round(device.active/device.count*100)}%)</span>
                <span>v{device.version}</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">Last synced: {device.updated}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Manage</Button>
                <Button size="sm" variant="outline" className="text-xs">Analytics</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {CAMPAIGNS.map(campaign => (
            <div key={campaign.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{campaign.title}</h3>
                <span className="text-xs text-gray-600">{campaign.sent} sent</span>
              </div>
              <p className="text-xs text-gray-600 mb-2">{campaign.target}</p>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <p className="text-gray-600">Opens</p>
                  <p className="font-bold text-gray-900">{Math.round(campaign.opened/campaign.sent*100)}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Clicks</p>
                  <p className="font-bold text-gray-900">{Math.round(campaign.clicked/campaign.sent*100)}%</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}