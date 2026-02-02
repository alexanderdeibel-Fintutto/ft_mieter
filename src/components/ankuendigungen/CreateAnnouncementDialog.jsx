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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
    Megaphone, 
    Wrench, 
    Calendar, 
    AlertTriangle,
    Bell,
    Info,
    Loader2,
    Send
} from 'lucide-react';

const CATEGORIES = [
    { id: 'allgemein', label: 'Allgemein', icon: Megaphone },
    { id: 'wartung', label: 'Wartung', icon: Wrench },
    { id: 'termin', label: 'Termin', icon: Calendar },
    { id: 'sicherheit', label: 'Sicherheit', icon: AlertTriangle },
];

const PRIORITIES = [
    { id: 'normal', label: 'Info', icon: Info, color: 'text-blue-600' },
    { id: 'important', label: 'Wichtig', icon: Bell, color: 'text-orange-600' },
    { id: 'urgent', label: 'Dringend', icon: AlertTriangle, color: 'text-red-600' },
];

export default function CreateAnnouncementDialog({ open, onOpenChange, onSubmit }) {
    const [form, setForm] = useState({
        title: '',
        content: '',
        category: 'allgemein',
        priority: 'normal',
        expires_at: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim()) return;
        
        setLoading(true);
        await new Promise(r => setTimeout(r, 500)); // Simulate API
        onSubmit({
            ...form,
            expires_at: form.expires_at || null,
        });
        setForm({
            title: '',
            content: '',
            category: 'allgemein',
            priority: 'normal',
            expires_at: '',
        });
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-violet-600" />
                        Neue Ankündigung
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Title */}
                    <div>
                        <Label>Titel *</Label>
                        <Input
                            value={form.title}
                            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="z.B. Wartungsarbeiten am Aufzug"
                            required
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <Label>Nachricht *</Label>
                        <Textarea
                            value={form.content}
                            onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Beschreiben Sie die Ankündigung..."
                            rows={4}
                            required
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <Label>Kategorie</Label>
                        <Select 
                            value={form.category} 
                            onValueChange={(v) => setForm(prev => ({ ...prev, category: v }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        <div className="flex items-center gap-2">
                                            <cat.icon className="w-4 h-4" />
                                            {cat.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Priority */}
                    <div>
                        <Label>Priorität</Label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            {PRIORITIES.map(priority => {
                                const Icon = priority.icon;
                                return (
                                    <button
                                        key={priority.id}
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, priority: priority.id }))}
                                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                                            form.priority === priority.id
                                                ? 'border-violet-500 bg-violet-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 mx-auto mb-1 ${priority.color}`} />
                                        <span className="text-xs font-medium">{priority.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Expiry Date (optional) */}
                    <div>
                        <Label>Gültig bis (optional)</Label>
                        <Input
                            type="date"
                            value={form.expires_at}
                            onChange={(e) => setForm(prev => ({ ...prev, expires_at: e.target.value }))}
                            min={new Date().toISOString().split('T')[0]}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Leer lassen für dauerhafte Ankündigung
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            type="submit"
                            disabled={loading || !form.title.trim() || !form.content.trim()}
                            className="flex-1 bg-violet-600 hover:bg-violet-700"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 mr-2" />
                            )}
                            Senden
                        </Button>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Abbrechen
                        </Button>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                        Die Ankündigung wird sofort an alle Mieter gesendet.
                    </p>
                </form>
            </DialogContent>
        </Dialog>
    );
}