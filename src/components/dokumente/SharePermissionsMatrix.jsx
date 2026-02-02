import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Lock } from 'lucide-react';

const PERMISSIONS = {
  view: ['View', 'Preview', 'Search'],
  download: ['View', 'Preview', 'Search', 'Download'],
  edit: ['View', 'Preview', 'Search', 'Download', 'Edit', 'Share', 'Delete'],
  owner: ['View', 'Preview', 'Search', 'Download', 'Edit', 'Share', 'Delete', 'Manage Team', 'Set Permissions'],
};

export default function SharePermissionsMatrix() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Berechtigungen nach Rolle</CardTitle>
        <CardDescription className="text-xs">
          Was kann jede Rolle tun?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(PERMISSIONS).map(([role, perms]) => (
            <div key={role}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={role === 'owner' ? 'default' : 'secondary'}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-1 ml-2">
                {perms.map(perm => (
                  <div key={perm} className="flex items-center gap-1 text-xs">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    <span className="text-gray-700">{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t text-xs text-gray-600">
          <p>💡 <strong>Tip:</strong> Owner kann andere Roles ändern und Team-Mitglieder verwalten</p>
        </div>
      </CardContent>
    </Card>
  );
}