import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
    Settings2, 
    Star, 
    Calendar, 
    MessageCircle, 
    Wrench, 
    ClipboardList, 
    FileText, 
    ShoppingBag,
    Sparkles,
    Bell
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CONTENT_TYPES = [
    { key: 'announcements', label: 'Ankündigungen', icon: Star, description: 'Mitteilungen der Hausverwaltung' },
    { key: 'events', label: 'Veranstaltungen', icon: Calendar, description: 'Community-Events und Termine' },
    { key: 'groupPosts', label: 'Gruppen-Beiträge', icon: MessageCircle, description: 'Posts aus deinen Gruppen' },
    { key: 'repairs', label: 'Reparaturen', icon: Wrench, description: 'Status-Updates zu Meldungen' },
    { key: 'surveys', label: 'Umfragen', icon: ClipboardList, description: 'Neue Umfragen teilnehmen' },
    { key: 'documents', label: 'Dokumente', icon: FileText, description: 'Neue wichtige Dokumente' },
    { key: 'marketplace', label: 'Marktplatz', icon: ShoppingBag, description: 'Neue Anzeigen von Nachbarn' }
];

const INTEREST_CATEGORIES = [
    { key: 'familie', label: 'Familie & Kinder', emoji: '👨‍👩‍👧‍👦' },
    { key: 'sport', label: 'Sport & Fitness', emoji: '⚽' },
    { key: 'umwelt', label: 'Umwelt & Garten', emoji: '🌱' },
    { key: 'kultur', label: 'Kultur & Musik', emoji: '🎭' },
    { key: 'kochen', label: 'Kochen & Essen', emoji: '🍳' },
    { key: 'haustiere', label: 'Haustiere', emoji: '🐕' },
    { key: 'technik', label: 'Technik & Digital', emoji: '💻' },
    { key: 'handwerk', label: 'Handwerk & DIY', emoji: '🔨' }
];

export default function FeedPreferencesPanel({ open, onOpenChange, preferences, onSave }) {
    const [localPrefs, setLocalPrefs] = useState(preferences);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setLocalPrefs(preferences);
    }, [preferences, open]);

    const handleContentTypeToggle = (key) => {
        setLocalPrefs(prev => ({
            ...prev,
            contentTypes: {
                ...prev.contentTypes,
                [key]: !prev.contentTypes?.[key]
            }
        }));
    };

    const handleInterestToggle = (key) => {
        setLocalPrefs(prev => {
            const currentInterests = prev.interests || [];
            const newInterests = currentInterests.includes(key)
                ? currentInterests.filter(i => i !== key)
                : [...currentInterests, key];
            return { ...prev, interests: newInterests };
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save preferences to user profile
            await base44.auth.updateMe({ feed_preferences: localPrefs });
            onSave(localPrefs);
            onOpenChange(false);
        } catch (error) {
            console.error('Fehler beim Speichern:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-violet-500" />
                        Feed personalisieren
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Content Types */}
                    <div>
                        <h3 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            Inhaltstypen
                        </h3>
                        <div className="space-y-2">
                            {CONTENT_TYPES.map(({ key, label, icon: Icon, description }) => (
                                <div 
                                    key={key}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium">{label}</p>
                                            <p className="text-xs text-gray-500">{description}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={localPrefs.contentTypes?.[key] !== false}
                                        onCheckedChange={() => handleContentTypeToggle(key)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Interests */}
                    <div>
                        <h3 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Interessen
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">
                            Wähle Themen, die dich interessieren, um relevantere Inhalte zu sehen.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {INTEREST_CATEGORIES.map(({ key, label, emoji }) => {
                                const isSelected = localPrefs.interests?.includes(key);
                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleInterestToggle(key)}
                                        className={`px-3 py-2 rounded-full text-sm flex items-center gap-1.5 transition-all ${
                                            isSelected
                                                ? 'bg-violet-100 text-violet-700 border-2 border-violet-300'
                                                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                        }`}
                                    >
                                        <span>{emoji}</span>
                                        <span>{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Suggestions Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-violet-50">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-violet-500" />
                            <div>
                                <p className="text-sm font-medium">Empfehlungen anzeigen</p>
                                <p className="text-xs text-gray-500">Personalisierte Vorschläge</p>
                            </div>
                        </div>
                        <Switch
                            checked={localPrefs.showSuggestions !== false}
                            onCheckedChange={(checked) => setLocalPrefs(prev => ({ ...prev, showSuggestions: checked }))}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Abbrechen
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="bg-violet-600 hover:bg-violet-700"
                    >
                        {isSaving ? 'Speichern...' : 'Speichern'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}