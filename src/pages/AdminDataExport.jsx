import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Plus } from 'lucide-react';

const EXPORTS = [
  { id: 1, name: 'Q4 Financial Export', entity: 'Payment', format: 'CSV', size: '12.5 MB', created: '2026-01-24 14:30', status: 'completed' },
  { id: 2, name: 'User Data Snapshot', entity: 'User', format: 'JSON', size: '8.3 MB', created: '2026-01-23 10:15', status: 'completed' },
  { id: 3, name: 'Repair Tickets Export', entity: 'Repair', format: 'CSV', size: '5.2 MB', created: '2026-01-22 16:45', status: 'completed' },
];

const FORMATS = ['CSV', 'JSON', 'XML', 'Excel', 'Parquet'];
const ENTITIES = ['Repair', 'Payment', 'Document', 'User', 'Property'];

export default function AdminDataExport() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Download className="w-6 h-6" /> Data Export & Backup
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4" /> Export starten
        </Button>
      </div>

      {showNew && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Daten exportieren
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Export Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>- Entity wählen -</option>
              {ENTITIES.map(e => <option key={e}>{e}</option>)}
            </select>
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>- Format -</option>
              {FORMATS.map(f => <option key={f}>{f}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" /> Verschlüsselt exportieren
            </label>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">Starten</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Exports', value: '3', color: 'text-blue-600' },
          { label: 'Total Size', value: '26 MB', color: 'text-green-600' },
          { label: 'Avg Duration', value: '8m 45s', color: 'text-emerald-600' },
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
          <CardTitle>Recent Exports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {EXPORTS.map(exp => (
            <div key={exp.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{exp.name}</h3>
                <Badge className="bg-green-100 text-green-800">✓ {exp.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{exp.entity}</span>
                <span className="font-mono">{exp.format}</span>
                <span>{exp.size}</span>
                <span>{exp.created}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs">
                  Download
                </Button>
                <Button size="sm" variant="outline" className="text-xs">Delete</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked /> Auto-delete after 30 days
            </label>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked /> Encrypt sensitive data
            </label>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Include audit logs
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}