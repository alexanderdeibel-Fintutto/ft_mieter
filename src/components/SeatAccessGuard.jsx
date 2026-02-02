import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SeatAccessGuard({ appId, children }) {
    const [access, setAccess] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const response = await base44.functions.invoke('getUserAppAccess', {
                    p_app_id: appId
                });
                setAccess(response.data);
            } catch (error) {
                console.error('Access check failed:', error);
                setAccess({ has_access: false });
            } finally {
                setLoading(false);
            }
        };

        checkAccess();
    }, [appId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin">⏳</div>
            </div>
        );
    }

    if (!access?.has_access) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                            <CardTitle>Kein Zugriff</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-600">
                            Du hast keine Berechtigung, diese App zu nutzen. 
                            Kontaktiere deinen Administrator oder upgrade dein Konto.
                        </p>
                        <Button className="w-full" onClick={() => window.location.href = '/'}>
                            Zurück zur Startseite
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}