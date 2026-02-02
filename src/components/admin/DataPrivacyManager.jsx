import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Trash2, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const REQUEST_TYPES = [
    { value: 'data_export', label: 'Datenexport', icon: '📦' },
    { value: 'data_deletion', label: 'Datenlöschung', icon: '🗑️' },
    { value: 'anonymization', label: 'Anonymisierung', icon: '👤' },
    { value: 'right_to_be_forgotten', label: 'Recht auf Vergessenwerden', icon: '🚫' },
    { value: 'data_portability', label: 'Datenportabilität', icon: '↗️' }
];

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800'
};

export default function DataPrivacyManager({ organizationId }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [activeTab, setActiveTab] = useState('requests');
    const [formData, setFormData] = useState({
        user_id: '',
        request_type: ''
    });

    useEffect(() => {
        loadRequests();
    }, [organizationId]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const response = await base44.functions.invoke('manageDataPrivacy', {
                action: 'get_requests',
                organization_id: organizationId
            });
            setRequests(response.data.requests || []);
        } catch (error) {
            console.error('Load error:', error);
            toast.error('Fehler beim Laden der Anfragen');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRequest = async () => {
        if (!formData.user_id || !formData.request_type) {
            toast.error('Bitte füllen Sie alle Felder aus');
            return;
        }

        try {
            await base44.functions.invoke('manageDataPrivacy', {
                action: 'create_request',
                organization_id: organizationId,
                user_id: formData.user_id,
                request_type: formData.request_type,
                scope: { include_all: true }
            });

            toast.success('Anfrage erstellt');
            setFormData({ user_id: '', request_type: '' });
            setShowRequestForm(false);
            loadRequests();
        } catch (error) {
            console.error('Create error:', error);
            toast.error('Fehler beim Erstellen der Anfrage');
        }
    };

    const handleVerifyRequest = async (requestId) => {
        try {
            await base44.functions.invoke('manageDataPrivacy', {
                action: 'verify_request',
                organization_id: organizationId,
                request_id: requestId
            });

            toast.success('Anfrage verifiziert');
            loadRequests();
        } catch (error) {
            console.error('Verify error:', error);
            toast.error('Fehler bei der Verifikation');
        }
    };

    const handleExecuteAction = async (requestId, requestType) => {
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        if (!confirm(`${REQUEST_TYPES.find(t => t.value === requestType)?.label} für User ${request.user_id} ausführen?`)) {
            return;
        }

        try {
            const action = requestType === 'data_export' 
                ? 'export_data'
                : requestType === 'anonymization'
                ? 'anonymize_data'
                : 'delete_data';

            await base44.functions.invoke('manageDataPrivacy', {
                action: action,
                organization_id: organizationId,
                request_id: requestId,
                user_id: request.user_id
            });

            toast.success('Aktion ausgeführt');
            loadRequests();
        } catch (error) {
            console.error('Execute error:', error);
            toast.error('Fehler bei der Ausführung');
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

    const getDaysUntilDeadline = (deadlineDate) => {
        const days = Math.ceil((new Date(deadlineDate) - new Date()) / (1000 * 60 * 60 * 24));
        return days;
    };

    const getRequestTypeInfo = (type) => {
        return REQUEST_TYPES.find(t => t.value === type);
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
                        <div className="text-xs text-gray-600">Gesamt Anfragen</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-600">
                            {requests.filter(r => r.status === 'pending').length}
                        </div>
                        <div className="text-xs text-gray-600">Ausstehend</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">
                            {requests.filter(r => r.status === 'completed').length}
                        </div>
                        <div className="text-xs text-gray-600">Abgeschlossen</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-600">
                            {requests.filter(r => getDaysUntilDeadline(r.deadline_date) < 3).length}
                        </div>
                        <div className="text-xs text-gray-600">Frist überschreitet</div>
                    </CardContent>
                </Card>
            </div>

            {/* Create Form */}
            {showRequestForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Neue Datenschutz-Anfrage</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">User-ID</label>
                            <Input
                                placeholder="User-ID oder Email"
                                value={formData.user_id}
                                onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Anfrageart</label>
                            <Select
                                value={formData.request_type}
                                onValueChange={(value) => setFormData({...formData, request_type: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Wählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {REQUEST_TYPES.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.icon} {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleCreateRequest} className="flex-1">
                                Erstellen
                            </Button>
                            <Button variant="outline" onClick={() => setShowRequestForm(false)} className="flex-1">
                                Abbrechen
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Requests List */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Datenschutz-Anfragen</h3>
                {!showRequestForm && (
                    <Button onClick={() => setShowRequestForm(true)}>
                        Neue Anfrage
                    </Button>
                )}
            </div>

            <div className="space-y-3">
                {requests.map(request => {
                    const typeInfo = getRequestTypeInfo(request.request_type);
                    const daysUntilDeadline = getDaysUntilDeadline(request.deadline_date);
                    const isOverdue = daysUntilDeadline < 0;
                    const isCritical = daysUntilDeadline < 3;

                    return (
                        <Card key={request.id} className={isOverdue ? 'border-red-300' : isCritical ? 'border-yellow-300' : ''}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-start gap-3 flex-1">
                                        <span className="text-2xl">{typeInfo?.icon}</span>
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{typeInfo?.label}</h4>
                                            <p className="text-sm text-gray-600">
                                                User: {request.user_id}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className={STATUS_COLORS[request.status]}>
                                        {request.status === 'pending' ? 'Ausstehend' :
                                         request.status === 'in_progress' ? 'In Bearbeitung' :
                                         request.status === 'completed' ? 'Abgeschlossen' :
                                         'Abgelehnt'}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                                    <div className="bg-gray-50 rounded p-2">
                                        <div className="text-gray-600">Anfrage</div>
                                        <div className="font-medium">{formatDate(request.requested_at)}</div>
                                    </div>
                                    <div className={`rounded p-2 ${isOverdue ? 'bg-red-50' : isCritical ? 'bg-yellow-50' : 'bg-blue-50'}`}>
                                        <div className="text-gray-600">Frist</div>
                                        <div className={`font-medium ${isOverdue ? 'text-red-600' : isCritical ? 'text-yellow-600' : 'text-blue-600'}`}>
                                            {daysUntilDeadline < 0 
                                                ? `${Math.abs(daysUntilDeadline)} Tage überschritten` 
                                                : `${daysUntilDeadline} Tage verbleibend`}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded p-2">
                                        <div className="text-gray-600">Status</div>
                                        <div className="font-medium capitalize">{request.status}</div>
                                    </div>
                                </div>

                                {request.status === 'pending' && !request.verified && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3 text-sm">
                                        <AlertCircle className="w-4 h-4 inline mr-1" />
                                        Anfrage muss verifiziert werden
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    {!request.verified && request.status === 'pending' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleVerifyRequest(request.id)}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Verifizieren
                                        </Button>
                                    )}

                                    {request.verified && request.status === 'in_progress' && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleExecuteAction(request.id, request.request_type)}
                                        >
                                            {request.request_type === 'data_export' 
                                                ? 'Daten exportieren'
                                                : request.request_type === 'anonymization'
                                                ? 'Anonymisieren'
                                                : 'Löschen'}
                                        </Button>
                                    )}

                                    {request.status === 'completed' && request.deletion_count && (
                                        <Badge variant="outline" className="text-xs">
                                            {request.deletion_count} gelöschte Datensätze
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {requests.length === 0 && !showRequestForm && (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            Keine Datenschutz-Anfragen
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}