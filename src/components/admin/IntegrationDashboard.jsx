import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Zap, Plus, ExternalLink, Trash2, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800',
    pending_auth: 'bg-yellow-100 text-yellow-800',
    expired: 'bg-orange-100 text-orange-800'
};

const SERVICE_ICONS = {
    slack: '💬',
    zapier: '⚡',
    stripe: '💳',
    github: '🐙',
    jira: '📋',
    notion: '📝',
    salesforce: '☁️',
    twilio: '📞',
    sendgrid: '📧',
    datadog: '📊',
    custom_webhook: '🪝'
};

const SERVICES = [
    { value: 'slack', label: 'Slack' },
    { value: 'zapier', label: 'Zapier' },
    { value: 'stripe', label: 'Stripe' },
    { value: 'github', label: 'GitHub' },
    { value: 'jira', label: 'Jira' },
    { value: 'notion', label: 'Notion' },
    { value: 'salesforce', label: 'Salesforce' },
    { value: 'twilio', label: 'Twilio' },
    { value: 'sendgrid', label: 'SendGrid' },
    { value: 'custom_webhook', label: 'Custom Webhook' }
];

export default function IntegrationDashboard({ organizationId }) {
    const [integrations, setIntegrations] = useState([]);
    const [webhooks, setWebhooks] = useState({});
    const [loading, setLoading] = useState(true);
    const [showNewForm, setShowNewForm] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        service_type: 'slack',
        description: '',
        api_key: ''
    });

    useEffect(() => {
        loadIntegrations();
    }, [organizationId]);

    const loadIntegrations = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('integrationManagement', {
                action: 'get_integrations',
                organization_id: organizationId
            });
            setIntegrations(res.data.integrations || []);
        } catch (error) {
            console.error('Load error:', error);
            toast.error('Fehler beim Laden der Integrationen');
        } finally {
            setLoading(false);
        }
    };

    const loadWebhooks = async (integrationId) => {
        try {
            const res = await base44.functions.invoke('integrationManagement', {
                action: 'get_webhooks',
                organization_id: organizationId,
                integration_id: integrationId
            });
            setWebhooks(prev => ({
                ...prev,
                [integrationId]: res.data.webhooks || []
            }));
        } catch (error) {
            console.error('Load webhooks error:', error);
        }
    };

    const handleCreateIntegration = async () => {
        if (!formData.name || !formData.service_type) {
            toast.error('Bitte füllen Sie alle erforderlichen Felder aus');
            return;
        }

        try {
            await base44.functions.invoke('integrationManagement', {
                action: 'create_integration',
                organization_id: organizationId,
                name: formData.name,
                service_type: formData.service_type,
                description: formData.description,
                api_key: formData.api_key
            });

            toast.success('Integration erstellt');
            setFormData({ name: '', service_type: 'slack', description: '', api_key: '' });
            setShowNewForm(false);
            loadIntegrations();
        } catch (error) {
            console.error('Create error:', error);
            toast.error('Fehler beim Erstellen der Integration');
        }
    };

    const handleTestIntegration = async (integrationId) => {
        try {
            const res = await base44.functions.invoke('integrationManagement', {
                action: 'test_integration',
                organization_id: organizationId,
                integration_id: integrationId
            });

            if (res.data.test_passed) {
                toast.success('Integration funktioniert ✓');
            } else {
                toast.error('Integration Test fehlgeschlagen');
            }
            
            loadIntegrations();
        } catch (error) {
            console.error('Test error:', error);
            toast.error('Fehler beim Testen der Integration');
        }
    };

    const handleDeleteIntegration = async (integrationId) => {
        if (!confirm('Integration wirklich löschen?')) return;

        try {
            await base44.functions.invoke('integrationManagement', {
                action: 'delete_integration',
                organization_id: organizationId,
                integration_id: integrationId
            });

            toast.success('Integration gelöscht');
            loadIntegrations();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Fehler beim Löschen der Integration');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{integrations.length}</div>
                        <div className="text-xs text-gray-600">Gesamt</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">
                            {integrations.filter(i => i.status === 'active').length}
                        </div>
                        <div className="text-xs text-gray-600">Aktiv</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-600">
                            {integrations.filter(i => i.status === 'pending_auth').length}
                        </div>
                        <div className="text-xs text-gray-600">Ausstehend</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-600">
                            {integrations.filter(i => i.status === 'error').length}
                        </div>
                        <div className="text-xs text-gray-600">Fehler</div>
                    </CardContent>
                </Card>
            </div>

            {/* Create Form */}
            {showNewForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Neue Integration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Integrations-Name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                        <Select value={formData.service_type} onValueChange={(v) => setFormData({...formData, service_type: v})}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SERVICES.map(service => (
                                    <SelectItem key={service.value} value={service.value}>
                                        {service.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Beschreibung"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                        <Input
                            placeholder="API Key (optional)"
                            type="password"
                            value={formData.api_key}
                            onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                        />
                        <div className="flex gap-2">
                            <Button onClick={handleCreateIntegration} className="flex-1">Erstellen</Button>
                            <Button variant="outline" onClick={() => setShowNewForm(false)} className="flex-1">
                                Abbrechen
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!showNewForm && (
                <Button onClick={() => setShowNewForm(true)} className="w-full md:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Neue Integration
                </Button>
            )}

            {/* Integrations List */}
            <div className="space-y-3">
                {integrations.map(integration => (
                    <Card key={integration.id}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-2xl">
                                            {SERVICE_ICONS[integration.service_type] || '🔌'}
                                        </span>
                                        <h4 className="font-semibold">{integration.name}</h4>
                                        <Badge className={STATUS_COLORS[integration.status]}>
                                            {integration.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">{integration.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleTestIntegration(integration.id)}
                                    >
                                        <RotateCw className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedIntegration(
                                                selectedIntegration === integration.id ? null : integration.id
                                            );
                                            if (selectedIntegration !== integration.id) {
                                                loadWebhooks(integration.id);
                                            }
                                        }}
                                    >
                                        <Zap className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDeleteIntegration(integration.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {integration.last_tested_at && (
                                <p className="text-xs text-gray-500 mb-3">
                                    Getestet: {formatDate(integration.last_tested_at)}
                                </p>
                            )}

                            {/* Webhooks Section */}
                            {selectedIntegration === integration.id && webhooks[integration.id] && (
                                <div className="mt-4 pt-4 border-t">
                                    <h5 className="text-sm font-semibold mb-3">Webhooks ({webhooks[integration.id].length})</h5>
                                    {webhooks[integration.id].length > 0 ? (
                                        <div className="space-y-2">
                                            {webhooks[integration.id].map(webhook => (
                                                <div key={webhook.id} className="bg-gray-50 p-3 rounded text-sm">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium">{webhook.endpoint_name}</p>
                                                            <p className="text-xs text-gray-600 truncate">{webhook.target_url}</p>
                                                            <div className="flex gap-2 mt-1">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {webhook.event_type}
                                                                </Badge>
                                                                {webhook.last_delivery_status && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {webhook.success_count} erfolg.
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                                                            webhook.is_active
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {webhook.is_active ? 'Aktiv' : 'Inaktiv'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500">Keine Webhooks</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {integrations.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            Keine Integrationen konfiguriert
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}