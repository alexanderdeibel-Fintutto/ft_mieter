import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Plus } from 'lucide-react';

const TEST_SUITES = [
  { id: 1, name: 'API Unit Tests', tests: 245, passed: 243, failed: 2, coverage: '94%', lastRun: '2026-01-24 14:30' },
  { id: 2, name: 'Integration Tests', tests: 128, passed: 126, failed: 2, coverage: '87%', lastRun: '2026-01-24 14:25' },
  { id: 3, name: 'E2E Tests', tests: 64, passed: 64, failed: 0, coverage: '92%', lastRun: '2026-01-24 14:20' },
];

const BUGS = [
  { id: 1, title: 'Repair form validation', severity: 'High', status: 'in_progress', created: '2026-01-22', assignee: 'Dev Team' },
  { id: 2, title: 'Payment gateway timeout', severity: 'Medium', status: 'open', created: '2026-01-23', assignee: 'Unassigned' },
  { id: 3, title: 'Document upload slow', severity: 'Low', status: 'open', created: '2026-01-24', assignee: 'QA Team' },
];

export default function AdminQualityAssurance() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6" /> Quality Assurance & Testing
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4" /> Bug melden
        </Button>
      </div>

      {showNew && (
        <Card className="border-teal-200 bg-teal-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Bug Report
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Bug Title" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <textarea placeholder="Description & Steps to Reproduce" className="w-full px-3 py-2 border rounded-lg text-sm h-24" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-teal-600 hover:bg-teal-700">Melden</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Tests Passed', value: '433/439', color: 'text-green-600' },
          { label: 'Code Coverage', value: '91%', color: 'text-blue-600' },
          { label: 'Open Bugs', value: '2', color: 'text-orange-600' },
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
          <CardTitle>Test Suites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {TEST_SUITES.map(suite => (
            <div key={suite.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{suite.name}</h3>
                <Badge className={suite.failed === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {suite.failed === 0 ? '✓ All Pass' : `${suite.failed} Failed`}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{suite.passed}/{suite.tests} passed</span>
                <span>Coverage: {suite.coverage}</span>
                <span>Last: {suite.lastRun}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-green-500" style={{ width: `${(suite.passed/suite.tests)*100}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {BUGS.map(bug => (
            <div key={bug.id} className={`p-3 rounded-lg border-l-4 ${
              bug.severity === 'High' ? 'border-red-400 bg-red-50' :
              bug.severity === 'Medium' ? 'border-yellow-400 bg-yellow-50' :
              'border-blue-400 bg-blue-50'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{bug.title}</h3>
                <Badge className={
                  bug.severity === 'High' ? 'bg-red-100 text-red-800' :
                  bug.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }>
                  {bug.severity}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Created: {bug.created}</span>
                <span className={bug.status === 'open' ? 'text-red-600 font-bold' : 'text-blue-600'}>{bug.status}</span>
                <span>{bug.assignee}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}