import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Bug, RotateCcw, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function ErrorManagementDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('errors');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('errorHandlingEngine', {
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
        critical: 'bg-red-100 text-red-800',
        high: 'bg-orange-100 text-orange-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-blue-100 text-blue-800',
        new: 'bg-blue-100 text-blue-800',
        assigned: 'bg-purple-100 text-purple-800',
        investigating: 'bg-orange-100 text-orange-800',
        'in_progress': 'bg-cyan-100 text-cyan-800',
        resolved: 'bg-green-100 text-green-800',
        'wont_fix': 'bg-gray-100 text-gray-800',
        successful: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        'in_progress': 'bg-yellow-100 text-yellow-800',
        isolated: 'bg-blue-100 text-blue-800',
        localized: 'bg-orange-100 text-orange-800',
        'system_wide': 'bg-red-100 text-red-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['errors', 'trackers', 'recovery', 'analytics'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'errors' && '🐛 Fehler'}
                        {tab === 'trackers' && '📍 Tracker'}
                        {tab === 'recovery' && '🔄 Recovery'}
                        {tab === 'analytics' && '📊 Analytik'}
                    </button>
                ))}
            </div>

            {activeTab === 'errors' && (
                <>
                    <div className="grid grid-cols-5 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.error_stats.total_errors}</div>
                            <div className="text-xs text-gray-600">Fehler</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">
                                {data.error_stats.unresolved_errors}
                            </div>
                            <div className="text-xs text-gray-600">Ungelöst</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-700">
                                {data.error_stats.critical_errors}
                            </div>
                            <div className="text-xs text-gray-600">Kritisch</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">
                                {data.error_stats.high_errors}
                            </div>
                            <div className="text-xs text-gray-600">Hoch</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Schweregrad</h4>
                            {Object.entries(data.error_stats.by_severity || {}).map(([sev, count]) => (
                                <div key={sev} className="text-xs flex justify-between">
                                    <span>{sev}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.logs.map(log => (
                            <Card key={log.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Bug className="w-4 h-4 text-gray-600" />
                                                <span className="font-semibold text-sm">{log.error_type}</span>
                                                <Badge className={statusColors[log.severity]}>
                                                    {log.severity}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                {log.error_message}
                                            </p>
                                            <div className="flex gap-4 mt-2 flex-wrap">
                                                {log.component && (
                                                    <span className="text-xs text-gray-600">
                                                        Komponente: {log.component}
                                                    </span>
                                                )}
                                                {log.source_file && (
                                                    <span className="text-xs text-gray-600">
                                                        {log.source_file}:{log.line_number}
                                                    </span>
                                                )}
                                                <span className="text-xs text-purple-600">
                                                    Aufgetreten: {log.occurrence_count}x
                                                </span>
                                                <Badge variant="outline" className="text-xs">
                                                    {log.environment}
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                Zuletzt: {new Date(log.last_occurred_at).toLocaleString('de-DE')}
                                            </span>
                                        </div>
                                        <Badge className={log.is_resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                            {log.is_resolved ? '✓ Gelöst' : 'Offen'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'trackers' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.tracker_stats.total_trackers}
                            </div>
                            <div className="text-xs text-gray-600">Tracker</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.tracker_stats.new_trackers}
                            </div>
                            <div className="text-xs text-gray-600">Neu</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.tracker_stats.assigned_trackers}
                            </div>
                            <div className="text-xs text-gray-600">Zugewiesen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.tracker_stats.resolved_trackers}
                            </div>
                            <div className="text-xs text-gray-600">Gelöst</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.trackers.map(tracker => (
                            <Card key={tracker.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-gray-600" />
                                                <span className="font-semibold text-sm">{tracker.exception_type}</span>
                                                <Badge className={statusColors[tracker.impact_level]}>
                                                    {tracker.impact_level}
                                                </Badge>
                                            </div>
                                            {tracker.root_cause && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Ursache: {tracker.root_cause}
                                                </p>
                                            )}
                                            <div className="flex gap-4 mt-2 flex-wrap">
                                                {tracker.affected_modules && tracker.affected_modules.length > 0 && (
                                                    <span className="text-xs text-gray-600">
                                                        Module: {tracker.affected_modules.join(', ')}
                                                    </span>
                                                )}
                                                {tracker.user_impact > 0 && (
                                                    <span className="text-xs text-red-600">
                                                        👥 {tracker.user_impact} Benutzer betroffen
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={statusColors[tracker.status]}>
                                            {tracker.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'recovery' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.recovery_stats.total_recoveries}
                            </div>
                            <div className="text-xs text-gray-600">Recovery-Versuche</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.recovery_stats.successful_recoveries}
                            </div>
                            <div className="text-xs text-gray-600">Erfolgreich</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">
                                {data.recovery_stats.failed_recoveries}
                            </div>
                            <div className="text-xs text-gray-600">Fehlgeschlagen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.recovery_stats.success_rate}%
                            </div>
                            <div className="text-xs text-gray-600">Erfolgsrate</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.recoveries.map(recovery => (
                            <Card key={recovery.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <RotateCcw className="w-4 h-4 text-gray-600" />
                                                <span className="font-semibold text-sm">
                                                    {recovery.recovery_strategy}
                                                </span>
                                            </div>
                                            {recovery.fallback_action && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Fallback: {recovery.fallback_action}
                                                </p>
                                            )}
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Versuche: {recovery.retry_count}/{recovery.max_retries}
                                                </span>
                                                {recovery.recovery_time_ms > 0 && (
                                                    <span className="text-xs text-purple-600">
                                                        ⏱️ {recovery.recovery_time_ms}ms
                                                    </span>
                                                )}
                                                {recovery.error_after_recovery && (
                                                    <span className="text-xs text-red-600">
                                                        ⚠️ Error: {recovery.error_after_recovery}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={recovery.is_successful ? 'bg-green-100 text-green-800' : statusColors[recovery.status]}>
                                            {recovery.is_successful ? '✓ Erfolg' : recovery.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'analytics' && (
                <>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.analysis_stats.total_analyses}
                            </div>
                            <div className="text-xs text-gray-600">Analysen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.analysis_stats.high_confidence}
                            </div>
                            <div className="text-xs text-gray-600">High Confidence</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">
                                {data.analysis_stats.patterns_identified}
                            </div>
                            <div className="text-xs text-gray-600">Muster erkannt</div>
                        </CardContent></Card>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {data.analyses.slice(0, 10).map(analysis => (
                            <Card key={analysis.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between mb-2">
                                        <BarChart3 className="w-4 h-4 text-gray-600" />
                                        <Badge className="text-xs">
                                            Score: {analysis.confidence_score?.toFixed(0)}%
                                        </Badge>
                                    </div>
                                    <div className="text-xs space-y-1">
                                        <div><span className="font-semibold">Typ:</span> {analysis.analysis_type}</div>
                                        <div><span className="font-semibold">Häufigkeit:</span> {analysis.pattern_frequency}</div>
                                        <div><span className="font-semibold">Ähnliche:</span> {analysis.similar_errors_count}</div>
                                        {analysis.root_cause_analysis && (
                                            <div className="text-gray-600 line-clamp-2">
                                                {analysis.root_cause_analysis}
                                            </div>
                                        )}
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