import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FileText, User, Home } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import SeatAccessGuard from '@/components/SeatAccessGuard';

function LeasesContent() {
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

    const { data: leases = [] } = useQuery({
        queryKey: ['leases', org?.id],
        queryFn: async () => {
            if (!org) return [];
            const units = await base44.entities.Unit.filter({});
            const allLeases = [];
            for (const unit of units) {
                const unitLeases = await base44.entities.Lease.filter({
                    unit_id: unit.id,
                    status: 'active'
                });
                allLeases.push(...unitLeases);
            }
            return allLeases;
        },
        enabled: !!org
    });

    const filteredLeases = leases.filter(lease =>
        lease.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Mietverträge</h1>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Neuer Mietvertrag
                </Button>
            </div>

            <div className="mb-6">
                <Input
                    placeholder="Nach Mieter suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredLeases.length > 0 ? (
                <div className="grid gap-4">
                    {filteredLeases.map(lease => (
                        <Card key={lease.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Mieter</p>
                                        <p className="font-semibold flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            {lease.tenant_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Einheit</p>
                                        <p className="font-semibold flex items-center gap-2">
                                            <Home className="w-4 h-4" />
                                            {lease.unit_number}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Miete</p>
                                        <p className="font-semibold">€{lease.rent_amount?.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-end">
                                        <Button variant="outline" className="w-full">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Details
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-600">Keine Mietverträge gefunden</p>
                </div>
            )}
        </div>
    );
}

export default function VermietifyLeases() {
    return (
        <SeatAccessGuard appId="vermietify">
            <LeasesContent />
        </SeatAccessGuard>
    );
}