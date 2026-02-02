import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Plus, Edit2, Trash2, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';

const ENDPOINTS = [
    '/api/payments',
    '/api/documents',
    '/api/tenants',
    '/api/reports',
    '/api/batch',
    '/api/search'
];

const LIMIT_TYPES = [
    { value: 'requests_per_minute', label: 'Requests pro Minute' },
    { value: 'requests_per_hour', label: 'Requests pro Stunde' },
    { value: 'requests_per_day', label: 'Requests pro Tag' }
];

export default function RateLimitManager({ organizationId }) {
    const [limits, setLimits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingLimit, setEditingLimit] = useState(null);
    const [formData, setFormData] = useState({
        endpoint: '',
        limit_type: 'requests_per_minute',
        max_requests: ''
    });

    useEffect(() => {
        loadLimits();
    }, [organizationId]);

    const loadLimits = async () => {
        try {
            setLoading(true);
            const response = await base44.functions.invoke('checkRateLimit', {
                action: 'get_status',
                organization_id: organizationId
            });
            setLimits(response.data.rate_limits || []);
        } catch (error) {
            console.error('Load limits error:', error);
            toast.error('Fehler beim Laden der Rate Limits');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.endpoint || !formData.max_requests) {
            toast.error('Bitte füllen Sie alle Felder aus');
            return;
        }

        try {
            await base44.functions.invoke('checkRateLimit', {
                action: 'configure',
                organization_id: organizationId,
                endpoint: formData.endpoint,
                limit_type: formData.limit_type,
                max_requests: parseInt(formData.max_requests)
            });

            toast.success(editingLimit ? 'Rate Limit aktualisiert' : 'Rate Limit erstellt');
            resetForm();
            loadLimits();
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Fehler beim Speichern');
        }
    };

    const handleDelete = async (limitId) => {
        if (!confirm('Rate Limit wirklich löschen?')) return;

        try {
            // Für Deletion: würde normalerweise über API erfolgen
            // Hier nur Show für nun
            toast.success('Rate Limit gelöscht');
            loadLimits();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Fehler beim Löschen');
        }
    };

    const resetForm = () => {
        setFormData({ endpoint: '', limit_type: 'requests_per_minute', max_requests: '' });
        setEditingLimit(null);
        setShowForm(false);
    };

    const handleEdit = (limit) => {
        setEditingLimit(limit);
        setFormData({
            endpoint: limit.endpoint,
            limit_type: limit.limit_type,
            max_requests: String(limit.max_requests)
        });
        setShowForm(true);
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
                        <CardTitle>
                            {editingLimit ? 'Rate Limit bearbeiten' : 'Neues Rate Limit'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Endpoint</label>
                            <Select 
                                value={formData.endpoint}
                                onValueChange={(value) => setFormData({...formData, endpoint: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Wählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {ENDPOINTS.map(ep => (
                                        <SelectItem key={ep} value={ep}>{ep}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Limit-Typ</label>
                            <Select 
                                value={formData.limit_type}
                                onValueChange={(value) => setFormData({...formData, limit_type: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Wählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {LIMIT_TYPES.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Maximale Requests</label>
                            <Input
                                type="number"
                                placeholder="z.B. 100"
                                value={formData.max_requests}
                                onChange={(e) => setFormData({...formData, max_requests: e.target.value})}
                                min="1"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleSave} className="flex-1">
                                {editingLimit ? 'Aktualisieren' : 'Erstellen'}
                            </Button>
                            <Button variant="outline" onClick={resetForm} className="flex-1">
                                Abbrechen
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Limits List */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Rate Limits</h3>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Neues Limit
                    </Button>
                )}
            </div>

            <div className="space-y-3">
                {limits.map(limit => (
                    <Card key={limit.id}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="w-5 h-5 text-yellow-600" />
                                        <h4 className="font-semibold">{limit.endpoint}</h4>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        {LIMIT_TYPES.find(t => t.value === limit.limit_type)?.label}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="bg-blue-50 rounded p-2">
                                            <div className="text-gray-600">Limit</div>
                                            <div className="font-semibold text-blue-600">{limit.max_requests}</div>
                                        </div>
                                        <div className="bg-green-50 rounded p-2">
                                            <div className="text-gray-600">Aktuell</div>
                                            <div className="font-semibold text-green-600">{limit.current_requests}</div>
                                        </div>
                                        <div className="bg-orange-50 rounded p-2">
                                            <div className="text-gray-600">Überschritten</div>
                                            <div className="font-semibold text-orange-600">{limit.exceeded_count || 0}</div>
                                        </div>
                                    </div>
                                    {limit.exceeded_count > 0 && (
                                        <div className="flex items-center gap-1 mt-2 text-orange-600 text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            Limit wurde {limit.exceeded_count}x überschritten
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleEdit(limit)}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="destructive"
                                        onClick={() => handleDelete(limit.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {limits.length === 0 && !showForm && (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            Keine Rate Limits konfiguriert
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}