import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MapPin, Home } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import SeatAccessGuard from '@/components/SeatAccessGuard';

function PropertiesContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewProperty, setShowNewProperty] = useState(false);
    const [newProperty, setNewProperty] = useState({
        name: '',
        street: '',
        zip: '',
        city: ''
    });

    const [user, setUser] = React.useState(null);
    const [org, setOrg] = React.useState(null);

    React.useEffect(() => {
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

    const { data: buildings = [], refetch } = useQuery({
        queryKey: ['buildings', org?.id],
        queryFn: async () => {
            if (!org) return [];
            return base44.entities.Building.filter({
                organization_id: org.id
            });
        },
        enabled: !!org
    });

    const filteredBuildings = buildings.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateProperty = async () => {
        if (!newProperty.name || !newProperty.street || !newProperty.zip || !newProperty.city) {
            toast.error('Bitte alle Felder ausfüllen');
            return;
        }

        try {
            await base44.entities.Building.create({
                organization_id: org.id,
                name: newProperty.name,
                address: {
                    street: newProperty.street,
                    zip: newProperty.zip,
                    city: newProperty.city,
                    country: 'DE'
                }
            });

            toast.success('Objekt erstellt!');
            setNewProperty({ name: '', street: '', zip: '', city: '' });
            setShowNewProperty(false);
            refetch();
        } catch (error) {
            toast.error('Fehler beim Erstellen');
            console.error(error);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Objekte</h1>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowNewProperty(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Neues Objekt
                </Button>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                        placeholder="Objekte suchen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {showNewProperty && (
                <Card className="mb-8 border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle>Neues Objekt erstellen</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Objektname"
                            value={newProperty.name}
                            onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                        />
                        <Input
                            placeholder="Straße"
                            value={newProperty.street}
                            onChange={(e) => setNewProperty({ ...newProperty, street: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                placeholder="PLZ"
                                value={newProperty.zip}
                                onChange={(e) => setNewProperty({ ...newProperty, zip: e.target.value })}
                            />
                            <Input
                                placeholder="Stadt"
                                value={newProperty.city}
                                onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowNewProperty(false)} className="flex-1">
                                Abbrechen
                            </Button>
                            <Button className="flex-1 bg-blue-600" onClick={handleCreateProperty}>
                                Erstellen
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {filteredBuildings.length > 0 ? (
                <div className="grid gap-4">
                    {filteredBuildings.map(building => (
                        <Card key={building.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4 flex-1">
                                        <div className="p-3 bg-blue-100 rounded-lg h-fit">
                                            <Home className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{building.name}</h3>
                                            <div className="flex items-center gap-1 text-gray-600 mt-1">
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-sm">
                                                    {building.address.street}, {building.address.zip} {building.address.city}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost">→</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-600">Keine Objekte gefunden</p>
                </div>
            )}
        </div>
    );
}

export default function VermietifyProperties() {
    return (
        <SeatAccessGuard appId="vermietify">
            <PropertiesContent />
        </SeatAccessGuard>
    );
}