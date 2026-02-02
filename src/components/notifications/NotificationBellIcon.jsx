import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import NotificationCenter from './NotificationCenter';

export default function NotificationBellIcon() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadUnreadCount();

    // Subscribe to new notifications
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type === 'create') {
        setUnreadCount(prev => prev + 1);
      }
    });

    return unsubscribe;
  }, []);

  const loadUnreadCount = async () => {
    const notifs = await base44.entities.Notification.filter({
      is_read: false
    });
    setUnreadCount(notifs?.length || 0);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
            variant="destructive"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}