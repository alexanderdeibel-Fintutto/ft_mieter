import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Trash2, Check } from 'lucide-react';
import { useRealtime } from './RealtimeProvider';

export default function RealtimeNotificationCenter() {
  const { notifications, unreadCount, markAsRead, clearNotifications } = useRealtime();

  const getTypeColor = (type) => {
    switch(type) {
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'success': return 'bg-green-50 border-green-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="w-5 h-5" /> Benachrichtigungen ({unreadCount})
        </h2>
        {notifications.length > 0 && (
          <Button size="sm" variant="ghost" onClick={clearNotifications}>
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            Keine Benachrichtigungen
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.slice(0, 10).map(notif => (
            <Card key={notif.id} className={`border-l-4 ${getTypeColor(notif.type)}`}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{notif.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {notif.timestamp?.toLocaleTimeString()}
                    </p>
                  </div>
                  {!notif.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsRead(notif.id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}