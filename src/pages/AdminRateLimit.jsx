import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, AlertTriangle } from 'lucide-react';

const RATE_LIMITS = [
  { endpoint: '/api/repairs', limit: '1000/hour', current: 845, status: 'normal' },
  { endpoint: '/api/documents', limit: '500/hour', current: 487, status: 'normal' },
  { endpoint: '/api/auth', limit: '100/hour', current: 98, status: 'warning' },
  { endpoint: '/api/payments', limit: '200/hour', current: 45, status: 'normal' },
];

const VIOLATIONS = [
  { ip: '192.168.1.105', endpoint: '/api/repairs', timestamp: '2026-01-24 14:32', action: 'throttled' },
  { ip: '10.0.0.42', endpoint: '/api/auth', timestamp: '2026-01-24 13:15', action: 'blocked' },
];

export default function AdminRateLimit() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Zap className="w-6 h-6" /> Rate Limiting & Quotas
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Requests', value: '1.5M/hour', limit: '2M' },
          { label: 'Rate Violations', value: '2', trend: '-8 from yesterday' },
          { label: 'Blocked IPs', value: '3', status: 'managed' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
              <p className="text-xs text-gray-500 mt-1">{metric.limit || metric.trend || metric.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Endpoints Rate Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {RATE_LIMITS.map(limit => (
            <div key={limit.endpoint} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-sm font-medium text-gray-900">{limit.endpoint}</h3>
                <Badge className={limit.status === 'warning' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                  {limit.status === 'warning' ? '⚠️ Warning' : '✓ Normal'}
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all ${limit.status === 'warning' ? 'bg-orange-600' : 'bg-violet-600'}`}
                  style={{ width: `${(limit.current / parseInt(limit.limit)) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{limit.current} / {limit.limit}</span>
                <span>{Math.round((limit.current / parseInt(limit.limit)) * 100)}%</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Recent Violations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {VIOLATIONS.map((v, idx) => (
            <div key={idx} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-sm text-gray-900">{v.ip}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {v.endpoint} • {v.timestamp}
                  </p>
                </div>
                <Badge className="bg-orange-100 text-orange-800 capitalize">
                  {v.action}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: 'Default Rate Limit', value: '1000 requests/hour' },
            { label: 'Burst Allowance', value: '+20% for 1 minute' },
            { label: 'Violation Action', value: 'Throttle then Block' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-600">{item.value}</p>
            </div>
          ))}
          <Button className="w-full bg-violet-600 hover:bg-violet-700">Update Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}