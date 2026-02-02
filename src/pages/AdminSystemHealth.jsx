import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';

const SERVICES = [
  { name: 'API Server', status: 'healthy', uptime: '99.98%', responseTime: '45ms', lastCheck: '1m ago' },
  { name: 'Database', status: 'healthy', uptime: '100%', responseTime: '8ms', lastCheck: '1m ago' },
  { name: 'Cache Server', status: 'healthy', uptime: '99.95%', responseTime: '2ms', lastCheck: '1m ago' },
  { name: 'Message Queue', status: 'degraded', uptime: '98.5%', responseTime: '125ms', lastCheck: '30s ago' },
];

const SYSTEM_METRICS = [
  { label: 'CPU Usage', value: '34%', status: 'normal' },
  { label: 'Memory Usage', value: '62%', status: 'normal' },
  { label: 'Disk Space', value: '71%', status: 'warning' },
  { label: 'Network', value: '24 Mbps', status: 'normal' },
];

export default function AdminSystemHealth() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Activity className="w-6 h-6" /> System Health
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {SYSTEM_METRICS.map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
              <Badge className={`mt-2 text-xs ${
                metric.status === 'normal' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {metric.status === 'normal' ? '✓ Normal' : '⚠️ Warning'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SERVICES.map((service, idx) => (
            <div key={idx} className={`p-3 border rounded-lg ${
              service.status === 'healthy' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{service.name}</h3>
                <Badge className={service.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {service.status === 'healthy' ? '✓ Healthy' : '⚠️ Degraded'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Uptime: {service.uptime}</span>
                <span>Response: {service.responseTime}</span>
                <span>{service.lastCheck}</span>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs">Details</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Alerts (24h)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { alert: 'Disk space warning', time: '3h ago', severity: 'warning' },
              { alert: 'Queue latency spike', time: '1h ago', severity: 'info' },
            ].map((item, idx) => (
              <div key={idx} className="p-2 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">{item.alert}</p>
                <p className="text-xs text-gray-600 mt-1">{item.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full text-xs">Clear Cache</Button>
            <Button variant="outline" className="w-full text-xs">Restart Services</Button>
            <Button variant="outline" className="w-full text-xs">Run Diagnostics</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}