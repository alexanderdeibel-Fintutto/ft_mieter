import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Users } from 'lucide-react';

const ROLES = [
  { id: 'owner', label: 'Owner', permissions: ['view', 'download', 'edit', 'share', 'revoke', 'delete'] },
  { id: 'editor', label: 'Editor', permissions: ['view', 'download', 'edit'] },
  { id: 'commenter', label: 'Commenter', permissions: ['view', 'download', 'comment'] },
  { id: 'viewer', label: 'Viewer', permissions: ['view'] },
  { id: 'restricted', label: 'Restricted', permissions: ['view-limited'] },
];

export default function RoleBasedAccessControl() {
  const [selectedRole, setSelectedRole] = useState('viewer');

  const role = ROLES.find(r => r.id === selectedRole);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Rolle-basierte Zugriffskontrolle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                selectedRole === r.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-sm">{r.label}</p>
              <p className="text-xs text-gray-600 mt-1">{r.permissions.length} Berechtigungen</p>
            </button>
          ))}
        </div>

        {role && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-3">Berechtigungen für {role.label}</h4>
            <div className="grid grid-cols-2 gap-2">
              {role.permissions.map(perm => (
                <div key={perm} className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-gray-700 capitalize">{perm}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}