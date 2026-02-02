import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Shift + ? to open shortcuts help
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        setOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [open]);

  const shortcuts = [
    { keys: ['⌘', 'K'], description: 'Globale Suche öffnen' },
    { keys: ['Shift', '?'], description: 'Diese Hilfe anzeigen' },
    { keys: ['G', 'H'], description: 'Zur Startseite' },
    { keys: ['G', 'C'], description: 'Zur Community' },
    { keys: ['G', 'M'], description: 'Zum Mietrecht Chat' },
    { keys: ['G', 'R'], description: 'Zu Reparaturen' },
    { keys: ['G', 'F'], description: 'Zu Finanzen' },
    { keys: ['Esc'], description: 'Dialoge schließen' },
  ];

  useEffect(() => {
    const handleNavigationShortcuts = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // G + H = Home
      if (e.key === 'h' && lastKey === 'g') {
        window.location.href = '#/MieterHome';
      }
      // G + C = Community
      if (e.key === 'c' && lastKey === 'g') {
        window.location.href = '#/MieterCommunity';
      }
      // G + M = Mietrecht
      if (e.key === 'm' && lastKey === 'g') {
        window.location.href = '#/MietrechtChat';
      }
      // G + R = Repairs
      if (e.key === 'r' && lastKey === 'g') {
        window.location.href = '#/MieterRepairs';
      }
      // G + F = Finances
      if (e.key === 'f' && lastKey === 'g') {
        window.location.href = '#/MieterFinances';
      }

      lastKey = e.key;
    };

    let lastKey = '';
    window.addEventListener('keydown', handleNavigationShortcuts);
    return () => window.removeEventListener('keydown', handleNavigationShortcuts);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-30 p-2 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Tastaturkürzel (Shift + ?)"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Tastaturkürzel
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            {shortcuts.map((shortcut, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{shortcut.description}</span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key, keyIdx) => (
                    <Badge key={keyIdx} variant="outline" className="font-mono">
                      {key}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            Drücken Sie <Badge variant="outline" className="font-mono mx-1">Shift</Badge> +{' '}
            <Badge variant="outline" className="font-mono mx-1">?</Badge> um diese Hilfe anzuzeigen
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}