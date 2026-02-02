import React, { useState } from 'react';
import { Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const CATEGORIES = [
  { id: 'stockwerk', label: '🏢 Stockwerk/Bereich' },
  { id: 'familie', label: '👨‍👩‍👧 Familie' },
  { id: 'hobby', label: '🎯 Hobby' },
  { id: 'sport', label: '⚽ Sport' },
  { id: 'sonstiges', label: '📋 Sonstiges' },
];

const ICONS = ['🏢', '👨‍👩‍👧‍👦', '🌱', '⚽', '🎯', '🐕', '📚', '🎭', '🎮', '🍳', '🎵', '🚴'];

export default function CreateGroupDialog({ open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'hobby',
    icon: '🎯',
    isPrivate: false,
  });

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Bitte fülle alle Pflichtfelder aus');
      return;
    }
    onSubmit(formData);
    setFormData({ name: '', description: '', category: 'hobby', icon: '🎯', isPrivate: false });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Neue Gruppe erstellen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    formData.icon === icon 
                      ? 'bg-[#8B5CF6] text-white scale-110' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Gruppenname *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="z.B. Gartenfreunde"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Beschreibung *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Worum geht es in der Gruppe?"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Kategorie</label>
            <Select 
              value={formData.category} 
              onValueChange={(v) => setFormData({ ...formData, category: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {formData.isPrivate ? <Lock className="w-4 h-4 text-gray-500" /> : <Globe className="w-4 h-4 text-gray-500" />}
              <div>
                <p className="text-sm font-medium">{formData.isPrivate ? 'Private Gruppe' : 'Öffentliche Gruppe'}</p>
                <p className="text-xs text-gray-500">
                  {formData.isPrivate ? 'Nur auf Einladung' : 'Jeder kann beitreten'}
                </p>
              </div>
            </div>
            <Switch
              checked={formData.isPrivate}
              onCheckedChange={(v) => setFormData({ ...formData, isPrivate: v })}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleSubmit}
              className="flex-1 bg-[#8B5CF6] hover:bg-violet-700"
            >
              Gruppe erstellen
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}