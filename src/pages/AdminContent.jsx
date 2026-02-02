import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';

const CONTENT_ITEMS = [
  { id: 1, title: 'Mietrecht FAQ', type: 'article', status: 'published', views: 1245, updated: '2026-01-20' },
  { id: 2, title: 'Reparaturprozess', type: 'guide', status: 'draft', views: 0, updated: '2026-01-24' },
  { id: 3, title: 'Zahlungsbedingungen', type: 'policy', status: 'published', views: 542, updated: '2026-01-10' },
  { id: 4, title: 'Neue Features 2026', type: 'announcement', status: 'published', views: 3456, updated: '2026-01-01' },
];

export default function AdminContent() {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6" /> Content Management
        </h1>
        <Button onClick={() => setShowEditor(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Neuer Content
        </Button>
      </div>

      {showEditor && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Content Editor
              <button onClick={() => setShowEditor(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Titel" className="w-full px-3 py-2 border rounded-lg" />
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>Article</option>
              <option>Guide</option>
              <option>Policy</option>
              <option>Announcement</option>
            </select>
            <textarea placeholder="Inhalt" rows="6" className="w-full px-3 py-2 border rounded-lg" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEditor(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Entwurf speichern</Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700">Veröffentlichen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Published Content', value: '3', color: 'text-green-600' },
          { label: 'Drafts', value: '1', color: 'text-yellow-600' },
          { label: 'Total Views', value: '5,243', color: 'text-blue-600' },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className={`text-2xl font-bold mt-2 ${metric.color}`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        {CONTENT_ITEMS.map(item => (
          <Card key={item.id} className="hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{item.type}</Badge>
                    <Badge className={item.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {item.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{item.views} views • Aktualisiert: {item.updated}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}