import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SeatAccessGuard from '@/components/SeatAccessGuard';
import { Plus, Building2, Home, Users, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

function VermietifyDashboardContent() {
    const [org, setOrg] = useState(null);

    useEffect(() => {
        const loadOrg = async () => {
            try {
                const user = await base44.auth.me();
                const memberships = await base44.entities.OrgMembership.filter({
                    user_id: user.id,
                    is_active: true
                });
                if (memberships.length > 0) {
                    const orgs = await base44.entities.Organization.filter({
                        id: memberships[0].organization_id
                    });
                    setOrg(orgs[0]);
                }
            } catch (error) {
                console.error('Failed to load org:', error);
            }
        };
        loadOrg();
    }, []);

    const { data: buildings = [] } = useQuery({
        queryKey: ['buildings', org?.id],
        queryFn: async () => {
            if (!org) return [];
            return base44.entities.Building.filter({
                organization_id: org.id
            });
        },
        enabled: !!org
    });

    const { data: units = [] } = useQuery({
        queryKey: ['units', buildings],
        queryFn: async () => {
            if (buildings.length === 0) return [];
            const allUnits = [];
            for (const building of buildings) {
                const units = await base44.entities.Unit.filter({
                    building_id: building.id
                });
                allUnits.push(...units);
            }
            return allUnits;
        },
        enabled: buildings.length > 0
    });

    const { data: leases = [] } = useQuery({
        queryKey: ['leases', units],
        queryFn: async () => {
            if (units.length === 0) return [];
            const allLeases = [];
            for (const unit of units) {
                const leases = await base44.entities.Lease.filter({
                    unit_id: unit.id,
                    status: 'active'
                });
                allLeases.push(...leases);
            }
            return allLeases;
        },
        enabled: units.length > 0
    });

    const totalRent = leases.reduce((sum, lease) => sum + (lease.rent_amount || 0), 0);
    const occupancyRate = leases.length > 0 ? Math.round((leases.length / units.length) * 100) : 0;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Dashboard
                </h1>
                <p className="text-gray-600">
                    Willkommen {org?.name && `zu ${org.name}`}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium">Objekte</CardTitle>
                        <Building2 className="w-4 h-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{buildings.length}</div>
                        <p className="text-xs text-gray-600 mt-1">Verwaltete Gebäude</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium">Einheiten</CardTitle>
                        <Home className="w-4 h-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{units.length}</div>
                        <p className="text-xs text-gray-600 mt-1">Wohnungen gesamt</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium">Mietverträge</CardTitle>
                        <Users className="w-4 h-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{leases.length}</div>
                        <p className="text-xs text-gray-600 mt-1">Aktive Mietverträge</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium">Einnahmen</CardTitle>
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">€{totalRent.toLocaleString()}</div>
                        <p className="text-xs text-gray-600 mt-1">Monatlich</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnellstart</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Neues Objekt
                    </Button>
                    <Button variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Neuer Mieter
                    </Button>
                    <Button variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Dokument hochladen
                    </Button>
                </div>
            </div>

            {/* Buildings List */}
            {buildings.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Meine Objekte</h2>
                    <div className="grid gap-4">
                        {buildings.map(building => (
                            <Card key={building.id}>
                                <CardHeader>
                                    <CardTitle className="text-base">{building.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600">
                                        {building.address.street}, {building.address.zip} {building.address.city}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {buildings.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">Du hast noch keine Objekte angelegt</p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Erstes Objekt erstellen
                    </Button>
                </div>
            )}
        </div>
    );
}

export default function VermietifyDashboard() {
    return (
        <SeatAccessGuard appId="vermietify">
            <VermietifyDashboardContent />
        </SeatAccessGuard>
    );
}