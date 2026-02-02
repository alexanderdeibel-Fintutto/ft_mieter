import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import MediaUploader from './MediaUploader';
import FloorplanMarker from './FloorplanMarker';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
    { value: 'heizung', label: '🔥 Heizung', description: 'Heizung defekt, kalt, Geräusche' },
    { value: 'wasser', label: '💧 Wasser/Sanitär', description: 'Wasserschaden, Rohrbruch, WC' },
    { value: 'elektrik', label: '⚡ Elektrik', description: 'Steckdosen, Licht, Sicherungen' },
    { value: 'fenster_tueren', label: '🚪 Fenster/Türen', description: 'Schlösser, Scheiben, Dichtungen' },
    { value: 'schimmel', label: '🦠 Schimmel/Feuchtigkeit', description: 'Schimmelbildung, feuchte Wände' },
    { value: 'sonstiges', label: '📋 Sonstiges', description: 'Andere Mängel' }
];

export default function CreateMaengelDialog({ 
    open, 
    onOpenChange, 
    onSubmit,
    submitting = false 
}) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        media: [],
        floorplanMarker: null,
        isUrgent: false
    });

    const [step, setStep] = useState(1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.title.trim()) {
            toast.error('Bitte gib einen Titel ein');
            return;
        }
        if (!form.category) {
            toast.error('Bitte wähle eine Kategorie');
            return;
        }

        await onSubmit({
            ...form,
            status: 'reported',
            statusHistory: [{ 
                status: 'reported', 
                timestamp: new Date().toISOString() 
            }],
            comments: []
        });

        // Reset form
        setForm({
            title: '',
            description: '',
            category: '',
            media: [],
            floorplanMarker: null,
            isUrgent: false
        });
        setStep(1);
    };

    const handleClose = () => {
        onOpenChange(false);
        setStep(1);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Mangel melden
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                {/* Urgent Toggle */}
                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                        <div>
                                            <p className="text-sm font-medium text-red-700">Dringend</p>
                                            <p className="text-xs text-red-600">Sofortige Aufmerksamkeit nötig</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={form.isUrgent}
                                        onCheckedChange={(checked) => setForm({ ...form, isUrgent: checked })}
                                    />
                                </div>

                                {/* Title */}
                                <div className="space-y-2">
                                    <Label>Was ist das Problem? *</Label>
                                    <Input
                                        placeholder="z.B. Heizung wird nicht warm"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label>Kategorie *</Label>
                                    <Select 
                                        value={form.category} 
                                        onValueChange={(v) => setForm({ ...form, category: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Kategorie wählen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map(c => (
                                                <SelectItem key={c.value} value={c.value}>
                                                    <div>
                                                        <span>{c.label}</span>
                                                        <span className="text-xs text-gray-500 ml-2">{c.description}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label>Detaillierte Beschreibung</Label>
                                    <Textarea
                                        placeholder="Beschreibe den Mangel so genau wie möglich..."
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                <Button 
                                    type="button" 
                                    onClick={() => setStep(2)}
                                    className="w-full bg-violet-600 hover:bg-violet-700"
                                    disabled={!form.title || !form.category}
                                >
                                    Weiter: Fotos & Position
                                </Button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                {/* Media Upload */}
                                <div className="space-y-2">
                                    <Label>Fotos & Videos hinzufügen</Label>
                                    <p className="text-xs text-gray-500">
                                        Dokumentiere den Mangel mit Fotos oder Videos
                                    </p>
                                    <MediaUploader
                                        media={form.media}
                                        onMediaChange={(media) => setForm({ ...form, media })}
                                        maxFiles={5}
                                        acceptVideo={true}
                                    />
                                </div>

                                {/* Floorplan Marker */}
                                <div className="space-y-2">
                                    <Label>Position markieren (optional)</Label>
                                    <p className="text-xs text-gray-500">
                                        Markiere die Stelle auf dem Grundriss
                                    </p>
                                    <FloorplanMarker
                                        marker={form.floorplanMarker}
                                        onMarkerChange={(marker) => setForm({ ...form, floorplanMarker: marker })}
                                        compact={true}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        className="flex-1"
                                    >
                                        Zurück
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        className="flex-1 bg-violet-600 hover:bg-violet-700"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Wird gesendet...
                                            </>
                                        ) : (
                                            'Mangel melden'
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </DialogContent>
        </Dialog>
    );
}