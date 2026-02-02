import React, { useState } from 'react';
import { Bell, Mail, Smartphone, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function NotificationPreferences({ onSave }) {
    const [prefs, setPrefs] = useState({
        emailNotifications: true,
        pushNotifications: false,
        weeklyDigest: true,
        urgentOnly: false,
        marketingEmails: false
    });

    const handleChange = (key, value) => {
        const newPrefs = { ...prefs, [key]: value };
        setPrefs(newPrefs);
        onSave?.(newPrefs);
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-500" /> Benachrichtigungen
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                            <Label className="text-sm">E-Mail-Benachrichtigungen</Label>
                            <p className="text-xs text-gray-500">Wichtige Updates per Mail</p>
                        </div>
                    </div>
                    <Switch
                        checked={prefs.emailNotifications}
                        onCheckedChange={(v) => handleChange('emailNotifications', v)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Smartphone className="w-4 h-4 text-gray-400" />
                        <div>
                            <Label className="text-sm">Push-Benachrichtigungen</Label>
                            <p className="text-xs text-gray-500">Echtzeit-Benachrichtigungen</p>
                        </div>
                    </div>
                    <Switch
                        checked={prefs.pushNotifications}
                        onCheckedChange={(v) => handleChange('pushNotifications', v)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4 text-gray-400" />
                        <div>
                            <Label className="text-sm">Nur Dringende Benachrichtigungen</Label>
                            <p className="text-xs text-gray-500">Weniger Ablenkung</p>
                        </div>
                    </div>
                    <Switch
                        checked={prefs.urgentOnly}
                        onCheckedChange={(v) => handleChange('urgentOnly', v)}
                    />
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                        <Label className="text-sm">Wöchentliche Zusammenfassung</Label>
                        <p className="text-xs text-gray-500">Übersicht aller Events</p>
                    </div>
                    <Switch
                        checked={prefs.weeklyDigest}
                        onCheckedChange={(v) => handleChange('weeklyDigest', v)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-sm">Marketing-E-Mails</Label>
                        <p className="text-xs text-gray-500">Tipps & neue Features</p>
                    </div>
                    <Switch
                        checked={prefs.marketingEmails}
                        onCheckedChange={(v) => handleChange('marketingEmails', v)}
                    />
                </div>
            </CardContent>
        </Card>
    );
}