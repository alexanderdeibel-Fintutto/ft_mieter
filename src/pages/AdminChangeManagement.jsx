import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Plus } from 'lucide-react';

const RELEASES = [
  { id: 1, version: 'v2.4.1', date: '2026-01-24', status: 'deployed', changes: 12, rollback: false, duration: '15 min' },
  { id: 2, version: 'v2.4.0', date: '2026-01-20', status: 'deployed', changes: 28, rollback: false, duration: '28 min' },
  { id: 3, version: 'v2.3.9', date: '2026-01-15', status: 'deployed', changes: 18, rollback: true, duration: '35 min' },
];

const PENDING = [
  { id: 1, name: 'Feature: Advanced Search', stage: 'testing', completion: 78, approvals: 2 },
  { id: 2, name: 'Hotfix: Payment Timeout', stage: 'ready', completion: 100, approvals: 1 },
  { id: 3, name: 'Feature: Multi-Language', stage: 'development', completion: 45, approvals: 0 },
];

const ROLLBACK_PROCEDURES = [
  { id: 1, name: 'Quick Revert Script', status: 'active', lastTested: '2026-01-15' },
  { id: 2, name: 'Database Rollback Plan', status: 'active', lastTested: '2026-01-01' },
  { id: 3, name: 'Cache Invalidation', status: 'active', lastTested: '2026-01-10' },
];

export default function AdminChangeManagement() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GitBranch className="w-6 h-6" /> Change Management & Releases
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Release erstellen
        </Button>
      </div>

      {showNew && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Release
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Version (e.g., v2.5.0)" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <textarea placeholder="Release Notes" className="w-full px-3 py-2 border rounded-lg text-sm h-20" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" /> Requires Rollback Plan
            </label>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Releases This Month', value: '3', color: 'text-blue-600' },
          { label: 'Success Rate', value: '98.5%', color: 'text-green-600' },
          { label: 'Avg Deploy Time', value: '23 min', color: 'text-blue-600' },
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
          <CardTitle>Recent Releases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {RELEASES.map(release => (
            <div key={release.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{release.version}</h3>
                <Badge className={release.rollback ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                  {release.rollback ? '↩ Rolled back' : '✓ Deployed'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{release.date}</span>
                <span>{release.changes} changes</span>
                <span>{release.duration}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Changelog</Button>
                {!release.rollback && <Button size="sm" variant="outline" className="text-xs">Rollback</Button>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Changes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {PENDING.map(change => (
            <div key={change.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{change.name}</h3>
                <Badge variant="outline">{change.stage}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Progress: {change.completion}%</span>
                <span>{change.approvals}/2 approvals</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: `${change.completion}%` }} />
              </div>
              {change.stage === 'ready' && <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-xs">Deploy</Button>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rollback Procedures</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ROLLBACK_PROCEDURES.map(proc => (
            <div key={proc.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{proc.name}</h3>
                <Badge className="bg-green-100 text-green-800">✓ {proc.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Last tested: {proc.lastTested}</span>
                <Button size="sm" variant="outline" className="text-xs">Test Now</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}