import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Webhook, Plus, Trash2, TestTube, Copy, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const EVENT_OPTIONS = [
    'payment.created',
    'payment.completed',
    'payment.failed',
    'document.uploaded',
    'document.deleted',
    'tenant.created',
    'tenant.updated',
    'lease.created',
    'lease.ended',
    'maintenance.created',
    'maintenance.completed',
    '*'  // All events
];

export default function WebhookManager({ organizationId }) {
    const [webhooks, setWebhooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        url: '',
        events: [],
        secret: '',
        description: ''
    });

    useEffect(() => {
        loadWebhooks();
    }, [organizationId]);

    const loadWebhooks = async () => {
        try {
            setLoading(true);
            const response = await base44.functions.invoke('manageWebhook', {
                action: 'list',
                organization_id: organizationId
            });
            setWebhooks(response.data.webhooks || []);
        } catch (error) {
            console.error('Load webhooks error:', error);
            toast.error('Fehler beim Laden der Webhooks');
        } finally {
            setLoading(false);
        }
    };

    const generateSecret = () => {
        const secret = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        setFormData({...formData, secret});
    };

    const handleCreate = async () => {
        if (!formData.url || formData.events.length === 0 || !formData.secret) {
            toast.error('Bitte füllen Sie alle erforderlichen Felder aus');
            return;
        }

        try {
            await base44.functions.invoke('manageWebhook', {
                action: 'create',
                organization_id: organizationId,
                ...formData
            });

            toast.success('Webhook erstellt');
            setFormData({ url: '', events: [], secret: '', description: '' });
            setShowForm(false);
            loadWebhooks();
        } catch (error) {
            console.error('Create webhook error:', error);
            toast.error('Fehler beim Erstellen des Webhooks');
        }
    };

    const handleDelete = async (webhookId) => {
        if (!confirm('Webhook wirklich löschen?')) return;

        try {
            await base44.functions.invoke('manageWebhook', {
                action: 'delete',
                organization_id: organizationId,
                webhook_id: webhookId
            });

            toast.success('Webhook gelöscht');
            loadWebhooks();
        } catch (error) {
            console.error('Delete webhook error:', error);
            toast.error('Fehler beim Löschen des Webhooks');
        }
    };

    const handleTest = async (webhookId) => {
        try {
            await base44.functions.invoke('manageWebhook', {
                action: 'test',
                organization_id: organizationId,
                webhook_id: webhookId
            });

            toast.success('Test-Webhook gesendet');
        } catch (error) {
            console.error('Test webhook error:', error);
            toast.error('Fehler beim Testen des Webhooks');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Create Form */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Neuer Webhook</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Ziel-URL</label>
                            <Input
                                placeholder="https://api.example.com/webhooks"
                                value={formData.url}
                                onChange={(e) => setFormData({...formData, url: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Events</label>
                            <Select 
                                value={formData.events[0] || ''}
                                onValueChange={(value) => setFormData({...formData, events: [value]})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Event wählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {EVENT_OPTIONS.map(event => (
                                        <SelectItem key={event} value={event}>
                                            {event}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium">Secret</label>
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={generateSecret}
                                >
                                    Generieren
                                </Button>
                            </div>
                            <Input
                                placeholder="Secret für HMAC-Validierung"
                                value={formData.secret}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Beschreibung (optional)</label>
                            <Input
                                placeholder="z.B. Payment Notifications"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleCreate} className="flex-1">
                                Erstellen
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => setShowForm(false)}
                                className="flex-1"
                            >
                                Abbrechen
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Webhooks List */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Webhooks</h3>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Neuer Webhook
                    </Button>
                )}
            </div>

            <div className="space-y-3">
                {webhooks.map(webhook => (
                    <Card key={webhook.id}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Webhook className="w-5 h-5 text-blue-600" />
                                        <h4 className="font-medium">{webhook.url}</h4>
                                        <Badge className={webhook.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {webhook.active ? 'Aktiv' : 'Inaktiv'}
                                        </Badge>
                                    </div>
                                    {webhook.description && (
                                        <p className="text-sm text-gray-600 mb-2">{webhook.description}</p>
                                    )}
                                    <div className="flex gap-2 flex-wrap">
                                        {webhook.events.map(event => (
                                            <Badge key={event} variant="outline">
                                                {event}
                                            </Badge>
                                        ))}
                                    </div>
                                    {webhook.failure_count > 0 && (
                                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            {webhook.failure_count} Fehlgeschlagene Versuche
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 flex-shrink-0">
                                    <Button 
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleTest(webhook.id)}
                                        title="Test-Payload senden"
                                    >
                                        <TestTube className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            navigator.clipboard.writeText(webhook.secret);
                                            toast.success('Secret kopiert');
                                        }}
                                        title="Secret kopieren"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDelete(webhook.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {webhooks.length === 0 && !showForm && (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            Keine Webhooks konfiguriert
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}