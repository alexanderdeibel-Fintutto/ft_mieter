import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Image, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const EVENT_CATEGORIES = [
  { id: 'fest', label: '🎉 Fest / Feier', description: 'Straßenfest, Grillabend, Sommerfest' },
  { id: 'flohmarkt', label: '🛍️ Flohmarkt', description: 'Hofflohmarkt, Tauschbörse' },
  { id: 'sport', label: '⚽ Sport & Bewegung', description: 'Lauftreff, Yoga, Fußball' },
  { id: 'kultur', label: '🎭 Kultur', description: 'Konzert, Lesung, Filmabend' },
  { id: 'kinder', label: '👶 Kinder & Familie', description: 'Spielenachmittag, Basteln' },
  { id: 'sonstiges', label: '📋 Sonstiges', description: 'Andere Veranstaltungen' },
];

const RECURRENCE_OPTIONS = [
  { id: 'weekly', label: 'Wöchentlich' },
  { id: 'biweekly', label: 'Alle 2 Wochen' },
  { id: 'monthly', label: 'Monatlich' },
];

const WEEKDAYS = [
  { id: 0, label: 'So' },
  { id: 1, label: 'Mo' },
  { id: 2, label: 'Di' },
  { id: 3, label: 'Mi' },
  { id: 4, label: 'Do' },
  { id: 5, label: 'Fr' },
  { id: 6, label: 'Sa' },
];

const initialFormData = {
  title: '',
  description: '',
  category: '',
  date: '',
  time: '',
  location: '',
  maxParticipants: '',
  image: '',
  isRecurring: false,
  recurrenceType: 'weekly',
  recurrenceDay: 1,
  recurrenceEndDate: '',
};

export default function CreateEventDialog({ open, onOpenChange, onSubmit, editEvent = null }) {
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (editEvent) {
      setFormData({
        title: editEvent.title || '',
        description: editEvent.description || '',
        category: editEvent.category || '',
        date: editEvent.date || '',
        time: editEvent.time || '',
        location: editEvent.location || '',
        maxParticipants: editEvent.maxParticipants?.toString() || '',
        image: editEvent.image || '',
        isRecurring: editEvent.isRecurring || false,
        recurrenceType: editEvent.recurrenceType || 'weekly',
        recurrenceDay: editEvent.recurrenceDay ?? 1,
        recurrenceEndDate: editEvent.recurrenceEndDate || '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editEvent, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time || !formData.location || !formData.category) {
      return;
    }
    
    const categoryData = EVENT_CATEGORIES.find(c => c.id === formData.category);
    onSubmit({
      ...formData,
      categoryLabel: categoryData?.label || formData.category,
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
      recurrenceDay: formData.isRecurring ? parseInt(formData.recurrenceDay) : null,
    });
    
    setFormData(initialFormData);
    onOpenChange(false);
  };

  const isEditing = !!editEvent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#8B5CF6]" />
            {isEditing ? 'Event bearbeiten' : 'Event erstellen'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Kategorie *</label>
            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Kategorie wählen" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div>
                      <div>{cat.label}</div>
                      <div className="text-xs text-gray-500">{cat.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Titel *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="z.B. Sommerfest im Innenhof"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Beschreibung</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Beschreibe dein Event..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {formData.isRecurring ? 'Startdatum *' : 'Datum *'}
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="mt-1"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Uhrzeit *</label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>

          {/* Recurring Event Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Wiederkehrendes Event</p>
                <p className="text-xs text-gray-500">z.B. wöchentlicher Lauftreff</p>
              </div>
            </div>
            <Switch
              checked={formData.isRecurring}
              onCheckedChange={(v) => setFormData({...formData, isRecurring: v})}
            />
          </div>

          {/* Recurrence Options */}
          {formData.isRecurring && (
            <div className="space-y-3 p-3 bg-violet-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700">Wiederholung</label>
                <Select 
                  value={formData.recurrenceType} 
                  onValueChange={(v) => setFormData({...formData, recurrenceType: v})}
                >
                  <SelectTrigger className="mt-1 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCE_OPTIONS.map(opt => (
                      <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Wochentag</label>
                <div className="flex gap-1 mt-1">
                  {WEEKDAYS.map(day => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setFormData({...formData, recurrenceDay: day.id})}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                        formData.recurrenceDay === day.id
                          ? 'bg-[#8B5CF6] text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Enddatum (optional)</label>
                <Input
                  type="date"
                  value={formData.recurrenceEndDate}
                  onChange={(e) => setFormData({...formData, recurrenceEndDate: e.target.value})}
                  className="mt-1 bg-white"
                  min={formData.date}
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Ort *</label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="z.B. Innenhof, Gemeinschaftsraum"
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Max. Teilnehmer (optional)</label>
            <div className="relative mt-1">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                placeholder="Unbegrenzt"
                className="pl-9"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Bild-URL (optional)</label>
            <div className="relative mt-1">
              <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                placeholder="https://..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" className="flex-1 bg-[#8B5CF6] hover:bg-violet-700">
              {isEditing ? 'Speichern' : 'Event erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}