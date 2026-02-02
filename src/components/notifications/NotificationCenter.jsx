import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, X, CheckCheck } from 'lucide-react';

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const TYPE_ICONS = {
  workflow: '⚙️',
  document: '📄',
  task: '✅',
  alert: '🔔',
  permission: '🔐'
};

export default function NotificationCenter({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    
    // Subscribe to new notifications
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type === 'create') {
        setNotifications(prev => [event.data, ...prev]);
      }
    });

    return unsubscribe;
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    const notifs = await base44.entities.Notification.filter(
      { is_read: false },
      '-created_date',
      50
    );
    setNotifications(notifs || []);
    setLoading(false);
  };

  const handleMarkAsRead = async (notifId) => {
    await base44.entities.Notification.update(notifId, {
      is_read: true,
      read_at: new Date().toISOString()
    });
    setNotifications(notifications.filter(n => n.id !== notifId));
  };

  const handleMarkAllAsRead = async () => {
    for (const notif of notifications) {
      await base44.entities.Notification.update(notif.id, {
        is_read: true,
        read_at: new Date().toISOString()
      });
    }
    setNotifications([]);
  };

  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins}m`;
    if (diffHours < 24) return `vor ${diffHours}h`;
    if (diffDays < 7) return `vor ${diffDays}d`;
    return notifDate.toLocaleDateString('de-DE');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-screen w-full max-w-md bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={20} />
            <h2 className="font-semibold">Benachrichtigungen</h2>
            {notifications.length > 0 && (
              <Badge variant="destructive">{notifications.length}</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Wird geladen...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Keine neuen Benachrichtigungen
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {notifications.map(notif => (
                <Card key={notif.id} className="hover:bg-gray-50 transition">
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <div className="text-2xl">{TYPE_ICONS[notif.type]}</div>
                      
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-1">
                          <h3 className="font-medium text-sm flex-1">{notif.title}</h3>
                          <Badge className={PRIORITY_COLORS[notif.priority]} className="text-xs">
                            {notif.priority}
                          </Badge>
                        </div>

                        <p className="text-xs text-gray-600 mb-2">{notif.message}</p>

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {formatDate(notif.created_date)}
                          </p>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="h-6"
                          >
                            {notif.action_label || 'Schließen'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="sticky bottom-0 bg-gray-50 border-t p-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="flex-1 gap-2"
            >
              <CheckCheck size={14} />
              Alle als gelesen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}