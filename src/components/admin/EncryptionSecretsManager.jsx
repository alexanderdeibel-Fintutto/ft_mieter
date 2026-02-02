import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Key, Shield, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function EncryptionSecretsManager({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('encryption');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('encryptionSecretsEngine', {
                action: 'get_dashboard_data',
                organization_id: organizationId
            });
            setData(res.data);
        } catch (error) {
            console.error('Load error:', error);
            toast.error('Fehler beim Laden');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    const statusColors = {
        encrypted: 'bg-green-100 text-green-800',
        decrypted: 'bg-blue-100 text-blue-800',
        pending: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
        success: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        partial: 'bg-orange-100 text-orange-800',
        active: 'bg-green-100 text-green-800',
        deprecated: 'bg-gray-100 text-gray-800',
        staged: 'bg-blue-100 text-blue-800',
        scheduled: 'bg-yellow-100 text-yellow-800',
        allowed: 'bg-green-100 text-green-800',
        denied: 'bg-red-100 text-red-800',
        'read': 'bg-blue-100 text-blue-800',
        'create': 'bg-green-100 text-green-800',
        'update': 'bg-orange-100 text-orange-800',
        'delete': 'bg-red-100 text-red-800',
        'rotate': 'bg-purple-100 text-purple-800'
    };

    const classificationColors = {
        public: 'bg-gray-100 text-gray-800',
        internal: 'bg-blue-100 text-blue-800',
        confidential: 'bg-orange-100 text-orange-800',
        restricted: 'bg-red-100 text-red-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['encryption', 'secrets', 'access'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'encryption' && '🔐 Verschlüsselung'}
                        {tab === 'secrets' && '🔑 Secrets'}
                        {tab === 'access' && '👁️ Zugriff'}
                    </button>
                ))}
            </div>

            {activeTab === 'encryption' && (
                <>
                    <div className="grid grid-cols-5 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.encryption_stats.total_fields}</div>
                            <div className="text-xs text-gray-600">Felder</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.encryption_stats.encrypted_fields}</div>
                            <div className="text-xs text-gray-600">Verschlüsselt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.encryption_stats.total_encrypted_records}</div>
                            <div className="text-xs text-gray-600">Records</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.encryption_stats.total_operations}</div>
                            <div className="text-xs text-gray-600">Operationen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-cyan-600">{data.encryption_stats.success_rate}%</div>
                            <div className="text-xs text-gray-600">Erfolgsrate</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.encrypted_fields.map(field => (
                            <Card key={field.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Lock className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{field.field_name}</h5>
                                                <Badge className={classificationColors[field.data_classification]}>
                                                    {field.data_classification}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap">
                                                <span className="text-xs text-gray-600">
                                                    Entity: {field.entity_type}
                                                </span>
                                                <span className="text-xs text-purple-600">
                                                    Algo: {field.encryption_algorithm}
                                                </span>
                                                <span className="text-xs text-blue-600">
                                                    Records: {field.encrypted_records_count}
                                                </span>
                                                {field.decryption_key_rotations > 0 && (
                                                    <span className="text-xs text-orange-600">
                                                        Rotationen: {field.decryption_key_rotations}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={statusColors[field.encryption_status]}>
                                            {field.encryption_status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'secrets' && (
                <>
                    <div className="grid grid-cols-5 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.secret_stats.total_secrets}</div>
                            <div className="text-xs text-gray-600">Secrets</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.secret_stats.active_secrets}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.secret_stats.rotation_enabled}</div>
                            <div className="text-xs text-gray-600">Mit Rotation</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.secret_stats.secrets_needing_rotation}</div>
                            <div className="text-xs text-gray-600">Rotation fällig</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Typ</h4>
                            {Object.entries(data.secret_stats.by_type || {}).slice(0, 3).map(([type, count]) => (
                                <div key={type} className="text-xs flex justify-between">
                                    <span>{type}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.secrets.map(secret => (
                            <Card key={secret.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Key className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{secret.secret_name}</h5>
                                                <Badge variant="outline" className="text-xs">
                                                    {secret.secret_type}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {secret.environment}
                                                </Badge>
                                            </div>
                                            {secret.description && (
                                                <p className="text-xs text-gray-600 mt-1">{secret.description}</p>
                                            )}
                                            <div className="flex gap-4 mt-2 flex-wrap">
                                                <span className="text-xs text-gray-600">
                                                    Zugriffe: {secret.access_count}
                                                </span>
                                                {secret.rotation_enabled && (
                                                    <span className="text-xs text-orange-600">
                                                        🔄 Rotation: alle {secret.rotation_days} Tage
                                                    </span>
                                                )}
                                                {secret.last_rotated_at && (
                                                    <span className="text-xs text-green-600">
                                                        Rotiert: {new Date(secret.last_rotated_at).toLocaleDateString('de-DE')}
                                                    </span>
                                                )}
                                                {secret.next_rotation_at && (
                                                    <span className="text-xs text-blue-600">
                                                        Nächste: {new Date(secret.next_rotation_at).toLocaleDateString('de-DE')}
                                                    </span>
                                                )}
                                            </div>
                                            {secret.tags && secret.tags.length > 0 && (
                                                <div className="flex gap-1 mt-2 flex-wrap">
                                                    {secret.tags.slice(0, 3).map(tag => (
                                                        <Badge key={tag} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <Badge className={secret.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {secret.is_active ? 'Aktiv' : 'Inaktiv'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'access' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.access_stats.total_accesses}</div>
                            <div className="text-xs text-gray-600">Zugriffe gesamt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.access_stats.allowed_accesses}</div>
                            <div className="text-xs text-gray-600">Erlaubt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.access_stats.denied_accesses}</div>
                            <div className="text-xs text-gray-600">Abgelehnt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Typ</h4>
                            {Object.entries(data.access_stats.by_type || {}).map(([type, count]) => (
                                <div key={type} className="text-xs flex justify-between">
                                    <span>{type}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.access_logs.map(log => (
                            <Card key={log.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Eye className="w-4 h-4 text-gray-600" />
                                                <Badge className={statusColors[log.access_type]}>
                                                    {log.access_type}
                                                </Badge>
                                                <span className="text-xs font-mono text-gray-600">
                                                    {log.secret_id?.substring(0, 12)}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    User: {log.user_id?.substring(0, 12)}
                                                </span>
                                                {log.reason_for_access && (
                                                    <span className="text-gray-600">
                                                        Grund: {log.reason_for_access}
                                                    </span>
                                                )}
                                                {log.ip_address && (
                                                    <span className="text-gray-600">
                                                        IP: {log.ip_address}
                                                    </span>
                                                )}
                                                {log.duration_ms > 0 && (
                                                    <span className="text-purple-600">
                                                        ⏱️ {log.duration_ms}ms
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                {new Date(log.timestamp).toLocaleString('de-DE')}
                                            </span>
                                        </div>
                                        <Badge className={statusColors[log.status]}>
                                            {log.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}