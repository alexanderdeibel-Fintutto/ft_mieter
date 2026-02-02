import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, Circle, CheckCheck, Filter, Settings, Archive, RotateCcw, XCircle, AlertTriangle, Pencil, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAuth from '../components/useAuth';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import NotificationHub from '../components/notifications/NotificationHub';

const NOTIFICATION_TYPES = {
  nachricht: { icon: '💬', color: 'bg-blue-100 text-blue-600', label: 'Nachricht' },
  zahlung: { icon: '💰', color: 'bg-green-100 text-green-600', label: 'Zahlung' },
  mangel: { icon: '🔧', color: 'bg-orange-100 text-orange-600', label: 'Mängel' },
  termin: { icon: '📅', color: 'bg-violet-100 text-violet-600', label: 'Termin' },
  dokument: { icon: '📄', color: 'bg-cyan-100 text-cyan-600', label: 'Dokument' },
  system: { icon: '⚙️', color: 'bg-gray-100 text-gray-600', label: 'System' },
  community: { icon: '👥', color: 'bg-pink-100 text-pink-600', label: 'Community' },
  buchung: { icon: '📋', color: 'bg-purple-100 text-purple-600', label: 'Buchung' },
  event: { icon: '🎉', color: 'bg-rose-100 text-rose-600', label: 'Event' },
  hilfe: { icon: '🤝', color: 'bg-amber-100 text-amber-600', label: 'Nachbarschaftshilfe' },
  erinnerung: { icon: '⏰', color: 'bg-yellow-100 text-yellow-600', label: 'Erinnerung' },
  event_cancelled: { icon: '❌', color: 'bg-red-100 text-red-600', label: 'Event abgesagt' },
  event_updated: { icon: '✏️', color: 'bg-blue-100 text-blue-600', label: 'Event aktualisiert' },
  event_reminder: { icon: '🔔', color: 'bg-yellow-100 text-yellow-600', label: 'Event-Erinnerung' },
};

const EVENT_FILTER_OPTIONS = [
  { id: 'all_events', label: 'Alle Event-Benachrichtigungen' },
  { id: 'event_cancelled', label: '❌ Abgesagte Events' },
  { id: 'event_updated', label: '✏️ Aktualisierte Events' },
  { id: 'event_reminder', label: '🔔 Event-Erinnerungen' },
];

