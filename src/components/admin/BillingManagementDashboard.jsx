import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, DollarSign, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

const RESOURCE_TYPES = [
    { value: 'api_calls', label: 'API Calls' },
    { value: 'storage', label: 'Speicher' },
    { value: 'users', label: 'Benutzer' },
    { value: 'documents', label: 'Dokumente' },
    { value: 'emails', label: 'E-Mails' }
];

export default function BillingManagementDashboard({ organizationId }) {
    const [quotas, setQuotas] = useState([]);
    const [cycles, setCycles] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('quotas');
    const [showNewQuota, setShowNewQuota] = useState(false);
    const [quotaForm, setQuotaForm] = useState({
        quota_name: '',
        resource_type: 'api_calls',
        limit: 1000,
        unit: 'calls'
    });

    useEffect(() => {
        loadData();
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [quotasRes, cyclesRes, invoicesRes] = await Promise.all([
                base44.functions.invoke('billingEngine', {
                    action: 'get_quotas',
                    organization_id: organizationId
                }),
                base44.functions.invoke('billingEngine', {
                    action: 'get_billing_cycles',
                    organization_id: organizationId
                }),
                base44.functions.invoke('billingEngine', {
                    action: 'get_invoices',
                    organization_id: organizationId
                })
            ]);

            setQuotas(quotasRes.data.quotas || []);
            setCycles(cyclesRes.data.cycles || []);
            setInvoices(invoicesRes.data.invoices || []);
        } catch (error) {
            console.error('Load error:', error);
            toast.error('Fehler beim Laden');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuota = async () => {
        if (!quotaForm.quota_name || !quotaForm.limit) {
            toast.error('Name und Limit erforderlich');
            return;
        }

        try {
            await base44.functions.invoke('billingEngine', {
                action: 'create_quota',
                organization_id: organizationId,
                ...quotaForm
            });

            toast.success('Quota erstellt');
            setQuotaForm({ quota_name: '', resource_type: 'api_calls', limit: 1000, unit: 'calls' });
            setShowNewQuota(false);
            loadData();
        } catch (error) {
            console.error('Create error:', error);
            toast.error('Fehler beim Erstellen');
        }
    };

    const handleResetQuota = async (quotaId) => {
        try {
            await base44.functions.invoke('billingEngine', {
                action: 'reset_quota',
                organization_id: organizationId,
                quota_id: quotaId
            });

            toast.success('Quota zurückgesetzt');
            loadData();
        } catch (error) {
            console.error('Reset error:', error);
            toast.error('Fehler beim Zurücksetzen');
        }
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    const quotaStats = {
        total: quotas.length,
        exceeded: quotas.filter(q => q.used > q.limit).length,
        nearLimit: quotas.filter(q => (q.used / q.limit) >= 0.8).length
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b">
                {['quotas', 'cycles', 'invoices'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'quotas' && '📊 Quotas'}
                        {tab === 'cycles' && '🔄 Abrechnungszyklen'}
                        {tab === 'invoices' && '📄 Rechnungen'}
                    </button>
                ))}
            </div>

            {/* Quotas Tab */}
            {activeTab === 'quotas' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-blue-600">{quotaStats.total}</div>
                                <div className="text-xs text-gray-600">Quotas</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-red-600">{quotaStats.exceeded}</div>
                                <div className="text-xs text-gray-600">Überschritten</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-yellow-600">{quotaStats.nearLimit}</div>
                                <div className="text-xs text-gray-600">Nahe Limit</div>
                            </CardContent>
                        </Card>
                    </div>

                    {!showNewQuota && (
                        <Button onClick={() => setShowNewQuota(true)} className="w-full md:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Neues Quota
                        </Button>
                    )}

                    {showNewQuota && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Neues Quota</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="Quota Name"
                                    value={quotaForm.quota_name}
                                    onChange={(e) => setQuotaForm({...quotaForm, quota_name: e.target.value})}
                                />
                                <Select value={quotaForm.resource_type} onValueChange={(v) => setQuotaForm({...quotaForm, resource_type: v})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {RESOURCE_TYPES.map(r => (
                                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder="Limit"
                                    type="number"
                                    value={quotaForm.limit}
                                    onChange={(e) => setQuotaForm({...quotaForm, limit: parseInt(e.target.value)})}
                                />
                                <Input
                                    placeholder="Einheit"
                                    value={quotaForm.unit}
                                    onChange={(e) => setQuotaForm({...quotaForm, unit: e.target.value})}
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleCreateQuota} className="flex-1">Erstellen</Button>
                                    <Button variant="outline" onClick={() => setShowNewQuota(false)} className="flex-1">
                                        Abbrechen
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-3">
                        {quotas.map(quota => {
                            const usagePercent = (quota.used / quota.limit) * 100;
                            const exceeded = quota.used > quota.limit;

                            return (
                                <Card key={quota.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h5 className="font-semibold text-sm">{quota.quota_name}</h5>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {quota.used.toLocaleString()} / {quota.limit.toLocaleString()} {quota.unit}
                                                </p>
                                                <div className="mt-2">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${exceeded ? 'bg-red-600' : usagePercent >= 80 ? 'bg-yellow-500' : 'bg-green-600'}`}
                                                            style={{width: `${Math.min(usagePercent, 100)}%`}}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1">{usagePercent.toFixed(1)}%</p>
                                                </div>
                                                {exceeded && (
                                                    <Badge className="bg-red-100 text-red-800 mt-2">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        Überschritten
                                                    </Badge>
                                                )}
                                            </div>
                                            <Button size="sm" variant="outline" onClick={() => handleResetQuota(quota.id)}>
                                                Reset
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Cycles Tab */}
            {activeTab === 'cycles' && (
                <div className="space-y-3">
                    {cycles.map(cycle => (
                        <Card key={cycle.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h5 className="font-semibold text-sm">{cycle.cycle_name}</h5>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm font-semibold mt-2">€{cycle.total_amount.toFixed(2)}</p>
                                    </div>
                                    <Badge className={
                                        cycle.status === 'finalized' ? 'bg-green-100 text-green-800' : 
                                        cycle.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                                        'bg-blue-100 text-blue-800'
                                    }>
                                        {cycle.status}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-blue-600">{invoices.length}</div>
                                <div className="text-xs text-gray-600">Rechnungen</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-green-600">
                                    {invoices.filter(i => i.status === 'paid').length}
                                </div>
                                <div className="text-xs text-gray-600">Bezahlt</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-red-600">
                                    {invoices.filter(i => i.status === 'overdue').length}
                                </div>
                                <div className="text-xs text-gray-600">Überfällig</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-3">
                        {invoices.map(invoice => (
                            <Card key={invoice.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h5 className="font-semibold text-sm">{invoice.invoice_number}</h5>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Datum: {new Date(invoice.invoice_date).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm font-semibold mt-2">€{invoice.total_amount.toFixed(2)}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge className={
                                                invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800'
                                            }>
                                                {invoice.status}
                                            </Badge>
                                            <Button size="sm" variant="outline">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
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