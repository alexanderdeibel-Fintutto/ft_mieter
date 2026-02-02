import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default function CreateGroupEventDialog({ open, onOpenChange, onSubmit, groupName }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time) return;
    onSubmit(formData);
    setFormData({ title: '', description: '', date: '', time: '', location: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gruppen-Event erstellen</DialogTitle>
          <p className="text-sm text-gray-500">Event für "{groupName}"</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Titel *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="z.B. Grillabend"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Beschreibung</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Was ist geplant?"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Datum *
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block flex items-center gap-1">
                <Clock className="w-3 h-3" /> Uhrzeit *
              </label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Ort
            </label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="z.B. Innenhof, Gemeinschaftsraum"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              type="submit" 
              className="flex-1 bg-[#8B5CF6] hover:bg-violet-700"
              disabled={!formData.title || !formData.date || !formData.time}
            >
              Event erstellen
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}