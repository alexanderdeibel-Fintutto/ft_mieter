import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, MessageCircle, BookOpen, Lightbulb } from 'lucide-react';
import SmartTooltip from '@/components/onboarding/SmartTooltip';

const HELP_TIPS = {
  payment: {
    title: 'Zahlungen',
    tips: [
      'Sie können Ihre Miete direkt in der App zahlen',
      'Automatische Zahlungspläne können eingerichtet werden',
      'Zahlungsbelege werden per Email zugesendet'
    ]
  },
  repair: {
    title: 'Reparaturen melden',
    tips: [
      'Beschreiben Sie das Problem detailliert',
      'Fotos helfen dem Handwerker',
      'Dringende Fälle: Unter "Notfall" schneller Support'
    ]
  },
  meter: {
    title: 'Zählerablesung',
    tips: [
      'Der OCR erkennt automatisch Ziffern',
      'Eine Ablesung pro Monat ausreichend',
      'Historische Daten für Vergleiche'
    ]
  },
  document: {
    title: 'Dokumente',
    tips: [
      'Alle Dokumente werden verschlüsselt gespeichert',
      'Teilbar mit Vermieter oder Familie',
      'Automatische Backup-Erstellung'
    ]
  }
};

export default function ContextualHelpPanel({ context = 'general', onClose }) {
  const [expanded, setExpanded] = useState(false);
  const [viewed, setViewed] = useState([]);

  const help = HELP_TIPS[context] || { title: 'Hilfe', tips: [] };

  return (
    <div className="fixed bottom-24 right-4 z-40 max-w-xs animate-in fade-in slide-in-from-bottom-4">
      <Card className="bg-white dark:bg-gray-800 shadow-2xl">
        {expanded ? (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                {help.title}
              </h3>
              <button
                onClick={() => setExpanded(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {help.tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500 p-3 rounded text-sm"
                >
                  {tip}
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {}}
              >
                <MessageCircle className="h-4 w-4" />
                Support
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {}}
              >
                <BookOpen className="h-4 w-4" />
                FAQ
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setExpanded(true)}
            className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <div className="flex-1 text-sm">
              <p className="font-medium">Benötigen Sie Hilfe?</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Tipps & Support</p>
            </div>
          </button>
        )}
      </Card>
    </div>
  );
}