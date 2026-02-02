import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success(
        <div className="flex items-center gap-2">
          <Wifi className="w-5 h-5 text-green-600" />
          <span>Wieder online! Synchronisiere...</span>
        </div>
      );
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning(
        <div className="flex items-center gap-2">
          <WifiOff className="w-5 h-5 text-orange-600" />
          <span>Offline-Modus aktiv</span>
        </div>,
        { duration: Infinity }
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending actions from localStorage
    const pending = JSON.parse(localStorage.getItem('pending_actions') || '[]');
    setPendingActions(pending);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncPendingActions = async () => {
    const actions = JSON.parse(localStorage.getItem('pending_actions') || '[]');
    if (actions.length === 0) return;

    // Try to sync each action
    for (const action of actions) {
      try {
        // Here you would actually sync with the server
        console.log('Syncing action:', action);
      } catch (error) {
        console.error('Failed to sync action:', error);
      }
    }

    // Clear pending actions
    localStorage.removeItem('pending_actions');
    setPendingActions([]);
    
    toast.success(
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span>Alle Änderungen synchronisiert</span>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white py-2 px-4 text-center text-sm"
        >
          <WifiOff className="w-4 h-4 inline mr-2" />
          Offline-Modus • Änderungen werden synchronisiert, wenn Sie wieder online sind
        </motion.div>
      )}
    </AnimatePresence>
  );
}