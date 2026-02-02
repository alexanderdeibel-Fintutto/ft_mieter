import React from 'react';
import { Bell, Calendar, AlertTriangle, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function createEventNotification(type, event, reason = '') {
  const baseNotification = {
    id: Date.now(),
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.date,
    eventTime: event.time,
    timestamp: new Date().toISOString(),
    read: false,
  };

  switch (type) {
    case 'cancelled':
      return {
        ...baseNotification,
        type: 'event_cancelled',
        title: 'Event abgesagt',
        message: `"${event.title}" wurde abgesagt.${reason ? ` Grund: ${reason}` : ''}`,
        icon: 'alert',
      };
    case 'updated':
      return {
        ...baseNotification,
        type: 'event_updated',
        title: 'Event aktualisiert',
        message: `"${event.title}" wurde aktualisiert. Bitte prüfe die Details.`,
        icon: 'edit',
      };
    case 'reminder':
      return {
        ...baseNotification,
        type: 'event_reminder',
        title: 'Event-Erinnerung',
        message: `"${event.title}" findet morgen statt!`,
        icon: 'bell',
      };
    default:
      return baseNotification;
  }
}

export default function EventNotificationItem({ notification, onClick }) {
  const getIcon = () => {
    switch (notification.icon) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'edit':
        return <Pencil className="w-5 h-5 text-blue-500" />;
      case 'bell':
        return <Bell className="w-5 h-5 text-[#8B5CF6]" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Gerade eben';
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    return format(date, 'dd. MMM', { locale: de });
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
        notification.read ? 'bg-white hover:bg-gray-50' : 'bg-violet-50 hover:bg-violet-100'
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm ${notification.read ? 'text-gray-700' : 'font-medium text-gray-900'}`}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="w-2 h-2 bg-[#8B5CF6] rounded-full" />
          )}
        </div>
        <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-1">{formatTime(notification.timestamp)}</p>
      </div>
    </button>
  );
}