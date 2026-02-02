import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function BillingOverview({ organizationId }) {
    const [subscription, setSubscription] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBillingData();
    }, [organizationId]);

    const loadBillingData = async () => {
        try {
            setLoading(true);

            // Lade aktive Subscription
            const subs = await base44.entities.Subscription.filter({
                organization_id: organizationId,
                status: 'active'
            });
            if (subs.length > 0) {
                setSubscription(subs[0]);
            }

            // Lade Rechnungen
            const invoicesRes = await base44.functions.invoke('manageBilling', {
                action: 'get_invoices',
                organization_id: organizationId,
                limit: 5
            });
            setInvoices(invoicesRes.data.invoices || []);

            // Lade Usage
            const usageRes = await base44.functions.invoke('manageBilling', {
                action: 'get_usage',
                organization_id: organizationId,
                time_range: '30d'
            });
            setUsage(usageRes.data.usage);
        } catch (error) {
            console.error('Billing data error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Subscription Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Aktuelles Abonnement
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {subscription ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-lg">
                                        {subscription.product_id}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Läuft bis {format(new Date(subscription.current_period_end), 'dd. MMMM yyyy', { locale: de })}
                                    </p>
                                </div>
                                <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Aktiv
                                </Badge>
                            </div>

                            {subscription.cancel_at_period_end && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-yellow-800">
                                        Ihr Abonnement wird am Ende des aktuellen Zeitraums gekündigt.
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-gray-600 mb-4">
                                Sie haben noch kein aktives Abonnement
                            </p>
                            <Button>Abonnement auswählen</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Usage Card */}
            {usage && (
                <Card>
                    <CardHeader>
                        <CardTitle>Nutzung (letzte 30 Tage)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border rounded-lg p-4">
                                <p className="text-sm text-gray-600">Dokumente hochgeladen</p>
                                <p className="text-2xl font-bold mt-1">{usage.documents_uploaded}</p>
                            </div>
                            <div className="border rounded-lg p-4">
                                <p className="text-sm text-gray-600">Benachrichtigungen</p>
                                <p className="text-2xl font-bold mt-1">{usage.notifications_sent}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Invoices Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Rechnungen</CardTitle>
                </CardHeader>
                <CardContent>
                    {invoices.length === 0 ? (
                        <p className="text-gray-600 text-center py-4">
                            Keine Rechnungen vorhanden
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {invoices.map(invoice => (
                                <div
                                    key={invoice.id}
                                    className="flex items-center justify-between border rounded-lg p-3"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {(invoice.amount_due / 100).toFixed(2)} €
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {format(new Date(invoice.created * 1000), 'dd.MM.yyyy', { locale: de })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={invoice.status === 'paid' ? 'default' : 'outline'}>
                                            {invoice.status === 'paid' ? 'Bezahlt' : 'Offen'}
                                        </Badge>
                                        {invoice.invoice_pdf && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => window.open(invoice.invoice_pdf, '_blank')}
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}