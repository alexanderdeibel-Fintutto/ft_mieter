import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function ComplianceAuditDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('policies');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('complianceEngine', {
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
        compliant: 'bg-green-100 text-green-800',
        'non_compliant': 'bg-red-100 text-red-800',
        'partial_compliant': 'bg-yellow-100 text-yellow-800',
        pending: 'bg-gray-100 text-gray-800',
        passed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        warning: 'bg-orange-100 text-orange-800',
        'not_applicable': 'bg-blue-100 text-blue-800',
        acknowledged: 'bg-blue-100 text-blue-800',
        'in_progress': 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        denied: 'bg-red-100 text-red-800',
        access: 'bg-blue-100 text-blue-800',
        deletion: 'bg-red-100 text-red-800',
        'data_access': 'bg-blue-100 text-blue-800',
        'data_deletion': 'bg-red-100 text-red-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['policies', 'requests', 'checks', 'audits'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'policies' && '🛡️ Policies'}
                        {tab === 'requests' && '📋 Anfragen'}
                        {tab === 'checks' && '✓ Checks'}
                        {tab === 'audits' && '📊 Audits'}
                    </button>
                ))}
            </div>

            {activeTab === 'policies' && (
                <>
                    <div className="grid grid-cols-5 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.policy_stats.total_policies}</div>
                            <div className="text-xs text-gray-600">Policies</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.policy_stats.compliant}</div>
                            <div className="text-xs text-gray-600">Konform</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.policy_stats.non_compliant}</div>
                            <div className="text-xs text-gray-600">Nicht konform</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.policy_stats.pending_audits}</div>
                            <div className="text-xs text-gray-600">Audit ausstehend</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-xs mb-2">Nach Typ</h4>
                            {Object.entries(data.policy_stats.by_type || {}).slice(0, 3).map(([type, count]) => (
                                <div key={type} className="text-xs flex justify-between">
                                    <span>{type}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.policies.map(policy => (
                            <Card key={policy.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{policy.policy_name}</h5>
                                                <Badge className={statusColors[policy.policy_type]}>
                                                    {policy.policy_type}
                                                </Badge>
                                            </div>
                                            {policy.description && (
                                                <p className="text-xs text-gray-600 mt-1">{policy.description}</p>
                                            )}
                                            <div className="flex gap-4 mt-2">
                                                {policy.responsible_person && (
                                                    <span className="text-xs text-gray-600">
                                                        Verantwortlich: {policy.responsible_person}
                                                    </span>
                                                )}
                                                {policy.last_audit_date && (
                                                    <span className="text-xs text-blue-600">
                                                        Audit: {new Date(policy.last_audit_date).toLocaleDateString('de-DE')}
                                                    </span>
                                                )}
                                                {policy.next_audit_date && (
                                                    <span className="text-xs text-orange-600">
                                                        Nächste: {new Date(policy.next_audit_date).toLocaleDateString('de-DE')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={statusColors[policy.compliance_status]}>
                                            {policy.compliance_status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'requests' && (
                <>
                    <div className="grid grid-cols-5 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.request_stats.total_requests}</div>
                            <div className="text-xs text-gray-600">Anfragen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.request_stats.pending}</div>
                            <div className="text-xs text-gray-600">Ausstehend</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.request_stats.in_progress}</div>
                            <div className="text-xs text-gray-600">In Bearbeitung</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.request_stats.completed}</div>
                            <div className="text-xs text-gray-600">Abgeschlossen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.request_stats.denied}</div>
                            <div className="text-xs text-gray-600">Abgelehnt</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.privacy_requests.map(request => (
                            <Card key={request.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-600" />
                                                <Badge className={statusColors[request.request_type]}>
                                                    {request.request_type}
                                                </Badge>
                                                <span className="text-xs font-mono text-gray-600">
                                                    {request.request_id?.substring(0, 12)}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Person: {request.subject_id}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Anfrage: {new Date(request.requested_at).toLocaleDateString('de-DE')}
                                                </span>
                                                <span className="text-xs text-red-600">
                                                    Frist: {new Date(request.deadline).toLocaleDateString('de-DE')}
                                                </span>
                                            </div>
                                            {request.data_categories && request.data_categories.length > 0 && (
                                                <div className="flex gap-1 mt-2 flex-wrap">
                                                    {request.data_categories.slice(0, 3).map(cat => (
                                                        <Badge key={cat} variant="outline" className="text-xs">
                                                            {cat}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <Badge className={statusColors[request.status]}>
                                            {request.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'checks' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.check_stats.total_checks}</div>
                            <div className="text-xs text-gray-600">Checks</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.check_stats.passed}</div>
                            <div className="text-xs text-gray-600">Bestanden</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.check_stats.failed}</div>
                            <div className="text-xs text-gray-600">Fehlgeschlagen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.check_stats.success_rate}%</div>
                            <div className="text-xs text-gray-600">Erfolgsrate</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.check_results.map(check => (
                            <Card key={check.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-gray-600" />
                                                <h5 className="font-semibold text-sm">{check.requirement_name}</h5>
                                                <Badge variant="outline" className="text-xs">
                                                    {check.check_type}
                                                </Badge>
                                            </div>
                                            {check.findings && check.findings.length > 0 && (
                                                <div className="text-xs text-red-600 mt-1">
                                                    Probleme: {check.findings.join(', ')}
                                                </div>
                                            )}
                                            {check.remediation_steps && check.remediation_steps.length > 0 && (
                                                <div className="text-xs text-gray-600 mt-1">
                                                    Abhilfemaßnahmen: {check.remediation_steps.length} Schritte
                                                </div>
                                            )}
                                            {check.next_check_date && (
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    Nächster Check: {new Date(check.next_check_date).toLocaleDateString('de-DE')}
                                                </span>
                                            )}
                                        </div>
                                        <Badge className={statusColors[check.status]}>
                                            {check.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'audits' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.audit_stats.total_audits}</div>
                            <div className="text-xs text-gray-600">Audit-Logs</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.audit_stats.compliant}</div>
                            <div className="text-xs text-gray-600">Konform</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.audit_stats.non_compliant}</div>
                            <div className="text-xs text-gray-600">Nicht konform</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.audit_stats.flagged}</div>
                            <div className="text-xs text-gray-600">Gekennzeichnet</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.audit_logs.map(log => (
                            <Card key={log.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-gray-600" />
                                                <Badge className={statusColors[log.audit_type]}>
                                                    {log.audit_type}
                                                </Badge>
                                                <span className="text-xs font-mono text-gray-600">
                                                    {log.entity_type}#{log.entity_id?.substring(0, 8)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Aktion: {log.action}
                                            </p>
                                            <div className="flex gap-4 mt-2">
                                                {log.reason && (
                                                    <span className="text-xs text-gray-600">
                                                        Grund: {log.reason}
                                                    </span>
                                                )}
                                                {log.data_affected && log.data_affected.length > 0 && (
                                                    <span className="text-xs text-red-600">
                                                        Daten: {log.data_affected.length}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                {new Date(log.timestamp).toLocaleString('de-DE')}
                                            </span>
                                        </div>
                                        <Badge className={statusColors[log.compliance_status]}>
                                            {log.compliance_status}
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