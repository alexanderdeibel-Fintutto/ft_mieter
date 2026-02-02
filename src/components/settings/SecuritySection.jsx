import React, { useState } from 'react';
import { Lock, Shield, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SecuritySection({ onLogout }) {
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [sessionCount] = useState(1);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-500" /> Sicherheit
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-600" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">Passwort</p>
                            <p className="text-xs text-blue-700">Zuletzt geändert vor 30 Tagen</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                        Ändern
                    </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm font-medium">Zwei-Faktor-Authentifizierung</p>
                        <p className="text-xs text-gray-500">Extra-Sicherheit für dein Konto</p>
                    </div>
                    <Badge variant={twoFAEnabled ? 'default' : 'secondary'}>
                        {twoFAEnabled ? 'Aktiviert' : 'Inaktiv'}
                    </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm font-medium">Aktive Sitzungen</p>
                        <p className="text-xs text-gray-500">{sessionCount} aktive Sitzung(en)</p>
                    </div>
                    <Badge variant="outline">{sessionCount}</Badge>
                </div>

                <Button
                    variant="destructive"
                    size="sm"
                    onClick={onLogout}
                    className="w-full"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Abmelden
                </Button>
            </CardContent>
        </Card>
    );
}