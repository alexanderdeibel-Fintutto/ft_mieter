import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Edit2, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function RoleManager({ organizationId }) {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: []
    });

    useEffect(() => {
        loadData();
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [rolesRes, permsRes] = await Promise.all([
                base44.functions.invoke('managePermissions', {
                    action: 'list_roles',
                    organization_id: organizationId
                }),
                base44.entities.Permission.list()
            ]);

            setRoles(rolesRes.data.roles || []);
            setPermissions(permsRes || []);
        } catch (error) {
            console.error('Load data error:', error);
            toast.error('Fehler beim Laden der Daten');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.name || formData.permissions.length === 0) {
            toast.error('Bitte füllen Sie alle erforderlichen Felder aus');
            return;
        }

        try {
            if (editingRole) {
                await base44.functions.invoke('managePermissions', {
                    action: 'update_role',
                    organization_id: organizationId,
                    role_id: editingRole.id,
                    role_name: formData.name,
                    role_description: formData.description,
                    permissions: formData.permissions
                });
                toast.success('Rolle aktualisiert');
            } else {
                await base44.functions.invoke('managePermissions', {
                    action: 'create_role',
                    organization_id: organizationId,
                    role_name: formData.name,
                    role_description: formData.description,
                    permissions: formData.permissions
                });
                toast.success('Rolle erstellt');
            }

            resetForm();
            loadData();
        } catch (error) {
            console.error('Save role error:', error);
            toast.error('Fehler beim Speichern der Rolle');
        }
    };

    const handleEdit = (role) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions || []
        });
        setShowForm(true);
    };

    const handleDelete = async (roleId) => {
        if (!confirm('Rolle wirklich löschen?')) return;

        try {
            await base44.functions.invoke('managePermissions', {
                action: 'delete_role',
                organization_id: organizationId,
                role_id: roleId
            });
            toast.success('Rolle gelöscht');
            loadData();
        } catch (error) {
            console.error('Delete role error:', error);
            toast.error('Fehler beim Löschen der Rolle');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', permissions: [] });
        setEditingRole(null);
        setShowForm(false);
    };

    const togglePermission = (permId) => {
        setFormData({
            ...formData,
            permissions: formData.permissions.includes(permId)
                ? formData.permissions.filter(p => p !== permId)
                : [...formData.permissions, permId]
        });
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
            {/* Create/Edit Form */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingRole ? 'Rolle bearbeiten' : 'Neue Rolle'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Name</label>
                            <Input
                                placeholder="z.B. Manager"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Beschreibung</label>
                            <Input
                                placeholder="Beschreibung der Rolle"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3">Permissions</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto border rounded p-3">
                                {permissions.map(perm => (
                                    <div key={perm.id} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={formData.permissions.includes(perm.id)}
                                            onCheckedChange={() => togglePermission(perm.id)}
                                        />
                                        <label className="text-sm cursor-pointer flex-1">
                                            <div className="font-medium">{perm.name}</div>
                                            <div className="text-xs text-gray-600">{perm.description}</div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleCreate} className="flex-1">
                                {editingRole ? 'Aktualisieren' : 'Erstellen'}
                            </Button>
                            <Button variant="outline" onClick={resetForm} className="flex-1">
                                Abbrechen
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Roles List */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Rollen</h3>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Neue Rolle
                    </Button>
                )}
            </div>

            <div className="space-y-3">
                {roles.map(role => (
                    <Card key={role.id}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield className="w-5 h-5 text-blue-600" />
                                        <h4 className="font-semibold">{role.name}</h4>
                                        {role.is_system_role && (
                                            <Badge variant="outline">System</Badge>
                                        )}
                                    </div>
                                    {role.description && (
                                        <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                                    )}
                                    <div className="flex gap-1 flex-wrap">
                                        {role.permissions.slice(0, 5).map(permId => {
                                            const perm = permissions.find(p => p.id === permId);
                                            return perm ? (
                                                <Badge key={permId} variant="secondary" className="text-xs">
                                                    {perm.name}
                                                </Badge>
                                            ) : null;
                                        })}
                                        {role.permissions.length > 5 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{role.permissions.length - 5} mehr
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 flex-shrink-0">
                                    {!role.is_system_role && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit(role)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(role.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {roles.length === 0 && !showForm && (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            Keine Rollen konfiguriert
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}