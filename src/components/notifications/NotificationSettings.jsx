import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Mail, Smartphone } from 'lucide-react';

export default function NotificationSettings() {
    const [settings, setSettings] = useState({
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        repairsNotifications: true,
        paymentsNotifications: true,
        communityNotifications: true,
        quietHoursEnabled: true,
        quietFrom: '22:00',
        quietTo: '08:00',
    });

    const handleToggle = (key) => {
        setSettings({ ...settings, [key]: !settings[key] });
    };

    const handleTimeChange = (key, value) => {
        setSettings({ ...settings, [key]: value });
    };

    return (
        <div className="space-y-4">
            {/* Channels */}
            <Card>
                <CardHeader>
                    <CardTitle>Benachrichtigungs-Kanäle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-violet-600" />
                            <div>
                                <p className="font-medium text-gray-900">Push-Benachrichtigungen</p>
                                <p className="text-sm text-gray-500">In-App Nachrichten</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.pushEnabled}
                            onCheckedChange={() => handleToggle('pushEnabled')}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="font-medium text-gray-900">E-Mail-Benachrichtigungen</p>
                                <p className="text-sm text-gray-500">Zusammenfassungen & Updates</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.emailEnabled}
                            onCheckedChange={() => handleToggle('emailEnabled')}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="font-medium text-gray-900">SMS-Benachrichtigungen</p>
                                <p className="text-sm text-gray-500">Kritische Alerts</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.smsEnabled}
                            onCheckedChange={() => handleToggle('smsEnabled')}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Categories */}
            <Card>
                <CardHeader>
                    <CardTitle>Benachrichtigungs-Kategorien</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[
                        { key: 'repairsNotifications', label: 'Reparaturen', desc: 'Status-Updates zu Reparaturen' },
                        { key: 'paymentsNotifications', label: 'Zahlungen', desc: 'Zahlungserinnerungen & Quittungen' },
                        { key: 'communityNotifications', label: 'Community', desc: 'Ereignisse & Ankündigungen' },
                    ].map(cat => (
                        <div key={cat.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">{cat.label}</p>
                                <p className="text-sm text-gray-500">{cat.desc}</p>
                            </div>
                            <Switch
                                checked={settings[cat.key]}
                                onCheckedChange={() => handleToggle(cat.key)}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Quiet Hours */}
            <Card>
                <CardHeader>
                    <CardTitle>Stille Stunden</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">Stille Stunden aktivieren</p>
                        <Switch
                            checked={settings.quietHoursEnabled}
                            onCheckedChange={() => handleToggle('quietHoursEnabled')}
                        />
                    </div>

                    {settings.quietHoursEnabled && (
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-900 block mb-1">Von</label>
                                <Input
                                    type="time"
                                    value={settings.quietFrom}
                                    onChange={(e) => handleTimeChange('quietFrom', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-900 block mb-1">Bis</label>
                                <Input
                                    type="time"
                                    value={settings.quietTo}
                                    onChange={(e) => handleTimeChange('quietTo', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Save */}
            <Button className="w-full bg-violet-600 hover:bg-violet-700">
                Einstellungen speichern
            </Button>
        </div>
    );
}