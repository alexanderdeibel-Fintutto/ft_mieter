import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, List, Search, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useAuth from '../components/useAuth';
import { createPageUrl } from '../utils';
import EventCard from '../components/events/EventCard';
import EventCalendar from '../components/events/EventCalendar';
import EventFilters from '../components/events/EventFilters';
import CreateEventDialog from '../components/events/CreateEventDialog';
import CancelEventDialog from '../components/events/CancelEventDialog';
import EventDetailDialog from '../components/events/EventDetailDialog';
import { createEventNotification } from '../components/events/EventNotification';
import { toast } from 'sonner';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// Demo events data
const DEMO_EVENTS = [
  {
    id: 1,
    title: 'Sommerfest im Innenhof',
    description: 'Gemeinsames Grillen und Feiern mit allen Nachbarn. Bringt Salate und gute Laune mit!',
    category: 'fest',
    categoryLabel: '🎉 Fest / Feier',
    date: '2026-02-15',
    time: '16:00',
    location: 'Innenhof',
    creator: 'Maria K.',
    creatorId: 'user-101',
    maxParticipants: 50,
    participants: ['user-101', 'user-102', 'user-103'],
    image: 'https://images.unsplash.com/photo-1529543544277-750e0c469b5d?w=400&h=200&fit=crop',
    isRecurring: false,
  },
  {
    id: 2,
    title: 'Hofflohmarkt',
    description: 'Räumt eure Keller und Dachböden aus! Verkauft oder tauscht mit den Nachbarn.',
    category: 'flohmarkt',
    categoryLabel: '🛍️ Flohmarkt',
    date: '2026-02-22',
    time: '10:00',
    location: 'Vorgarten & Gehweg',
    creator: 'Jonas M.',
    creatorId: 'user-102',
    maxParticipants: null,
    participants: ['user-102'],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop',
    isRecurring: false,
  },
  {
    id: 3,
    title: 'Lauftreff jeden Mittwoch',
    description: 'Gemeinsam joggen im Park. Alle Leistungsstufen willkommen!',
    category: 'sport',
    categoryLabel: '⚽ Sport & Bewegung',
    date: '2026-01-29',
    time: '18:30',
    location: 'Treffpunkt: Haupteingang',
    creator: 'Peter S.',
    creatorId: 'user-103',
    maxParticipants: 15,
    participants: ['user-103', 'user-102', 'current-user'],
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=200&fit=crop',
    isRecurring: true,
    recurrenceType: 'weekly',
    recurrenceDay: 3,
    recurrenceEndDate: '2026-06-30',
    recurrenceEndType: 'date',
  },
  {
    id: 4,
    title: 'Spielenachmittag für Kinder',
    description: 'Spielspaß im Gemeinschaftsraum. Brettspiele, Basteln und Snacks!',
    category: 'kinder',
    categoryLabel: '👶 Kinder & Familie',
    date: '2026-02-01',
    time: '15:00',
    location: 'Gemeinschaftsraum',
    creator: 'Maria K.',
    creatorId: 'user-101',
    maxParticipants: 20,
    participants: ['user-101'],
    image: 'https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=400&h=200&fit=crop',
    isRecurring: false,
  },
  {
    id: 5,
    title: 'Filmabend: Klassiker',
    description: 'Wir schauen gemeinsam "Das Leben ist schön". Popcorn wird gestellt!',
    category: 'kultur',
    categoryLabel: '🎭 Kultur',
    date: '2026-02-08',
    time: '19:30',
    location: 'Gemeinschaftsraum',
    creator: 'Jonas M.',
    creatorId: 'user-102',
    maxParticipants: 25,
    participants: ['user-102', 'user-101'],
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=200&fit=crop',
    isRecurring: false,
  },
];

const CATEGORIES = [
  { id: 'all', label: 'Alle' },
  { id: 'fest', label: '🎉 Feste' },
  { id: 'flohmarkt', label: '🛍️ Flohmarkt' },
  { id: 'sport', label: '⚽ Sport' },
  { id: 'kultur', label: '🎭 Kultur' },
  { id: 'kinder', label: '👶 Kinder' },
  { id: 'sonstiges', label: '📋 Sonstiges' },
];

