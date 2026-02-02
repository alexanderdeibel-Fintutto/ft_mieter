import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key, Eye, EyeOff, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SecretsVaultDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('secrets');
    const [revealedSecrets, setRevealedSecrets] = useState({});

    useEffect(() => {
        loadData();
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('secretsVaultEngine', {
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

    const revealSecret = async (secretId) => {
        try {
            const res = await base44.functions.invoke('secretsVaultEngine', {
                action: 'get_secret',
                organization_id: organizationId,
                secret_id: secretId
            });
            setRevealedSecrets(prev => ({
                ...prev,
                [secretId]: res.data.secret_value
            }));
            setTimeout(() => {
                setRevealedSecrets(prev => {
                    const next = { ...prev };
                    delete next[secretId];
                    return next;
                });
            }, 30000);
        } catch (error) {
            toast.error('Fehler beim Abrufen des Secrets');
        }
    };

    const rotateSecret = async (secretId) => {
        const newValue = prompt('Neuer Secret-Wert:');
        if (!newValue) return;

        try {
            await base44.functions.invoke('secretsVaultEngine', {
                action: 'rotate_secret',
                organization_id: organizationId,
                secret_id: secretId,
                new_value: newValue
            });
            toast.success('Secret rotiert');
            loadData();
        } catch (error) {
            toast.error('Fehler beim Rotieren');
        }
    };

    const deleteSecret = async (secretId) => {
        if (!confirm('Secret wirklich deaktivieren?')) return;

        try {
            await base44.functions.invoke('secretsVaultEngine', {
                action: 'delete_secret',
                organization_id: organizationId,
                secret_id: secretId
            });
            toast.success('Secret deaktiviert');
            loadData();
        } catch (error) {
            toast.error('Fehler beim Deaktivieren');
        }
    };

    if (loading || !data) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    const typeColors = {
        api_key: 'bg-blue-100 text-blue-800',
        password: 'bg-red-100 text-red-800',
        certificate: 'bg-purple-100 text-purple-800',
        token: 'bg-green-100 text-green-800',
        connection_string: 'bg-yellow-100 text-yellow-800',
        custom: 'bg-gray-100 text-gray-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['secrets', 'logs', 'stats'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'secrets' && '🔐 Secrets'}
                        {tab === 'logs' && '📋 Access Logs'}
                        {tab === 'stats' && '📊 Statistiken'}
                    </button>
                ))}
            </div>

            {activeTab === 'secrets' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_secrets}</div>
                            <div className="text-xs text-gray-600">Secrets</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_secrets}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.total_versions}</div>
                            <div className="text-xs text-gray-600">Versionen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.stats.secrets_needing_rotation}</div>
                            <div className="text-xs text-gray-600">Rotation fällig</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.secrets.map(secret => (
                            <Card key={secret.id} className={!secret.is_active ? 'opacity-50' : ''}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Key className="w-4 h-4 text-blue-600" />
                                                <span className="font-semibold text-sm">{secret.secret_name}</span>
                                                <Badge className={typeColors[secret.secret_type]}>
                                                    {secret.secret_type}
                                                </Badge>
                                                {!secret.is_active && (
                                                    <Badge className="bg-gray-100 text-gray-800">inaktiv</Badge>
                                                )}
                                            </div>
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                                                {secret.secret_key}
                                            </code>
                                            <p className="text-xs text-gray-600 mt-1">{secret.description}</p>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Version: {secret.current_version}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Rotation: {secret.rotation_policy}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Zugriffe: {secret.access_count || 0}
                                                </span>
                                            </div>
                                            {revealedSecrets[secret.id] && (
                                                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                                    <code className="text-xs">{revealedSecrets[secret.id]}</code>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        ⚠️ Wird in 30s ausgeblendet
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {!revealedSecrets[secret.id] ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => revealSecret(secret.id)}
                                                    disabled={!secret.is_active}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setRevealedSecrets(prev => {
                                                        const next = {...prev};
                                                        delete next[secret.id];
                                                        return next;
                                                    })}
                                                >
                                                    <EyeOff className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => rotateSecret(secret.id)}
                                                disabled={!secret.is_active}
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => deleteSecret(secret.id)}
                                                disabled={!secret.is_active}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'logs' && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_accesses}</div>
                            <div className="text-xs text-gray-600">Zugriffe gesamt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Nach Typ</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.logs_by_type || {}).map(([type, count]) => (
                                    <Badge key={type} variant="outline">
                                        {type}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Letzte Zugriffe</h4>
                        {data.recent_logs.map(log => {
                            const secret = data.secrets.find(s => s.id === log.secret_id);
                            return (
                                <Card key={log.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {log.access_type}
                                                    </Badge>
                                                    <span className="text-sm">{secret?.secret_name || 'Unknown'}</span>
                                                </div>
                                                <div className="flex gap-4 mt-2 text-xs text-gray-600">
                                                    <span>User: {log.accessed_by}</span>
                                                    {log.ip_address && <span>IP: {log.ip_address}</span>}
                                                    <span>{new Date(log.timestamp).toLocaleString('de-DE')}</span>
                                                </div>
                                                {log.error_message && (
                                                    <p className="text-xs text-red-600 mt-1">{log.error_message}</p>
                                                )}
                                            </div>
                                            <Badge className={log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                {log.success ? 'success' : 'failed'}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {activeTab === 'stats' && (
                <>
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Secrets nach Typ</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.entries(data.secrets_by_type || {}).map(([type, count]) => (
                                    <div key={type} className="text-center p-3 border rounded">
                                        <Badge className={typeColors[type]}>{type}</Badge>
                                        <div className="text-lg font-bold text-blue-600 mt-2">{count}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-sm">Rotation-Status</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {data.secrets.filter(s => s.is_active).map(secret => {
                                    let needsRotation = false;
                                    if (secret.rotation_policy !== 'never') {
                                        if (!secret.last_rotated_at) {
                                            needsRotation = true;
                                        } else {
                                            const days = parseInt(secret.rotation_policy.split('_')[0]);
                                            const lastRotated = new Date(secret.last_rotated_at);
                                            const daysSince = Math.floor((Date.now() - lastRotated) / (1000 * 60 * 60 * 24));
                                            needsRotation = daysSince > days;
                                        }
                                    }
                                    return (
                                        <div key={secret.id} className="p-2 border rounded flex justify-between items-center">
                                            <span className="text-sm">{secret.secret_name}</span>
                                            <div className="flex gap-2 items-center">
                                                <Badge variant="outline" className="text-xs">
                                                    {secret.rotation_policy}
                                                </Badge>
                                                {needsRotation && (
                                                    <Badge className="bg-red-100 text-red-800">
                                                        Rotation fällig
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}