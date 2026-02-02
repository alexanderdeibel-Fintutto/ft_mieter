import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, Euro, MessageCircle, Calendar, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '../../utils';

const STATUS_CONFIG = {
  offen: { label: 'Offen', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  in_bearbeitung: { label: 'In Bearbeitung', color: 'bg-yellow-100 text-yellow-700', icon: Loader2 },
  abgeschlossen: { label: 'Abgeschlossen', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
};

export default function ServiceCard({ service, onBook, onContact, onClick }) {
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const status = service.status || 'offen';
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick?.(service)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link 
            to={createPageUrl('NachbarProfil') + `?id=user-${service.id}`}
            className="flex items-start gap-3 hover:opacity-80 transition-opacity flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
              {service.author.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">{service.author}</h3>
                {service.verified && (
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">✓ Verifiziert</span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {renderStars(service.rating)}
                <span className="text-xs text-gray-500 ml-1">({service.reviewCount})</span>
              </div>
            </div>
          </Link>
          <Badge className={`${statusConfig.color} flex items-center gap-1 flex-shrink-0`}>
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </Badge>
        </div>

        <div className="mt-3">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            service.type === 'bietet' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {service.type === 'bietet' ? '🤝 Bietet an' : '🔍 Sucht'}
          </span>
          <h4 className="font-medium text-gray-900 mt-2">{service.title}</h4>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{service.description}</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {service.categories.map((cat, i) => (
            <span key={i} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">
              {cat}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {service.floor}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {service.availability}
            </span>
          </div>
          {service.price && (
            <span className="flex items-center gap-1 font-medium text-green-600">
              <Euro className="w-3 h-3" /> {service.price}
            </span>
          )}
        </div>

        {service.commentCount > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <MessageCircle className="w-3 h-3" />
            <span>{service.commentCount} Kommentare</span>
          </div>
        )}

        <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
          {service.type === 'bietet' && status !== 'abgeschlossen' && (
            <Button 
              onClick={() => onBook(service)}
              className="flex-1 bg-[#8B5CF6] hover:bg-violet-700"
              size="sm"
            >
              <Calendar className="w-4 h-4 mr-1" /> Anfragen
            </Button>
          )}
          <Button 
            onClick={() => onContact(service)}
            variant="outline"
            size="sm"
            className={service.type === 'sucht' || status === 'abgeschlossen' ? 'flex-1' : ''}
            title="Chat starten"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Kontakt
          </Button>
        </div>
      </div>
    </div>
  );
}