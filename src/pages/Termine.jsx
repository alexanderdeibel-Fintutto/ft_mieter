import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Plus, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import useAuth from '../components/useAuth';
import { supabase } from '../components/services/supabase';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';

const SERVICE_TYPES = [
  { id: 'hausmeister', label: 'Hausmeister', icon: '🔧', color: 'bg-blue-100 text-blue-700' },
  { id: 'handwerker', label: 'Handwerker', icon: '🛠️', color: 'bg-orange-100 text-orange-700' },
  { id: 'reinigung', label: 'Reinigung', icon: '🧹', color: 'bg-green-100 text-green-700' },
  { id: 'verwaltung', label: 'Hausverwaltung', icon: '📋', color: 'bg-violet-100 text-violet-700' },
];

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

function AppointmentCard({ appointment, onCancel }) {
  const service = SERVICE_TYPES.find(s => s.id === appointment.service_type) || SERVICE_TYPES[0];
  const isPast = new Date(appointment.date) < new Date();
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 ${isPast ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${service.color}`}>
          <span className="text-lg">{service.icon}</span>
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{service.label}</h4>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(appointment.date).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            <Clock className="w-4 h-4 ml-2" />
            <span>{appointment.time} Uhr</span>
          </div>
          {appointment.notes && (
            <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {appointment.status === 'confirmed' ? 'Bestätigt' : 
             appointment.status === 'pending' ? 'Ausstehend' : 'Abgesagt'}
          </span>
          {!isPast && appointment.status !== 'cancelled' && (
            <button onClick={() => onCancel(appointment)} className="text-xs text-red-500 hover:underline">
              Absagen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarView({ selectedDate, onSelectDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty days for padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="font-medium">
          {currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
        {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map(d => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={i} />;
          
          const isToday = day.getTime() === today.getTime();
          const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
          const isPast = day < today;
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          
          return (
            <button
              key={i}
              onClick={() => !isPast && !isWeekend && onSelectDate(day)}
              disabled={isPast || isWeekend}
              className={`p-2 text-sm rounded-lg transition-all ${
                isSelected ? 'bg-[#8B5CF6] text-white' :
                isToday ? 'bg-violet-100 text-[#8B5CF6] font-medium' :
                isPast || isWeekend ? 'text-gray-300 cursor-not-allowed' :
                'hover:bg-gray-100'
              }`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Termine() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookingForm, setBookingForm] = useState({ service_type: '', time: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(createPageUrl('Register'));
      return;
    }
    if (user) loadAppointments();
  }, [user, authLoading]);

  const loadAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('tenant_id', user.id)
      .order('date', { ascending: true });
    
    if (!error && data && data.length > 0) {
      setAppointments(data);
    } else {
      // Demo appointments
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      setAppointments([
        { id: 'demo-1', service_type: 'hausmeister', date: tomorrow.toISOString().split('T')[0], time: '10:00', status: 'confirmed', notes: 'Heizung prüfen' },
        { id: 'demo-2', service_type: 'reinigung', date: nextWeek.toISOString().split('T')[0], time: '09:00', status: 'pending', notes: 'Treppenhausreinigung' },
      ]);
    }
    setLoading(false);
  };

  const handleBooking = async () => {
    if (!selectedDate || !bookingForm.service_type || !bookingForm.time) {
      toast.error('Bitte fülle alle Pflichtfelder aus');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('appointments').insert({
        tenant_id: user.id,
        service_type: bookingForm.service_type,
        date: selectedDate.toISOString().split('T')[0],
        time: bookingForm.time,
        notes: bookingForm.notes,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Termin erfolgreich gebucht');
      setBookingDialogOpen(false);
      setBookingForm({ service_type: '', time: '', notes: '' });
      setSelectedDate(null);
      loadAppointments();
    } catch (error) {
      // Demo mode
      const newAppointment = {
        id: `demo-${Date.now()}`,
        service_type: bookingForm.service_type,
        date: selectedDate.toISOString().split('T')[0],
        time: bookingForm.time,
        notes: bookingForm.notes,
        status: 'pending',
      };
      setAppointments(prev => [...prev, newAppointment].sort((a, b) => new Date(a.date) - new Date(b.date)));
      toast.success('Termin gebucht (Demo)');
      setBookingDialogOpen(false);
      setBookingForm({ service_type: '', time: '', notes: '' });
      setSelectedDate(null);
    }
    setSubmitting(false);
  };

  const handleCancel = async (appointment) => {
    if (appointment.id.startsWith('demo-')) {
      setAppointments(prev => prev.map(a => 
        a.id === appointment.id ? { ...a, status: 'cancelled' } : a
      ));
      toast.success('Termin abgesagt (Demo)');
      return;
    }

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointment.id);

    if (error) {
      toast.error('Fehler beim Absagen');
    } else {
      toast.success('Termin abgesagt');
      loadAppointments();
    }
  };

  const upcomingAppointments = appointments.filter(a => new Date(a.date) >= new Date() && a.status !== 'cancelled');
  const pastAppointments = appointments.filter(a => new Date(a.date) < new Date() || a.status === 'cancelled');

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="p-4 border-b bg-white flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">📅 Termine</h1>
        <Button 
          onClick={() => setBookingDialogOpen(true)}
          className="bg-[#8B5CF6] hover:bg-violet-700"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Buchen
        </Button>
      </header>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-violet-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-[#8B5CF6]">{upcomingAppointments.length}</p>
            <p className="text-xs text-violet-600">Anstehend</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-600">
              {appointments.filter(a => a.status === 'confirmed').length}
            </p>
            <p className="text-xs text-green-600">Bestätigt</p>
          </div>
        </div>

        {/* Upcoming */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Anstehende Termine</h2>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-xl border">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Keine anstehenden Termine</p>
              <Button 
                onClick={() => setBookingDialogOpen(true)} 
                className="mt-3 bg-[#8B5CF6] hover:bg-violet-700"
                size="sm"
              >
                Termin buchen
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map(a => (
                <AppointmentCard key={a.id} appointment={a} onCancel={handleCancel} />
              ))}
            </div>
          )}
        </div>

        {/* Past */}
        {pastAppointments.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Vergangene Termine</h2>
            <div className="space-y-3">
              {pastAppointments.slice(0, 3).map(a => (
                <AppointmentCard key={a.id} appointment={a} onCancel={handleCancel} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Termin buchen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Service Type */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Service wählen</label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_TYPES.map(service => (
                  <button
                    key={service.id}
                    onClick={() => setBookingForm(prev => ({ ...prev, service_type: service.id }))}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      bookingForm.service_type === service.id
                        ? 'border-[#8B5CF6] bg-violet-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{service.icon}</span>
                    <p className="text-sm font-medium mt-1">{service.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Datum wählen</label>
              <CalendarView selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Uhrzeit wählen</label>
                <div className="grid grid-cols-5 gap-2">
                  {TIME_SLOTS.map(time => (
                    <button
                      key={time}
                      onClick={() => setBookingForm(prev => ({ ...prev, time }))}
                      className={`py-2 px-3 text-sm rounded-lg border transition-all ${
                        bookingForm.time === time
                          ? 'border-[#8B5CF6] bg-[#8B5CF6] text-white'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Anmerkungen (optional)</label>
              <Textarea
                value={bookingForm.notes}
                onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="z.B. Heizung funktioniert nicht richtig..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleBooking} 
                disabled={submitting || !selectedDate || !bookingForm.service_type || !bookingForm.time}
                className="flex-1 bg-[#8B5CF6] hover:bg-violet-700"
              >
                {submitting ? 'Buche...' : 'Termin buchen'}
              </Button>
              <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>
                Abbrechen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}