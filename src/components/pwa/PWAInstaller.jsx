import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!deferredPrompt || showPrompt === false || installed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-6 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 max-w-sm"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">
              App installieren
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Schneller Zugriff vom Home Screen
            </p>
          </div>
          <button
            onClick={() => setShowPrompt(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleInstall}
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Download className="w-4 h-4" />
            Installieren
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPrompt(false)}
            size="sm"
            className="flex-1"
          >
            Später
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}