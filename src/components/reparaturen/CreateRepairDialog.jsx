import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
    Wrench,
    Camera,
    X,
    Loader2,
    Send,
    MapPin,
    AlertTriangle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = [
    { id: 'sanitaer', label: 'Sanitär', emoji: '🚿', examples: 'Wasserhahn, Toilette, Abfluss' },
    { id: 'elektrik', label: 'Elektrik', emoji: '💡', examples: 'Steckdosen, Licht, Sicherung' },
    { id: 'heizung', label: 'Heizung', emoji: '🔥', examples: 'Heizkörper, Thermostat' },
    { id: 'fenster_tueren', label: 'Fenster/Türen', emoji: '🚪', examples: 'Schloss, Griff, Dichtung' },
    { id: 'boden', label: 'Boden', emoji: '🏠', examples: 'Parkett, Fliesen, Teppich' },
    { id: 'wand_decke', label: 'Wand/Decke', emoji: '🧱', examples: 'Risse, Schimmel, Feuchtigkeit' },
    { id: 'geraete', label: 'Geräte', emoji: '🔧', examples: 'Herd, Spülmaschine, Kühlschrank' },
    { id: 'sonstiges', label: 'Sonstiges', emoji: '📋', examples: 'Andere Probleme' },
];

const LOCATIONS = [
    'Badezimmer',
    'Küche', 
    'Wohnzimmer',
    'Schlafzimmer',
    'Kinderzimmer',
    'Flur',
    'Balkon',
    'Keller',
    'Treppenhaus',
    'Sonstiges'
];

const PRIORITIES = [
    { id: 'normal', label: 'Normal', description: 'Kann in den nächsten Tagen behoben werden' },
    { id: 'hoch', label: 'Dringend', description: 'Sollte zeitnah behoben werden' },
    { id: 'notfall', label: 'Notfall', description: 'Sofortige Maßnahme erforderlich' },
];

export default function CreateRepairDialog({ open, onOpenChange, onSubmit }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        location: '',
        priority: 'normal',
        photos: [],
    });
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        const uploadedUrls = [];

        for (const file of files) {
            try {
                const { file_url } = await base44.integrations.Core.UploadFile({ file });
                uploadedUrls.push(file_url);
            } catch (error) {
                console.error('Upload error:', error);
            }
        }

        setForm(prev => ({ ...prev, photos: [...prev.photos, ...uploadedUrls] }));
        setUploading(false);
    };

    const removePhoto = (index) => {
        setForm(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.category || !form.location) return;

        setLoading(true);
        await new Promise(r => setTimeout(r, 500));
        onSubmit(form);
        setForm({
            title: '',
            description: '',
            category: '',
            location: '',
            priority: 'normal',
            photos: [],
        });
        setLoading(false);
    };

    const selectedCategory = CATEGORIES.find(c => c.id === form.category);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-amber-600" />
                        Schaden melden
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Category Selection */}
                    <div>
                        <Label>Kategorie *</Label>
                        <div className="grid grid-cols-4 gap-2 mt-1">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, category: cat.id }))}
                                    className={`p-2 rounded-xl border-2 text-center transition-all ${
                                        form.category === cat.id
                                            ? 'border-amber-500 bg-amber-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="text-xl">{cat.emoji}</span>
                                    <p className="text-xs mt-1 font-medium truncate">{cat.label}</p>
                                </button>
                            ))}
                        </div>
                        {selectedCategory && (
                            <p className="text-xs text-gray-500 mt-1">
                                z.B. {selectedCategory.examples}
                            </p>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <Label>Kurzbeschreibung *</Label>
                        <Input
                            value={form.title}
                            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="z.B. Wasserhahn tropft"
                            required
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <Label>Ort in der Wohnung *</Label>
                        <Select 
                            value={form.location} 
                            onValueChange={(v) => setForm(prev => ({ ...prev, location: v }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Raum auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                                {LOCATIONS.map(loc => (
                                    <SelectItem key={loc} value={loc}>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3" />
                                            {loc}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description */}
                    <div>
                        <Label>Detaillierte Beschreibung</Label>
                        <Textarea
                            value={form.description}
                            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Beschreiben Sie das Problem möglichst genau..."
                            rows={3}
                        />
                    </div>

                    {/* Priority */}
                    <div>
                        <Label>Dringlichkeit</Label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            {PRIORITIES.map(priority => (
                                <button
                                    key={priority.id}
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, priority: priority.id }))}
                                    className={`p-2 rounded-xl border-2 text-center transition-all ${
                                        form.priority === priority.id
                                            ? priority.id === 'notfall' 
                                                ? 'border-red-500 bg-red-50' 
                                                : priority.id === 'hoch'
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-amber-500 bg-amber-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    {priority.id === 'notfall' && <AlertTriangle className="w-4 h-4 mx-auto text-red-600" />}
                                    <p className="text-xs font-medium">{priority.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <Label>Fotos (optional)</Label>
                        <div className="mt-1">
                            {form.photos.length > 0 && (
                                <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                                    {form.photos.map((url, index) => (
                                        <div key={index} className="relative flex-shrink-0">
                                            <img
                                                src={url}
                                                alt={`Foto ${index + 1}`}
                                                className="w-20 h-20 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="w-full"
                            >
                                {uploading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Camera className="w-4 h-4 mr-2" />
                                )}
                                {uploading ? 'Wird hochgeladen...' : 'Foto hinzufügen'}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handlePhotoUpload}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            type="submit"
                            disabled={loading || !form.title.trim() || !form.category || !form.location}
                            className="flex-1 bg-amber-500 hover:bg-amber-600"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 mr-2" />
                            )}
                            Meldung senden
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