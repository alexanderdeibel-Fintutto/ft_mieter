import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageCircle, Heart, Tag, Gift, Repeat2, Euro, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '../../utils';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const TYPE_CONFIG = {
  offer: { label: 'Biete', color: 'bg-green-100 text-green-700', icon: Tag },
  search: { label: 'Suche', color: 'bg-blue-100 text-blue-700', icon: Tag },
};

const TRANSACTION_CONFIG = {
  sell: { label: 'Verkaufen', icon: Euro, color: 'text-green-600' },
  gift: { label: 'Verschenken', icon: Gift, color: 'text-pink-600' },
  trade: { label: 'Tauschen', icon: Repeat2, color: 'text-violet-600' },
};

const CATEGORY_LABELS = {
  electronics: '📱 Elektronik',
  furniture: '🪑 Möbel',
  clothing: '👕 Kleidung',
  books: '📚 Bücher',
  sports: '⚽ Sport',
  garden: '🌱 Garten',
  kids: '👶 Kinder',
  household: '🏠 Haushalt',
  other: '📦 Sonstiges',
};

export default function ListingCard({ listing, onContact, onFavorite, currentUserId, isFavorite }) {
  const typeConfig = TYPE_CONFIG[listing.type] || TYPE_CONFIG.offer;
  const transactionConfig = TRANSACTION_CONFIG[listing.transactionType] || TRANSACTION_CONFIG.sell;
  const TypeIcon = typeConfig.icon;
  const TransactionIcon = transactionConfig.icon;
  const isOwner = listing.creatorId === currentUserId;

  const timeAgo = listing.createdAt 
    ? formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true, locale: de })
    : 'vor kurzem';

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        {listing.images?.[0] ? (
          <img 
            src={listing.images[0]} 
            alt={listing.title} 
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <TypeIcon className="w-12 h-12 text-gray-300" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
          <Badge variant="secondary" className="bg-white/90">
            <TransactionIcon className={`w-3 h-3 mr-1 ${transactionConfig.color}`} />
            {transactionConfig.label}
          </Badge>
        </div>

        {/* Favorite Button */}
        {!isOwner && (
          <button
            onClick={() => onFavorite?.(listing)}
            className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Price */}
        {listing.transactionType === 'sell' && listing.price && (
          <div className="absolute bottom-2 right-2 bg-white/95 px-2 py-1 rounded-lg font-bold text-green-600">
            {listing.price} €
          </div>
        )}
        {listing.transactionType === 'gift' && (
          <div className="absolute bottom-2 right-2 bg-pink-100 px-2 py-1 rounded-lg font-medium text-pink-600 text-sm">
            Gratis
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{listing.description}</p>

        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
          <span className="px-2 py-0.5 bg-gray-100 rounded-full">
            {CATEGORY_LABELS[listing.category] || listing.category}
          </span>
          {listing.condition && (
            <span className="px-2 py-0.5 bg-gray-100 rounded-full">
              {listing.condition}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <Link 
            to={createPageUrl('NachbarProfil') + `?id=${listing.creatorId}`}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {listing.creatorName?.charAt(0) || '?'}
            </div>
            <div className="text-xs">
              <span className="text-gray-700 font-medium">{listing.creatorName}</span>
              <div className="flex items-center gap-1 text-gray-400">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </div>
            </div>
          </Link>

          {!isOwner && (
            <Button
              size="sm"
              onClick={() => onContact(listing)}
              className="bg-[#8B5CF6] hover:bg-violet-700"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Anfragen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}