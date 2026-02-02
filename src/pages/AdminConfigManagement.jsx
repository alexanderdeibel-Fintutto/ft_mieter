import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';

const CONFIGS = [
  { key: 'max_upload_size', environment: 'All', value: '50MB', type: 'string' },
  { key: 'session_timeout', environment: 'Production', value: '30 minutes', type: 'duration' },
  { key: 'enable_analytics', environment: 'All', value: 'true', type: 'boolean' },
  { key: 'api_rate_limit', environment: 'Production', value: '1000', type: 'number' },
];

const VERSIONS = [
  { version: 'v1.2.3', updated: '2026-01-24 10:00', updatedBy: 'admin@team.de', changes: 5 },
  { version: 'v1.2.2', updated: '2026-01-20 15:30', updatedBy: 'dev@team.de', changes: 3 },
];

export default function AdminConfigManagement() {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6" /> Configuration Management
        </h1>
        <Button onClick={() => setShowEditor(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Settings className="w-4 h-4" /> New Config
        </Button>
      </div>

      {showEditor && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Add Configuration
              <button onClick={() => setShowEditor(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Config Key" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>string</option>
              <option>number</option>
              <option>boolean</option>
              <option>duration</option>
            </select>
            <input type="text" placeholder="Value" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEditor(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Configurations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {CONFIGS.map(config => (
            <div key={config.key} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <code className="text-sm font-mono text-gray-900">{config.key}</code>
                <Badge variant="outline" className="text-xs">{config.type}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{config.environment}</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-gray-900">{config.value}</code>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Edit</Button>
                <Button size="sm" variant="outline" className="text-xs">Delete</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Versions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {VERSIONS.map(ver => (
            <div key={ver.version} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-sm font-medium text-gray-900">{ver.version}</h3>
                <Badge variant="outline" className="text-xs">{ver.changes} changes</Badge>
              </div>
              <p className="text-xs text-gray-600">{ver.updated} by {ver.updatedBy}</p>
              <Button size="sm" variant="outline" className="w-full text-xs mt-2">Restore</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}