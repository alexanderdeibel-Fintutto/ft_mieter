import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Check } from 'lucide-react';

const AVAILABLE_WIDGETS = [
    { id: 'upcoming-tasks', name: 'Anstehende Aufgaben', icon: '📋', category: 'organisation' },
    { id: 'repair-status', name: 'Reparatur-Status', icon: '🔧', category: 'maintenance' },
    { id: 'next-payment', name: 'Nächste Zahlung', icon: '💰', category: 'finance' },
    { id: 'latest-documents', name: 'Letzte Dokumente', icon: '📄', category: 'documents' },
    { id: 'calendar-events', name: 'Kalender-Ereignisse', icon: '📅', category: 'calendar' },
    { id: 'marketplace-favorites', name: 'Meine Favoriten', icon: '❤️', category: 'marketplace' },
    { id: 'community-news', name: 'Community-News', icon: '📰', category: 'community' },
    { id: 'help-requests', name: 'Hilfsanfragen', icon: '🤝', category: 'help' },
    { id: 'quick-stats', name: 'Schnellübersicht', icon: '📊', category: 'stats' },
    { id: 'announcements', name: 'Ankündigungen', icon: '📢', category: 'announcements' },
];

export default function WidgetSelector({ open, onOpenChange, selectedWidgets, onAddWidget }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Widgets hinzufügen</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {AVAILABLE_WIDGETS.map(widget => {
                        const isSelected = selectedWidgets.includes(widget.id);
                        return (
                            <button
                                key={widget.id}
                                onClick={() => !isSelected && onAddWidget(widget.id)}
                                disabled={isSelected}
                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                                    isSelected
                                        ? 'bg-violet-50 border-violet-300'
                                        : 'bg-white border-gray-200 hover:border-violet-300'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{widget.icon}</span>
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900">{widget.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{widget.category}</p>
                                    </div>
                                </div>
                                {isSelected && (
                                    <Check className="w-5 h-5 text-violet-600" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export { AVAILABLE_WIDGETS };