import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, Bell } from 'lucide-react';

const MONITORING_DATA = [
  { time: '00:00', cpu: 32, memory: 45, disk: 28, network: 120 },
  { time: '04:00', cpu: 28, memory: 42, disk: 28, network: 95 },
  { time: '08:00', cpu: 52, memory: 65, disk: 35, network: 280 },
  { time: '12:00', cpu: 68, memory: 72, disk: 42, network: 450 },
  { time: '16:00', cpu: 74, memory: 78, disk: 48, network: 520 },
  { time: '20:00', cpu: 55, memory: 68, disk: 45, network: 380 },
];

const ALERTS = [
  { id: 1, type: 'High CPU Usage', severity: 'critical', value: '92%', threshold: '80%', triggered: '2 min ago' },
  { id: 2, type: 'Disk Space Low', severity: 'warning', value: '87%', threshold: '85%', triggered: '45 min ago' },
  { id: 3, type: 'Memory Usage', severity: 'warning', value: '81%', threshold: '80%', triggered: '1 hour ago' },
];

export default function AdminMonitoring() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Bell className="w-6 h-6" /> Monitoring & Alerts
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'CPU Usage', value: '74%', status: 'high' },
          { label: 'Memory', value: '78%', status: 'high' },
          { label: 'Disk', value: '48%', status: 'normal' },
          { label: 'Network', value: '380 Mbps', status: 'normal' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className={`text-2xl font-bold mt-2 ${
                metric.status === 'high' ? 'text-red-600' : 'text-green-600'
              }`}>
                {metric.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Resource Usage (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={MONITORING_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="cpu" fill="#8B5CF6" stroke="#8B5CF6" name="CPU %" opacity={0.6} />
              <Area type="monotone" dataKey="memory" fill="#06B6D4" stroke="#06B6D4" name="Memory %" opacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" /> Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ALERTS.map(alert => (
            <div key={alert.id} className={`p-3 rounded-lg border ${
              alert.severity === 'critical' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{alert.type}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Current: <strong>{alert.value}</strong> | Threshold: {alert.threshold}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{alert.triggered}</p>
                </div>
                <Badge className={alert.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                  {alert.severity}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alert Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { metric: 'CPU Threshold', value: '80%', status: 'active' },
            { metric: 'Memory Threshold', value: '80%', status: 'active' },
            { metric: 'Disk Threshold', value: '90%', status: 'active' },
            { metric: 'Response Time', value: '1000ms', status: 'active' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <p className="font-medium text-gray-900">{item.metric}</p>
              <Badge variant="outline" className="text-xs">{item.value}</Badge>
            </div>
          ))}
          <Button className="w-full bg-violet-600 hover:bg-violet-700">Edit Thresholds</Button>
        </CardContent>
      </Card>
    </div>
  );
}