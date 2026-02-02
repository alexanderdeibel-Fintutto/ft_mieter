import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2, Copy, TestTube, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function WebhookManager({ open, onOpenChange }) {
  const [webhooks, setWebhooks] = useState([]);
  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: [],
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(null);

  const EVENTS = [
    { id: 'document_shared', label: 'Dokument geteilt' },
    { id: 'document_revoked', label: 'Freigabe widerrufen' },
    { id: 'document_viewed', label: 'Dokument angesehen' },
    { id: 'document_downloaded', label: 'Dokument heruntergeladen' },
    { id: 'share_expired', label: 'Share abgelaufen' },
  ];

  const handleAddWebhook = () => {
    if (!newWebhook.url) {
      toast.error('URL erforderlich');
      return;
    }

    if (newWebhook.events.length === 0) {
      toast.error('Mindestens ein Event auswählen');
      return;
    }

    const webhook = {
      id: Date.now(),
      ...newWebhook,
      createdAt: new Date().toISOString(),
      deliveries: 0,
      lastDelivery: null,
    };

    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ url: '', events: [], isActive: true });
    toast.success('Webhook erstellt');
  };

  const handleToggleEvent = (eventId) => {
    const updated = newWebhook.events.includes(eventId)
      ? newWebhook.events.filter(e => e !== eventId)
      : [...newWebhook.events, eventId];
    
    setNewWebhook({ ...newWebhook, events: updated });
  };

  const handleTestWebhook = async (webhookId) => {
    setTesting(webhookId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Test-Webhook erfolgreich gesendet');
      
      setWebhooks(webhooks.map(w => 
        w.id === webhookId 
          ? { ...w, lastDelivery: new Date().toISOString(), deliveries: w.deliveries + 1 }
          : w
      ));
    } catch (error) {
      toast.error('Test fehlgeschlagen');
    }
    setTesting(null);
  };

  const handleDeleteWebhook = (webhookId) => {
    setWebhooks(webhooks.filter(w => w.id !== webhookId));
    toast.success('Webhook gelöscht');
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('URL kopiert');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-96">
        <DialogHeader>
          <DialogTitle>🪝 Webhook Manager</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto">
          {/* Add Webhook */}
          <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium">Neuer Webhook</h4>
            
            <div>
              <Input
                placeholder="https://example.com/webhooks/documents"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-2 block">Events</label>
              <div className="grid grid-cols-2 gap-2">
                {EVENTS.map(event => (
                  <div key={event.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={newWebhook.events.includes(event.id)}
                      onCheckedChange={() => handleToggleEvent(event.id)}
                    />
                    <label className="text-xs text-gray-700 cursor-pointer">
                      {event.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleAddWebhook}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Webhook hinzufügen
            </Button>
          </div>

          {/* Webhooks List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Registrierte Webhooks ({webhooks.length})</h4>
            {webhooks.length === 0 ? (
              <p className="text-xs text-gray-500 py-4">Keine Webhooks konfiguriert</p>
            ) : (
              webhooks.map(webhook => (
                <div key={webhook.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-gray-700 truncate">
                        {webhook.url}
                      </p>
                    </div>
                    {webhook.isActive && (
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map(event => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {EVENTS.find(e => e.id === event)?.label}
                      </Badge>
                    ))}
                  </div>

                  <div className="text-xs text-gray-600 flex gap-2">
                    <span>Deliveries: {webhook.deliveries}</span>
                    {webhook.lastDelivery && (
                      <span>
                        Last: {new Date(webhook.lastDelivery).toLocaleTimeString('de-DE')}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestWebhook(webhook.id)}
                      disabled={testing === webhook.id}
                      className="flex-1"
                    >
                      {testing === webhook.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <TestTube className="w-3 h-3 mr-1" />
                      )}
                      Test
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyUrl(webhook.url)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteWebhook(webhook.id)}
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}