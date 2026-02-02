import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Plus } from 'lucide-react';

const TEST_RESULTS = [
  { id: 1, name: 'Q1 Load Test', date: '2026-01-20', users: 5000, duration: '30 min', peakLatency: '245ms', passed: true, report: 'View' },
  { id: 2, name: 'Stress Test - Payment', date: '2026-01-15', users: 10000, duration: '45 min', peakLatency: '580ms', passed: false, report: 'View' },
  { id: 3, name: 'Spike Test - Repairs', date: '2026-01-10', users: 8000, duration: '20 min', peakLatency: '320ms', passed: true, report: 'View' },
];

const SCENARIOS = [
  { name: 'Normal Load', users: 500, duration: '15 min', interval: '1 req/sec' },
  { name: 'Peak Load', users: 5000, duration: '30 min', interval: '10 req/sec' },
  { name: 'Stress Test', users: 10000, duration: '45 min', interval: '20 req/sec' },
  { name: 'Spike Test', users: 8000, duration: '20 min', interval: '50 req/sec burst' },
];

export default function AdminLoadTesting() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-6 h-6" /> Load Testing & Capacity Planning
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4" /> Test starten
        </Button>
      </div>

      {showNew && (
        <Card className="border-cyan-200 bg-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Load Test konfigurieren
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Test Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Normal Load</option>
              <option>Peak Load</option>
              <option>Stress Test</option>
              <option>Spike Test</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Virtual Users" className="px-3 py-2 border rounded-lg text-sm" />
              <input type="number" placeholder="Duration (min)" className="px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">Starten</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Capacity Headroom', value: '35%', color: 'text-green-600' },
          { label: 'Bottleneck', value: 'Database', color: 'text-orange-600' },
          { label: 'Recommended Scaling', value: '+2 instances', color: 'text-blue-600' },
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
          <CardTitle>Test Scenarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SCENARIOS.map((scenario, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{scenario.name}</h3>
                <Button size="sm" variant="outline" className="text-xs">Run</Button>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{scenario.users} users</span>
                <span>{scenario.duration}</span>
                <span className="font-mono">{scenario.interval}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Test Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {TEST_RESULTS.map(test => (
            <div key={test.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{test.name}</h3>
                <Badge className={test.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {test.passed ? '✓ Passed' : '✗ Failed'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{test.date}</span>
                <span>{test.users} concurrent users</span>
                <span>{test.duration}</span>
                <span className={test.peakLatency.includes('580') ? 'text-red-600 font-bold' : ''}>Peak: {test.peakLatency}</span>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs">{test.report} Report</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}