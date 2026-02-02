import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/notifications/ToastSystem';
import { CloudOff, Loader, CheckCircle } from 'lucide-react';

export default function OfflineSyncManager() {
  const { addToast } = useToast();
  const [syncStatus, setSyncStatus] = useState('online');
  const [pendingActions, setPendingActions] = useState([]);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => {
      setSyncStatus('syncing');
      addToast('Wieder online - Sync wird durchgeführt...', 'info');
      syncPendingActions();
    };

    const handleOffline = () => {
      setSyncStatus('offline');
      addToast('Offline - Änderungen werden gespeichert', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setSyncStatus('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncPendingActions = async () => {
    try {
      // Get pending actions from IndexedDB
      const db = await openIndexedDB();
      const tx = db.transaction('pendingActions', 'readonly');
      const store = tx.objectStore('pendingActions');
      const items = await store.getAll();

      // Process each action
      for (const item of items) {
        await processPendingAction(item);
      }

      // Clear synced items
      const deleteTx = db.transaction('pendingActions', 'readwrite');
      await deleteTx.objectStore('pendingActions').clear();

      setSyncStatus('online');
      addToast('Alle Änderungen synchronisiert', 'success', 2000);
    } catch (error) {
      console.error('Sync failed:', error);
      addToast('Sync fehlgeschlagen - wird später wiederholt', 'error');
      setSyncStatus('offline');
    }
  };

  const processPendingAction = async (action) => {
    // Process payment, repair, meter reading, etc.
    console.log('Processing pending action:', action);
  };

  const openIndexedDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MieterApp', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('pendingActions')) {
          db.createObjectStore('pendingActions', { keyPath: 'id' });
        }
      };
    });
  };

  if (syncStatus === 'online') return null;

  const icons = {
    offline: <CloudOff className="h-5 w-5" />,
    syncing: <Loader className="h-5 w-5 animate-spin" />
  };

  const messages = {
    offline: 'Offline - Änderungen werden lokal gespeichert',
    syncing: 'Synchronisiere mit Server...'
  };

  const colors = {
    offline: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    syncing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  };

  return (
    <div className={`fixed top-16 left-0 right-0 z-40 px-4 py-3 flex items-center gap-3 ${colors[syncStatus]}`}>
      {icons[syncStatus]}
      <span className="text-sm font-medium flex-1">{messages[syncStatus]}</span>
      {pendingActions.length > 0 && (
        <span className="text-xs bg-white/30 px-2 py-1 rounded">
          {pendingActions.length} ausstehend
        </span>
      )}
    </div>
  );
}