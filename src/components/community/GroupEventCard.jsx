import React from 'react';
import { Calendar, Clock, MapPin, Users, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function GroupEventCard({ event, currentUserId, onJoin }) {
  const isParticipant = event.participants?.includes(currentUserId);
  const isPast = new Date(event.date) < new Date();

  return (
    <div className={`bg-white rounded-xl border overflow-hidden ${isPast ? 'opacity-60' : ''}`}>
      {event.image && (
        <div className="h-28 relative">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          {isPast && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge className="bg-gray-800 text-white">Vergangen</Badge>
            </div>
          )}
        </div>
      )}
      
      <div className="p-3">
        <h4 className="font-semibold text-sm">{event.title}</h4>
        
        <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(event.date), 'EEE, dd. MMM', { locale: de })}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {event.time}
          </div>
          {event.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {event.location}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Users className="w-3 h-3" />
            {event.participants?.length || 0} Teilnehmer
          </div>
          
          {!isPast && (
            <Button
              size="sm"
              variant={isParticipant ? 'outline' : 'default'}
              className={isParticipant ? '' : 'bg-[#8B5CF6] hover:bg-violet-700'}
              onClick={() => onJoin(event.id)}
            >
              {isParticipant ? (
                <>
                  <Check className="w-3 h-3 mr-1" /> Dabei
                </>
              ) : (
                'Teilnehmen'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}