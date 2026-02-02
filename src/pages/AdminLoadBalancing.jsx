import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Server } from 'lucide-react';

const SERVERS = [
  { id: 1, name: 'Server-01', region: 'us-east-1', cpu: 65, memory: 72, requests: 2450 },
  { id: 2, name: 'Server-02', region: 'us-east-1', cpu: 58, memory: 68, requests: 2180 },
  { id: 3, name: 'Server-03', region: 'eu-west-1', cpu: 42, memory: 55, requests: 1890 },
  { id: 4, name: 'Server-04', region: 'ap-south-1', cpu: 71, memory: 78, requests: 2670 },
];

export default function AdminLoadBalancing() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Zap className="w-6 h-6" /> Load Balancing
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Servers', value: '4', status: 'healthy' },
          { label: 'Avg Load', value: '59%', status: 'normal' },
          { label: 'Total Throughput', value: '9.2K req/s', status: 'normal' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
              <Badge className="mt-2 text-xs bg-green-100 text-green-800">✓ {metric.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Server Instances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SERVERS.map(server => (
            <div key={server.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-violet-600" />
                  {server.name}
                </h3>
                <Badge variant="outline" className="text-xs">{server.region}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-xs">
                  <p className="text-gray-600">CPU</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div className="bg-violet-600 h-1.5 rounded-full" style={{ width: `${server.cpu}%` }} />
                  </div>
                  <p className="font-semibold text-gray-900 mt-1">{server.cpu}%</p>
                </div>
                <div className="text-xs">
                  <p className="text-gray-600">Memory</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${server.memory}%` }} />
                  </div>
                  <p className="font-semibold text-gray-900 mt-1">{server.memory}%</p>
                </div>
                <div className="text-xs">
                  <p className="text-gray-600">Requests</p>
                  <p className="font-semibold text-gray-900 mt-2">{server.requests}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Load Balancer Config</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { setting: 'Algorithm', value: 'Round Robin' },
            { setting: 'Health Check', value: 'Every 10s' },
            { setting: 'Sticky Sessions', value: 'Disabled' },
            { setting: 'Connection Pool', value: '1000' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <p className="font-medium text-gray-900">{item.setting}</p>
              <Badge variant="outline">{item.value}</Badge>
            </div>
          ))}
          <Button className="w-full bg-violet-600 hover:bg-violet-700">Update Configuration</Button>
        </CardContent>
      </Card>
    </div>
  );
}