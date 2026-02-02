import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Euro, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import SeatAccessGuard from '@/components/SeatAccessGuard';

function PaymentsContent() {
    const [user, setUser] = useState(null);
    const [org, setOrg] = useState(null);

    useEffect(() => {
        const load = async () => {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
            const memberships = await base44.entities.OrgMembership.filter({
                user_id: currentUser.id,
                is_active: true
            });
            if (memberships.length > 0) {
                const orgs = await base44.entities.Organization.filter({
                    id: memberships[0].organization_id
                });
                setOrg(orgs[0]);
            }
        };
        load();
    }, []);

    const { data: payments = [] } = useQuery({
        queryKey: ['payments', org?.id],
        queryFn: async () => {
            if (!org) return [];
            return base44.entities.PaymentTransaction.filter({});
        },
        enabled: !!org
    });

    const openPayments = payments.filter(p => p.status === 'offen');
    const paidPayments = payments.filter(p => p.status === 'bezahlt');
    const overduePayments = payments.filter(p => p.status === 'ueberfaellig');

    const totalOpen = openPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Zahlungen</h1>
                <p className="text-gray-600">Miete, Nebenkosten und Transaktionen</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
                        <AlertCircle className="w-4 h-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">€{totalOpen.toFixed(2)}</div>
                        <p className="text-xs text-gray-600 mt-1">{openPayments.length} Zahlungen</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium">Erhalten</CardTitle>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">€{totalPaid.toFixed(2)}</div>
                        <p className="text-xs text-gray-600 mt-1">{paidPayments.length} Zahlungen</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium">Überfällig</CardTitle>
                        <Euro className="w-4 h-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overduePayments.length}</div>
                        <p className="text-xs text-gray-600 mt-1">Zahlungen überfällig</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="open" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="open">Ausstehend ({openPayments.length})</TabsTrigger>
                    <TabsTrigger value="paid">Bezahlt ({paidPayments.length})</TabsTrigger>
                    <TabsTrigger value="overdue">Überfällig ({overduePayments.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="open" className="space-y-4">
                    {openPayments.map(payment => (
                        <Card key={payment.id} className="border-red-200 bg-red-50">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">{payment.description}</p>
                                        <p className="text-sm text-gray-600">
                                            Fällig: {new Date(payment.due_date).toLocaleDateString('de-DE')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">€{payment.amount.toFixed(2)}</p>
                                        <Button size="sm" variant="outline">Erinnern</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="paid" className="space-y-4">
                    {paidPayments.map(payment => (
                        <Card key={payment.id} className="border-green-200 bg-green-50">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">{payment.description}</p>
                                        <p className="text-sm text-gray-600">
                                            Bezahlt: {new Date(payment.paid_date).toLocaleDateString('de-DE')}
                                        </p>
                                    </div>
                                    <p className="font-bold text-lg text-green-600">€{payment.amount.toFixed(2)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="overdue" className="space-y-4">
                    {overduePayments.map(payment => (
                        <Card key={payment.id} className="border-orange-200 bg-orange-50">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">{payment.description}</p>
                                        <p className="text-sm text-gray-600">
                                            Überfällig seit: {new Date(payment.due_date).toLocaleDateString('de-DE')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-orange-600">€{payment.amount.toFixed(2)}</p>
                                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                                            Mahnen
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function VermietifyPayments() {
    return (
        <SeatAccessGuard appId="vermietify">
            <PaymentsContent />
        </SeatAccessGuard>
    );
}