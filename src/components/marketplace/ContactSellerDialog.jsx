import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, User } from 'lucide-react';

const QUICK_MESSAGES = [
  'Ist der Artikel noch verfügbar?',
  'Können wir uns zum Abholen treffen?',
  'Wäre ein niedrigerer Preis möglich?',
  'Können Sie mir mehr Bilder schicken?',
];

export default function ContactSellerDialog({ open, onOpenChange, listing, onSend }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(listing, message);
    setMessage('');
    onOpenChange(false);
  };

  const handleQuickMessage = (text) => {
    setMessage(text);
  };

  if (!listing) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#8B5CF6]" />
            Nachricht senden
          </DialogTitle>
        </DialogHeader>

        {/* Listing Preview */}
        <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
          {listing.images?.[0] ? (
            <img 
              src={listing.images[0]} 
              alt={listing.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{listing.title}</h4>
            <p className="text-sm text-gray-500">von {listing.creatorName}</p>
            {listing.price && (
              <p className="text-sm font-bold text-green-600">{listing.price} €</p>
            )}
          </div>
        </div>

        {/* Quick Messages */}
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Schnellantworten:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_MESSAGES.map((text, index) => (
              <button
                key={index}
                onClick={() => handleQuickMessage(text)}
                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="space-y-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Schreibe deine Nachricht..."
            rows={3}
            className="resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className="w-full bg-[#8B5CF6] hover:bg-violet-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Nachricht senden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}