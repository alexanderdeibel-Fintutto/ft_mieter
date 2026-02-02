import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Mail, Phone, User, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import SeatAccessGuard from '@/components/SeatAccessGuard';

function TenantsContent() {
    const [user, setUser] = useState(null);
    const [org, setOrg] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    const { data: tenants = [] } = useQuery({
        queryKey: ['tenants', org?.id],
        queryFn: async () => {
            if (!org) return [];
            return base44.entities.Tenant.filter({
                organization_id: org.id
            });
        },
        enabled: !!org
    });

    const filteredTenants = tenants.filter(tenant =>
        `${tenant.first_name} ${tenant.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Mieter</h1>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Neuer Mieter
                </Button>
            </div>

            <div className="mb-6">
                <Input
                    placeholder="Nach Mieter suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredTenants.length > 0 ? (
                <div className="grid gap-4">
                    {filteredTenants.map(tenant => (
                        <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Name</p>
                                        <p className="font-semibold flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            {tenant.first_name} {tenant.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">E-Mail</p>
                                        <a href={`mailto:${tenant.email}`} className="text-blue-600 hover:underline flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            {tenant.email}
                                        </a>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Telefon</p>
                                        <p className="font-semibold flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            {tenant.phone || '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Geburtsdatum</p>
                                        <p className="text-sm">
                                            {tenant.date_of_birth ? new Date(tenant.date_of_birth).toLocaleDateString('de-DE') : '—'}
                                        </p>
                                    </div>
                                    <div className="flex items-end">
                                        <Button variant="outline" className="w-full">Details</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-600">Keine Mieter gefunden</p>
                </div>
            )}
        </div>
    );
}

export default function VermietifyTenants() {
    return (
        <SeatAccessGuard appId="vermietify">
            <TenantsContent />
        </SeatAccessGuard>
    );
}