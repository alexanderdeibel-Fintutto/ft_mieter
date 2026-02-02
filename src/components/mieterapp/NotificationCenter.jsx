import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle, DollarSign, MessageSquare, Zap, Trash2, Check, X
} from 'lucide-react';
import { useToast } from '@/components/notifications/ToastSystem';
import SkeletonLoader from '@/components/states/SkeletonLoader';
import EmptyState from '@/components/states/EmptyState';

const NOTIFICATION_ICONS = {
  payment: DollarSign,
  repair: AlertCircle,
  message: MessageSquare,
  meter: Zap,
  default: AlertCircle
};

const NOTIFICATION_COLORS = {
  payment: 'bg-blue-100 text-blue-800 border-blue-300',
  repair: 'bg-red-100 text-red-800 border-red-300',
  message: 'bg-green-100 text-green-800 border-green-300',
  meter: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  default: 'bg-gray-100 text-gray-800 border-gray-300'
};

export default function NotificationCenter() {
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const user = await base44.auth.me();
      // Mock notifications - replace with actual entity in production
      const mockNotifications = [
        {
          id: '1',
          type: 'payment',
          title: 'Zahlungserinnerung',
          description: 'Miete für Januar ist fällig',
          read: false,
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          type: 'repair',
          title: 'Reparatur durchgeführt',
          description: 'Heizung wurde repariert',
          read: false,
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '3',
          type: 'meter',
          title: 'Zählerablesung fällig',
          description: 'Bitte Strom-/Wasserzähler ablesen',
          read: true,
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      setNotifications(mockNotifications);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      addToast('Benachrichtigungen konnten nicht geladen werden', 'error');
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    addToast('Benachrichtigung als gelesen markiert', 'success', 1500);
  };

  const deleteNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    addToast('Benachrichtigung gelöscht', 'success', 1500);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('Alle Benachrichtigungen als gelesen markiert', 'success', 1500);
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return <SkeletonLoader type="list" count={3} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Benachrichtigungen</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {unreadCount} neue Benachrichtigungen
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Alle als gelesen
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'payment', 'repair', 'message', 'meter'].map(type => (
          <Button
            key={type}
            variant={filter === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(type)}
          >
            {type === 'all' ? 'Alle' : type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="Keine Benachrichtigungen"
          description="Sie haben alle Benachrichtigungen gelesen"
        />
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map(notification => {
            const Icon = NOTIFICATION_ICONS[notification.type] || AlertCircle;
            return (
              <Card
                key={notification.id}
                className={`border-l-4 transition-all ${NOTIFICATION_COLORS[notification.type]} ${
                  !notification.read ? 'shadow-md' : ''
                }`}
              >
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="h-5 w-5 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{notification.title}</h3>
                      <p className="text-sm opacity-80 mt-1">{notification.description}</p>
                      <p className="text-xs opacity-60 mt-2">
                        {new Date(notification.created_at).toLocaleString('de-DE')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 hover:bg-white/30 rounded-lg transition-colors"
                        aria-label="Als gelesen markieren"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 hover:bg-white/30 rounded-lg transition-colors"
                      aria-label="Löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}