import { useState, useEffect } from 'react';
import { 
  getUnreadNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  subscribeToNotifications 
} from '../services/messaging';
import { getCurrentUser } from '../services/supabase';
import { Bell, Check, MessageCircle, FileText, Wrench, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    loadNotifications();
    
    // Realtime Subscription
    getCurrentUser().then(user => {
      if (user) {
        const subscription = subscribeToNotifications(user.id, (newNotification) => {
          setNotifications(prev => [newNotification, ...prev]);
        });
        
        return () => subscription.unsubscribe();
      }
    });
  }, []);
  
  async function loadNotifications() {
    const data = await getUnreadNotifications();
    setNotifications(data);
  }
  
  async function handleMarkRead(notificationId, e) {
    e.stopPropagation();
    await markNotificationRead(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }
  
  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    setNotifications([]);
  }
  
  const unreadCount = notifications.length;
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96 p-0">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <h3 className="font-semibold">Benachrichtigungen</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs"
            >
              <Check size={14} className="mr-1" />
              Alle als gelesen markieren
            </Button>
          )}
        </div>
        
        {/* Notifications List */}
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="mx-auto mb-2 text-gray-300" size={32} />
              <p className="text-sm">Keine neuen Benachrichtigungen</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationItem({ notification, onMarkRead }) {
  const icon = getNotificationIcon(notification.notification_type);
  
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors group">
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          notification.notification_type === 'message' ? 'bg-blue-100 text-blue-600' :
          notification.notification_type === 'task_updated' ? 'bg-green-100 text-green-600' :
          notification.notification_type === 'task_created' ? 'bg-orange-100 text-orange-600' :
          'bg-gray-100 text-gray-600'
        }`}>
          {icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {notification.title}
          </p>
          <p className="text-sm text-gray-600 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatNotificationTime(notification.created_at)}
          </p>
        </div>
        
        {/* Mark Read Button */}
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => onMarkRead(notification.id, e)}
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
}

function getNotificationIcon(type) {
  switch(type) {
    case 'message':
      return <MessageCircle size={20} />;
    case 'task_created':
    case 'task_updated':
      return <Wrench size={20} />;
    case 'document_shared':
      return <FileText size={20} />;
    default:
      return <Bell size={20} />;
  }
}

function formatNotificationTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Gerade eben';
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
  
  return date.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: '2-digit',
    year: 'numeric'
  });
}