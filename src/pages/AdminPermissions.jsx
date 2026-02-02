import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Lock, Plus } from 'lucide-react';

const ROLES = [
  {
    id: 1,
    name: 'Admin',
    description: 'Vollzugriff auf alle Funktionen',
    permissions: ['read_users', 'write_users', 'delete_users', 'read_logs', 'manage_settings', 'manage_roles'],
  },
  {
    id: 2,
    name: 'Moderator',
    description: 'Moderation und Überwachung',
    permissions: ['read_users', 'read_logs', 'moderate_content'],
  },
  {
    id: 3,
    name: 'User',
    description: 'Standardbenutzer',
    permissions: ['read_own_profile', 'write_own_profile'],
  },
];

const ALL_PERMISSIONS = [
  { key: 'read_users', label: 'Benutzer lesen' },
  { key: 'write_users', label: 'Benutzer bearbeiten' },
  { key: 'delete_users', label: 'Benutzer löschen' },
  { key: 'read_logs', label: 'Logs lesen' },
  { key: 'manage_settings', label: 'Einstellungen verwalten' },
  { key: 'manage_roles', label: 'Rollen verwalten' },
  { key: 'moderate_content', label: 'Inhalte moderieren' },
  { key: 'read_own_profile', label: 'Eigenes Profil lesen' },
  { key: 'write_own_profile', label: 'Eigenes Profil bearbeiten' },
];

export default function AdminPermissions() {
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [permissions, setPermissions] = useState(selectedRole.permissions);

  const handlePermissionToggle = (permKey) => {
    setPermissions(prev =>
      prev.includes(permKey)
        ? prev.filter(p => p !== permKey)
        : [...prev, permKey]
    );
  };

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Lock className="w-6 h-6" /> Rollen & Berechtigungen
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Roles List */}
        <div className="space-y-2">
          {ROLES.map(role => (
            <Card
              key={role.id}
              className={`cursor-pointer transition-all ${selectedRole.id === role.id ? 'ring-2 ring-violet-600 bg-violet-50' : 'hover:shadow-md'}`}
              onClick={() => {
                setSelectedRole(role);
                setPermissions(role.permissions);
              }}
            >
              <CardContent className="p-3">
                <h3 className="font-medium text-gray-900">{role.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                <Badge className="mt-2 bg-gray-200 text-gray-800">{role.permissions.length} Berechtigungen</Badge>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" className="w-full gap-2">
            <Plus className="w-4 h-4" /> Neue Rolle
          </Button>
        </div>

        {/* Permissions Editor */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{selectedRole.name} - Berechtigungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ALL_PERMISSIONS.map(perm => (
                <div key={perm.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <label className="font-medium text-gray-900 cursor-pointer">
                    {perm.label}
                  </label>
                  <Switch
                    checked={permissions.includes(perm.key)}
                    onCheckedChange={() => handlePermissionToggle(perm.key)}
                  />
                </div>
              ))}
              <Button className="w-full mt-6 bg-violet-600 hover:bg-violet-700">
                Speichern
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}