import { useState } from 'react';
import { createDamageReport } from '../services/messaging';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateDamageReportDialog({ open, onOpenChange, buildingId, unitId }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal'
  });
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files].slice(0, 5)); // Max 5 Fotos
  };
  
  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Bitte geben Sie einen Titel ein');
      return;
    }
    
    setSubmitting(true);
    
    const result = await createDamageReport({
      buildingId,
      unitId,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      photos
    });
    
    setSubmitting(false);
    
    if (result.success) {
      setSuccess(true);
      toast.success('Schadensmeldung erfolgreich erstellt');
      
      setTimeout(() => {
        setSuccess(false);
        setFormData({ title: '', description: '', priority: 'normal' });
        setPhotos([]);
        onOpenChange(false);
      }, 2000);
    } else {
      toast.error('Fehler beim Erstellen der Meldung: ' + result.error);
    }
  };
  
  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="text-green-600 mb-4" size={64} />
            <h3 className="text-xl font-semibold mb-2">Erfolgreich gemeldet!</h3>
            <p className="text-gray-600 text-center">
              Ihre Schadensmeldung wurde erstellt und ein Chat mit Ihrem Vermieter wurde geöffnet.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schadensmeldung erstellen</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titel */}
          <div>
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="z.B. Wasserschaden im Bad"
              required
            />
          </div>
          
          {/* Beschreibung */}
          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detaillierte Beschreibung des Schadens..."
              rows={4}
            />
          </div>
          
          {/* Priorität */}
          <div>
            <Label htmlFor="priority">Priorität</Label>
            <Select 
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Niedrig</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
                <SelectItem value="urgent">Dringend</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Fotos */}
          <div>
            <Label>Fotos (max. 5)</Label>
            <div className="mt-2">
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-sm text-gray-600">Fotos hochladen</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelect}
                  disabled={photos.length >= 5}
                />
              </label>
              
              {/* Foto-Vorschau */}
              {photos.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={submitting || !formData.title.trim()}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Wird erstellt...
                </>
              ) : (
                'Meldung erstellen'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}