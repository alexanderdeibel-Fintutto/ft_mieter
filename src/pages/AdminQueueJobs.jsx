import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

const JOBS = [
  { id: 1, name: 'Email Campaign', type: 'async', status: 'processing', progress: 65, queued: 1200, started: '2026-01-24 14:00' },
  { id: 2, name: 'Data Export', type: 'scheduled', status: 'queued', progress: 0, queued: 3, started: 'scheduled' },
  { id: 3, name: 'Backup Database', type: 'scheduled', status: 'completed', progress: 100, queued: 0, started: '2026-01-24 02:00' },
  { id: 4, name: 'Index Rebuild', type: 'maintenance', status: 'failed', progress: 45, queued: 0, error: 'Timeout', started: '2026-01-23 22:00' },
];

export default function AdminQueueJobs() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Activity className="w-6 h-6" /> Job Queue Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Processing', value: '1', color: 'text-blue-600' },
          { label: 'Queued', value: '3', color: 'text-yellow-600' },
          { label: 'Completed (24h)', value: '42', color: 'text-green-600' },
          { label: 'Failed', value: '1', color: 'text-red-600' },
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
          <CardTitle>Active Jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {JOBS.map(job => (
            <div key={job.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{job.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">Started: {job.started}</p>
                </div>
                <Badge className={
                  job.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  job.status === 'queued' ? 'bg-yellow-100 text-yellow-800' :
                  job.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }>
                  {job.status === 'processing' && '⏳ Processing'}
                  {job.status === 'queued' && '⏳ Queued'}
                  {job.status === 'completed' && '✓ Completed'}
                  {job.status === 'failed' && '✗ Failed'}
                </Badge>
              </div>

              {job.status === 'processing' && (
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{job.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${job.progress}%` }} />
                  </div>
                </div>
              )}

              {job.status === 'failed' && job.error && (
                <p className="text-xs text-red-600 mb-2">Error: {job.error}</p>
              )}

              <div className="flex gap-2">
                {job.status === 'processing' && (
                  <Button size="sm" variant="outline" className="flex-1 text-xs">Pause</Button>
                )}
                {job.status === 'queued' && (
                  <Button size="sm" variant="outline" className="flex-1 text-xs">Priority</Button>
                )}
                {job.status === 'failed' && (
                  <Button size="sm" variant="outline" className="flex-1 text-xs bg-yellow-50">Retry</Button>
                )}
                <Button size="sm" variant="outline" className="text-xs">Logs</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Queue Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { setting: 'Max Concurrent Jobs', value: '5' },
            { setting: 'Job Timeout', value: '30 minutes' },
            { setting: 'Retry Attempts', value: '3' },
            { setting: 'Dead Letter TTL', value: '7 days' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <p className="font-medium text-gray-900">{item.setting}</p>
              <input type="text" defaultValue={item.value} className="px-2 py-1 border rounded text-xs w-32" />
            </div>
          ))}
          <Button className="w-full bg-violet-600 hover:bg-violet-700">Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}