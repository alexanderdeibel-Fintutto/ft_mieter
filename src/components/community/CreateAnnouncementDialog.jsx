import React, { useState } from 'react';
import { Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  { id: 'info', label: '📢 Info', desc: 'Allgemeine Informationen' },
  { id: 'ankuendigung', label: '📣 Ankündigung', desc: 'Wichtige Mitteilungen' },
  { id: 'hilfe', label: '🆘 Hilfe gesucht', desc: 'Du brauchst Unterstützung' },
  { id: 'diskussion', label: '💬 Diskussion', desc: 'Meinungsaustausch' },
];

export default function CreateAnnouncementDialog({ open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'info',
    image: '',
  });

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Bitte fülle alle Pflichtfelder aus');
      return;
    }
    onSubmit(formData);
    setFormData({ title: '', content: '', category: 'info', image: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Neuer Beitrag</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
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
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex flex-col">
                      <span>{cat.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Titel *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Worum geht es?"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Inhalt *</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Beschreibe dein Anliegen..."
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Bild-URL (optional)</label>
            <div className="flex gap-2">
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
                className="flex-1"
              />
              <Button variant="outline" size="icon">
                <Image className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleSubmit}
              className="flex-1 bg-[#8B5CF6] hover:bg-violet-700"
            >
              Veröffentlichen
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