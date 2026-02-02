import React from 'react';
import { Calendar, Clock, Star, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATUS_CONFIG = {
  pending: { label: 'Ausstehend', icon: AlertCircle, color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Bestätigt', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  completed: { label: 'Abgeschlossen', icon: CheckCircle, color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Abgesagt', icon: XCircle, color: 'bg-red-100 text-red-700' },
};

export default function MyBookings({ bookings, onReview, onCancel }) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Keine Buchungen vorhanden</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map(booking => {
        const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
        const StatusIcon = status.icon;
        const isPast = new Date(booking.date) < new Date();
        const canReview = booking.status === 'completed' && !booking.reviewed;
        const canCancel = booking.status === 'pending' && !isPast;

        return (
          <div key={booking.id} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">{booking.serviceTitle}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">mit {booking.providerName}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(booking.date).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {booking.time} Uhr
                  </span>
                </div>
                {booking.message && (
                  <p className="text-sm text-gray-500 mt-2 italic">"{booking.message}"</p>
                )}
              </div>
            </div>

            {(canReview || canCancel) && (
              <div className="flex gap-2 mt-3 pt-3 border-t">
                {canReview && (
                  <Button 
                    onClick={() => onReview(booking)}
                    size="sm"
                    className="bg-[#8B5CF6] hover:bg-violet-700"
                  >
                    <Star className="w-4 h-4 mr-1" /> Bewerten
                  </Button>
                )}
                {canCancel && (
                  <Button 
                    onClick={() => onCancel(booking)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    Stornieren
                  </Button>
                )}
              </div>
            )}

            {booking.reviewed && (
              <div className="flex items-center gap-1 mt-3 pt-3 border-t text-sm text-gray-500">
                <span>Deine Bewertung:</span>
                {Array(5).fill(0).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${i < booking.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}