import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Invite() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const appId = searchParams.get('app');
    
    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadInvitation = async () => {
            if (!token || !appId) {
                setError('Ungültige Einladungs-URL');
                setLoading(false);
                return;
            }

            try {
                const invitations = await base44.entities.Invitation.filter({
                    token,
                    app_id: appId
                });

                if (invitations.length === 0) {
                    setError('Einladung nicht gefunden oder abgelaufen');
                } else {
                    const inv = invitations[0];
                    if (inv.status !== 'pending') {
                        setError(`Diese Einladung wurde bereits ${inv.status}`);
                    } else {
                        const expiresAt = new Date(inv.expires_at);
                        if (expiresAt < new Date()) {
                            setError('Diese Einladung ist abgelaufen');
                        } else {
                            setInvitation(inv);
                        }
                    }
                }
            } catch (err) {
                setError('Fehler beim Laden der Einladung');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadInvitation();
    }, [token, appId]);

    const handleAcceptInvitation = async () => {
        setAccepting(true);
        try {
            const user = await base44.auth.me();
            if (!user) {
                toast.error('Du musst angemeldet sein');
                return;
            }

            // Create seat allocation
            await base44.entities.SeatAllocation.create({
                granting_org_id: invitation.inviting_org_id,
                receiving_user_id: user.id,
                app_id: invitation.app_id,
                seat_type: invitation.seat_type,
                is_active: true
            });

            // Update invitation status
            await base44.entities.Invitation.update(invitation.id, {
                status: 'accepted',
                accepted_at: new Date().toISOString()
            });

            toast.success('Einladung akzeptiert!');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (err) {
            toast.error('Fehler beim Akzeptieren der Einladung');
            console.error(err);
        } finally {
            setAccepting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <CardTitle>Einladung ungültig</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-600">{error}</p>
                        <Button className="w-full" onClick={() => window.location.href = '/'}>
                            Zur Startseite
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <CardTitle className="text-2xl">Du wurdest eingeladen!</CardTitle>
                    <CardDescription>
                        Akzeptiere die Einladung um Zugang zu erhalten
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">App</p>
                        <p className="font-semibold text-gray-900 capitalize">
                            {invitation?.app_id}
                        </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Einladung für</p>
                        <p className="font-semibold text-gray-900 capitalize">
                            {invitation?.seat_type === 'hausmeister' && 'Hausmeister'}
                            {invitation?.seat_type === 'mieter' && 'Mieter'}
                            {invitation?.seat_type === 'team_member' && 'Team-Mitglied'}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={handleAcceptInvitation}
                            disabled={accepting}
                        >
                            {accepting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Wird akzeptiert...
                                </>
                            ) : (
                                'Einladung akzeptieren'
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => window.location.href = '/'}
                        >
                            Später
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}