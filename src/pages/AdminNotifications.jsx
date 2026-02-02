import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus } from 'lucide-react';

const CHANNELS = [
  { id: 1, name: 'Email', type: 'email', status: 'active', messages: 3240, failureRate: '0.8%' },
  { id: 2, name: 'SMS', type: 'sms', status: 'active', messages: 890, failureRate: '1.2%' },
  { id: 3, name: 'In-App', type: 'in-app', status: 'active', messages: 5620, failureRate: '0%' },
];

const QUEUED = [
  { id: 1, type: 'password_reset', recipient: 'user@example.de', status: 'pending', queued: '2h ago' },
  { id: 2, type: 'repair_update', recipient: 'repair@complex.de', status: 'pending', queued: '1h ago' },
];

export default function AdminNotifications() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6" /> Notification Management
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Test Notification
        </Button>
      </div>

      {showNew && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Test Notification versenden
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Email</option>
              <option>SMS</option>
              <option>In-App</option>
            </select>
            <input type="email" placeholder="Recipient" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <textarea placeholder="Message" rows="3" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Versenden</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Sent', value: '9.75K', color: 'text-blue-600' },
          { label: 'Success Rate', value: '99.3%', color: 'text-green-600' },
          { label: 'Queued', value: '2', color: 'text-orange-600' },
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
          <CardTitle>Notification Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {CHANNELS.map(channel => (
            <div key={channel.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{channel.name}</h3>
                <Badge className="bg-green-100 text-green-800">✓ {channel.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{channel.messages} messages sent</span>
                <span>{channel.failureRate} failure rate</span>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs">Settings</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Queued Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {QUEUED.map(notif => (
            <div key={notif.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 capitalize">{notif.type.replace('_', ' ')}</h3>
                <Badge variant="outline" className="text-xs">Pending</Badge>
              </div>
              <p className="text-xs text-gray-600 mb-2">{notif.recipient} • {notif.queued}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Send Now</Button>
                <Button size="sm" variant="outline" className="text-xs">Cancel</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}