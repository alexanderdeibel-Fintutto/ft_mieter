import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, TestTube } from 'lucide-react';

const WEBHOOK_EVENTS = [
    'payment.completed',
    'payment.failed',
    'repair.created',
    'repair.updated',
    'repair.completed',
    'document.uploaded',
    'user.invited',
    'user.activated',
];

export default function WebhookManager({ webhooks, setWebhooks }) {
    const [showNew, setShowNew] = useState(false);
    const [newUrl, setNewUrl] = useState('');
    const [selectedEvents, setSelectedEvents] = useState(['payment.completed']);

    const toggleEvent = (event) => {
        setSelectedEvents(prev =>
            prev.includes(event)
                ? prev.filter(e => e !== event)
                : [...prev, event]
        );
    };

    const addWebhook = () => {
        if (newUrl.trim()) {
            const newWebhook = {
                id: Math.max(...webhooks.map(w => w.id), 0) + 1,
                url: newUrl,
                events: selectedEvents,
                active: true,
                lastTriggered: '-'
            };
            setWebhooks([newWebhook, ...webhooks]);
            setNewUrl('');
            setSelectedEvents(['payment.completed']);
            setShowNew(false);
        }
    };

    const deleteWebhook = (id) => {
        setWebhooks(webhooks.filter(w => w.id !== id));
    };

    const testWebhook = (url) => {
        alert(`Test-Webhook gesendet an: ${url}`);
    };

    return (
        <div className="space-y-4">
            <Button onClick={() => setShowNew(true)} className="w-full bg-violet-600 hover:bg-violet-700 gap-2">
                <Plus className="w-4 h-4" /> Neuer Webhook
            </Button>

            {/* Webhooks List */}
            <div className="space-y-2">
                {webhooks.map(webhook => (
                    <Card key={webhook.id}>
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 break-all">{webhook.url}</p>
                                        <p className="text-xs text-gray-500 mt-1">Zuletzt: {webhook.lastTriggered}</p>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700 ml-2">Aktiv</Badge>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {webhook.events.map(event => (
                                        <Badge key={event} variant="outline" className="text-xs">
                                            {event}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => testWebhook(webhook.url)}
                                        className="gap-2 flex-1"
                                    >
                                        <TestTube className="w-4 h-4" /> Test
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteWebhook(webhook.id)}
                                        className="text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* New Webhook Dialog */}
            <Dialog open={showNew} onOpenChange={setShowNew}>
                <DialogContent className="max-w-md max-h-96 overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Neuen Webhook hinzufügen</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-900 block mb-2">Webhook URL</label>
                            <Input
                                placeholder="https://app.example.com/webhooks/..."
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-900 block mb-2">Events</label>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {WEBHOOK_EVENTS.map(event => (
                                    <div key={event} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={selectedEvents.includes(event)}
                                            onCheckedChange={() => toggleEvent(event)}
                                        />
                                        <label className="text-sm text-gray-900 cursor-pointer">{event}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => setShowNew(false)}>
                                Abbrechen
                            </Button>
                            <Button onClick={addWebhook} className="flex-1 bg-violet-600 hover:bg-violet-700">
                                Hinzufügen
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}