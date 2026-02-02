import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, MessageCircle, Repeat, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '../../utils';

const RECURRENCE_LABELS = {
  weekly: 'Wöchentlich',
  biweekly: 'Alle 2 Wochen',
  monthly: 'Monatlich',
};

const formatEndDate = (endDate, endType) => {
  if (!endDate && !endType) return null;
  if (endType === 'never') return null;
  if (endType === 'count' && endDate) return `nach ${endDate}x`;
  if (endDate) {
    return `bis ${new Date(endDate).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }
  return null;
};

export default function EventCard({ event, onJoin, onContact, onEdit, onCancel, onOpenDetail, currentUserId }) {
  const isJoined = event.participants?.includes(currentUserId);
  const isPast = new Date(event.date) < new Date();
  const isCancelled = event.status === 'cancelled';
  const isCreator = event.creatorId === currentUserId;
  const spotsLeft = event.maxParticipants ? event.maxParticipants - (event.participants?.length || 0) : null;

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border overflow-hidden ${isPast || isCancelled ? 'opacity-60' : ''} cursor-pointer hover:shadow-md transition-shadow`}
      onClick={() => onOpenDetail?.(event)}
    >
      {event.image && (
        <div className="h-32 bg-gradient-to-br from-violet-400 to-purple-500 relative">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 flex gap-1">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              event.category === 'fest' ? 'bg-pink-100 text-pink-700' :
              event.category === 'flohmarkt' ? 'bg-green-100 text-green-700' :
              event.category === 'sport' ? 'bg-blue-100 text-blue-700' :
              event.category === 'kultur' ? 'bg-purple-100 text-purple-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {event.categoryLabel}
            </span>
            {event.isRecurring && (
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-violet-100 text-violet-700 flex items-center gap-1">
                <Repeat className="w-3 h-3" />
                {RECURRENCE_LABELS[event.recurrenceType]}
              </span>
            )}
          </div>
          {isCancelled && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">ABGESAGT</span>
            </div>
          )}
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-semibold text-gray-900 ${isCancelled ? 'line-through' : ''}`}>{event.title}</h3>
          <div className="flex gap-1">
            {isPast && !isCancelled && (
              <Badge variant="secondary" className="text-xs">Vergangen</Badge>
            )}
            {isCancelled && (
              <Badge variant="destructive" className="text-xs">Abgesagt</Badge>
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>

        <div className="flex flex-col gap-1.5 mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(event.date).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            {event.isRecurring && (
              <>
                <span className="text-[#8B5CF6]">• {RECURRENCE_LABELS[event.recurrenceType]}</span>
                {formatEndDate(event.recurrenceEndDate, event.recurrenceEndType) && (
                  <span className="text-gray-400 text-xs">({formatEndDate(event.recurrenceEndDate, event.recurrenceEndType)})</span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{event.time} Uhr</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>
              {event.participants?.length || 0} Teilnehmer
              {spotsLeft !== null && spotsLeft > 0 && ` · ${spotsLeft} Plätze frei`}
              {spotsLeft === 0 && ' · Ausgebucht'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          <Link 
            to={createPageUrl('NachbarProfil') + `?id=${event.creatorId}`}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {event.creator.charAt(0)}
            </div>
            <span className="text-xs text-gray-600">{event.creator}</span>
          </Link>
        </div>

        {!isCancelled && (
          <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
            {!isPast && (
              <>
                <Button 
                  onClick={() => onJoin(event)}
                  className={`flex-1 ${isJoined ? 'bg-green-600 hover:bg-green-700' : 'bg-[#8B5CF6] hover:bg-violet-700'}`}
                  size="sm"
                  disabled={!isJoined && spotsLeft === 0}
                >
                  <Users className="w-4 h-4 mr-1" />
                  {isJoined ? 'Teilnahme ✓' : 'Teilnehmen'}
                </Button>
                <Button 
                  onClick={() => onContact(event)}
                  variant="outline"
                  size="sm"
                  title="Organisator kontaktieren"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </>
            )}
            {isCreator && !isPast && (
              <>
                <Button 
                  onClick={() => onEdit(event)}
                  variant="outline"
                  size="sm"
                  title="Event bearbeiten"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={() => onCancel(event)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Event absagen"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}