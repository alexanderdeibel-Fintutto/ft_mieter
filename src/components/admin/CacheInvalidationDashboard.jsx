import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Trash2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function CacheInvalidationDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('entries');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('cacheInvalidationEngine', {
                action: 'get_cache_stats',
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

    const layerColors = {
        memory: 'bg-blue-100 text-blue-800',
        redis: 'bg-red-100 text-red-800',
        cdn: 'bg-purple-100 text-purple-800',
        browser: 'bg-green-100 text-green-800',
        database: 'bg-orange-100 text-orange-800',
        pending: 'bg-yellow-100 text-yellow-800',
        in_progress: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        ttl_expired: 'bg-gray-100 text-gray-800',
        manual: 'bg-indigo-100 text-indigo-800',
        event_triggered: 'bg-purple-100 text-purple-800'
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['entries', 'policies', 'invalidations'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'entries' && '💾 Cache-Einträge'}
                        {tab === 'policies' && '📋 Policies'}
                        {tab === 'invalidations' && '🗑️ Invalidierungen'}
                    </button>
                ))}
            </div>

            {activeTab === 'entries' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_entries}</div>
                            <div className="text-xs text-gray-600">Cache-Einträge</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.total_size_mb}MB</div>
                            <div className="text-xs text-gray-600">Speicher</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.hit_rate}%</div>
                            <div className="text-xs text-gray-600">Hit-Rate</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.stats.total_hits}</div>
                            <div className="text-xs text-gray-600">Hits / {data.stats.total_misses} Misses</div>
                        </CardContent></Card>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-sm mb-3">Cache-Schichten</h4>
                            <div className="space-y-2">
                                {Object.entries(data.stats.entries_by_layer || {}).map(([layer, count]) => (
                                    <div key={layer} className="flex items-center justify-between">
                                        <Badge className={layerColors[layer]}>{layer}</Badge>
                                        <span className="text-sm font-semibold">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent></Card>

                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-sm mb-3">Speicher-Übersicht</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Gesamt</span>
                                    <span className="text-sm font-semibold">{formatBytes(data.stats.total_size_bytes)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Freigegeben</span>
                                    <span className="text-sm font-semibold text-green-600">{formatBytes(data.stats.total_space_freed)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Durchschn. Eintrag</span>
                                    <span className="text-sm font-semibold">
                                        {data.stats.total_entries > 0 ? formatBytes(data.stats.total_size_bytes / data.stats.total_entries) : '0 B'}
                                    </span>
                                </div>
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.entries.map(entry => (
                            <Card key={entry.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-gray-600" />
                                                <span className="font-semibold text-sm truncate">{entry.cache_key}</span>
                                                <Badge className={layerColors[entry.cache_layer]}>
                                                    {entry.cache_layer}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Größe: {formatBytes(entry.value_size_bytes || 0)}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    TTL: {entry.ttl_seconds}s
                                                </span>
                                                <span className="text-xs text-green-600">
                                                    Hits: {entry.hit_count || 0}
                                                </span>
                                                <span className="text-xs text-red-600">
                                                    Misses: {entry.miss_count || 0}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                {entry.is_compressed && (
                                                    <Badge variant="outline" className="text-xs">🗜️ Komprimiert</Badge>
                                                )}
                                                {entry.is_encrypted && (
                                                    <Badge variant="outline" className="text-xs">🔒 Verschlüsselt</Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                Zugriff: {new Date(entry.last_accessed_at).toLocaleString('de-DE')}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'policies' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_policies}</div>
                            <div className="text-xs text-gray-600">Policies</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_policies}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.total_entries}</div>
                            <div className="text-xs text-gray-600">Verwaltete Einträge</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-indigo-600">
                                {data.policies.filter(p => p.compression_enabled).length}
                            </div>
                            <div className="text-xs text-gray-600">Mit Komprimierung</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.policies.map(policy => (
                            <Card key={policy.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <BarChart3 className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{policy.policy_name}</h5>
                                                <Badge variant="outline">{policy.cache_pattern}</Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    TTL: {policy.default_ttl_seconds}s (max: {policy.max_ttl_seconds}s)
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Strategie: {policy.invalidation_strategy}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Priorität: {policy.priority}
                                                </span>
                                            </div>
                                            {policy.cache_layers && policy.cache_layers.length > 0 && (
                                                <div className="flex gap-1 mt-2 flex-wrap">
                                                    <span className="text-xs text-gray-600">Schichten:</span>
                                                    {policy.cache_layers.map(layer => (
                                                        <Badge key={layer} variant="outline" className="text-xs">
                                                            {layer}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            {policy.invalidation_events && policy.invalidation_events.length > 0 && (
                                                <div className="flex gap-1 mt-2 flex-wrap">
                                                    <span className="text-xs text-gray-600">Events:</span>
                                                    {policy.invalidation_events.slice(0, 3).map(event => (
                                                        <Badge key={event} variant="outline" className="text-xs">
                                                            {event}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex gap-2 mt-2">
                                                {policy.compression_enabled && (
                                                    <Badge className="bg-green-100 text-green-800 text-xs">🗜️ Komprimierung</Badge>
                                                )}
                                                {policy.encryption_enabled && (
                                                    <Badge className="bg-blue-100 text-blue-800 text-xs">🔒 Verschlüsselung</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={policy.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {policy.is_active ? 'ON' : 'OFF'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'invalidations' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_invalidations}</div>
                            <div className="text-xs text-gray-600">Invalidierungen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">
                                {data.invalidations.reduce((sum, inv) => sum + (inv.entries_invalidated || 0), 0)}
                            </div>
                            <div className="text-xs text-gray-600">Einträge invalidiert</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {formatBytes(data.stats.total_space_freed)}
                            </div>
                            <div className="text-xs text-gray-600">Speicher freigegeben</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.invalidations.filter(inv => inv.status === 'completed').length}
                            </div>
                            <div className="text-xs text-gray-600">Abgeschlossen</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.invalidations.map(invalidation => (
                            <Card key={invalidation.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                                <Badge className={layerColors[invalidation.reason] || 'bg-gray-100 text-gray-800'}>
                                                    {invalidation.reason}
                                                </Badge>
                                                {invalidation.pattern && (
                                                    <span className="text-xs font-mono text-gray-600">
                                                        {invalidation.pattern}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Invalidiert: {invalidation.entries_invalidated || 0}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Betroffene: {invalidation.entries_affected || 0}
                                                </span>
                                                <span className="text-xs text-green-600">
                                                    Freigegeben: {formatBytes(invalidation.space_freed_bytes || 0)}
                                                </span>
                                                {invalidation.duration_ms && (
                                                    <span className="text-xs text-gray-600">
                                                        Dauer: {invalidation.duration_ms}ms
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                {new Date(invalidation.started_at).toLocaleString('de-DE')}
                                            </span>
                                        </div>
                                        <Badge className={layerColors[invalidation.status]}>
                                            {invalidation.status}
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