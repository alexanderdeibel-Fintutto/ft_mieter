import React, { useState } from 'react';
import { 
  MapPin, Clock, Euro, Star, MessageCircle, Calendar, 
  CheckCircle, AlertCircle, Loader2, Send, User, Repeat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import ServiceReviews from './ServiceReviews';

const STATUS_CONFIG = {
  offen: { label: 'Offen', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  in_bearbeitung: { label: 'In Bearbeitung', color: 'bg-yellow-100 text-yellow-700', icon: Loader2 },
  abgeschlossen: { label: 'Abgeschlossen', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
};

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star 
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

function CommentItem({ comment }) {
  return (
    <div className="flex gap-3 py-3 border-b last:border-b-0">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {comment.author.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-900">{comment.author}</span>
          <span className="text-xs text-gray-400">
            {format(new Date(comment.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
          </span>
        </div>
        <p className="text-sm text-gray-600">{comment.text}</p>
      </div>
    </div>
  );
}

export default function ServiceDetailDialog({ 
  open, 
  onOpenChange, 
  service, 
  onStatusChange,
  onAddComment,
  onBook,
  onBookRecurring,
  onContact,
  isOwner = false,
  comments = [],
  reviews = []
}) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  if (!service) return null;

  const statusConfig = STATUS_CONFIG[service.status] || STATUS_CONFIG.offen;
  const StatusIcon = statusConfig.icon;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    await onAddComment(service.id, newComment.trim());
    setNewComment('');
    setIsSubmitting(false);
  };

  const handleStatusChange = (newStatus) => {
    onStatusChange(service.id, newStatus);
    toast.success(`Status geändert: ${STATUS_CONFIG[newStatus].label}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2">
            <DialogTitle className="text-lg">{service.title}</DialogTitle>
            <Badge className={statusConfig.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">
              Bewertungen ({reviews.length || service.reviewCount || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 pt-4">
            {/* Author Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {service.author.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{service.author}</span>
                  {service.verified && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">✓ Verifiziert</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-3 h-3" /> {service.floor}
                  {service.rating > 0 && (
                    <>
                      <span>•</span>
                      <StarRating rating={service.rating} />
                      <span>({service.reviewCount})</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Type Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={service.type === 'bietet' ? 'default' : 'secondary'}>
                {service.type === 'bietet' ? '🎁 Bietet an' : '🔍 Sucht'}
              </Badge>
              {service.categories?.map((cat, i) => (
                <Badge key={i} variant="outline">{cat}</Badge>
              ))}
              {service.allowsRecurring && (
                <Badge className="bg-purple-100 text-purple-700">
                  <Repeat className="w-3 h-3 mr-1" /> Wiederkehrend möglich
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600">{service.description}</p>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3">
              {service.availability && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{service.availability}</span>
                </div>
              )}
              {service.price && (
                <div className="flex items-center gap-2 text-sm">
                  <Euro className="w-4 h-4 text-gray-400" />
                  <span>{service.price}</span>
                </div>
              )}
            </div>

            {/* Status Change (Owner Only) */}
            {isOwner && (
              <div className="p-3 bg-violet-50 rounded-lg">
                <label className="text-sm font-medium text-gray-700 block mb-2">Status ändern</label>
                <Select value={service.status || 'offen'} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offen">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Offen
                      </div>
                    </SelectItem>
                    <SelectItem value="in_bearbeitung">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        In Bearbeitung
                      </div>
                    </SelectItem>
                    <SelectItem value="abgeschlossen">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Abgeschlossen
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Comments Section */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Kommentare ({comments.length})
              </h4>

              {comments.length > 0 ? (
                <div className="max-h-48 overflow-y-auto mb-3">
                  {comments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-3">Noch keine Kommentare</p>
              )}

              {/* Add Comment */}
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Kommentar schreiben..."
                  rows={2}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isSubmitting}
                  size="icon"
                  className="bg-[#8B5CF6] hover:bg-violet-700 self-end"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            {!isOwner && (
              <div className="flex flex-col gap-2 pt-2">
                {service.type === 'bietet' && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => onBook(service)}
                      className="flex-1 bg-[#8B5CF6] hover:bg-violet-700"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Einmalig buchen
                    </Button>
                    {service.allowsRecurring && onBookRecurring && (
                      <Button 
                        onClick={() => onBookRecurring(service)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Repeat className="w-4 h-4 mr-2" />
                        Wiederkehrend
                      </Button>
                    )}
                  </div>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => onContact(service)}
                  className="w-full"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Kontaktieren
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="pt-4">
            <ServiceReviews serviceId={service.id} reviews={reviews} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}