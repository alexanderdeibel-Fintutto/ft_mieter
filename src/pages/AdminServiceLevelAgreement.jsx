import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp } from 'lucide-react';

const UPTIME_DATA = [
  { date: 'Jan 20', uptime: 99.98, latency: 45 },
  { date: 'Jan 21', uptime: 99.95, latency: 48 },
  { date: 'Jan 22', uptime: 99.99, latency: 42 },
  { date: 'Jan 23', uptime: 99.97, latency: 50 },
  { date: 'Jan 24', uptime: 99.96, latency: 46 },
];

const SERVICES = [
  { name: 'Repair Service', sla: '99.9%', current: '99.98%', incidents: 0, mttr: '5min' },
  { name: 'Payment Service', sla: '99.95%', current: '99.92%', incidents: 1, mttr: '12min' },
  { name: 'Document Service', sla: '99.5%', current: '99.87%', incidents: 0, mttr: '8min' },
];

const INCIDENTS = [
  { id: 1, service: 'API Gateway', severity: 'Medium', duration: '45 minutes', impact: 'Degraded Performance' },
  { id: 2, service: 'Payment Processing', severity: 'High', duration: '120 minutes', impact: 'Service Unavailable' },
];

export default function AdminServiceLevelAgreement() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <TrendingUp className="w-6 h-6" /> Service Level Agreement (SLA)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Overall Uptime', value: '99.97%', color: 'text-green-600', target: 'vs 99.9% SLA' },
          { label: 'Avg Latency', value: '46ms', color: 'text-blue-600', target: 'vs 200ms target' },
          { label: 'Incidents This Month', value: '1', color: 'text-orange-600', target: 'vs 0 goal' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className={`text-2xl font-bold mt-2 ${metric.color}`}>{metric.value}</p>
              <p className="text-xs text-gray-500 mt-1">{metric.target}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uptime & Latency Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={UPTIME_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" domain={[99.9, 100]} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />
              <Line yAxisId="left" type="monotone" dataKey="uptime" stroke="#10B981" name="Uptime %" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="latency" stroke="#3B82F6" name="Latency (ms)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Level Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SERVICES.map((service, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{service.name}</h3>
                <Badge className={parseFloat(service.current) >= parseFloat(service.sla) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {parseFloat(service.current) >= parseFloat(service.sla) ? '✓ OK' : '✗ Below'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>SLA: <strong>{service.sla}</strong></span>
                <span>Current: <strong>{service.current}</strong></span>
                <span>{service.incidents} incidents</span>
                <span>MTTR: {service.mttr}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${parseFloat(service.current) >= 99.9 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${parseFloat(service.current)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {INCIDENTS.map(incident => (
            <div key={incident.id} className={`p-3 rounded-lg border-l-4 ${
              incident.severity === 'High' ? 'border-red-400 bg-red-50' : 'border-yellow-400 bg-yellow-50'
            }`}>
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-medium text-gray-900">{incident.service}</h3>
                <Badge className={incident.severity === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                  {incident.severity}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-1">{incident.impact}</p>
              <p className="text-xs text-gray-600">Duration: {incident.duration}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}