const DEMO_NOTIFICATIONS = [
  // Buchungsanfragen für Dienstleister
  {
    id: 1,
    type: 'buchung',
    title: 'Neue Buchungsanfrage',
    message: 'Helga B. möchte deine "Einkaufshilfe" am 25. Jan. um 14:00 Uhr buchen.',
    created_at: new Date(Date.now() - 600000).toISOString(),
    read: false,
    link: '/Schwarzesbrett?tab=bookings&view=requests',
  },
  // Buchungsbestätigung
  {
    id: 2,
    type: 'buchung',
    title: 'Buchung bestätigt ✓',
    message: 'Peter S. hat deine Anfrage für "Kleine Reparaturen" am 28. Jan. bestätigt.',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    read: false,
    link: '/Schwarzesbrett?tab=bookings',
  },
  // Neue Chat-Nachricht
  {
    id: 3,
    type: 'nachricht',
    title: 'Neue Nachricht von Maria K.',
    message: 'Hallo! Wegen der Einkaufshilfe morgen...',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    link: '/Chat?recipient=user-101',
  },
  // Neues Event passend zu Interessen
  {
    id: 4,
    type: 'event',
    title: 'Neues Event: Sommerfest im Innenhof',
    message: 'Ein Event in deiner Lieblingskategorie "Feste & Feiern" wurde erstellt.',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    link: '/Events',
  },
  // Neues Nachbarschaftshilfe-Angebot
  {
    id: 5,
    type: 'hilfe',
    title: 'Neues Hilfsangebot: Technik-Hilfe',
    message: 'Jonas M. bietet jetzt "Computer & Handy Hilfe" in deiner Nachbarschaft an.',
    created_at: new Date(Date.now() - 14400000).toISOString(),
    read: false,
    link: '/Schwarzesbrett?tab=services',
  },
  // Erinnerung an Event
  {
    id: 6,
    type: 'erinnerung',
    title: 'Morgen: Lauftreff',
    message: 'Erinnerung: Der Lauftreff findet morgen um 18:30 Uhr statt. Treffpunkt: Haupteingang.',
    created_at: new Date(Date.now() - 21600000).toISOString(),
    read: true,
    link: '/Events',
  },
  // Erinnerung an gebuchten Termin
  {
    id: 7,
    type: 'erinnerung',
    title: 'Termin in 2 Stunden',
    message: 'Dein Termin "Einkaufshilfe" mit Maria K. beginnt um 14:00 Uhr.',
    created_at: new Date(Date.now() - 28800000).toISOString(),
    read: true,
    link: '/Schwarzesbrett?tab=bookings',
  },
  // Buchung abgelehnt
  {
    id: 8,
    type: 'buchung',
    title: 'Buchung abgelehnt',
    message: 'Leider musste Anna L. deine Anfrage für "Kinderbetreuung" am 30. Jan. absagen.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    link: '/Schwarzesbrett?tab=bookings',
  },
  // Neues Gesuch in der Nähe
  {
    id: 9,
    type: 'hilfe',
    title: 'Neues Hilfegesuch',
    message: 'Klaus D. sucht Hilfe beim Umzug in deiner Nachbarschaft.',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    read: true,
    link: '/Schwarzesbrett?tab=services',
  },
  // Zahlung
  {
    id: 10,
    type: 'zahlung',
    title: 'Miete eingegangen',
    message: 'Ihre Mietzahlung für Januar 2026 wurde erfolgreich verbucht.',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    read: true,
  },
  // Mängel
  {
    id: 11,
    type: 'mangel',
    title: 'Mängelmeldung aktualisiert',
    message: 'Der Hausmeister wird am Montag vorbeikommen.',
    created_at: new Date(Date.now() - 345600000).toISOString(),
    read: true,
    link: '/Maengel',
  },
  // Community
  {
    id: 12,
    type: 'community',
    title: 'Neuer Beitrag auf der Pinnwand',
    message: 'Ein Nachbar verschenkt Zimmerpflanzen.',
    created_at: new Date(Date.now() - 432000000).toISOString(),
    read: true,
    link: '/Schwarzesbrett',
  },
  // Event abgesagt
  {
    id: 13,
    type: 'event_cancelled',
    title: 'Event abgesagt: Filmabend',
    message: 'Der Filmabend am 08. Feb. wurde leider abgesagt. Grund: Organisator krank.',
    created_at: new Date(Date.now() - 500000000).toISOString(),
    read: true,
    link: '/Events',
  },
  // Event aktualisiert
  {
    id: 14,
    type: 'event_updated',
    title: 'Event aktualisiert: Sommerfest',
    message: 'Das Sommerfest wurde auf 16:30 Uhr verschoben. Bitte prüfe die Details.',
    created_at: new Date(Date.now() - 550000000).toISOString(),
    read: true,
    link: '/Events',
  },
  // Event-Erinnerung
  {
    id: 15,
    type: 'event_reminder',
    title: 'Morgen: Hofflohmarkt',
    message: 'Vergiss nicht: Der Hofflohmarkt findet morgen um 10:00 Uhr statt!',
    created_at: new Date(Date.now() - 600000000).toISOString(),
    read: true,
    link: '/Events',
  },
];

