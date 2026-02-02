import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ReviewDialog({ open, onOpenChange, booking, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setSubmitting(true);
    await onSubmit({
      bookingId: booking?.id,
      rating,
      comment
    });
    setSubmitting(false);
    setRating(0);
    setComment('');
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bewertung abgeben</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {/* Booking Info */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="font-medium text-gray-900">{booking.serviceTitle}</p>
            <p className="text-sm text-gray-600">
              {new Date(booking.date).toLocaleDateString('de-DE')} um {booking.time} Uhr
            </p>
            <p className="text-sm text-gray-500">mit {booking.providerName}</p>
          </div>

          {/* Star Rating */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Wie war deine Erfahrung?</label>
            <div className="flex items-center gap-1 justify-center py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500">
              {rating === 1 && 'Schlecht'}
              {rating === 2 && 'Nicht so gut'}
              {rating === 3 && 'Okay'}
              {rating === 4 && 'Gut'}
              {rating === 5 && 'Ausgezeichnet!'}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Kommentar (optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Erzähle anderen von deiner Erfahrung..."
              rows={3}
            />
          </div>

          {/* Quick Tags */}
          <div className="flex flex-wrap gap-2">
            {['Pünktlich', 'Freundlich', 'Hilfsbereit', 'Zuverlässig', 'Empfehlenswert'].map(tag => (
              <button
                key={tag}
                onClick={() => setComment(prev => prev ? `${prev} ${tag}` : tag)}
                className="text-xs bg-violet-50 text-violet-700 px-2 py-1 rounded-full hover:bg-violet-100"
              >
                + {tag}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="flex-1 bg-[#8B5CF6] hover:bg-violet-700"
            >
              {submitting ? 'Sende...' : 'Bewertung abgeben'}
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