import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Key, Webhook, Copy, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import APIKeyManager from '../components/api/APIKeyManager';
import WebhookManager from '../components/api/WebhookManager';

export default function APIManagement() {
    const [apiKeys, setApiKeys] = useState([
        { id: 1, name: 'Mobile App', key: 'sk_live_••••••••5g8d', created: '2025-12-15', lastUsed: '2026-01-24', active: true },
        { id: 2, name: 'Web Dashboard', key: 'sk_live_••••••••9k2m', created: '2025-11-10', lastUsed: '2026-01-23', active: true },
    ]);

    const [webhooks, setWebhooks] = useState([
        { id: 1, url: 'https://app.example.com/webhooks/payment', events: ['payment.completed', 'payment.failed'], active: true, lastTriggered: '2026-01-24 14:30' },
        { id: 2, url: 'https://app.example.com/webhooks/repairs', events: ['repair.created', 'repair.updated'], active: true, lastTriggered: '2026-01-24 10:15' },
    ]);

    const [copied, setCopied] = useState(null);

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        toast.success('In Zwischenablage kopiert');
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-6 pb-20 p-4 sm:p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">API & Webhooks</h1>
                <p className="text-gray-600 mt-1">Verwalte deine API-Schlüssel und Webhook-Integrationen</p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="keys" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="keys" className="flex items-center gap-2 transition-all">
                        <Key className="w-4 h-4" /> API-Schlüssel
                    </TabsTrigger>
                    <TabsTrigger value="webhooks" className="flex items-center gap-2 transition-all">
                        <Webhook className="w-4 h-4" /> Webhooks
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="keys" className="space-y-4 animate-in fade-in">
                    <APIKeyManager keys={apiKeys} setKeys={setApiKeys} />
                    <div className="grid gap-4">
                        {apiKeys.map(key => (
                            <Card key={key.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{key.name}</p>
                                            <p className="text-sm text-gray-500 mt-1">{key.key}</p>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleCopy(key.key, key.id)}
                                            className="transition-colors"
                                        >
                                            {copied === key.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="webhooks" className="space-y-4 animate-in fade-in">
                    <WebhookManager webhooks={webhooks} setWebhooks={setWebhooks} />
                </TabsContent>
            </Tabs>
        </div>
    );
}