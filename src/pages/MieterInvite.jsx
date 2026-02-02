import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, CheckCircle2, AlertCircle, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function MieterInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState(null);
  const [unit, setUnit] = useState(null);
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadInvitation();
    checkUser();
  }, [token]);

  const loadInvitation = async () => {
    if (!token) {
      setError('Kein Einladungscode gefunden');
      setLoading(false);
      return;
    }

    try {
      const invitations = await base44.entities.Invitation.filter({
        token
      });

      if (invitations.length === 0) {
        setError('Einladung nicht gefunden');
        setLoading(false);
        return;
      }

      const inv = invitations[0];

      // Check expiration
      const expiresAt = new Date(inv.expires_at);
      if (expiresAt < new Date()) {
        setError('Einladung ist abgelaufen');
        setLoading(false);
        return;
      }

      setInvitation(inv);

      // Load unit details from tenant
      if (inv.invitedEmail) {
        const tenants = await base44.entities.Tenant.filter({
          email: inv.invitedEmail
        });

        if (tenants.length > 0) {
          const tenant = tenants[0];
          const units = await base44.entities.Unit.filter({
            id: tenant.unit_id
          });

          if (units.length > 0) {
            const u = units[0];
            setUnit(u);

            const buildings = await base44.entities.Building.filter({
              id: u.building_id
            });
            setBuilding(buildings[0]);
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

  const checkUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (err) {
      console.error('Auth check failed:', err);
    }
  };

  const handleAccept = async () => {
    if (!user) {
      toast.error('Bitte melden Sie sich zuerst an');
      navigate('/register');
      return;
    }

    setAccepting(true);
    try {
      // Get tenant info
      const tenants = await base44.entities.Tenant.filter({
        email: user.email
      });

      if (tenants.length === 0) {
        toast.error('Mieter-Profil nicht gefunden');
        return;
      }

      const tenant = tenants[0];

      // Create seat allocation
      await base44.entities.SeatAllocation.create({
        granting_org_id: invitation.inviting_org_id,
        receiving_user_id: user.id,
        app_id: 'mieterapp',
        seat_type: 'mieter',
        is_active: true,
        access_scope: {
          unit_id: unit?.id
        }
      });

      // Update invitation
      await base44.entities.Invitation.update(invitation.id, {
        status: 'accepted',
        accepted_at: new Date().toISOString()
      });

      toast.success('Einladung angenommen!');
      setTimeout(() => {
        navigate('/mieter-dashboard');
      }, 2000);
    } catch (error) {
      toast.error('Fehler beim Akzeptieren der Einladung');
      console.error(error);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
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
            <Button 
              className="w-full" 
              onClick={() => navigate('/')}
            >
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
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-7 h-7 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Mieterportal</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Du wurdest eingeladen zum</p>
            {unit && building && (
              <div>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Wohnung {unit.unit_number}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-2">
                  <MapPin className="w-3 h-3" />
                  {building.address?.street}, {building.address?.zip} {building.address?.city}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Im Portal kannst du:</p>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Schäden melden
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Dokumente einsehen
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Mit Vermieter kommunizieren
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleAccept}
            disabled={accepting}
          >
            {accepting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wird angenommen...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Einladung annehmen
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}