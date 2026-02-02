import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flag, FlaskConical, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function FeatureFlagDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('flags');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('featureFlagEngine', {
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
        draft: 'bg-gray-100 text-gray-800',
        running: 'bg-green-100 text-green-800',
        paused: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-blue-100 text-blue-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['flags', 'tests', 'results'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'flags' && '🚩 Feature Flags'}
                        {tab === 'tests' && '🧪 A/B Tests'}
                        {tab === 'results' && '📊 Ergebnisse'}
                    </button>
                ))}
            </div>

            {activeTab === 'flags' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_flags}</div>
                            <div className="text-xs text-gray-600">Flags</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.enabled_flags}</div>
                            <div className="text-xs text-gray-600">Aktiviert</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.total_evaluations}</div>
                            <div className="text-xs text-gray-600">Evaluierungen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Nach Typ</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.flags_by_type || {}).map(([type, count]) => (
                                    <Badge key={type} variant="outline">
                                        {type}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.flags.map(flag => {
                            const enabledRate = flag.total_evaluations > 0
                                ? Math.round(((flag.enabled_count || 0) / flag.total_evaluations) * 100)
                                : 0;
                            return (
                                <Card key={flag.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Flag className="w-4 h-4 text-blue-600" />
                                                    <h5 className="font-semibold text-sm">{flag.flag_name}</h5>
                                                    <Badge variant="outline">{flag.flag_type}</Badge>
                                                    {flag.enabled && (
                                                        <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Key: {flag.flag_key}
                                                </p>
                                                {flag.description && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {flag.description}
                                                    </p>
                                                )}
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Rollout: {flag.rollout_percentage || 0}%
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Default: {flag.default_value}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Evaluierungen: {flag.total_evaluations || 0}
                                                    </span>
                                                </div>
                                                {flag.environments && flag.environments.length > 0 && (
                                                    <div className="flex gap-1 mt-2 flex-wrap">
                                                        {flag.environments.map(env => (
                                                            <Badge key={env} variant="outline" className="text-xs">
                                                                {env}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                {flag.total_evaluations > 0 && (
                                                    <div className="mt-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                                <div 
                                                                    className="h-2 rounded-full bg-green-500"
                                                                    style={{ width: `${enabledRate}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-gray-600">{enabledRate}% enabled</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <Badge className={flag.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                {flag.enabled ? 'ON' : 'OFF'}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {activeTab === 'tests' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_tests}</div>
                            <div className="text-xs text-gray-600">Tests</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.running_tests}</div>
                            <div className="text-xs text-gray-600">Laufend</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.total_participants}</div>
                            <div className="text-xs text-gray-600">Teilnehmer</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.stats.conversion_rate}%</div>
                            <div className="text-xs text-gray-600">Conversion Rate</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.tests.map(test => {
                            const conversionRate = test.total_participants > 0
                                ? Math.round((test.total_conversions / test.total_participants) * 100)
                                : 0;
                            return (
                                <Card key={test.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <FlaskConical className="w-4 h-4 text-blue-600" />
                                                    <h5 className="font-semibold text-sm">{test.test_name}</h5>
                                                    <Badge variant="outline">{test.test_key}</Badge>
                                                </div>
                                                {test.description && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {test.description}
                                                    </p>
                                                )}
                                                <div className="flex gap-2 mt-2 flex-wrap">
                                                    {test.variants.map((variant, idx) => (
                                                        <Badge key={idx} variant="outline">
                                                            {variant.name} ({variant.weight || 50}%)
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Traffic: {test.traffic_allocation || 100}%
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Teilnehmer: {test.total_participants || 0}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Conversions: {test.total_conversions || 0}
                                                    </span>
                                                </div>
                                                {test.primary_metric && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Metrik: {test.primary_metric}
                                                    </p>
                                                )}
                                                {test.started_at && (
                                                    <span className="text-xs text-gray-600 mt-2 inline-block">
                                                        Start: {new Date(test.started_at).toLocaleDateString('de-DE')}
                                                    </span>
                                                )}
                                                {test.ended_at && (
                                                    <span className="text-xs text-gray-600 ml-3">
                                                        Ende: {new Date(test.ended_at).toLocaleDateString('de-DE')}
                                                    </span>
                                                )}
                                                {test.total_participants > 0 && (
                                                    <div className="mt-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-600">Conversion:</span>
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                                <div 
                                                                    className="h-2 rounded-full bg-green-500"
                                                                    style={{ width: `${conversionRate}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-semibold text-green-600">{conversionRate}%</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <Badge className={statusColors[test.status]}>
                                                {test.status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {activeTab === 'results' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.results.length}</div>
                            <div className="text-xs text-gray-600">Ergebnisse</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.results.filter(r => r.converted).length}
                            </div>
                            <div className="text-xs text-gray-600">Conversions</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.stats.conversion_rate}%</div>
                            <div className="text-xs text-gray-600">Conversion Rate</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.stats.total_conversions}
                            </div>
                            <div className="text-xs text-gray-600">Gesamt-Conversions</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.results.map(result => {
                            const test = data.tests.find(t => t.id === result.test_id);
                            return (
                                <Card key={result.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="w-4 h-4 text-blue-600" />
                                                    <span className="font-semibold text-sm">{result.variant_name}</span>
                                                    <Badge variant="outline">
                                                        {test?.test_name || 'Unknown Test'}
                                                    </Badge>
                                                </div>
                                                <div className="flex gap-4 mt-2">
                                                    {result.user_id && (
                                                        <span className="text-xs text-gray-600">
                                                            User: {result.user_id.substring(0, 8)}...
                                                        </span>
                                                    )}
                                                    {result.session_id && (
                                                        <span className="text-xs text-gray-600">
                                                            Session: {result.session_id.substring(0, 8)}...
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    Zugewiesen: {new Date(result.assigned_at).toLocaleString('de-DE')}
                                                </span>
                                                {result.converted && result.converted_at && (
                                                    <span className="text-xs text-green-600 ml-3">
                                                        Konvertiert: {new Date(result.converted_at).toLocaleString('de-DE')}
                                                    </span>
                                                )}
                                                {result.metric_value && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Metrik-Wert: {result.metric_value}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge className={result.converted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                {result.converted ? 'Converted' : 'Assigned'}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}