import React, { createContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export const RealtimeContext = createContext();

export function RealtimeProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = { ...notification, id, timestamp: new Date() };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    return id;
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    // Subscribe to notification events
    const unsubscribe = base44.entities.NotificationLog?.subscribe?.((event) => {
      if (event.type === 'create') {
        addNotification({
          title: event.data?.title || 'Neue Benachrichtigung',
          message: event.data?.message || '',
          type: event.data?.type || 'info',
          read: false,
        });
      }
    });

    return () => unsubscribe?.();
  }, [addNotification]);

  const value = {
    notifications,
    unreadCount,
    onlineUsers,
    addNotification,
    markAsRead,
    clearNotifications,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = React.useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
}