import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Plus } from 'lucide-react';

const FIELDS = [
  { id: 1, name: 'Repair Priority', entity: 'Repair', type: 'select', options: 4, required: true, created: '2025-12-01' },
  { id: 2, name: 'Custom Reference', entity: 'Document', type: 'text', options: 0, required: false, created: '2025-11-15' },
  { id: 3, name: 'Department Code', entity: 'User', type: 'text', options: 0, required: false, created: '2025-10-20' },
];

const ENTITY_TYPES = ['Repair', 'Document', 'User', 'Payment', 'Property', 'Tenant'];
const FIELD_TYPES = ['text', 'number', 'select', 'checkbox', 'date', 'textarea', 'email'];

export default function AdminCustomFields() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Database className="w-6 h-6" /> Custom Fields & Metadata
        </h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4" /> Feld hinzufügen
        </Button>
      </div>

      {showNew && (
        <Card className="border-cyan-200 bg-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Custom Field erstellen
              <button onClick={() => setShowNew(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Field Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>- Entity wählen -</option>
              {ENTITY_TYPES.map(e => <option key={e}>{e}</option>)}
            </select>
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>- Field Type -</option>
              {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" /> Required
            </label>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Fields', value: '3', color: 'text-blue-600' },
          { label: 'Entities Extended', value: '6', color: 'text-green-600' },
          { label: 'Field Types', value: '7', color: 'text-cyan-600' },
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
          <CardTitle>Custom Fields</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {FIELDS.map(field => (
            <div key={field.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{field.name}</h3>
                <Badge className={field.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>
                  {field.required ? 'Required' : 'Optional'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>{field.entity}</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">{field.type}</span>
                {field.options > 0 && <span>{field.options} options</span>}
              </div>
              <p className="text-xs text-gray-500 mb-2">Created: {field.created}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">Edit</Button>
                <Button size="sm" variant="outline" className="text-xs">Delete</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}