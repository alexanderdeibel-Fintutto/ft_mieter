import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
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
import { MapPin, Loader2 } from 'lucide-react';

const CATEGORIES = [
    { value: 'werkzeug', label: 'Werkzeug ausleihen' },
    { value: 'hilfe', label: 'Hilfe benötigt' },
    { value: 'transport', label: 'Transport/Fahrt' },
    { value: 'sonstiges', label: 'Sonstiges' }
];

export default function CreateMapRequestDialog({ open, onOpenChange, onSubmit, userLocation }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'sonstiges',
        location: userLocation || { latitude: 52.52, longitude: 13.405, address: '' }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        setIsSubmitting(true);
        
        // Ablaufdatum auf 24h setzen
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await onSubmit({
            ...formData,
            expires_at: expiresAt.toISOString(),
            status: 'offen'
        });

        setIsSubmitting(false);
        setFormData({
            title: '',
            description: '',
            category: 'sonstiges',
            location: userLocation || { latitude: 52.52, longitude: 13.405, address: '' }
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-orange-500" />
                        Neue Anfrage erstellen
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Was suchen Sie? *</Label>
                        <Input
                            id="title"
                            placeholder="z.B. Wer hat eine Leiter?"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Kategorie</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Kategorie wählen" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Beschreibung</Label>
                        <Textarea
                            id="description"
                            placeholder="Weitere Details zu Ihrer Anfrage..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Standort/Adresse</Label>
                        <Input
                            id="address"
                            placeholder="z.B. Gebäude A, 2. Stock"
                            value={formData.location.address}
                            onChange={(e) => setFormData({
                                ...formData,
                                location: { ...formData.location, address: e.target.value }
                            })}
                        />
                        <p className="text-xs text-gray-500">
                            Ihre Anfrage läuft automatisch nach 24 Stunden ab.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Abbrechen
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !formData.title.trim()}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Anfrage erstellen
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}