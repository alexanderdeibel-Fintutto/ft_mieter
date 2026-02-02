import React, { useState } from 'react';
import { Calendar, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function BookingDialog({ open, onOpenChange, service, onSubmit }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getNextDays = () => {
    const days = [];
    for (let i = 1; i <= 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      if (date.getDay() !== 0) { // Skip Sundays
        days.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })
        });
      }
    }
    return days;
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;
    
    setSubmitting(true);
    await onSubmit({
      serviceId: service.id,
      date: selectedDate,
      time: selectedTime,
      message
    });
    setSubmitting(false);
    setSelectedDate('');
    setSelectedTime('');
    setMessage('');
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Hilfe anfragen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {/* Service Info */}
          <div className="bg-violet-50 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {service.author.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{service.title}</p>
                <p className="text-sm text-gray-600">von {service.author}</p>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Wunschtermin
            </label>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger>
                <SelectValue placeholder="Tag auswählen" />
              </SelectTrigger>
              <SelectContent>
                {getNextDays().map(day => (
                  <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div>
              <label className="text-sm text-gray-600 mb-2 block flex items-center gap-1">
                <Clock className="w-4 h-4" /> Uhrzeit
              </label>
              <div className="grid grid-cols-5 gap-2">
                {TIME_SLOTS.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 text-sm rounded-lg border transition-all ${
                      selectedTime === time
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

          {/* Message */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> Nachricht (optional)
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Beschreibe kurz, wobei du Hilfe brauchst..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleSubmit}
              disabled={!selectedDate || !selectedTime || submitting}
              className="flex-1 bg-[#8B5CF6] hover:bg-violet-700"
            >
              {submitting ? 'Sende...' : 'Anfrage senden'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}