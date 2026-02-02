import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Target, Plus, X } from 'lucide-react';

const PROJECT_CATEGORIES = [
  { id: 'umwelt', label: '🌱 Umwelt & Nachhaltigkeit' },
  { id: 'nachbarschaft', label: '🏘️ Nachbarschaftspflege' },
  { id: 'sozial', label: '❤️ Soziales Engagement' },
  { id: 'kultur', label: '🎭 Kultur & Freizeit' },
  { id: 'sport', label: '⚽ Sport & Gesundheit' },
  { id: 'sonstiges', label: '📋 Sonstiges' },
];

export default function CreateProjectDialog({ open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'nachbarschaft',
    targetDate: '',
    location: '',
    maxParticipants: '',
    tasks: [],
  });
  const [newTask, setNewTask] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    
    onSubmit({
      ...formData,
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
      tasks: formData.tasks.map(t => ({ id: Date.now() + Math.random(), text: t, completed: false })),
    });
    
    setFormData({
      title: '',
      description: '',
      category: 'nachbarschaft',
      targetDate: '',
      location: '',
      maxParticipants: '',
      tasks: [],
    });
    onOpenChange(false);
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setFormData(prev => ({ ...prev, tasks: [...prev.tasks, newTask.trim()] }));
    setNewTask('');
  };

  const removeTask = (index) => {
    setFormData(prev => ({ ...prev, tasks: prev.tasks.filter((_, i) => i !== index) }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#8B5CF6]" />
            Neues Projekt starten
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Projekttitel *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="z.B. Gemeinschaftsgarten anlegen"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Beschreibung *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Worum geht es bei diesem Projekt? Was wollt ihr erreichen?"
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
                {PROJECT_CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Zieldatum
              </label>
              <Input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Max. Teilnehmer</label>
              <Input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                placeholder="Unbegrenzt"
                min="1"
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

          {/* Tasks */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Aufgaben (optional)</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Aufgabe hinzufügen..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTask())}
              />
              <Button type="button" variant="outline" size="icon" onClick={addTask}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tasks.length > 0 && (
              <div className="space-y-1">
                {formData.tasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                    <span className="flex-1">{task}</span>
                    <button type="button" onClick={() => removeTask(index)} className="text-gray-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              type="submit" 
              className="flex-1 bg-[#8B5CF6] hover:bg-violet-700"
              disabled={!formData.title || !formData.description}
            >
              Projekt starten
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