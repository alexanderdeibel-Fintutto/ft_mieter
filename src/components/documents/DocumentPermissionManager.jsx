import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';

export default function DocumentPermissionManager({ documentId, onClose }) {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newAccessLevel, setNewAccessLevel] = useState('viewer');

  useEffect(() => {
    loadPermissions();
  }, [documentId]);

  const loadPermissions = async () => {
    setLoading(true);
    const perms = await base44.entities.DocumentPermission.filter({
      document_id: documentId
    });
    setPermissions(perms || []);
    setLoading(false);
  };

  const handleAddPermission = async () => {
    if (!newUserEmail.trim()) return;

    const perm = await base44.entities.DocumentPermission.create({
      document_id: documentId,
      user_id: newUserEmail,
      permission_type: 'view',
      access_level: newAccessLevel
    });

    // Log permission change
    await base44.functions.invoke('logAction', {
      action: 'permission_change',
      entity_type: 'DocumentPermission',
      entity_id: perm.id,
      entity_name: newUserEmail,
      description: `Berechtigung erteilt für Dokument`,
      new_values: { access_level: newAccessLevel },
      changes_summary: `${newUserEmail} erhielt ${newAccessLevel === 'viewer' ? 'Lesezugriff' : 'Bearbeitungszugriff'}`
    });

    setNewUserEmail('');
    setNewAccessLevel('viewer');
    loadPermissions();
  };

  const handleRemovePermission = async (permissionId) => {
    if (confirm('Berechtigung wirklich entziehen?')) {
      await base44.entities.DocumentPermission.delete(permissionId);
      loadPermissions();
    }
  };

  const handleChangeAccessLevel = async (permissionId, newLevel) => {
    const perm = permissions.find(p => p.id === permissionId);
    
    await base44.entities.DocumentPermission.update(permissionId, {
      access_level: newLevel
    });

    // Log permission change
    await base44.functions.invoke('logAction', {
      action: 'permission_change',
      entity_type: 'DocumentPermission',
      entity_id: permissionId,
      entity_name: perm?.user_id || 'Unknown',
      description: `Berechtigung geändert`,
      old_values: { access_level: perm?.access_level },
      new_values: { access_level: newLevel },
      changes_summary: `Berechtigung aktualisiert: ${perm?.access_level} → ${newLevel}`
    });

    loadPermissions();
  };

  if (loading) {
    return <div className="text-center py-4">Wird geladen...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Zugriff verwalten</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Permission */}
        <div className="flex gap-2 pb-4 border-b">
          <Input
            placeholder="Email-Adresse"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
          />
          <Select value={newAccessLevel} onValueChange={setNewAccessLevel}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Anschauen</SelectItem>
              <SelectItem value="editor">Bearbeiten</SelectItem>
              <SelectItem value="owner">Besitzer</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddPermission} size="sm" className="gap-2">
            <Plus size={16} />
            Hinzufügen
          </Button>
        </div>

        {/* Permissions List */}
        {permissions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Keine Berechtigungen</p>
        ) : (
          <div className="space-y-2">
            {permissions.map(perm => (
              <div
                key={perm.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div>
                  <p className="font-medium text-sm">{perm.user_id}</p>
                  {perm.expires_at && (
                    <p className="text-xs text-gray-500">
                      Bis: {new Date(perm.expires_at).toLocaleDateString('de-DE')}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {perm.is_inherited && (
                    <Badge variant="secondary" className="text-xs">Geerbt</Badge>
                  )}

                  <Select
                    value={perm.access_level}
                    onValueChange={(value) =>
                      handleChangeAccessLevel(perm.id, value)
                    }
                  >
                    <SelectTrigger className="w-28 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Anschauen</SelectItem>
                      <SelectItem value="editor">Bearbeiten</SelectItem>
                      <SelectItem value="owner">Besitzer</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePermission(perm.id)}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}