import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Plus, Trash2 } from 'lucide-react';

const ROLES = [
  { id: 1, name: 'Admin', permissions: 15, users: 3, status: 'active' },
  { id: 2, name: 'Manager', permissions: 8, users: 12, status: 'active' },
  { id: 3, name: 'Support', permissions: 4, users: 8, status: 'active' },
  { id: 4, name: 'User', permissions: 2, users: 450, status: 'active' },
];

const PERMISSIONS = [
  { name: 'View Analytics', category: 'Analytics' },
  { name: 'Manage Users', category: 'Users' },
  { name: 'View Reports', category: 'Reports' },
  { name: 'Manage Content', category: 'Content' },
  { name: 'Access Settings', category: 'System' },
];

export default function AdminAccessControl() {
  const [showNewRole, setShowNewRole] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Lock className="w-6 h-6" /> Access Control & Roles
        </h1>
        <Button onClick={() => setShowNewRole(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Neue Role
        </Button>
      </div>

      {showNewRole && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Role Editor
              <button onClick={() => setShowNewRole(false)}>×</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Role Name" className="w-full px-3 py-2 border rounded-lg" />
            <div>
              <label className="text-sm font-medium block mb-2">Permissions</label>
              {PERMISSIONS.map(perm => (
                <label key={perm.name} className="flex items-center gap-2 mb-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">{perm.name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNewRole(false)}>Abbrechen</Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Erstellen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ROLES.map(role => (
            <div key={role.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{role.name}</h3>
                <Badge className="bg-green-100 text-green-800">✓ {role.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{role.permissions} Permissions</span>
                <span>{role.users} Users</span>
              </div>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                <Button size="sm" variant="outline" className="text-red-600">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {PERMISSIONS.map(perm => (
            <div key={perm.name} className="p-2 bg-gray-50 rounded flex items-center justify-between">
              <p className="text-sm text-gray-900">{perm.name}</p>
              <Badge variant="outline" className="text-xs">{perm.category}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}