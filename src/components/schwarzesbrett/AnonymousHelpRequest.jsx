import React, { useState } from 'react';
import { EyeOff, AlertTriangle, Clock, Send, Info, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const HELP_CATEGORIES = [
  { id: 'einkauf', label: 'Einkaufshilfe', icon: '🛒' },
  { id: 'haushalt', label: 'Haushalt', icon: '🏠' },
  { id: 'technik', label: 'Technik', icon: '💻' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'betreuung', label: 'Betreuung', icon: '👶' },
  { id: 'sonstiges', label: 'Sonstiges', icon: '📋' },
];

export function AnonymousRequestCard({ request, onRespond, onContact }) {
  const category = HELP_CATEGORIES.find(c => c.id === request.category) || HELP_CATEGORIES[5];
  const isUrgent = request.isUrgent;

  return (
    <div className={`bg-white rounded-xl border overflow-hidden ${
      isUrgent ? 'border-red-300 ring-2 ring-red-100' : ''
    }`}>
      {/* Urgent Banner */}
      {isUrgent && (
        <div className="bg-red-500 text-white px-4 py-1.5 flex items-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium">Dringend</span>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{category.icon}</span>
            <Badge variant="outline">{category.label}</Badge>
            {request.isAnonymous && (
              <Badge className="bg-gray-100 text-gray-600">
                <EyeOff className="w-3 h-3 mr-1" />
                Anonym
              </Badge>
            )}
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {request.timeAgo}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-semibold text-gray-900 mb-1">{request.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{request.description}</p>

        {/* Details */}
        <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-500">
          {request.preferredTime && (
            <span className="bg-gray-100 px-2 py-1 rounded-full">
              🕐 {request.preferredTime}
            </span>
          )}
          {request.floor && !request.isAnonymous && (
            <span className="bg-gray-100 px-2 py-1 rounded-full">
              📍 {request.floor}
            </span>
          )}
          {request.pointsOffered > 0 && (
            <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
              🪙 +{request.pointsOffered} Punkte
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={() => onRespond(request)}
            className={`flex-1 ${isUrgent ? 'bg-red-500 hover:bg-red-600' : 'bg-[#8B5CF6] hover:bg-violet-700'}`}
          >
            Ich kann helfen
          </Button>
          {!request.isAnonymous && (
            <Button 
              variant="outline" 
              onClick={() => onContact(request)}
            >
              Nachfragen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CreateAnonymousRequestDialog({ open, onOpenChange, onSubmit, userPoints = 0 }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'sonstiges',
    isAnonymous: false,
    isUrgent: false,
    preferredTime: '',
    pointsOffered: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Bitte fülle alle Pflichtfelder aus');
      return;
    }

    if (formData.pointsOffered > userPoints) {
      toast.error('Du hast nicht genug Punkte');
      return;
    }

    setSubmitting(true);
    await onSubmit(formData);
    setSubmitting(false);
    
    setFormData({
      title: '',
      description: '',
      category: 'sonstiges',
      isAnonymous: false,
      isUrgent: false,
      preferredTime: '',
      pointsOffered: 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Hilfsanfrage erstellen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-gray-500" />
              <div>
                <span className="text-sm font-medium">Anonyme Anfrage</span>
                <p className="text-xs text-gray-500">Dein Name wird nicht angezeigt</p>
              </div>
            </div>
            <Switch 
              checked={formData.isAnonymous}
              onCheckedChange={(v) => setFormData({ ...formData, isAnonymous: v })}
            />
          </div>

          {/* Urgent Toggle */}
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <div>
                <span className="text-sm font-medium text-red-700">Dringend</span>
                <p className="text-xs text-red-500">Wird prominent hervorgehoben</p>
              </div>
            </div>
            <Switch 
              checked={formData.isUrgent}
              onCheckedChange={(v) => setFormData({ ...formData, isUrgent: v })}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Kategorie</label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HELP_CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Titel *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="z.B. Brauche Hilfe beim Einkaufen"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Beschreibung *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Beschreibe, wobei du Hilfe brauchst..."
              rows={3}
            />
          </div>

          {/* Preferred Time */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Wunschzeit (optional)</label>
            <Input
              value={formData.preferredTime}
              onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
              placeholder="z.B. Morgen Vormittag, Diese Woche"
            />
          </div>

          {/* Points Offered */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Punkte als Dankeschön (optional)</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max={userPoints}
                value={formData.pointsOffered}
                onChange={(e) => setFormData({ ...formData, pointsOffered: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="w-24"
              />
              <span className="text-sm text-gray-500">von {userPoints} verfügbar</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>Anfragen sind nur für registrierte Nachbarn sichtbar. Bei anonymen Anfragen wird dein Name erst nach der Kontaktaufnahme bekannt gegeben.</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={submitting || !formData.title || !formData.description}
              className="flex-1 bg-[#8B5CF6] hover:bg-violet-700"
            >
              {submitting ? 'Sende...' : 'Anfrage erstellen'}
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

export default { AnonymousRequestCard, CreateAnonymousRequestDialog };