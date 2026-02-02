import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HardDrive, RefreshCw, Shield, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function DisasterRecoveryManager({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('backups');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('disasterRecoveryEngine', {
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
        pending: 'bg-gray-100 text-gray-800',
        'in_progress': 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        corrupted: 'bg-red-100 text-red-800',
        archived: 'bg-purple-100 text-purple-800',
        verified: 'bg-green-100 text-green-800',
        cancelled: 'bg-gray-100 text-gray-800'
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['backups', 'restores', 'plans'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'backups' && '💾 Backups'}
                        {tab === 'restores' && '🔄 Wiederherstellungen'}
                        {tab === 'plans' && '📋 DR-Pläne'}
                    </button>
                ))}
            </div>

            {activeTab === 'backups' && (
                <>
                    <div className="grid grid-cols-6 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.backup_stats.total_backups}</div>
                            <div className="text-xs text-gray-600">Backups</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.backup_stats.completed_backups}</div>
                            <div className="text-xs text-gray-600">Erfolgreich</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.backup_stats.failed_backups}</div>
                            <div className="text-xs text-gray-600">Fehlgeschlagen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.backup_stats.verified_backups}</div>
                            <div className="text-xs text-gray-600">Verifiziert</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-lg font-bold text-orange-600">
                                {formatBytes(data.backup_stats.total_size_bytes)}
                            </div>
                            <div className="text-xs text-gray-600">Gesamtgröße</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-lg font-bold text-cyan-600">
                                {data.backup_stats.avg_compression_ratio}%
                            </div>
                            <div className="text-xs text-gray-600">Ø Kompression</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.backups.map(backup => (
                            <Card key={backup.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <HardDrive className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{backup.backup_name}</h5>
                                                <Badge variant="outline" className="text-xs">
                                                    {backup.backup_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap">
                                                <span className="text-xs text-gray-600">
                                                    Quelle: {backup.source_type}
                                                </span>
                                                <span className="text-xs text-purple-600">
                                                    {formatBytes(backup.size_bytes)}
                                                </span>
                                                {backup.compression_ratio && (
                                                    <span className="text-xs text-blue-600">
                                                        Kompression: {backup.compression_ratio}%
                                                    </span>
                                                )}
                                                {backup.is_encrypted && (
                                                    <span className="text-xs text-green-600">
                                                        🔒 {backup.encryption_method}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-4 mt-2 text-xs text-gray-600">
                                                <span>Start: {new Date(backup.started_at).toLocaleString('de-DE')}</span>
                                                {backup.completed_at && (
                                                    <span>Fertig: {new Date(backup.completed_at).toLocaleString('de-DE')}</span>
                                                )}
                                                <span>Ablauf: {new Date(backup.expires_at).toLocaleDateString('de-DE')}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Badge className={statusColors[backup.status]}>
                                                {backup.status}
                                            </Badge>
                                            {backup.verification_status && (
                                                <Badge variant="outline" className="text-xs">
                                                    ✓ {backup.verification_status}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'restores' && (
                <>
                    <div className="grid grid-cols-5 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.restore_stats.total_restores}</div>
                            <div className="text-xs text-gray-600">Wiederherstellungen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.restore_stats.successful_restores}</div>
                            <div className="text-xs text-gray-600">Erfolgreich</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.restore_stats.failed_restores}</div>
                            <div className="text-xs text-gray-600">Fehlgeschlagen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.restore_stats.in_progress}</div>
                            <div className="text-xs text-gray-600">Laufend</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.restore_stats.success_rate}%</div>
                            <div className="text-xs text-gray-600">Erfolgsrate</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.restores.map(restore => (
                            <Card key={restore.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <RefreshCw className="w-4 h-4 text-gray-600" />
                                                <Badge variant="outline" className="text-xs">
                                                    {restore.restore_type}
                                                </Badge>
                                                <span className="text-xs font-mono text-gray-600">
                                                    {restore.restore_id?.substring(0, 12)}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2 flex-wrap text-xs">
                                                <span className="text-gray-600">
                                                    Ziel: {restore.target_location}
                                                </span>
                                                {restore.progress_percentage > 0 && (
                                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${restore.progress_percentage}%` }}
                                                        />
                                                    </div>
                                                )}
                                                {restore.items_restored > 0 && (
                                                    <span className="text-green-600">
                                                        ✓ {restore.items_restored}/{restore.items_total}
                                                    </span>
                                                )}
                                                {restore.items_failed > 0 && (
                                                    <span className="text-red-600">
                                                        ✗ {restore.items_failed}
                                                    </span>
                                                )}
                                                {restore.actual_duration_minutes && (
                                                    <span className="text-purple-600">
                                                        ⏱️ {restore.actual_duration_minutes}min
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-4 mt-2 text-xs text-gray-600">
                                                <span>Anfrage: {new Date(restore.requested_at).toLocaleString('de-DE')}</span>
                                                {restore.completed_at && (
                                                    <span>Fertig: {new Date(restore.completed_at).toLocaleString('de-DE')}</span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={statusColors[restore.status]}>
                                            {restore.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'plans' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.plan_stats.total_plans}</div>
                            <div className="text-xs text-gray-600">DR-Pläne</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.plan_stats.active_plans}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.plan_stats.plans_needing_test}</div>
                            <div className="text-xs text-gray-600">Test erforderlich</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.plans.map(plan => (
                            <Card key={plan.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{plan.plan_name}</h5>
                                                <Badge variant="outline" className="text-xs">
                                                    {plan.plan_type}
                                                </Badge>
                                                <Badge className={plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                    {plan.is_active ? 'Aktiv' : 'Inaktiv'}
                                                </Badge>
                                            </div>
                                            {plan.description && (
                                                <p className="text-xs text-gray-600 mt-1">{plan.description}</p>
                                            )}
                                            <div className="flex gap-4 mt-2 flex-wrap">
                                                {plan.critical_systems && plan.critical_systems.length > 0 && (
                                                    <span className="text-xs text-gray-600">
                                                        Systeme: {plan.critical_systems.length}
                                                    </span>
                                                )}
                                                {plan.last_tested_at && (
                                                    <span className="text-xs text-green-600">
                                                        <Clock className="w-3 h-3 inline mr-1" />
                                                        Getestet: {new Date(plan.last_tested_at).toLocaleDateString('de-DE')}
                                                    </span>
                                                )}
                                                {plan.next_test_date && (
                                                    <span className="text-xs text-orange-600">
                                                        Nächster Test: {new Date(plan.next_test_date).toLocaleDateString('de-DE')}
                                                    </span>
                                                )}
                                            </div>
                                            {plan.version && (
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    Version {plan.version}
                                                </span>
                                            )}
                                        </div>
                                        <Badge className={
                                            !plan.last_tested_at || new Date(plan.next_test_date) <= new Date()
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                        }>
                                            {!plan.last_tested_at ? 'Nicht getestet' : 'Getestet'}
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