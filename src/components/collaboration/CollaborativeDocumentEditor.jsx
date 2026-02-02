import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Save, Users as UsersIcon } from 'lucide-react';

export default function CollaborativeDocumentEditor() {
  const [content, setContent] = useState('');
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'Max M.', color: 'bg-blue-600', editing: true },
    { id: 2, name: 'Anna S.', color: 'bg-purple-600', editing: false },
  ]);
  const [lastSaved, setLastSaved] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 500));
    setLastSaved(new Date());
    setIsSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <UsersIcon className="w-5 h-5" /> Collaborative Editor
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {collaborators.map(collab => (
              <Badge key={collab.id} className={collab.color} title={collab.name}>
                {collab.name.split(' ')[0]}
              </Badge>
            ))}
          </div>
          <Button onClick={handleSave} disabled={isSaving} size="sm" className="gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start editing..."
            className="w-full h-64 p-3 border rounded-lg font-mono text-sm resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            Last saved: {lastSaved.toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>

      <div className="text-xs text-gray-500">
        {collaborators.length} collaborators online
      </div>
    </div>
  );
}