const DEMO_ARCHIVED = [
  {
    id: 101,
    type: 'event_cancelled',
    title: 'Event abgesagt: Yoga im Park',
    message: 'Das Yoga-Event wurde wegen Regen abgesagt.',
    created_at: new Date(Date.now() - 864000000).toISOString(),
    read: true,
    archived_at: new Date(Date.now() - 800000000).toISOString(),
    archived_reason: 'dismissed',
  },
  {
    id: 102,
    type: 'buchung',
    title: 'Buchungsanfrage abgelehnt',
    message: 'Du hast die Anfrage von Max H. abgelehnt.',
    created_at: new Date(Date.now() - 950000000).toISOString(),
    read: true,
    archived_at: new Date(Date.now() - 900000000).toISOString(),
    archived_reason: 'rejected',
  },
];

function getTimeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  
  if (diff < 60) return 'Gerade eben';
  if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min.`;
  if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std.`;
  if (diff < 604800) return `vor ${Math.floor(diff / 86400)} Tagen`;
  return date.toLocaleDateString('de-DE');
}

function NotificationCard({ notification, onMarkRead, onDelete, onArchive, onNavigate, showArchiveButton = true }) {
  const type = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.system;
  
  const handleClick = () => {
    if (notification.link) {
      if (!notification.read) {
        onMarkRead?.(notification.id);
      }
      onNavigate(notification.link);
    }
  };
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border p-4 ${!notification.read ? 'border-l-4 border-l-[#8B5CF6]' : ''} ${notification.link ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={notification.link ? handleClick : undefined}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${type.color} text-xl`}>
          {type.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
              {notification.title}
            </h4>
            {!notification.read && (
              <Circle className="w-2 h-2 fill-[#8B5CF6] text-[#8B5CF6] flex-shrink-0 mt-2" />
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">{getTimeAgo(notification.created_at)}</span>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {!notification.read && onMarkRead && (
                <button 
                  onClick={() => onMarkRead(notification.id)}
                  className="text-xs text-[#8B5CF6] hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Gelesen
                </button>
              )}
              {showArchiveButton && onArchive && (
                <button 
                  onClick={() => onArchive(notification.id, 'dismissed')}
                  className="text-xs text-gray-400 hover:text-amber-500 flex items-center gap-1"
                  title="Archivieren"
                >
                  <Archive className="w-3 h-3" />
                </button>
              )}
              <button 
                onClick={() => onDelete(notification.id)}
                className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchivedNotificationCard({ notification, onRestore, onDelete }) {
  const type = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.system;
  
  const getArchivedReasonLabel = (reason) => {
    switch (reason) {
      case 'dismissed': return 'Ignoriert';
      case 'rejected': return 'Abgelehnt';
      default: return 'Archiviert';
    }
  };
  
  return (
    <div className="bg-gray-50 rounded-xl border p-4 opacity-75">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${type.color} text-xl opacity-60`}>
          {type.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-gray-500">{notification.title}</h4>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              {getArchivedReasonLabel(notification.archived_reason)}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">Archiviert: {getTimeAgo(notification.archived_at)}</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onRestore(notification)}
                className="text-xs text-[#8B5CF6] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Wiederherstellen
              </button>
              <button 
                onClick={() => onDelete(notification.id)}
                className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Benachrichtigungen() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [archivedNotifications, setArchivedNotifications] = useState(DEMO_ARCHIVED);
  const [filter, setFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all_events');
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(createPageUrl('Register'));
    }
  }, [user, authLoading]);

  const handleMarkRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('Alle als gelesen markiert');
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Benachrichtigung gelöscht');
  };

  const handleDeleteArchived = (id) => {
    setArchivedNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Archivierte Benachrichtigung gelöscht');
  };

  const handleArchive = (id, reason) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      setArchivedNotifications(prev => [{
        ...notification,
        read: true,
        archived_at: new Date().toISOString(),
        archived_reason: reason,
      }, ...prev]);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Benachrichtigung archiviert');
    }
  };

  const handleRestore = (notification) => {
    const { archived_at, archived_reason, ...restoredNotification } = notification;
    setNotifications(prev => [restoredNotification, ...prev]);
    setArchivedNotifications(prev => prev.filter(n => n.id !== notification.id));
    toast.success('Benachrichtigung wiederhergestellt');
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success('Alle Benachrichtigungen gelöscht');
  };

  const handleClearAllArchived = () => {
    setArchivedNotifications([]);
    toast.success('Archiv geleert');
  };

  const filteredNotifications = notifications.filter(n => {
    // Basic filter
    let matchesFilter = true;
    if (filter === 'unread') {
      matchesFilter = !n.read;
    } else if (filter !== 'all') {
      matchesFilter = n.type === filter;
    }
    
    // Event-specific filter
    if (eventFilter !== 'all_events') {
      if (eventFilter === 'event_cancelled') {
        matchesFilter = matchesFilter && n.type === 'event_cancelled';
      } else if (eventFilter === 'event_updated') {
        matchesFilter = matchesFilter && n.type === 'event_updated';
      } else if (eventFilter === 'event_reminder') {
        matchesFilter = matchesFilter && (n.type === 'event_reminder' || n.type === 'erinnerung');
      }
    }
    
    return matchesFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const eventNotificationCount = notifications.filter(n => 
    ['event', 'event_cancelled', 'event_updated', 'event_reminder', 'erinnerung'].includes(n.type)
  ).length;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="p-4 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">🔔 Benachrichtigungen</h1>
            {unreadCount > 0 && (
              <span className="bg-[#8B5CF6] text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount} neu
              </span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(createPageUrl('Settings'))}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="active" className="flex-1">
              <Bell className="w-4 h-4 mr-1" /> Aktiv
              {unreadCount > 0 && (
                <span className="ml-1 bg-[#8B5CF6] text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex-1">
              <Archive className="w-4 h-4 mr-1" /> Archiv
              {archivedNotifications.length > 0 && (
                <span className="ml-1 bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                  {archivedNotifications.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-4">
            {/* Filter & Actions */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="unread">Ungelesen</SelectItem>
                    {Object.entries(NOTIFICATION_TYPES).map(([key, type]) => (
                      <SelectItem key={key} value={key}>{type.icon} {type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                      <CheckCheck className="w-4 h-4 mr-1" /> Alle gelesen
                    </Button>
                  )}
                </div>
              </div>

              {/* Event-specific filter */}
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
                {EVENT_FILTER_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setEventFilter(opt.id)}
                    className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                      eventFilter === opt.id 
                        ? 'bg-[#8B5CF6] text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-violet-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-[#8B5CF6]">{notifications.length}</p>
                <p className="text-xs text-violet-600">Gesamt</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-blue-600">{unreadCount}</p>
                <p className="text-xs text-blue-600">Ungelesen</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-rose-600">{eventNotificationCount}</p>
                <p className="text-xs text-rose-600">Events</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-amber-600">{archivedNotifications.length}</p>
                <p className="text-xs text-amber-600">Archiv</p>
              </div>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Keine Benachrichtigungen</p>
                {(filter !== 'all' || eventFilter !== 'all_events') && (
                  <Button variant="link" onClick={() => { setFilter('all'); setEventFilter('all_events'); }} className="mt-2">
                    Alle anzeigen
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map(notification => (
                  <NotificationCard 
                    key={notification.id} 
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    onNavigate={(link) => navigate(link)}
                  />
                ))}
              </div>
            )}

            {/* Clear All */}
            {notifications.length > 0 && (
              <div className="text-center pt-4">
                <button 
                  onClick={handleClearAll}
                  className="text-sm text-gray-400 hover:text-red-500"
                >
                  Alle löschen
                </button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Ignorierte und abgelehnte Benachrichtigungen
              </p>
              {archivedNotifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearAllArchived} className="text-red-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4 mr-1" /> Archiv leeren
                </Button>
              )}
            </div>

            {archivedNotifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Archive className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Keine archivierten Benachrichtigungen</p>
              </div>
            ) : (
              <div className="space-y-3">
                {archivedNotifications.map(notification => (
                  <ArchivedNotificationCard 
                    key={notification.id} 
                    notification={notification}
                    onRestore={handleRestore}
                    onDelete={handleDeleteArchived}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}