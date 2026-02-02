import React, { useState } from 'react';
import { Calendar, Clock, Repeat, MessageCircle, CreditCard, Wallet, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00'
];

const RECURRENCE_OPTIONS = [
  { value: 'weekly', label: 'Wöchentlich', description: 'Jeden Woche am selben Tag' },
  { value: 'biweekly', label: 'Alle 2 Wochen', description: 'Jeden zweiten Woche' },
  { value: 'monthly', label: 'Monatlich', description: 'Einmal pro Monat' },
];

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Barzahlung', icon: Wallet, description: 'Direkt vor Ort bezahlen' },
  { id: 'app', label: 'In-App Zahlung', icon: CreditCard, description: 'Sicher über die App bezahlen' },
];

export default function RecurringBookingDialog({ open, onOpenChange, service, onSubmit }) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState('weekly');
  const [recurrenceCount, setRecurrenceCount] = useState(4);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [submitting, setSubmitting] = useState(false);

  const getNextDays = () => {
    const days = [];
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      if (date.getDay() !== 0) {
        days.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' }),
          weekday: date.toLocaleDateString('de-DE', { weekday: 'long' }),
        });
      }
    }
    return days;
  };

  const calculateRecurringDates = () => {
    if (!selectedDate || !isRecurring) return [selectedDate];
    
    const dates = [selectedDate];
    const startDate = new Date(selectedDate);
    
    for (let i = 1; i < recurrenceCount; i++) {
      const nextDate = new Date(startDate);
      if (recurrence === 'weekly') {
        nextDate.setDate(startDate.getDate() + (i * 7));
      } else if (recurrence === 'biweekly') {
        nextDate.setDate(startDate.getDate() + (i * 14));
      } else if (recurrence === 'monthly') {
        nextDate.setMonth(startDate.getMonth() + i);
      }
      dates.push(nextDate.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const calculateTotal = () => {
    const price = service?.priceValue || 0;
    const count = isRecurring ? recurrenceCount : 1;
    return price * count;
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Bitte wähle Datum und Uhrzeit');
      return;
    }
    
    setSubmitting(true);
    
    const bookingData = {
      serviceId: service.id,
      dates: calculateRecurringDates(),
      time: selectedTime,
      message,
      isRecurring,
      recurrence: isRecurring ? recurrence : null,
      recurrenceCount: isRecurring ? recurrenceCount : 1,
      paymentMethod,
      totalAmount: calculateTotal(),
    };
    
    await onSubmit(bookingData);
    setSubmitting(false);
    
    // Reset
    setStep(1);
    setSelectedDate('');
    setSelectedTime('');
    setMessage('');
    setIsRecurring(false);
    setRecurrence('weekly');
    setRecurrenceCount(4);
    setPaymentMethod('cash');
  };

  if (!service) return null;

  const recurringDates = calculateRecurringDates();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && 'Termin wählen'}
            {step === 2 && 'Wiederholung & Nachricht'}
            {step === 3 && 'Zahlung & Bestätigung'}
          </DialogTitle>
        </DialogHeader>
        
        {/* Progress */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map(s => (
            <div 
              key={s}
              className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-[#8B5CF6]' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        {/* Service Info */}
        <div className="bg-violet-50 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
              {service.author?.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{service.title}</p>
              <p className="text-sm text-gray-600">von {service.author}</p>
            </div>
            {service.priceValue > 0 && (
              <Badge className="bg-green-100 text-green-700">
                {service.priceValue}€
              </Badge>
            )}
          </div>
        </div>

        {/* Step 1: Date & Time */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Datum wählen
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

            {selectedDate && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Uhrzeit wählen
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

            <Button 
              onClick={() => setStep(2)}
              disabled={!selectedDate || !selectedTime}
              className="w-full bg-[#8B5CF6] hover:bg-violet-700"
            >
              Weiter
            </Button>
          </div>
        )}

        {/* Step 2: Recurrence & Message */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Recurring Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-[#8B5CF6]" />
                <span className="text-sm font-medium">Wiederkehrende Buchung</span>
              </div>
              <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
            </div>

            {isRecurring && (
              <div className="space-y-3 p-3 border rounded-lg bg-violet-50/50">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Wiederholung</label>
                  <RadioGroup value={recurrence} onValueChange={setRecurrence}>
                    {RECURRENCE_OPTIONS.map(opt => (
                      <div key={opt.value} className="flex items-center space-x-3 py-2">
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <label htmlFor={opt.value} className="flex-1 cursor-pointer">
                          <span className="text-sm font-medium">{opt.label}</span>
                          <p className="text-xs text-gray-500">{opt.description}</p>
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Anzahl Termine</label>
                  <Select value={recurrenceCount.toString()} onValueChange={(v) => setRecurrenceCount(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 4, 6, 8, 12].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n} Termine</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Preview dates */}
                <div className="text-xs text-gray-500">
                  <p className="font-medium mb-1">Geplante Termine:</p>
                  <div className="flex flex-wrap gap-1">
                    {recurringDates.slice(0, 4).map((d, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                      </Badge>
                    ))}
                    {recurringDates.length > 4 && (
                      <Badge variant="outline" className="text-xs">+{recurringDates.length - 4} weitere</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                <MessageCircle className="w-4 h-4" /> Nachricht
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Beschreibe kurz, wobei du Hilfe brauchst..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Zurück
              </Button>
              <Button 
                onClick={() => setStep(3)}
                className="flex-1 bg-[#8B5CF6] hover:bg-violet-700"
              >
                Weiter
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment & Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Payment Method */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Zahlungsart</label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {PAYMENT_METHODS.map(method => (
                  <div 
                    key={method.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      paymentMethod === method.id 
                        ? 'border-[#8B5CF6] bg-violet-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <RadioGroupItem value={method.id} id={method.id} />
                    <method.icon className="w-5 h-5 text-gray-500" />
                    <label htmlFor={method.id} className="flex-1 cursor-pointer">
                      <span className="text-sm font-medium">{method.label}</span>
                      <p className="text-xs text-gray-500">{method.description}</p>
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
              <h4 className="font-medium text-gray-900">Zusammenfassung</h4>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dienstleistung</span>
                <span>{service.title}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Erster Termin</span>
                <span>{new Date(selectedDate).toLocaleDateString('de-DE')} um {selectedTime}</span>
              </div>
              
              {isRecurring && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Anzahl Termine</span>
                  <span>{recurrenceCount}x {RECURRENCE_OPTIONS.find(o => o.value === recurrence)?.label}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Zahlung</span>
                <span>{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}</span>
              </div>
              
              {service.priceValue > 0 && (
                <>
                  <div className="border-t pt-2 mt-2" />
                  <div className="flex justify-between font-medium">
                    <span>Gesamt</span>
                    <span className="text-[#8B5CF6]">{calculateTotal()}€</span>
                  </div>
                </>
              )}
            </div>

            {/* Info */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>Der Anbieter erhält deine Anfrage und kann diese bestätigen oder ablehnen. Du wirst benachrichtigt.</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Zurück
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-[#8B5CF6] hover:bg-violet-700"
              >
                {submitting ? 'Sende...' : 'Buchung anfragen'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}