export default function Events() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState(DEMO_EVENTS);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [cancellingEvent, setCancellingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [customDate, setCustomDate] = useState(null);
  const [selectedRecurrence, setSelectedRecurrence] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState('list');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(createPageUrl('Register'));
    }
  }, [user, authLoading]);

  const currentUserId = user?.id || 'current-user';

  const handleCreateEvent = (eventData) => {
    if (editingEvent) {
      // Update existing event
      const oldEvent = events.find(e => e.id === editingEvent.id);
      setEvents(events.map(e => 
        e.id === editingEvent.id 
          ? { ...e, ...eventData }
          : e
      ));
      
      // Notify participants about update
      if (oldEvent.participants?.length > 1) {
        const notification = createEventNotification('updated', { ...oldEvent, ...eventData });
        setNotifications(prev => [notification, ...prev]);
        toast.success(`Event aktualisiert! ${oldEvent.participants.length - 1} Teilnehmer wurden benachrichtigt.`);
      } else {
        toast.success('Event aktualisiert!');
      }
      
      setEditingEvent(null);
    } else {
      // Create new event
      const newEvent = {
        ...eventData,
        id: Date.now(),
        creator: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Du',
        creatorId: currentUserId,
        participants: [currentUserId],
        status: 'active',
      };
      setEvents([newEvent, ...events]);
      toast.success('Event erstellt!');
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowCreateDialog(true);
  };

  const handleCancelEvent = (event) => {
    setCancellingEvent(event);
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = (event, reason, notifyParticipants) => {
    setEvents(events.map(e => 
      e.id === event.id 
        ? { ...e, status: 'cancelled', cancelReason: reason }
        : e
    ));

    if (notifyParticipants && event.participants?.length > 1) {
      const notification = createEventNotification('cancelled', event, reason);
      setNotifications(prev => [notification, ...prev]);
      toast.success(`Event abgesagt! ${event.participants.length - 1} Teilnehmer wurden benachrichtigt.`);
    } else {
      toast.success('Event abgesagt!');
    }

    setCancellingEvent(null);
  };

  const handleJoinEvent = (event) => {
    const isJoined = event.participants?.includes(currentUserId);

    setEvents(events.map(e => {
      if (e.id === event.id) {
        if (isJoined) {
          return { ...e, participants: e.participants.filter(p => p !== currentUserId) };
        } else {
          return { ...e, participants: [...(e.participants || []), currentUserId] };
        }
      }
      return e;
    }));

    toast.success(isJoined ? 'Teilnahme zurückgezogen' : 'Du nimmst teil!');
  };

  const handleContactOrganizer = (event) => {
    navigate(createPageUrl('Chat') + `?recipient=${event.creatorId}`);
  };

  const handleOpenDetail = (event) => {
    setSelectedEvent(event);
  };

  const handleRSVPChange = (event, status) => {
    setEvents(events.map(e => {
      if (e.id === event.id) {
        const isCurrentlyJoined = e.participants?.includes(currentUserId);
        
        if (status === 'declined') {
          // Remove from participants
          return {
            ...e,
            participants: e.participants?.filter(p => p !== currentUserId) || [],
            participantsData: (e.participantsData || []).filter(p => p.id !== currentUserId)
          };
        } else {
          // Add or update participant
          const newParticipants = isCurrentlyJoined 
            ? e.participants 
            : [...(e.participants || []), currentUserId];
          
          const participantsData = e.participantsData || [];
          const existingIndex = participantsData.findIndex(p => p.id === currentUserId);
          
          if (existingIndex >= 0) {
            participantsData[existingIndex] = { ...participantsData[existingIndex], rsvpStatus: status };
          } else {
            participantsData.push({
              id: currentUserId,
              name: user?.user_metadata?.full_name || 'Du',
              rsvpStatus: status
            });
          }
          
          return {
            ...e,
            participants: newParticipants,
            participantsData
          };
        }
      }
      return e;
    }));

    // Update selected event if open
    if (selectedEvent?.id === event.id) {
      setSelectedEvent(prev => {
        const isCurrentlyJoined = prev.participants?.includes(currentUserId);
        
        if (status === 'declined') {
          return {
            ...prev,
            participants: prev.participants?.filter(p => p !== currentUserId) || [],
            participantsData: (prev.participantsData || []).filter(p => p.id !== currentUserId)
          };
        } else {
          const newParticipants = isCurrentlyJoined 
            ? prev.participants 
            : [...(prev.participants || []), currentUserId];
          
          const participantsData = prev.participantsData || [];
          const existingIndex = participantsData.findIndex(p => p.id === currentUserId);
          
          if (existingIndex >= 0) {
            participantsData[existingIndex] = { ...participantsData[existingIndex], rsvpStatus: status };
          } else {
            participantsData.push({
              id: currentUserId,
              name: user?.user_metadata?.full_name || 'Du',
              rsvpStatus: status
            });
          }
          
          return {
            ...prev,
            participants: newParticipants,
            participantsData
          };
        }
      });
    }

    const statusLabels = {
      attending: 'Du hast zugesagt!',
      maybe: 'Du hast mit Vielleicht geantwortet',
      declined: 'Du hast abgesagt'
    };
    toast.success(statusLabels[status]);
  };

  const handleAddEventComment = (eventId, comment) => {
    setEvents(events.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          comments: [...(e.comments || []), { ...comment, id: Date.now() }]
        };
      }
      return e;
    }));

    // Update selected event if open
    if (selectedEvent?.id === eventId) {
      setSelectedEvent(prev => ({
        ...prev,
        comments: [...(prev.comments || []), { ...comment, id: Date.now() }]
      }));
    }
  };

  const getDateRange = () => {
    const today = new Date();
    switch (selectedDateRange) {
      case 'today':
        return { start: startOfDay(today), end: endOfDay(today) };
      case 'week':
        return { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) };
      case 'month':
        return { start: startOfMonth(today), end: endOfMonth(today) };
      case 'custom':
        if (customDate) {
          return { start: startOfDay(customDate), end: endOfDay(customDate) };
        }
        return null;
      default:
        return null;
    }
  };

  const filteredEvents = events
    .filter(event => event.status !== 'cancelled')
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      
      // Datum-Filter
      let matchesDate = true;
      if (selectedDate) {
        matchesDate = new Date(event.date).toDateString() === selectedDate.toDateString();
      } else {
        const dateRange = getDateRange();
        if (dateRange) {
          const eventDate = new Date(event.date);
          matchesDate = isWithinInterval(eventDate, dateRange);
        }
      }
      
      // Wiederholungs-Filter
      const matchesRecurrence = selectedRecurrence === 'all' ||
        (selectedRecurrence === 'single' && !event.isRecurring) ||
        (selectedRecurrence === 'recurring' && event.isRecurring);
      
      return matchesSearch && matchesCategory && matchesDate && matchesRecurrence;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedDateRange('all');
    setCustomDate(null);
    setSelectedRecurrence('all');
    setSelectedDate(null);
  };

  const cancelledEvents = events.filter(e => e.status === 'cancelled');
  const upcomingEvents = filteredEvents.filter(e => new Date(e.date) >= new Date());
  const pastEvents = filteredEvents.filter(e => new Date(e.date) < new Date());

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Nachbarschafts-Events</h1>
          <Button 
            onClick={() => {
              setEditingEvent(null);
              setShowCreateDialog(true);
            }}
            size="sm"
            className="bg-white text-[#8B5CF6] hover:bg-gray-100"
          >
            <Plus className="w-4 h-4 mr-1" /> Event
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Events suchen..."
            className="pl-9 bg-white/90 border-0"
          />
        </div>
      </div>

      <div className="px-4 -mt-3">
        {/* View Toggle & Filter Button */}
        <div className="flex gap-2 mb-4">
          <div className="bg-white rounded-xl shadow-sm border p-1 flex gap-1 flex-1">
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className={`flex-1 ${view === 'list' ? 'bg-[#8B5CF6]' : ''}`}
            >
              <List className="w-4 h-4 mr-1" /> Liste
            </Button>
            <Button
              variant={view === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('calendar')}
              className={`flex-1 ${view === 'calendar' ? 'bg-[#8B5CF6]' : ''}`}
            >
              <Calendar className="w-4 h-4 mr-1" /> Kalender
            </Button>
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-[#8B5CF6]' : ''}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mb-4">
            <EventFilters
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedDateRange={selectedDateRange}
              onDateRangeChange={setSelectedDateRange}
              customDate={customDate}
              onCustomDateChange={setCustomDate}
              selectedRecurrence={selectedRecurrence}
              onRecurrenceChange={setSelectedRecurrence}
              onClearFilters={handleClearFilters}
            />
          </div>
        )}

        {/* Quick Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === cat.id 
                  ? 'bg-[#8B5CF6] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Selected Date Filter */}
        {selectedDate && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-violet-50 rounded-lg">
            <Calendar className="w-4 h-4 text-[#8B5CF6]" />
            <span className="text-sm text-gray-700">
              Events am {selectedDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <Button variant="ghost" size="icon" className="ml-auto h-6 w-6" onClick={() => setSelectedDate(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {view === 'calendar' ? (
          <div className="space-y-4">
            <EventCalendar 
              events={events.filter(e => e.status !== 'cancelled')} 
              onSelectDate={setSelectedDate}
              selectedDate={selectedDate}
            />
            
            {filteredEvents.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">
                  {selectedDate ? 'Events an diesem Tag' : 'Kommende Events'}
                </h3>
                {(selectedDate ? filteredEvents : upcomingEvents).slice(0, 5).map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onJoin={handleJoinEvent}
                    onContact={handleContactOrganizer}
                    onEdit={handleEditEvent}
                    onCancel={handleCancelEvent}
                    onOpenDetail={handleOpenDetail}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                {selectedDate ? 'Keine Events an diesem Tag' : 'Keine Events gefunden'}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Kommende Events ({upcomingEvents.length})</h3>
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onJoin={handleJoinEvent}
                      onContact={handleContactOrganizer}
                      onEdit={handleEditEvent}
                      onCancel={handleCancelEvent}
                      onOpenDetail={handleOpenDetail}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-500 mb-3">Vergangene Events ({pastEvents.length})</h3>
                <div className="space-y-3">
                  {pastEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onJoin={handleJoinEvent}
                      onContact={handleContactOrganizer}
                      onEdit={handleEditEvent}
                      onCancel={handleCancelEvent}
                      onOpenDetail={handleOpenDetail}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Cancelled Events */}
            {cancelledEvents.length > 0 && (
              <div>
                <h3 className="font-medium text-red-500 mb-3">Abgesagte Events ({cancelledEvents.length})</h3>
                <div className="space-y-3">
                  {cancelledEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onJoin={handleJoinEvent}
                      onContact={handleContactOrganizer}
                      onEdit={handleEditEvent}
                      onCancel={handleCancelEvent}
                      onOpenDetail={handleOpenDetail}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredEvents.length === 0 && cancelledEvents.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Keine Events gefunden</p>
                <Button 
                  onClick={() => {
                    setEditingEvent(null);
                    setShowCreateDialog(true);
                  }}
                  className="mt-4 bg-[#8B5CF6] hover:bg-violet-700"
                >
                  <Plus className="w-4 h-4 mr-1" /> Erstes Event erstellen
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateEventDialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) setEditingEvent(null);
        }}
        onSubmit={handleCreateEvent}
        editEvent={editingEvent}
      />

      <CancelEventDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        event={cancellingEvent}
        onConfirm={handleConfirmCancel}
      />

      <EventDetailDialog
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
        event={selectedEvent}
        currentUserId={currentUserId}
        onRSVPChange={handleRSVPChange}
        onAddComment={handleAddEventComment}
        onEdit={handleEditEvent}
        onCancel={handleCancelEvent}
      />
    </div>
  );
}