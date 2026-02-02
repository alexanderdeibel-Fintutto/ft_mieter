import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SERVICE_CATEGORIES = [
  { id: 'einkauf', label: '🛒 Einkaufshilfe', desc: 'Einkäufe erledigen, Besorgungen' },
  { id: 'technik', label: '💻 Technik-Hilfe', desc: 'Computer, Handy, Smart-Home' },
  { id: 'reparatur', label: '🔧 Kleine Reparaturen', desc: 'Handwerkliches, Montage' },
  { id: 'garten', label: '🌱 Garten & Balkon', desc: 'Pflanzenpflege, Gießen' },
  { id: 'haushalt', label: '🏠 Haushaltshilfe', desc: 'Putzen, Aufräumen, Wäsche' },
  { id: 'kinder', label: '👶 Kinderbetreuung', desc: 'Babysitting, Abholen' },
  { id: 'tiere', label: '🐕 Tiersitting', desc: 'Gassi gehen, Füttern' },
  { id: 'transport', label: '🚗 Fahrdienste', desc: 'Arzttermine, Mitfahrgelegenheit' },
  { id: 'sonstiges', label: '✨ Sonstiges', desc: 'Andere Hilfsangebote' },
];

const AVAILABILITY_OPTIONS = [
  'Mo-Fr vormittags',
  'Mo-Fr nachmittags',
  'Mo-Fr ganztags',
  'Nur Wochenende',
  'Flexibel',
  'Nach Absprache',
];

export default function CreateServiceDialog({ open, onOpenChange, onSubmit, userName }) {
  const [form, setForm] = useState({
    type: 'bietet',
    title: '',
    description: '',
    categories: [],
    availability: '',
    price: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const toggleCategory = (catId) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(catId)
        ? prev.categories.filter(c => c !== catId)
        : [...prev.categories, catId].slice(0, 3)
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || form.categories.length === 0) return;
    
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
    setForm({ type: 'bietet', title: '', description: '', categories: [], availability: '', price: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nachbarschaftshilfe anbieten/suchen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {/* Type Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setForm(prev => ({ ...prev, type: 'bietet' }))}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                form.type === 'bietet'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🤝 Ich biete an
            </button>
            <button
              onClick={() => setForm(prev => ({ ...prev, type: 'sucht' }))}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                form.type === 'sucht'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔍 Ich suche
            </button>
          </div>

          {/* Categories */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Kategorie (max. 3)</label>
            <div className="grid grid-cols-3 gap-2">
              {SERVICE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    form.categories.includes(cat.id)
                      ? 'border-[#8B5CF6] bg-violet-50 text-violet-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{cat.label.split(' ')[0]}</span>
                  <p className="text-xs mt-1 truncate">{cat.label.split(' ').slice(1).join(' ')}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Titel *</label>
            <Input 
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder={form.type === 'bietet' ? 'z.B. Helfe beim Einkaufen' : 'z.B. Suche Hilfe bei PC-Problemen'}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Beschreibung *</label>
            <Textarea 
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Beschreibe dein Angebot/Gesuch genauer..."
              rows={3}
            />
          </div>

          {/* Availability */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Verfügbarkeit</label>
            <Select value={form.availability} onValueChange={(v) => setForm(prev => ({ ...prev, availability: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Wann bist du verfügbar?" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITY_OPTIONS.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          {form.type === 'bietet' && (
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Preis (optional)</label>
              <Input 
                value={form.price}
                onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                placeholder="z.B. Kostenlos, 10€/Std, VB"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleSubmit}
              disabled={!form.title || !form.description || form.categories.length === 0 || submitting}
              className="flex-1 bg-[#8B5CF6] hover:bg-violet-700"
            >
              {submitting ? 'Erstelle...' : 'Veröffentlichen'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}