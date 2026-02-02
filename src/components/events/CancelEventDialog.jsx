import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

export default function CancelEventDialog({ open, onOpenChange, event, onConfirm }) {
  const [reason, setReason] = useState('');
  const [notifyParticipants, setNotifyParticipants] = useState(true);

  const handleConfirm = () => {
    onConfirm(event, reason, notifyParticipants);
    setReason('');
    setNotifyParticipants(true);
    onOpenChange(false);
  };

  if (!event) return null;

  const participantCount = event.participants?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Event absagen
          </DialogTitle>
          <DialogDescription>
            Bist du sicher, dass du "{event.title}" absagen möchtest?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">
            <p className="font-medium">Achtung:</p>
            <p>Diese Aktion kann nicht rückgängig gemacht werden.</p>
            {participantCount > 1 && (
              <p className="mt-1">{participantCount - 1} Teilnehmer werden benachrichtigt.</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Grund für die Absage (optional)</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="z.B. Wetter, persönliche Gründe..."
              className="mt-1"
              rows={2}
            />
          </div>

          {participantCount > 1 && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="notify"
                checked={notifyParticipants}
                onCheckedChange={setNotifyParticipants}
              />
              <label htmlFor="notify" className="text-sm text-gray-700 cursor-pointer">
                Teilnehmer über Absage benachrichtigen
              </label>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Zurück
            </Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={handleConfirm}
            >
              Event absagen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}