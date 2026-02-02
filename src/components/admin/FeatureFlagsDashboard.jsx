import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flag, Beaker, TrendingUp, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

export default function FeatureFlagsDashboard({ organizationId }) {
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
            const res = await base44.functions.invoke('featureFlagsEngine', {
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
        enabled: 'bg-green-100 text-green-800',
        disabled: 'bg-red-100 text-red-800',
        draft: 'bg-gray-100 text-gray-800',
        archived: 'bg-purple-100 text-purple-800',
        boolean: 'bg-blue-100 text-blue-800',
        multivariate: 'bg-cyan-100 text-cyan-800',
        percentage: 'bg-orange-100 text-orange-800',
        custom: 'bg-indigo-100 text-indigo-800',
        planning: 'bg-gray-100 text-gray-800',
        running: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        paused: 'bg-yellow-100 text-yellow-800',
        'control_vs_variant': 'bg-purple-100 text-purple-800',
        'multi_armed_bandit': 'bg-orange-100 text-orange-800',
        sequential: 'bg-cyan-100 text-cyan-800'
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
                        {tab === 'results' && '📈 Ergebnisse'}
                    </button>
                ))}
            </div>

            {activeTab === 'flags' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.flag_stats.total_flags}</div>
                            <div className="text-xs text-gray-600">Flags</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.flag_stats.enabled_flags}</div>
                            <div className="text-xs text-gray-600">Aktiviert</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.flag_stats.disabled_flags}</div>
                            <div className="text-xs text-gray-600">Deaktiviert</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-gray-600">{data.flag_stats.draft_flags}</div>
                            <div className="text-xs text-gray-600">Entwurf</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.flag_stats.archived_flags}</div>
                            <div className="text-xs text-gray-600">Archiviert</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Typ</h4>
                            {Object.entries(data.flag_stats.by_type || {}).slice(0, 3).map(([type, count]) => (
                                <div key={type} className="text-xs flex justify-between">
                                    <span>{type}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </Card></CardContent>
                    </div>

                    <div className="space-y-2">
                        {data.flags.map(flag => (
                            <Card key={flag.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Flag className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{flag.flag_name}</h5>
                                                <Badge className={statusColors[flag.flag_type]}>
                                                    {flag.flag_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="font-mono text-gray-600">
                                                    {flag.flag_key}
                                                </span>
                                                {flag.rollout_percentage > 0 && (
                                                    <span className="text-blue-600">
                                                        Rollout: {flag.rollout_percentage}%
                                                    </span>
                                                )}
                                                {flag.enabled_for_users && flag.enabled_for_users.length > 0 && (
                                                    <span className="text-green-600">
                                                        ✓ {flag.enabled_for_users.length} User
                                                    </span>
                                                )}
                                                {flag.disabled_for_users && flag.disabled_for_users.length > 0 && (
                                                    <span className="text-red-600">
                                                        ✗ {flag.disabled_for_users.length} User
                                                    </span>
                                                )}
                                            </div>
                                            {flag.description && (
                                                <p className="text-xs text-gray-600 mt-1">{flag.description}</p>
                                            )}
                                        </div>
                                        <Badge className={statusColors[flag.status]}>
                                            {flag.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'tests' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.test_stats.total_tests}</div>
                            <div className="text-xs text-gray-600">Tests</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-gray-600">{data.test_stats.planning_tests}</div>
                            <div className="text-xs text-gray-600">Planung</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.test_stats.running_tests}</div>
                            <div className="text-xs text-gray-600">Läuft</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.test_stats.completed_tests}</div>
                            <div className="text-xs text-gray-600">Abgeschlossen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.test_stats.paused_tests}</div>
                            <div className="text-xs text-gray-600">Unterbrochen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Typ</h4>
                            {Object.entries(data.test_stats.by_type || {}).slice(0, 3).map(([type, count]) => (
                                <div key={type} className="text-xs flex justify-between">
                                    <span className="truncate">{type}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </Card></CardContent>
                    </div>

                    <div className="space-y-2">
                        {data.tests.map(test => (
                            <Card key={test.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Beaker className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{test.test_name}</h5>
                                                <Badge className={statusColors[test.test_type]}>
                                                    {test.test_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Metrik: {test.primary_metric}
                                                </span>
                                                <span className="text-purple-600">
                                                    Sample/Variante: {test.sample_size_per_variant}
                                                </span>
                                                <span className="text-blue-600">
                                                    Min-Runtime: {test.minimum_runtime_days}d
                                                </span>
                                                <span className="text-cyan-600">
                                                    Significance: {(test.statistical_significance_level * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            {test.hypothesis && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Hypothese: {test.hypothesis}
                                                </p>
                                            )}
                                            {test.started_at && (
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    Gestartet: {new Date(test.started_at).toLocaleDateString('de-DE')}
                                                </span>
                                            )}
                                        </div>
                                        <Badge className={statusColors[test.status]}>
                                            {test.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'results' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.result_stats.total_results}</div>
                            <div className="text-xs text-gray-600">Ergebnisse</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.result_stats.significant_results}</div>
                            <div className="text-xs text-gray-600">Signifikant</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.result_stats.avg_conversion_rate}%</div>
                            <div className="text-xs text-gray-600">Ø Konversionsrate</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-cyan-600">{data.result_stats.avg_participants}</div>
                            <div className="text-xs text-gray-600">Ø Teilnehmer</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.results.slice(0, 40).map(result => (
                            <Card key={result.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{result.variant_key}</h5>
                                                <span className="text-xs font-mono text-gray-600">
                                                    {result.test_id?.substring(0, 8)}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-purple-600">
                                                    Teilnehmer: {result.total_participants}
                                                </span>
                                                <span className="text-green-600">
                                                    Konversionen: {result.conversions}
                                                </span>
                                                <span className="text-blue-600 font-bold">
                                                    Rate: {result.conversion_rate}%
                                                </span>
                                                {result.lift_percentage && (
                                                    <span className="text-cyan-600">
                                                        Lift: {result.lift_percentage.toFixed(2)}%
                                                    </span>
                                                )}
                                                {result.average_value > 0 && (
                                                    <span className="text-orange-600">
                                                        Ø Wert: {result.average_value.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                            {result.p_value && (
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    P-Wert: {result.p_value.toFixed(4)}
                                                </span>
                                            )}
                                        </div>
                                        <Badge className={result.is_significant ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {result.is_significant ? '✓ Signifikant' : 'Nicht signifikant'}
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