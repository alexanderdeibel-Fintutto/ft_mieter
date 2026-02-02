import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Server } from 'lucide-react';

const SERVICES = [
  { name: 'Repair Service', status: 'healthy', instances: 3, cpu: 45, memory: 62, uptime: '99.98%' },
  { name: 'Document Service', status: 'healthy', instances: 2, cpu: 38, memory: 55, uptime: '99.95%' },
  { name: 'Chat Service', status: 'degraded', instances: 2, cpu: 78, memory: 84, uptime: '98.50%' },
  { name: 'Payment Service', status: 'healthy', instances: 1, cpu: 25, memory: 42, uptime: '100%' },
  { name: 'Notification Service', status: 'unhealthy', instances: 1, cpu: 95, memory: 92, uptime: '87.30%' },
];

export default function AdminServices() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Server className="w-6 h-6" /> Microservices Status
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Healthy Services', value: '3', color: 'text-green-600' },
          { label: 'Degraded', value: '1', color: 'text-yellow-600' },
          { label: 'Unhealthy', value: '1', color: 'text-red-600' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className={`text-2xl font-bold mt-2 ${metric.color}`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        {SERVICES.map(service => (
          <Card key={service.name} className="hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-medium text-gray-900">{service.name}</h3>
                <Badge className={
                  service.status === 'healthy' ? 'bg-green-100 text-green-800' :
                  service.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }>
                  {service.status === 'healthy' && '✓ Healthy'}
                  {service.status === 'degraded' && '⚠️ Degraded'}
                  {service.status === 'unhealthy' && '✗ Unhealthy'}
                </Badge>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-3">
                <div className="text-center">
                  <p className="text-xs text-gray-600">Instances</p>
                  <p className="font-bold text-gray-900">{service.instances}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">CPU</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div className="bg-violet-600 h-1.5 rounded-full" style={{ width: `${service.cpu}%` }} />
                  </div>
                  <p className="text-xs font-semibold text-gray-900">{service.cpu}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Memory</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${service.memory}%` }} />
                  </div>
                  <p className="text-xs font-semibold text-gray-900">{service.memory}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Uptime</p>
                  <p className="font-bold text-green-600 text-xs">{service.uptime}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="outline" className="text-xs h-7">Logs</Button>
                  <Button size="sm" variant="outline" className="text-xs h-7">Restart</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Dependencies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { service: 'Chat Service', depends: 'Notification Service', status: 'blocked' },
            { service: 'Repair Service', depends: 'Document Service', status: 'healthy' },
            { service: 'Payment Service', depends: 'Stripe API', status: 'healthy' },
          ].map((dep, idx) => (
            <div key={idx} className="p-2 bg-gray-50 rounded-lg flex items-center gap-2 text-xs">
              <code className="text-gray-900 font-mono">{dep.service}</code>
              <span className="text-gray-600">→</span>
              <code className="text-gray-900 font-mono">{dep.depends}</code>
              <Badge className={dep.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} variant="outline">
                {dep.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}