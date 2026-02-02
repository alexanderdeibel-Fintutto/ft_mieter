import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle } from 'lucide-react';

const SECURITY_EVENTS = [
  { id: 1, type: 'Login Attempt Failed', severity: 'warning', count: 23, timestamp: '2026-01-24 14:32' },
  { id: 2, type: 'IP Blocked', severity: 'error', count: 5, timestamp: '2026-01-24 13:15' },
  { id: 3, type: 'Certificate Expiring', severity: 'critical', days: 14, timestamp: '2026-01-24 10:00' },
];

export default function AdminSecurity() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Shield className="w-6 h-6" /> Security & Authentication
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Failed Logins (24h)', value: '23', severity: 'warning' },
          { label: 'Active Sessions', value: '145', severity: 'normal' },
          { label: 'SSL Certificate', value: '14 days', severity: 'critical' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className={`text-2xl font-bold mt-2 ${
                metric.severity === 'critical' ? 'text-red-600' :
                metric.severity === 'warning' ? 'text-orange-600' :
                'text-green-600'
              }`}>
                {metric.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Security Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SECURITY_EVENTS.map(event => (
            <div key={event.id} className={`p-3 rounded-lg border ${
              event.severity === 'critical' ? 'bg-red-50 border-red-200' :
              event.severity === 'error' ? 'bg-orange-50 border-orange-200' :
              'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{event.type}</p>
                  <p className="text-xs text-gray-600 mt-1">{event.timestamp}</p>
                </div>
                <Badge className={
                  event.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  event.severity === 'error' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }>
                  {event.count} {event.days ? `in ${event.days}d` : 'events'}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { setting: 'Two-Factor Authentication', status: 'enabled' },
            { setting: 'Session Timeout', status: '30 minutes' },
            { setting: 'Password Policy', status: 'Strong (12+ chars)' },
            { setting: 'IP Whitelist', status: 'Disabled' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <p className="font-medium text-gray-900">{item.setting}</p>
              <Badge variant="outline">{item.status}</Badge>
            </div>
          ))}
          <Button className="w-full bg-red-600 hover:bg-red-700">Update Security Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}