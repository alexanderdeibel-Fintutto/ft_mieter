import React, { useState } from 'react';
import { Star, ThumbsUp, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// Demo reviews
const DEMO_REVIEWS = [
  {
    id: 1,
    author: 'Maria K.',
    overallRating: 5,
    criteriaRatings: { quality: 5, punctuality: 5, communication: 5, friendliness: 5 },
    title: 'Absolut empfehlenswert!',
    comment: 'Super freundlich und hilfsbereit. Die Einkaufshilfe war pünktlich und hat alles genau nach meinen Wünschen besorgt. Würde jederzeit wieder buchen!',
    tags: ['Pünktlich', 'Freundlich', 'Zuverlässig'],
    wouldRecommend: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    helpful: 5,
  },
  {
    id: 2,
    author: 'Thomas B.',
    overallRating: 4,
    criteriaRatings: { quality: 4, punctuality: 3, communication: 5, friendliness: 5 },
    title: 'Gute Hilfe',
    comment: 'Kommunikation war top, leider kam die Person etwas verspätet. Ansonsten alles bestens!',
    tags: ['Freundlich', 'Hilfsbereit'],
    wouldRecommend: true,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    helpful: 2,
  },
  {
    id: 3,
    author: 'Lisa M.',
    overallRating: 5,
    criteriaRatings: { quality: 5, punctuality: 5, communication: 4, friendliness: 5 },
    title: 'Tolle Erfahrung',
    comment: 'Sehr zuverlässig und geduldig. Hat mir auch bei der Auswahl geholfen.',
    tags: ['Zuverlässig', 'Geduldig', 'Empfehlenswert'],
    wouldRecommend: true,
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    helpful: 3,
  },
];

function StarDisplay({ rating, size = 'sm' }) {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star 
          key={star}
          className={`${sizes[size]} ${
            star <= rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review, onMarkHelpful }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b last:border-b-0 py-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
            {review.author.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-sm">{review.author}</p>
            <p className="text-xs text-gray-400">
              {format(new Date(review.created_at), 'dd. MMMM yyyy', { locale: de })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <StarDisplay rating={review.overallRating} size="md" />
          <span className="text-sm font-medium ml-1">{review.overallRating}</span>
        </div>
      </div>

      {/* Title & Content */}
      {review.title && (
        <h4 className="font-semibold text-sm mb-1">{review.title}</h4>
      )}
      <p className={`text-sm text-gray-600 ${!expanded && 'line-clamp-2'}`}>
        {review.comment}
      </p>
      {review.comment.length > 150 && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-[#8B5CF6] mt-1 flex items-center gap-1"
        >
          {expanded ? 'Weniger' : 'Mehr lesen'}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      )}

      {/* Tags */}
      {review.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {review.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Criteria Ratings (expandable) */}
      {expanded && review.criteriaRatings && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
          {Object.entries(review.criteriaRatings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-gray-600 capitalize">{key}</span>
              <StarDisplay rating={value} size="sm" />
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <button 
          onClick={() => onMarkHelpful(review.id)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#8B5CF6]"
        >
          <ThumbsUp className="w-3 h-3" />
          Hilfreich ({review.helpful})
        </button>
        {review.wouldRecommend && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            ✓ Würde weiterempfehlen
          </span>
        )}
      </div>
    </div>
  );
}

export default function ServiceReviews({ serviceId, reviews = DEMO_REVIEWS }) {
  const [sortBy, setSortBy] = useState('recent');
  const [filterRating, setFilterRating] = useState('all');

  // Calculate stats
  const stats = {
    average: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length).toFixed(1)
      : 0,
    total: reviews.length,
    distribution: [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: reviews.filter(r => r.overallRating === rating).length,
      percentage: reviews.length > 0 
        ? (reviews.filter(r => r.overallRating === rating).length / reviews.length) * 100 
        : 0,
    })),
    recommendPercentage: reviews.length > 0
      ? Math.round((reviews.filter(r => r.wouldRecommend).length / reviews.length) * 100)
      : 0,
  };

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(r => filterRating === 'all' || r.overallRating === parseInt(filterRating))
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'highest') return b.overallRating - a.overallRating;
      if (sortBy === 'lowest') return a.overallRating - b.overallRating;
      if (sortBy === 'helpful') return b.helpful - a.helpful;
      return 0;
    });

  const handleMarkHelpful = (reviewId) => {
    // In a real app, this would update the backend
    console.log('Marked helpful:', reviewId);
  };

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">{stats.average}</div>
            <StarDisplay rating={Math.round(parseFloat(stats.average))} size="md" />
            <p className="text-xs text-gray-500 mt-1">{stats.total} Bewertungen</p>
          </div>
          
          <div className="flex-1 space-y-1">
            {stats.distribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-xs w-3">{rating}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <Progress value={percentage} className="flex-1 h-2" />
                <span className="text-xs text-gray-500 w-6">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-violet-100 text-center">
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-green-600">{stats.recommendPercentage}%</span> würden weiterempfehlen
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px] text-xs">
            <SelectValue placeholder="Sortieren" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Neueste</SelectItem>
            <SelectItem value="highest">Beste zuerst</SelectItem>
            <SelectItem value="lowest">Schlechteste zuerst</SelectItem>
            <SelectItem value="helpful">Hilfreichste</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-[120px] text-xs">
            <Filter className="w-3 h-3 mr-1" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Sterne</SelectItem>
            <SelectItem value="5">5 Sterne</SelectItem>
            <SelectItem value="4">4 Sterne</SelectItem>
            <SelectItem value="3">3 Sterne</SelectItem>
            <SelectItem value="2">2 Sterne</SelectItem>
            <SelectItem value="1">1 Stern</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      {filteredReviews.length > 0 ? (
        <div className="divide-y">
          {filteredReviews.map(review => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              onMarkHelpful={handleMarkHelpful}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Star className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Noch keine Bewertungen</p>
        </div>
      )}
    </div>
  );
}