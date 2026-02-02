import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Star, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATUS_CONFIG = {
  pending: { label: 'Ausstehend', color: 'bg-yellow-500', dotColor: 'bg-yellow-400' },
  confirmed: { label: 'Bestätigt', color: 'bg-green-500', dotColor: 'bg-green-400' },
  completed: { label: 'Abgeschlossen', color: 'bg-blue-500', dotColor: 'bg-blue-400' },
  cancelled: { label: 'Abgesagt', color: 'bg-red-500', dotColor: 'bg-red-400' },
};

export default function BookingCalendar({ bookings, onSelectBooking, onReview }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty slots for days before first day of month
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getBookingsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(b => b.date === dateStr);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const days = getDaysInMonth();
  const today = new Date();
  const selectedBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h3 className="font-semibold text-gray-900">
          {currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </h3>
        <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
          <div key={day} className="text-xs font-medium text-gray-500 py-2">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="h-12" />;
          }

          const dateBookings = getBookingsForDate(date);
          const hasBookings = dateBookings.length > 0;
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const isPast = date < new Date(today.setHours(0,0,0,0));

          return (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`h-12 rounded-lg flex flex-col items-center justify-center relative transition-all ${
                isSelected
                  ? 'bg-[#8B5CF6] text-white'
                  : isToday
                    ? 'bg-violet-100 text-[#8B5CF6] font-bold'
                    : isPast
                      ? 'text-gray-300'
                      : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-sm">{date.getDate()}</span>
              {hasBookings && (
                <div className="flex gap-0.5 mt-0.5">
                  {dateBookings.slice(0, 3).map((b, i) => (
                    <span 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white/70' : STATUS_CONFIG[b.status]?.dotColor || 'bg-gray-400'
                      }`} 
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Bookings */}
      {selectedDate && (
        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium text-gray-900 mb-3">
            {selectedDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h4>
          
          {selectedBookings.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Keine Termine an diesem Tag</p>
          ) : (
            <div className="space-y-2">
              {selectedBookings.map(booking => {
                const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                const canReview = booking.status === 'completed' && !booking.reviewed;

                return (
                  <div 
                    key={booking.id} 
                    className={`p-3 rounded-lg border-l-4 bg-gray-50 ${status.color.replace('bg-', 'border-')}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{booking.serviceTitle}</p>
                        <p className="text-xs text-gray-500">mit {booking.providerName}</p>
                      </div>
                      <div className="text-right">
                        <span className="flex items-center gap-1 text-sm text-gray-700">
                          <Clock className="w-3 h-3" /> {booking.time}
                        </span>
                        <span className={`text-xs ${status.color.replace('bg-', 'text-').replace('-500', '-700')}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    {canReview && (
                      <Button 
                        onClick={() => onReview(booking)}
                        size="sm"
                        className="mt-2 w-full bg-[#8B5CF6] hover:bg-violet-700"
                      >
                        <Star className="w-4 h-4 mr-1" /> Jetzt bewerten
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-2 border-t">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <span key={key} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
            {config.label}
          </span>
        ))}
      </div>
    </div>
  );
}