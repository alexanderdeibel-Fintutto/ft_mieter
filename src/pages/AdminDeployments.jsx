import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Zap } from 'lucide-react';

const DEPLOYMENTS = [
  { id: 1, version: 'v2.5.0', environment: 'Production', status: 'deployed', date: '2026-01-24 12:30', duration: '4m 32s' },
  { id: 2, version: 'v2.4.9', environment: 'Production', status: 'deployed', date: '2026-01-22 18:00', duration: '3m 45s' },
  { id: 3, version: 'v2.5.0-rc1', environment: 'Staging', status: 'deployed', date: '2026-01-24 10:00', duration: '2m 15s' },
];

const RECENT_CHANGES = [
  { commit: 'Fix repair chat UI', author: 'dev@team.de', date: '2h ago' },
  { commit: 'Add analytics dashboard', author: 'prod@team.de', date: '4h ago' },
  { commit: 'Optimize database queries', author: 'dev@team.de', date: '1d ago' },
];

export default function AdminDeployments() {
  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GitBranch className="w-6 h-6" /> CI/CD & Deployments
        </h1>
        <Button className="gap-2 bg-green-600 hover:bg-green-700">
          <Zap className="w-4 h-4" /> Deploy Now
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Deployments (30d)', value: '12', color: 'text-blue-600' },
          { label: 'Success Rate', value: '100%', color: 'text-green-600' },
          { label: 'Avg Deploy Time', value: '3m 45s', color: 'text-violet-600' },
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
          <CardTitle>Deployment History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {DEPLOYMENTS.map(dep => (
            <div key={dep.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-mono text-sm font-medium text-gray-900">{dep.version}</h3>
                  <p className="text-xs text-gray-600 mt-1">{dep.environment} • {dep.date}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">✓ {dep.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Duration: {dep.duration}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs">Logs</Button>
                  <Button size="sm" variant="outline" className="text-xs">Rollback</Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Git Commits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {RECENT_CHANGES.map((change, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{change.commit}</p>
              <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                <span>{change.author}</span>
                <span>{change.date}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}