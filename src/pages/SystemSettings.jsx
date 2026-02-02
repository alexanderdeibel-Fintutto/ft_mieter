import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Database, Mail, Globe } from 'lucide-react';

export default function SystemSettings() {
    const [settings, setSettings] = useState({
        appName: 'MieterApp',
        adminEmail: 'admin@mieterapp.de',
        supportEmail: 'support@mieterapp.de',
        timezone: 'Europe/Berlin',
        language: 'de',
        maintenanceMode: false,
        debugMode: false,
        maxUploadSize: 50,
        sessionTimeout: 30,
        passwordMinLength: 8,
        emailVerificationRequired: true,
        twoFactorEnabled: false,
    });

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const saveSettings = () => {
        alert('Einstellungen gespeichert!');
    };

    return (
        <div className="space-y-4 pb-20">
            {/* Header */}
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-6 h-6" /> System-Einstellungen
            </h1>

            {/* Tabs */}
            <Tabs defaultValue="general" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="general">Allgemein</TabsTrigger>
                    <TabsTrigger value="mail">E-Mail</TabsTrigger>
                    <TabsTrigger value="files">Dateien</TabsTrigger>
                    <TabsTrigger value="security">Sicherheit</TabsTrigger>
                </TabsList>

                {/* General */}
                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Grundlegende Informationen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-900 block mb-2">App-Name</label>
                                <Input
                                    value={settings.appName}
                                    onChange={(e) => handleChange('appName', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-900 block mb-2">Zeitzone</label>
                                <Select value={settings.timezone} onValueChange={(v) => handleChange('timezone', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                                        <SelectItem value="Europe/Vienna">Europe/Vienna</SelectItem>
                                        <SelectItem value="Europe/Zurich">Europe/Zurich</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-900 block mb-2">Sprache</label>
                                <Select value={settings.language} onValueChange={(v) => handleChange('language', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="de">Deutsch</SelectItem>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="fr">Français</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>System-Modi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Wartungsmodus</p>
                                    <p className="text-sm text-gray-500">App für Nutzer nicht erreichbar</p>
                                </div>
                                <Switch
                                    checked={settings.maintenanceMode}
                                    onCheckedChange={(v) => handleChange('maintenanceMode', v)}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Debug-Modus</p>
                                    <p className="text-sm text-gray-500">Detaillierte Fehlerausgaben</p>
                                </div>
                                <Switch
                                    checked={settings.debugMode}
                                    onCheckedChange={(v) => handleChange('debugMode', v)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Mail */}
                <TabsContent value="mail" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="w-5 h-5" /> E-Mail Konfiguration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-900 block mb-2">Admin E-Mail</label>
                                <Input
                                    type="email"
                                    value={settings.adminEmail}
                                    onChange={(e) => handleChange('adminEmail', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-900 block mb-2">Support E-Mail</label>
                                <Input
                                    type="email"
                                    value={settings.supportEmail}
                                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">E-Mail-Verifikation erforderlich</p>
                                    <p className="text-sm text-gray-500">Neue Nutzer müssen E-Mail verifizieren</p>
                                </div>
                                <Switch
                                    checked={settings.emailVerificationRequired}
                                    onCheckedChange={(v) => handleChange('emailVerificationRequired', v)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Files */}
                <TabsContent value="files" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="w-5 h-5" /> Datei-Verwaltung
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-900 block mb-2">Max. Upload-Größe (MB)</label>
                                <Input
                                    type="number"
                                    value={settings.maxUploadSize}
                                    onChange={(e) => handleChange('maxUploadSize', parseInt(e.target.value))}
                                />
                                <p className="text-xs text-gray-500 mt-1">Maximal zulässige Dateigröße pro Upload</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-900 block mb-2">Session-Timeout (Minuten)</label>
                                <Input
                                    type="number"
                                    value={settings.sessionTimeout}
                                    onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security */}
                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sicherheits-Richtlinien</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-900 block mb-2">Min. Passwortlänge</label>
                                <Input
                                    type="number"
                                    value={settings.passwordMinLength}
                                    onChange={(e) => handleChange('passwordMinLength', parseInt(e.target.value))}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">2-Faktor-Authentifizierung</p>
                                    <p className="text-sm text-gray-500">Zusätzliche Sicherheit für Admin-Konten</p>
                                </div>
                                <Switch
                                    checked={settings.twoFactorEnabled}
                                    onCheckedChange={(v) => handleChange('twoFactorEnabled', v)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Save Button */}
            <Button onClick={saveSettings} className="w-full bg-violet-600 hover:bg-violet-700">
                Einstellungen speichern
            </Button>
        </div>
    );
}