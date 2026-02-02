import React, { useState, useEffect } from 'react';
import { Loader2, Cloud, CloudOff, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function OfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('synced');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      setTimeout(() => setSyncStatus('synced'), 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4 text-green-600" />
          <Badge className={`text-xs ${
            syncStatus === 'synced' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {syncStatus === 'synced' ? '✓ Synchronisiert' : 'Synchronisiert...'}
          </Badge>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-600" />
          <Badge className="bg-red-100 text-red-700 text-xs">Offline</Badge>
        </>
      )}
    </div>
  );
}