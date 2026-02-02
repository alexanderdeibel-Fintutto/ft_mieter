import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const SCALING_DATA = [
  { time: '00:00', instances: 4, load: 32 },
  { time: '06:00', instances: 4, load: 28 },
  { time: '12:00', instances: 6, load: 68 },
  { time: '18:00', instances: 8, load: 85 },
  { time: '24:00', instances: 6, load: 55 },
];

const POLICIES = [
  { name: 'CPU-Based', metric: 'CPU > 70%', action: 'Add Instance', status: 'active' },
  { name: 'Memory-Based', metric: 'Memory > 75%', action: 'Add Instance', status: 'active' },
  { name: 'Request-Based', metric: 'Requests > 5K/min', action: 'Add Instance', status: 'active' },
  { name: 'Time-Based', metric: 'Weekday 9-17h', action: 'Min 6 Instances', status: 'active' },
];

export default function AdminAutoScaling() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <TrendingUp className="w-6 h-6" /> Auto-Scaling
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Instances', value: '8', range: '4-10' },
          { label: 'Avg Load', value: '65%', target: '70%' },
          { label: 'Monthly Cost Saved', value: '€1,240', vs: 'manual' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
              <p className="text-xs text-gray-500 mt-1">{metric.range || metric.target || metric.vs}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scaling Activity (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={SCALING_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" label={{ value: 'Instances', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Load %', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="instances" stroke="#8B5CF6" name="Instances" />
              <Line yAxisId="right" type="monotone" dataKey="load" stroke="#06B6D4" name="Load" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scaling Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {POLICIES.map((policy, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{policy.name}</h3>
                <Badge className="bg-green-100 text-green-800">✓ {policy.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Condition: {policy.metric}</span>
                <span>Action: {policy.action}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scale Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { setting: 'Min Instances', value: '4', editable: true },
            { setting: 'Max Instances', value: '10', editable: true },
            { setting: 'Scale-Up Cooldown', value: '60 seconds', editable: true },
            { setting: 'Scale-Down Cooldown', value: '300 seconds', editable: true },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <p className="font-medium text-gray-900">{item.setting}</p>
              <input type="text" defaultValue={item.value} className="px-2 py-1 border rounded text-xs w-24" />
            </div>
          ))}
          <Button className="w-full bg-violet-600 hover:bg-violet-700">Save Configuration</Button>
        </CardContent>
      </Card>
    </div>
  );
}