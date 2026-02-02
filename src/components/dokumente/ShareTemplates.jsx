import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, Copy, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_TEMPLATES = [
  {
    id: 'public_view_24h',
    name: 'Public View (24h)',
    description: 'Öffentlich, 24h Ablauf, nur ansehen',
    config: { isPublic: true, expiresInHours: 24, accessLevel: 'view', maxDownloads: null },
  },
  {
    id: 'team_edit_30d',
    name: 'Team Editing (30d)',
    description: 'Team-Edit, 30 Tage, unbegrenzte Downloads',
    config: { isPublic: false, expiresInHours: 720, accessLevel: 'edit', maxDownloads: null },
  },
  {
    id: 'contractor_dl_7d',
    name: 'Contractor (7d)',
    description: 'Externer Zugriff, 7 Tage, 5x Download',
    config: { isPublic: true, expiresInHours: 168, accessLevel: 'download', maxDownloads: 5 },
  },
  {
    id: 'client_view_90d',
    name: 'Client View (90d)',
    description: 'Nur ansehen, 90 Tage, unbegrenzt',
    config: { isPublic: false, expiresInHours: 2160, accessLevel: 'view', maxDownloads: null },
  },
];

export default function ShareTemplates({ open, onOpenChange, onSelectTemplate }) {
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [customName, setCustomName] = useState('');
  const [savingCustom, setSavingCustom] = useState(false);

  const handleSelectTemplate = (template) => {
    onSelectTemplate?.(template.config);
    onOpenChange(false);
  };

  const saveAsTemplate = () => {
    if (!customName.trim()) {
      toast.error('Template-Name erforderlich');
      return;
    }

    setSavingCustom(true);
    setTimeout(() => {
      const newTemplate = {
        id: `custom_${Date.now()}`,
        name: customName,
        description: 'Benutzerdefiniertes Template',
        config: {},
      };
      setTemplates([...templates, newTemplate]);
      setCustomName('');
      setSavingCustom(false);
      toast.success('Template gespeichert');
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-96">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Share-Templates
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto max-h-80">
          {templates.map(template => (
            <div
              key={template.id}
              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleSelectTemplate(template)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-sm text-gray-900">{template.name}</h4>
                  <p className="text-xs text-gray-500">{template.description}</p>
                </div>
                {template.id.startsWith('custom_') && (
                  <Badge variant="outline" className="text-xs">Custom</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {template.config.isPublic && (
                  <Badge className="bg-green-100 text-green-700 text-xs">Öffentlich</Badge>
                )}
                {template.config.accessLevel && (
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    {template.config.accessLevel}
                  </Badge>
                )}
                {template.config.expiresInHours && (
                  <Badge className="bg-orange-100 text-orange-700 text-xs">
                    {Math.round(template.config.expiresInHours / 24)}d
                  </Badge>
                )}
                {template.config.maxDownloads && (
                  <Badge className="bg-purple-100 text-purple-700 text-xs">
                    {template.config.maxDownloads}x DL
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Custom Template */}
        <div className="border-t pt-3 mt-3">
          <label className="text-sm font-medium mb-2 block">Aktuelles Template speichern</label>
          <div className="flex gap-2">
            <Input
              placeholder="Template Name..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={saveAsTemplate}
              disabled={savingCustom || !customName}
              variant="outline"
            >
              {savingCustom ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}