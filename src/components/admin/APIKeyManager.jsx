import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Eye, EyeOff, Plus, Trash2, Edit } from 'lucide-react';

const PERMISSIONS = [
  { value: 'read:usage_logs', label: 'Nutzungslogs lesen' },
  { value: 'read:costs', label: 'Kosten lesen' },
  { value: 'read:features', label: 'Features lesen' },
  { value: 'read:forecasts', label: 'Prognosen lesen' },
  { value: 'trigger:analysis', label: 'Analysen auslösen' },
  { value: 'trigger:categorization', label: 'Kategorisierung auslösen' },
  { value: 'trigger:ocr', label: 'OCR auslösen' }
];

export default function APIKeyManager() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showKey, setShowKey] = useState(null);
  const [newKey, setNewKey] = useState(null);

  const [formData, setFormData] = useState({
    key_name: '',
    permissions: [],
    rate_limit_per_hour: 100,
    allowed_ips: ''
  });

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const data = await base44.entities.APIKey.list('-created_date');
      setKeys(data);
    } catch (error) {
      console.error('Failed to load keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateKey = () => {
    return 'mieterapp_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleCreate = async () => {
    try {
      const generatedKey = generateKey();
      const keyHash = await hashString(generatedKey);

      await base44.entities.APIKey.create({
        key_name: formData.key_name,
        key_hash: keyHash,
        api_key_preview: generatedKey.substring(0, 8),
        permissions: formData.permissions,
        rate_limit_per_hour: formData.rate_limit_per_hour,
        allowed_ips: formData.allowed_ips ? formData.allowed_ips.split(',').map(ip => ip.trim()) : [],
        is_active: true,
        created_by: (await base44.auth.me())?.email
      });

      setNewKey(generatedKey);
      setFormData({
        key_name: '',
        permissions: [],
        rate_limit_per_hour: 100,
        allowed_ips: ''
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadKeys();
    } catch (error) {
      console.error('Failed to create key:', error);
      alert('Fehler beim Erstellen des Keys');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Key wirklich löschen?')) return;
    try {
      await base44.entities.APIKey.delete(id);
      loadKeys();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      await base44.entities.APIKey.update(id, { is_active: !isActive });
      loadKeys();
    } catch (error) {
      console.error('Failed to toggle:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      key_name: '',
      permissions: [],
      rate_limit_per_hour: 100,
      allowed_ips: ''
    });
    setNewKey(null);
  };

  const handlePermissionToggle = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  if (loading) {
    return <div className="text-center py-4">Lade API-Keys...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>🔑 API-Key Management</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Neuer Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-96 overflow-y-auto">
              <DialogHeader>
                <DialogTitle>API-Key erstellen</DialogTitle>
              </DialogHeader>

              {newKey ? (
                <div className="space-y-4 py-4 border rounded p-4 bg-green-50">
                  <div>
                    <p className="text-sm font-semibold text-green-900 mb-2">✓ Key erfolgreich erstellt!</p>
                    <p className="text-xs text-green-800 mb-3">
                      Speichern Sie diesen Key sofort. Sie können ihn nicht mehr abrufen.
                    </p>
                  </div>
                  <div className="relative">
                    <Input 
                      value={newKey}
                      readOnly
                      className="pr-10 font-mono text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1"
                      onClick={() => {
                        navigator.clipboard.writeText(newKey);
                        alert('Key kopiert');
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Fertig
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name*</Label>
                    <Input
                      value={formData.key_name}
                      onChange={(e) => setFormData({...formData, key_name: e.target.value})}
                      placeholder="z.B. Analytics Dashboard"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Berechtigungen*</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                      {PERMISSIONS.map(perm => (
                        <label key={perm.value} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={formData.permissions.includes(perm.value)}
                            onCheckedChange={() => handlePermissionToggle(perm.value)}
                          />
                          <span className="text-sm">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Rate Limit (Anfragen/Stunde)</Label>
                    <Input
                      type="number"
                      min="10"
                      value={formData.rate_limit_per_hour}
                      onChange={(e) => setFormData({...formData, rate_limit_per_hour: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Erlaubte IPs (optional)</Label>
                    <Input
                      value={formData.allowed_ips}
                      onChange={(e) => setFormData({...formData, allowed_ips: e.target.value})}
                      placeholder="192.168.1.1, 10.0.0.1"
                    />
                    <p className="text-xs text-gray-500">Komma-getrennt. Leer = alle IPs</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button 
                      onClick={handleCreate}
                      disabled={!formData.key_name || formData.permissions.length === 0}
                    >
                      Erstellen
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {keys.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Keine API-Keys konfiguriert
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Berechtigungen</TableHead>
                <TableHead className="text-right">Rate Limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Zuletzt genutzt</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map(key => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.key_name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    <div className="flex items-center gap-2">
                      {showKey === key.id ? key.api_key_preview : '••••••••'}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                      >
                        {showKey === key.id ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {key.permissions.slice(0, 2).map(perm => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          {perm.split(':')[1]}
                        </Badge>
                      ))}
                      {key.permissions.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{key.permissions.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{key.rate_limit_per_hour}/h</TableCell>
                  <TableCell>
                    <Badge variant={key.is_active ? 'default' : 'secondary'}>
                      {key.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {key.last_used 
                      ? new Date(key.last_used).toLocaleDateString('de-DE')
                      : 'Nie'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(key.id, key.is_active)}
                      >
                        {key.is_active ? 'Deaktivieren' : 'Aktivieren'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(key.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Helper
async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}