import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const PushNotificationContext = createContext(null);

// Notification types and their settings
const NOTIFICATION_SETTINGS_DEFAULT = {
  messages: { enabled: true, sound: true, badge: true },
  events: { enabled: true, sound: true, badge: true },
  projects: { enabled: true, sound: false, badge: true },
  groups: { enabled: true, sound: false, badge: true },
  pinnwand: { enabled: true, sound: false, badge: true },
  bookings: { enabled: true, sound: true, badge: true },
  repairs: { enabled: true, sound: true, badge: true },
  surveys: { enabled: true, sound: true, badge: true },
  documents: { enabled: true, sound: true, badge: true },
  announcements: { enabled: true, sound: true, badge: true },
  system: { enabled: true, sound: false, badge: true },
};

export function PushNotificationProvider({ children }) {
  const [permission, setPermission] = useState('default');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState(NOTIFICATION_SETTINGS_DEFAULT);

  // Check permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Load unread count
    const savedUnread = localStorage.getItem('unreadNotifications');
    if (savedUnread) {
      setUnreadCount(parseInt(savedUnread, 10));
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Dein Browser unterstützt keine Push-Benachrichtigungen');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Push-Benachrichtigungen aktiviert!');
        return true;
      } else if (result === 'denied') {
        toast.error('Push-Benachrichtigungen wurden blockiert');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
    return false;
  }, []);

  // Send a push notification
  const sendNotification = useCallback((type, title, body, options = {}) => {
    const typeSettings = settings[type] || settings.system;
    
    if (!typeSettings.enabled) return;

    // Update badge count
    if (typeSettings.badge) {
      const newCount = unreadCount + 1;
      setUnreadCount(newCount);
      localStorage.setItem('unreadNotifications', newCount.toString());
      
      // Update app badge if supported
      if ('setAppBadge' in navigator) {
        navigator.setAppBadge(newCount).catch(() => {});
      }
    }

    // Show browser notification if permission granted
    if (permission === 'granted' && document.hidden) {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: options.tag || `notification-${Date.now()}`,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: !typeSettings.sound,
      });

      notification.onclick = () => {
        window.focus();
        if (options.onClick) options.onClick();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }

    // Always show in-app toast
    const toastOptions = {
      duration: 4000,
      action: options.action,
    };

    switch (type) {
      case 'messages':
        toast.info(`💬 ${title}`, { ...toastOptions, description: body });
        break;
      case 'events':
        toast.info(`🎉 ${title}`, { ...toastOptions, description: body });
        break;
      case 'projects':
        toast.info(`🎯 ${title}`, { ...toastOptions, description: body });
        break;
      case 'groups':
        toast.info(`👥 ${title}`, { ...toastOptions, description: body });
        break;
      case 'pinnwand':
        toast.info(`📌 ${title}`, { ...toastOptions, description: body });
        break;
      case 'bookings':
        toast.info(`📋 ${title}`, { ...toastOptions, description: body });
        break;
      case 'repairs':
        toast.info(`🔧 ${title}`, { ...toastOptions, description: body });
        break;
      case 'surveys':
        toast.info(`📊 ${title}`, { ...toastOptions, description: body });
        break;
      case 'documents':
        toast.info(`📄 ${title}`, { ...toastOptions, description: body });
        break;
      case 'announcements':
        toast.info(`📢 ${title}`, { ...toastOptions, description: body });
        break;
      default:
        toast.info(title, { ...toastOptions, description: body });
    }

    // Add to notifications list
    const newNotification = {
      id: Date.now(),
      type,
      title,
      message: body,
      created_at: new Date().toISOString(),
      read: false,
      ...options.data,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    return newNotification;
  }, [permission, settings, unreadCount]);

  // Clear badge count
  const clearBadge = useCallback(() => {
    setUnreadCount(0);
    localStorage.setItem('unreadNotifications', '0');
    if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge().catch(() => {});
    }
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    const newCount = Math.max(0, unreadCount - 1);
    setUnreadCount(newCount);
    localStorage.setItem('unreadNotifications', newCount.toString());
  }, [unreadCount]);

  const value = {
    permission,
    requestPermission,
    sendNotification,
    notifications,
    unreadCount,
    clearBadge,
    settings,
    updateSettings,
    markAsRead,
    isSupported: 'Notification' in window,
  };

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
}

export function usePushNotifications() {
  const context = useContext(PushNotificationContext);
  if (!context) {
    throw new Error('usePushNotifications must be used within PushNotificationProvider');
  }
  return context;
}

export default PushNotificationContext;