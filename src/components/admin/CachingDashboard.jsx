import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function CachingDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('stats');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('cachingEngine', {
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

    const handleCleanup = async () => {
        try {
            await base44.functions.invoke('cachingEngine', {
                action: 'cleanup_expired',
                organization_id: organizationId
            });
            toast.success('Cache bereinigt');
            loadData();
        } catch (error) {
            toast.error('Fehler beim Bereinigen');
        }
    };

    if (loading || !data) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['stats', 'rules', 'optimizations'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}>
                        {tab === 'stats' && '📊 Cache Stats'}
                        {tab === 'rules' && '🔄 Invalidierung'}
                        {tab === 'optimizations' && '⚡ Optimierungen'}
                    </button>
                ))}
            </div>

            {activeTab === 'stats' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.cache_stats.total_entries}</div>
                            <div className="text-xs text-gray-600">Cache-Einträge</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.cache_stats.total_hits}</div>
                            <div className="text-xs text-gray-600">Cache-Hits</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.cache_stats.total_size_mb} MB</div>
                            <div className="text-xs text-gray-600">Cache-Größe</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.cache_stats.avg_hit_count}</div>
                            <div className="text-xs text-gray-600">Ø Hits/Eintrag</div>
                        </CardContent></Card>
                    </div>

                    <Button onClick={handleCleanup} variant="outline">
                        <Trash2 className="w-4 h-4 mr-2" />Cache bereinigen
                    </Button>

                    <Card>
                        <CardHeader><CardTitle className="text-sm">Cache-Verteilung</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(data.cache_stats.by_type || {}).map(([type, count]) => (
                                    <div key={type} className="flex justify-between items-center p-2 border rounded">
                                        <span className="text-sm font-medium">{type}</span>
                                        <Badge>{count} Einträge</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {activeTab === 'rules' && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_rules}</div>
                            <div className="text-xs text-gray-600">Regeln</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_rules}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.rules.map(rule => (
                            <Card key={rule.id}><CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h5 className="font-semibold text-sm">{rule.rule_name}</h5>
                                        <p className="text-xs text-gray-600 mt-1">Trigger: {rule.trigger_type}</p>
                                        {rule.entity_type && <p className="text-xs text-gray-600">Entity: {rule.entity_type}</p>}
                                    </div>
                                    <Badge className={rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                        {rule.is_active ? 'Aktiv' : 'Inaktiv'}
                                    </Badge>
                                </div>
                            </CardContent></Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'optimizations' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_optimizations}</div>
                            <div className="text-xs text-gray-600">Optimierungen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.enabled_optimizations}</div>
                            <div className="text-xs text-gray-600">Aktiviert</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.optimizations.length > 0 
                                    ? (data.optimizations.reduce((s, o) => s + (o.performance_gain_percent || 0), 0) / data.optimizations.length).toFixed(1)
                                    : 0}%
                            </div>
                            <div className="text-xs text-gray-600">Ø Performance-Gewinn</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.optimizations.map(opt => (
                            <Card key={opt.id}><CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h5 className="font-semibold text-sm">{opt.optimization_name}</h5>
                                        <p className="text-xs text-gray-600 mt-1">{opt.optimization_type}</p>
                                        {opt.performance_gain_percent && (
                                            <p className="text-xs text-green-600 mt-1">+{opt.performance_gain_percent}% Gewinn</p>
                                        )}
                                    </div>
                                    <Badge className={
                                        opt.status === 'enabled' ? 'bg-green-100 text-green-800' :
                                        opt.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }>{opt.status}</Badge>
                                </div>
                            </CardContent></Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}