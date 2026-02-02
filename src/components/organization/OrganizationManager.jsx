import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Building, Plus, Loader2 } from 'lucide-react';

export default function OrganizationManager() {
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        loadOrganization();
    }, []);

    const loadOrganization = async () => {
        try {
            setLoading(true);
            const user = await base44.auth.me();
            if (!user) return;

            // Hole erste Organisation des Users
            const memberships = await base44.entities.OrgMembership.filter({
                user_id: user.id,
                is_active: true
            });

            if (memberships.length > 0) {
                const orgs = await base44.entities.Organization.filter({
                    id: memberships[0].organization_id
                });
                setOrganization(orgs[0]);
                setUserRole(memberships[0].role);
            }
        } catch (error) {
            console.error('Load organization error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrganization = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            setCreating(true);
            const response = await base44.functions.invoke('manageUserOrganization', {
                action: 'create_org',
                name: formData.name,
                description: formData.description
            });

            setOrganization(response.data.organization);
            setFormData({ name: '', description: '' });
            setUserRole('owner');
        } catch (error) {
            console.error('Create organization error:', error);
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    if (!organization) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        Organisation erstellen
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateOrganization} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Name</label>
                            <Input
                                placeholder="Name der Organisation"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Beschreibung</label>
                            <Textarea
                                placeholder="Optionale Beschreibung"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <Button type="submit" disabled={creating} className="w-full">
                            {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                            Organisation erstellen
                        </Button>
                    </form>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        {organization.name}
                    </span>
                    {userRole && (
                        <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded">
                            {userRole}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {organization.description && (
                    <p className="text-gray-600 text-sm">{organization.description}</p>
                )}
                <div className="flex gap-2">
                    {['owner', 'admin'].includes(userRole) && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Mitglied hinzufügen
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Mitglied einladen</DialogTitle>
                                </DialogHeader>
                                <AddMemberForm orgId={organization.id} onSuccess={loadOrganization} />
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function AddMemberForm({ orgId, onSuccess }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');
    const [adding, setAdding] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        try {
            setAdding(true);
            await base44.functions.invoke('manageUserOrganization', {
                action: 'add_member',
                org_id: orgId,
                user_email: email,
                role: role
            });
            setEmail('');
            onSuccess();
        } catch (error) {
            console.error('Add member error:', error);
        } finally {
            setAdding(false);
        }
    };

    return (
        <form onSubmit={handleAdd} className="space-y-4">
            <div>
                <label className="text-sm font-medium">E-Mail</label>
                <Input
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label className="text-sm font-medium">Rolle</label>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                >
                    <option value="member">Mitglied</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <Button type="submit" disabled={adding} className="w-full">
                {adding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Hinzufügen'}
            </Button>
        </form>
    );
}