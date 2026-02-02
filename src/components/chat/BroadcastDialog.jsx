import React, { useState } from 'react';
import { createBroadcast, sendBroadcast } from '../services/messagingAdvanced';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send } from 'lucide-react';

export function BroadcastDialog({ orgId, buildingId, onBroadcastSent }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState('building');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    const result = await createBroadcast(title, content, {
      orgId,
      buildingId: targetType === 'building' ? buildingId : undefined,
      targetType,
      status: 'sent',
      recipientIds: []
    });

    if (result.success) {
      // Direkt senden
      await sendBroadcast(result.broadcast.id);
      onBroadcastSent?.(result.broadcast);
      setTitle('');
      setContent('');
      setTargetType('building');
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Send size={16} /> Ankündigung
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ankündigung erstellen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titel</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Betreff"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nachricht</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nachricht eingeben..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Empfänger</label>
            <Select value={targetType} onValueChange={setTargetType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="building">Gesamtes Gebäude</SelectItem>
                <SelectItem value="organization">Gesamte Organisation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!title || !content || loading}
              className="flex-1"
            >
              {loading ? 'Wird gesendet...' : 'Senden'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}