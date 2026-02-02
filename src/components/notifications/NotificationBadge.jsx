import React from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { usePushNotifications } from './PushNotificationService';

export default function NotificationBadge({ className = '', showText = false }) {
  const { unreadCount } = usePushNotifications();

  return (
    <Link 
      to={createPageUrl('Benachrichtigungen')} 
      className={`relative inline-flex items-center ${className}`}
    >
      <Bell className="w-6 h-6 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      {showText && (
        <span className="ml-2 text-sm text-gray-600">Benachrichtigungen</span>
      )}
    </Link>
  );
}