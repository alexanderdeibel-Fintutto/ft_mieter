import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, RotateCw, Plus, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

const DATA_TYPES = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'E-Mail' },
    { value: 'phone', label: 'Telefon' },
    { value: 'bank_account', label: 'Bankverbindung' },
    { value: 'credit_card', label: 'Kreditkarte' },
    { value: 'ssn', label: 'Sozialversicherung' }
];

const MASKING_PATTERNS = {
    phone: 'XXXX-XXXX-****',
    email: 'xxxx@****',
    bank_account: 'DE89-****-****-****',
    credit_card: 'XXXX-XXXX-XXXX-****',
    ssn: 'XXX-XX-****'
};

export default function EncryptionManager({ organizationId }) {
    const [fields, setFields] = useState([]);
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState('fields');
    const [formData, setFormData] = useState({
        entity_type: '',
        field_name: '',
        field_label: '',
        data_type: '',
        key_rotation_interval_days: 90
    });

    useEffect(() => {
        loadEncryptionData();
    }, [organizationId]);

    const loadEncryptionData = async () => {
        try {
            setLoading(true);
            const [fieldsRes, auditRes] = await Promise.all([
                base44.functions.invoke('encryptData', {
                    action: 'get_fields',
                    organization_id: organizationId
                }),
                base44.functions.invoke('encryptData', {
                    action: 'audit_access',
                    organization_id: organizationId
                })
            ]);

            setFields(fieldsRes.data.fields || []);
            setLogs(auditRes.data.logs || []);
            setStats(auditRes.data.stats || null);
        } catch (error) {
            console.error('Load error:', error);
            toast.error('Fehler beim Laden der Verschlüsselungs-Einstellungen');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateField = async () => {
        if (!formData.entity_type || !formData.field_name || !formData.data_type) {
            toast.error('Bitte füllen Sie alle erforderlichen Felder aus');
            return;
        }

        try {
            await base44.functions.invoke('encryptData', {
                action: 'configure_field',
                organization_id: organizationId,
                entity_type: formData.entity_type,
                field_name: formData.field_name,
                field_label: formData.field_label || formData.field_name,
                data_type: formData.data_type,
                key_rotation_interval_days: parseInt(formData.key_rotation_interval_days),
                masked_pattern: MASKING_PATTERNS[formData.data_type]
            });

            toast.success('Verschlüsseltes Feld erstellt');
            setFormData({ entity_type: '', field_name: '', field_label: '', data_type: '', key_rotation_interval_days: 90 });
            setShowForm(false);
            loadEncryptionData();
        } catch (error) {
            console.error('Create error:', error);
            toast.error('Fehler beim Erstellen');
        }
    };

    const handleRotateKeys = async (fieldId) => {
        const field = fields.find(f => f.id === fieldId);
        if (!field) return;

        if (!confirm(`Keys für "${field.field_label}" rotieren?`)) return;

        try {
            await base44.functions.invoke('encryptData', {
                action: 'rotate_keys',
                organization_id: organizationId,
                entity_type: field.entity_type,
                field_name: field.field_name
            });

            toast.success('Keys rotiert');
            loadEncryptionData();
        } catch (error) {
            console.error('Rotate error:', error);
            toast.error('Fehler beim Rotieren');
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

    const getDataTypeLabel = (type) => {
        return DATA_TYPES.find(t => t.value === type)?.label || type;
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{stats.total_operations}</div>
                            <div className="text-xs text-gray-600">Operationen</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{stats.by_operation.encrypt}</div>
                            <div className="text-xs text-gray-600">Verschlüsselungen</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{stats.by_operation.decrypt}</div>
                            <div className="text-xs text-gray-600">Entschlüsselungen</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{stats.failures}</div>
                            <div className="text-xs text-gray-600">Fehler</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{stats.last_24h}</div>
                            <div className="text-xs text-gray-600">Letzte 24h</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                <button
                    onClick={() => setActiveTab('fields')}
                    className={`pb-2 px-2 text-sm font-medium transition-colors ${
                        activeTab === 'fields'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <Lock className="w-4 h-4 inline mr-1" />
                    Verschlüsselte Felder
                </button>
                <button
                    onClick={() => setActiveTab('audit')}
                    className={`pb-2 px-2 text-sm font-medium transition-colors ${
                        activeTab === 'audit'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <Eye className="w-4 h-4 inline mr-1" />
                    Zugriffsverlauf
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Neues verschlüsseltes Feld</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Entity-Typ</label>
                                <Input
                                    placeholder="z.B. 'User', 'PaymentTransaction'"
                                    value={formData.entity_type}
                                    onChange={(e) => setFormData({...formData, entity_type: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Feldname</label>
                                <Input
                                    placeholder="z.B. 'iban'"
                                    value={formData.field_name}
                                    onChange={(e) => setFormData({...formData, field_name: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Feldbezeichnung</label>
                                <Input
                                    placeholder="z.B. 'IBAN'"
                                    value={formData.field_label}
                                    onChange={(e) => setFormData({...formData, field_label: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Datentyp</label>
                                <Select
                                    value={formData.data_type}
                                    onValueChange={(value) => setFormData({...formData, data_type: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Wählen..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DATA_TYPES.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Key-Rotations-Intervall (Tage)</label>
                            <Input
                                type="number"
                                value={formData.key_rotation_interval_days}
                                onChange={(e) => setFormData({...formData, key_rotation_interval_days: e.target.value})}
                                min="30"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleCreateField} className="flex-1">
                                Erstellen
                            </Button>
                            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                                Abbrechen
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Fields Tab */}
            {activeTab === 'fields' && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Verschlüsselte Felder</h3>
                        {!showForm && (
                            <Button onClick={() => setShowForm(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Neues Feld
                            </Button>
                        )}
                    </div>

                    {fields.map(field => (
                        <Card key={field.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h4 className="font-semibold">{field.field_label}</h4>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {field.entity_type}.{field.field_name}
                                        </p>
                                        <div className="flex gap-2 mb-2">
                                            <Badge>{getDataTypeLabel(field.data_type)}</Badge>
                                            <Badge variant="outline">{field.encryption_algorithm}</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="text-gray-600">
                                                Letzte Rotation: <span className="font-medium">{formatDate(field.last_key_rotation)}</span>
                                            </div>
                                            <div className="text-gray-600">
                                                Nächste Rotation: <span className="font-medium">{formatDate(field.next_key_rotation)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        onClick={() => handleRotateKeys(field.id)}
                                        title="Keys jetzt rotieren"
                                    >
                                        <RotateCw className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {fields.length === 0 && !showForm && (
                        <Card>
                            <CardContent className="p-8 text-center text-gray-500">
                                Keine verschlüsselten Felder konfiguriert
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Audit Tab */}
            {activeTab === 'audit' && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {logs.slice(0, 50).map((log, idx) => (
                        <Card key={idx} className="text-sm">
                            <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="font-medium capitalize">
                                            {log.operation.replace(/_/g, ' ')}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            {log.entity_type}.{log.field_name || '?'} - {formatDate(log.timestamp)}
                                        </div>
                                        {log.reason && (
                                            <div className="text-xs text-gray-600">
                                                Grund: {log.reason}
                                            </div>
                                        )}
                                    </div>
                                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                                        {log.status === 'success' ? '✓' : '✗'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {logs.length === 0 && (
                        <Card>
                            <CardContent className="p-8 text-center text-gray-500">
                                Keine Zugriffe geloggt
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}