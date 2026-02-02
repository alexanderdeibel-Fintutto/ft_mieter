import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const RESOURCES = [
  { name: 'Compute Instances', current: 24, capacity: 32, utilization: '75%', threshold: '80%', status: 'ok' },
  { name: 'Memory (GB)', current: 480, capacity: 512, utilization: '93.8%', threshold: '85%', status: 'warning' },
  { name: 'Storage (TB)', current: 8.4, capacity: 10, utilization: '84%', threshold: '85%', status: 'warning' },
  { name: 'Database Connections', current: 850, capacity: 1000, utilization: '85%', threshold: '90%', status: 'ok' },
];

const PROJECTIONS = [
  { month: 'Feb 2026', cpu: 78, memory: 96, storage: 87, action: 'Monitor' },
  { month: 'Mar 2026', cpu: 82, memory: 98, storage: 90, action: 'Plan Scaling' },
  { month: 'Apr 2026', cpu: 88, memory: 101, storage: 95, action: 'Scale Up' },
];

const RECOMMENDATIONS = [
  { id: 1, title: 'Add 2 compute instances', priority: 'Medium', estimatedCost: '+€840/mo', timeline: '2 weeks' },
  { id: 2, title: 'Upgrade memory to 512GB', priority: 'High', estimatedCost: '+€1200/mo', timeline: 'Immediate' },
  { id: 3, title: 'Migrate to larger storage tier', priority: 'Medium', estimatedCost: '+€320/mo', timeline: '3 weeks' },
];

export default function AdminCapacityManagement() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <AlertTriangle className="w-6 h-6" /> Capacity Management & Planning
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Avg Utilization', value: '84.5%', color: 'text-orange-600' },
          { label: 'Resources at Risk', value: '2', color: 'text-red-600' },
          { label: 'Runway', value: '6-8 weeks', color: 'text-blue-600' },
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
          <CardTitle>Resource Utilization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {RESOURCES.map((res, idx) => (
            <div key={idx} className={`p-3 rounded-lg ${res.status === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{res.name}</h3>
                <Badge className={res.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                  {res.status === 'warning' ? '⚠ Warning' : '✓ OK'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{res.current}/{res.capacity}</span>
                <span>Threshold: {res.threshold}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    parseFloat(res.utilization) >= parseFloat(res.threshold) ? 'bg-red-500' : 'bg-orange-500'
                  }`}
                  style={{ width: res.utilization }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6-Month Forecast</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {PROJECTIONS.map((proj, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{proj.month}</h3>
                <Badge variant="outline">{proj.action}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-gray-600">CPU</p>
                  <p className="font-bold text-gray-900">{proj.cpu}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Memory</p>
                  <p className="font-bold text-gray-900">{proj.memory}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Storage</p>
                  <p className="font-bold text-gray-900">{proj.storage}%</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scaling Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {RECOMMENDATIONS.map(rec => (
            <div key={rec.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{rec.title}</h3>
                <Badge className={rec.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                  {rec.priority}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{rec.estimatedCost}</span>
                <span>Timeline: {rec.timeline}</span>
              </div>
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-xs">Approve & Schedule</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}