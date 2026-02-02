import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap } from 'lucide-react';

const PIPELINE_DATA = [
  { stage: 'Extract', duration: 12, status: 'completed' },
  { stage: 'Transform', duration: 24, status: 'completed' },
  { stage: 'Load', duration: 8, status: 'in_progress' },
  { stage: 'Validate', duration: 0, status: 'pending' },
];

const PIPELINES = [
  { name: 'User Sync', frequency: 'Hourly', lastRun: '2026-01-24 14:00', status: 'success', records: 1240 },
  { name: 'Repair Analytics', frequency: 'Daily', lastRun: '2026-01-24 00:00', status: 'success', records: 5342 },
  { name: 'Financial Report', frequency: 'Weekly', lastRun: '2026-01-20', status: 'running', records: 8923 },
];

export default function AdminDataPipeline() {
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Zap className="w-6 h-6" /> Data Pipeline Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Pipelines', value: '3', color: 'text-blue-600' },
          { label: 'Total Records Processed', value: '15.5K', color: 'text-green-600' },
          { label: 'Avg Processing Time', value: '44 minutes', color: 'text-violet-600' },
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
          <CardTitle>Current Pipeline Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={PIPELINE_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="duration" fill="#8B5CF6" name="Duration (min)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Pipelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {PIPELINES.map(pipeline => (
            <div key={pipeline.name} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{pipeline.name}</h3>
                <Badge className={pipeline.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  {pipeline.status === 'success' ? '✓ Success' : '⏳ Running'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{pipeline.frequency} • {pipeline.lastRun}</span>
                <span>{pipeline.records.toLocaleString()} records</span>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs">View Details</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}