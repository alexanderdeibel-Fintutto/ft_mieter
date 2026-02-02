import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus } from 'lucide-react';

const JOBS = [
  { id: 1, name: 'Daily Backup', schedule: '0 2 * * *', status: 'active', lastRun: '2026-01-24 02:00', nextRun: '2026-01-25 02:00' },
  { id: 2, name: 'Weekly Report', schedule: '0 9 * * MON', status: 'active', lastRun: '2026-01-20 09:00', nextRun: '2026-01-27 09:00' },
  { id: 3, name: 'Cleanup Old Logs', schedule: '0 3 * * 0', status: 'active', lastRun: '2026-01-19 03:00', nextRun: '2026-01-26 03:00' },
];

export default function AdminScheduling() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-6 h-6" /> Scheduled Jobs & Cron
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Neuer Job
        </Button>
      </div>

      {showNew && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Scheduled Job erstellen
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Job Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Cron Expression</option>
              <option>Interval (Minutes)</option>
              <option>Interval (Hours)</option>
              <option>Interval (Days)</option>
            </select>
            <input type="text" placeholder="Schedule (cron or value)" className="w-full px-3 py-2 border rounded-lg text-sm font-mono" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>backupDatabase</option>
              <option>generateReport</option>
              <option>cleanupLogs</option>
              <option>sendNotifications</option>
            </select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Scheduled Jobs', value: '3', color: 'text-blue-600' },
          { label: 'Active', value: '3', color: 'text-green-600' },
          { label: 'Success Rate', value: '99.8%', color: 'text-green-600' },
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
          <CardTitle>Cron Jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {JOBS.map(job => (
            <div key={job.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{job.name}</h3>
                <Badge className="bg-green-100 text-green-800">✓ {job.status}</Badge>
              </div>
              <code className="text-xs text-gray-600 block mb-2 font-mono">{job.schedule}</code>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Last: {job.lastRun}</span>
                <span>Next: {job.nextRun}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Edit</Button>
                <Button size="sm" variant="outline" className="text-xs">Logs</Button>
                <Button size="sm" variant="outline" className="text-xs">Run Now</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cron Syntax Help</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-gray-700 font-mono">
          <div className="p-2 bg-gray-50 rounded">* * * * * (minute hour day month weekday)</div>
          <div className="p-2 bg-gray-50 rounded">0 2 * * * (daily at 2:00 AM)</div>
          <div className="p-2 bg-gray-50 rounded">0 9 * * MON (every Monday at 9:00 AM)</div>
          <div className="p-2 bg-gray-50 rounded">*/15 * * * * (every 15 minutes)</div>
        </CardContent>
      </Card>
    </div>
  );
}