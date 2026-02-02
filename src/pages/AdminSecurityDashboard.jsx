import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Lock, Shield, AlertTriangle, Key } from 'lucide-react';

export default function AdminSecurityDashboard() {
  const [settings, setSettings] = useState({
    twoFactorAuth: true,
    ipWhitelist: true,
    encryptionEnabled: true,
    sessionTimeout: 30,
    passwordPolicy: true,
    auditLogging: true,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Shield className="w-6 h-6" /> Sicherheit & Verschlüsselung
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Sicherheits-Score', value: '92/100', color: 'bg-green-100', icon: Shield },
          { label: 'Verdächtige Aktivitäten', value: '2', color: 'bg-orange-100', icon: AlertTriangle },
          { label: 'Verschlüsselte Daten', value: '98.5%', color: 'bg-blue-100', icon: Lock },
        ].map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sicherheitseinstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: 'twoFactorAuth', label: '2-Faktor-Authentifizierung', desc: 'Erzwingt 2FA für alle Admins' },
            { key: 'ipWhitelist', label: 'IP-Whitelist', desc: 'Nur erlaubte IPs dürfen sich anmelden' },
            { key: 'encryptionEnabled', label: 'End-to-End Verschlüsselung', desc: 'Verschlüsselt alle sensiblen Daten' },
            { key: 'passwordPolicy', label: 'Starke Passwort-Policy', desc: 'Mindestens 12 Zeichen, Sonderzeichen' },
            { key: 'auditLogging', label: 'Audit-Logging', desc: 'Alle Aktivitäten werden protokolliert' },
          ].map(setting => (
            <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{setting.label}</p>
                <p className="text-xs text-gray-600">{setting.desc}</p>
              </div>
              <Switch
                checked={settings[setting.key]}
                onCheckedChange={() => handleToggle(setting.key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" /> API Keys & Secrets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: 'Stripe API Key', created: '2026-01-15', lastUsed: '2026-01-24 14:32' },
            { name: 'LetterXpress API Key', created: '2025-12-01', lastUsed: '2026-01-20 10:15' },
          ].map((key, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{key.name}</p>
                  <p className="text-xs text-gray-500">Erstellt: {key.created} | Zuletzt: {key.lastUsed}</p>
                </div>
                <Button size="sm" variant="outline">Rotieren</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Timeout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-900 block mb-2">
              Timeout nach (Minuten): {settings.sessionTimeout}
            </label>
            <input
              type="range"
              min="5"
              max="120"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
          <Button className="w-full bg-violet-600 hover:bg-violet-700">Speichern</Button>
        </CardContent>
      </Card>
    </div>
  );
}