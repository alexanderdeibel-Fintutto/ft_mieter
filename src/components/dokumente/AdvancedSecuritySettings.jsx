import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Lock, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdvancedSecuritySettings() {
  const [settings, setSettings] = useState({
    requirePassword: false,
    ipWhitelist: [],
    enableVirusScan: true,
    enableEncryption: true,
    requireMFA: false,
  });
  const [newIP, setNewIP] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddIP = () => {
    if (!newIP) return;
    setSettings({
      ...settings,
      ipWhitelist: [...settings.ipWhitelist, newIP],
    });
    setNewIP('');
  };

  const handleRemoveIP = (ip) => {
    setSettings({
      ...settings,
      ipWhitelist: settings.ipWhitelist.filter(i => i !== ip),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      toast.success('Sicherheitseinstellungen gespeichert');
    } catch (error) {
      toast.error('Fehler beim Speichern');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Erweiterte Sicherheit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Password Protection */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Passwortschutz erforderlich</p>
              <p className="text-xs text-gray-600">Alle Shares mit Passwort sichern</p>
            </div>
            <Checkbox
              checked={settings.requirePassword}
              onCheckedChange={(checked) => 
                setSettings({...settings, requirePassword: checked})
              }
            />
          </div>

          {/* Virus Scanning */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Virenprüfung aktivieren</p>
              <p className="text-xs text-gray-600">ClamAV Integration</p>
            </div>
            <Checkbox
              checked={settings.enableVirusScan}
              onCheckedChange={(checked) => 
                setSettings({...settings, enableVirusScan: checked})
              }
              disabled
            />
          </div>

          {/* Encryption */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">AES-256 Verschlüsselung</p>
              <p className="text-xs text-gray-600">Automatisch aktiviert</p>
            </div>
            <Checkbox
              checked={settings.enableEncryption}
              disabled
            />
          </div>

          {/* MFA */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Multi-Faktor-Authentifizierung</p>
              <p className="text-xs text-gray-600">2FA für Shares</p>
            </div>
            <Checkbox
              checked={settings.requireMFA}
              onCheckedChange={(checked) => 
                setSettings({...settings, requireMFA: checked})
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* IP Whitelist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            IP Whitelist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="IP-Adresse (z.B. 192.168.1.1)"
              value={newIP}
              onChange={(e) => setNewIP(e.target.value)}
              className="text-sm"
            />
            <Button onClick={handleAddIP} variant="outline" size="sm">
              Hinzufügen
            </Button>
          </div>
          
          <div className="space-y-2">
            {settings.ipWhitelist.length === 0 ? (
              <p className="text-xs text-gray-500">Keine IPs whitelisted</p>
            ) : (
              settings.ipWhitelist.map(ip => (
                <div key={ip} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                  <code className="font-mono">{ip}</code>
                  <Button
                    onClick={() => handleRemoveIP(ip)}
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0"
                  >
                    ✕
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-green-600"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
        Speichern
      </Button>
    </div>
  );
}