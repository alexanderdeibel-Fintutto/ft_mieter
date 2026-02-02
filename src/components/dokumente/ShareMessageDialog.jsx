import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareMessageDialog({ open, onOpenChange, onShare }) {
  const [message, setMessage] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!recipientEmail) {
      toast.error('E-Mail erforderlich');
      return;
    }

    setLoading(true);
    try {
      await onShare({
        email: recipientEmail,
        message: message || 'Ich möchte dieses Dokument mit dir teilen.',
      });
      
      setMessage('');
      setRecipientEmail('');
      onOpenChange(false);
      toast.success('Dokument geteilt und Nachricht gesendet');
    } catch (error) {
      toast.error('Fehler beim Teilen');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Mit Nachricht teilen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">E-Mail des Empfängers</label>
            <Input
              placeholder="empfaenger@example.de"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              type="email"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Nachricht (optional)</label>
            <Textarea
              placeholder="Schreib eine persönliche Nachricht..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-24"
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/500 Zeichen
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleShare}
              disabled={loading || !recipientEmail}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Teilen
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