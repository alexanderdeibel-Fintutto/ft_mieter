import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function EventCalendar({ events, onSelectDate, selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday start
    
    const days = [];
    
    // Previous month days
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      
      // Direktes Datum-Match
      if (eventDate.toDateString() === date.toDateString()) {
        return true;
      }
      
      // Wiederkehrende Events
      if (event.isRecurring && date >= eventDate) {
        // Check Enddatum
        if (event.recurrenceEndDate && new Date(event.recurrenceEndDate) < date) {
          return false;
        }
        
        const dayOfWeek = date.getDay();
        const eventDayOfWeek = eventDate.getDay();
        
        if (event.recurrenceType === 'weekly') {
          return dayOfWeek === eventDayOfWeek;
        }
        if (event.recurrenceType === 'biweekly') {
          const diffTime = Math.abs(date - eventDate);
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const diffWeeks = Math.floor(diffDays / 7);
          return dayOfWeek === eventDayOfWeek && diffWeeks % 2 === 0;
        }
        if (event.recurrenceType === 'monthly') {
          return date.getDate() === eventDate.getDate();
        }
      }
      
      return false;
    });
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="bg-white rounded-xl border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h3 className="font-semibold text-gray-900">
          {currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </h3>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, isCurrentMonth }, index) => {
          const dayEvents = getEventsForDate(date);
          const hasEvents = dayEvents.length > 0;
          
          return (
            <button
              key={index}
              onClick={() => onSelectDate(date)}
              className={`
                relative p-2 text-sm rounded-lg transition-colors
                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                ${isToday(date) ? 'bg-violet-100 font-bold text-[#8B5CF6]' : ''}
                ${isSelected(date) ? 'bg-[#8B5CF6] text-white' : ''}
                ${hasEvents && !isSelected(date) ? 'font-medium' : ''}
                hover:bg-gray-100
                ${isSelected(date) ? 'hover:bg-[#8B5CF6]' : ''}
              `}
            >
              {date.getDate()}
              {hasEvents && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1 h-1 rounded-full ${isSelected(date) ? 'bg-white' : 'bg-[#8B5CF6]'}`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day events preview */}
      {selectedDate && (
        <div className="mt-4 pt-3 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Events am {selectedDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}
          </h4>
          {getEventsForDate(selectedDate).length > 0 ? (
            <div className="space-y-1.5">
              {getEventsForDate(selectedDate).map(event => (
                <div 
                  key={event.id} 
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm"
                >
                  <span className={`w-2 h-2 rounded-full ${
                    event.category === 'fest' ? 'bg-pink-500' :
                    event.category === 'sport' ? 'bg-blue-500' :
                    event.category === 'kultur' ? 'bg-purple-500' :
                    'bg-violet-500'
                  }`} />
                  <span className="flex-1 truncate font-medium">{event.title}</span>
                  <span className="text-gray-500 text-xs">{event.time}</span>
                  {event.isRecurring && (
                    <Repeat className="w-3 h-3 text-violet-500" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Keine Events</p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
          <span>Event</span>
        </div>
        <div className="flex items-center gap-1">
          <Repeat className="w-3 h-3 text-violet-500" />
          <span>Wiederkehrend</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-violet-100" />
          <span>Heute</span>
        </div>
      </div>
    </div>
  );
}