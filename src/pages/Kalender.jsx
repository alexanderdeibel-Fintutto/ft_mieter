import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Trash2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuth from '../components/useAuth';
import { createPageUrl } from '../utils';

const EVENT_TYPES = {
  muell: { label: 'Müllabfuhr', color: 'bg-green-500', icon: '🗑️' },
  wartung: { label: 'Wartung', color: 'bg-orange-500', icon: '🔧' },
  reinigung: { label: 'Reinigung', color: 'bg-blue-500', icon: '🧹' },
  versammlung: { label: 'Versammlung', color: 'bg-violet-500', icon: '👥' },
  termin: { label: 'Termin', color: 'bg-pink-500', icon: '📅' },
};

// Demo events
const DEMO_EVENTS = [
  { id: 1, type: 'muell', title: 'Restmüll', date: getNextWeekday(1) }, // Monday
  { id: 2, type: 'muell', title: 'Gelbe Tonne', date: getNextWeekday(3) }, // Wednesday
  { id: 3, type: 'muell', title: 'Papiermüll', date: getNextWeekday(5) }, // Friday
  { id: 4, type: 'wartung', title: 'Heizungswartung', date: getDateInDays(10) },
  { id: 5, type: 'reinigung', title: 'Treppenhausreinigung', date: getDateInDays(3) },
  { id: 6, type: 'versammlung', title: 'Eigentümerversammlung', date: getDateInDays(14) },
];

function getNextWeekday(targetDay) {
  const today = new Date();
  const diff = (targetDay - today.getDay() + 7) % 7 || 7;
  const next = new Date(today);
  next.setDate(today.getDate() + diff);
  return next.toISOString().split('T')[0];
}

function getDateInDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function EventBadge({ event }) {
  const type = EVENT_TYPES[event.type] || EVENT_TYPES.termin;
  return (
    <div className={`${type.color} text-white text-xs px-2 py-1 rounded-full truncate flex items-center gap-1`}>
      <span>{type.icon}</span>
      <span className="truncate">{event.title}</span>
    </div>
  );
}

function EventCard({ event }) {
  const type = EVENT_TYPES[event.type] || EVENT_TYPES.termin;
  const eventDate = new Date(event.date);
  const isToday = new Date().toDateString() === eventDate.toDateString();
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 flex items-center gap-3 ${isToday ? 'ring-2 ring-[#8B5CF6]' : ''}`}>
      <div className={`w-12 h-12 ${type.color} rounded-xl flex items-center justify-center text-2xl`}>
        {type.icon}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{event.title}</h4>
        <p className="text-sm text-gray-500">
          {eventDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'short' })}
          {isToday && <span className="ml-2 text-[#8B5CF6] font-medium">Heute!</span>}
        </p>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full ${type.color} bg-opacity-20 text-gray-700`}>
        {type.label}
      </span>
    </div>
  );
}

export default function Kalender() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState(DEMO_EVENTS);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(createPageUrl('Register'));
    }
  }, [user, authLoading]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr);
  };

  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="p-4 border-b bg-white">
        <h1 className="text-xl font-bold text-gray-900">📆 Kalender</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="font-semibold text-lg">
              {currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
            {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map(d => (
              <div key={d} className="py-1 font-medium">{d}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (!day) return <div key={i} className="aspect-square" />;
              
              const dayEvents = getEventsForDate(day);
              const isToday = day.getTime() === today.getTime();
              const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
              
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square p-1 rounded-lg transition-all relative ${
                    isSelected ? 'bg-[#8B5CF6] text-white' :
                    isToday ? 'bg-violet-100 text-[#8B5CF6] font-bold' :
                    'hover:bg-gray-100'
                  }`}
                >
                  <span className="text-sm">{day.getDate()}</span>
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayEvents.slice(0, 3).map((e, idx) => (
                        <div 
                          key={idx} 
                          className={`w-1.5 h-1.5 rounded-full ${EVENT_TYPES[e.type]?.color || 'bg-gray-400'}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Events */}
        {selectedDate && (
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="font-semibold mb-3">
              {selectedDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            {selectedDateEvents.length === 0 ? (
              <p className="text-gray-500 text-sm">Keine Termine an diesem Tag</p>
            ) : (
              <div className="space-y-2">
                {selectedDateEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upcoming Events */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#8B5CF6]" />
            Anstehende Termine
          </h2>
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-medium text-gray-700 mb-2">Legende</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(EVENT_TYPES).map(([key, type]) => (
              <div key={key} className="flex items-center gap-1 text-xs">
                <div className={`w-3 h-3 rounded-full ${type.color}`} />
                <span className="text-gray-600">{type.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}