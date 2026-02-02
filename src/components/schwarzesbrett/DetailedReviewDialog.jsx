import React, { useState } from 'react';
import { Star, ThumbsUp, Clock, MessageCircle, Heart, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const RATING_CRITERIA = [
  { key: 'quality', label: 'Qualität', icon: Star },
  { key: 'punctuality', label: 'Pünktlichkeit', icon: Clock },
  { key: 'communication', label: 'Kommunikation', icon: MessageCircle },
  { key: 'friendliness', label: 'Freundlichkeit', icon: Heart },
];

const QUICK_TAGS = [
  'Sehr hilfsbereit', 'Pünktlich', 'Freundlich', 'Zuverlässig', 
  'Empfehlenswert', 'Professionell', 'Geduldig', 'Schnell'
];

export default function DetailedReviewDialog({ open, onOpenChange, booking, onSubmit }) {
  const [overallRating, setOverallRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [criteriaRatings, setCriteriaRatings] = useState({
    quality: 0,
    punctuality: 0,
    communication: 0,
    friendliness: 0,
  });
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [wouldRecommend, setWouldRecommend] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCriteriaRating = (key, value) => {
    setCriteriaRatings(prev => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (overallRating === 0) {
      toast.error('Bitte gib eine Gesamtbewertung ab');
      return;
    }
    
    setSubmitting(true);
    await onSubmit({
      bookingId: booking?.id,
      serviceId: booking?.serviceId,
      providerId: booking?.providerId,
      overallRating,
      criteriaRatings,
      title,
      comment,
      tags: selectedTags,
      wouldRecommend,
      created_at: new Date().toISOString(),
    });
    setSubmitting(false);
    
    // Reset form
    setOverallRating(0);
    setCriteriaRatings({ quality: 0, punctuality: 0, communication: 0, friendliness: 0 });
    setTitle('');
    setComment('');
    setSelectedTags([]);
    setWouldRecommend(null);
  };

  if (!booking) return null;

  const avgCriteria = Object.values(criteriaRatings).filter(v => v > 0);
  const criteriaAvg = avgCriteria.length > 0 
    ? (avgCriteria.reduce((a, b) => a + b, 0) / avgCriteria.length).toFixed(1)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detaillierte Bewertung</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 pt-2">
          {/* Booking Info */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="font-medium text-gray-900">{booking.serviceTitle}</p>
            <p className="text-sm text-gray-600">
              {new Date(booking.date).toLocaleDateString('de-DE')} um {booking.time} Uhr
            </p>
            <p className="text-sm text-gray-500">mit {booking.providerName}</p>
          </div>

          {/* Overall Rating */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Gesamtbewertung *</label>
            <div className="flex items-center gap-1 justify-center py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setOverallRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating || overallRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500">
              {overallRating === 1 && 'Schlecht'}
              {overallRating === 2 && 'Nicht so gut'}
              {overallRating === 3 && 'Okay'}
              {overallRating === 4 && 'Gut'}
              {overallRating === 5 && 'Ausgezeichnet!'}
            </p>
          </div>

          {/* Criteria Ratings */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Detailbewertung (optional)</label>
            {RATING_CRITERIA.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-32">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => handleCriteriaRating(key, star)}
                      className="p-0.5"
                    >
                      <Star 
                        className={`w-5 h-5 ${
                          star <= criteriaRatings[key]
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {criteriaAvg && (
              <div className="text-xs text-gray-500 text-right">
                Durchschnitt: {criteriaAvg} Sterne
              </div>
            )}
          </div>

          {/* Review Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Titel der Bewertung</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Toller Service!"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Deine Erfahrung</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Beschreibe deine Erfahrung ausführlich..."
              rows={4}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/500</p>
          </div>

          {/* Quick Tags */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Schnelle Tags</label>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {selectedTags.includes(tag) && <CheckCircle className="w-3 h-3 inline mr-1" />}
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Would Recommend */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Würdest du weiterempfehlen?</label>
            <div className="flex gap-3">
              <button
                onClick={() => setWouldRecommend(true)}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  wouldRecommend === true
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ThumbsUp className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Ja</span>
              </button>
              <button
                onClick={() => setWouldRecommend(false)}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  wouldRecommend === false
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ThumbsUp className="w-5 h-5 mx-auto mb-1 rotate-180" />
                <span className="text-sm">Nein</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleSubmit}
              disabled={overallRating === 0 || submitting}
              className="flex-1 bg-[#8B5CF6] hover:bg-violet-700"
            >
              {submitting ? 'Sende...' : 'Bewertung veröffentlichen'}
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