import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccessGate({ children, appId = 'mieterapp' }) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seatType, setSeatType] = useState(null);

  useEffect(() => {
    checkAccess();
  }, [appId]);

  const checkAccess = async () => {
    try {
      setLoading(true);
      const user = await base44.auth.me();
      if (!user) {
        setHasAccess(false);
        return;
      }

      const allocations = await base44.entities.SeatAllocation.filter({
        receiving_user_id: user.id,
        app_id: appId,
        is_active: true
      });

      if (allocations.length > 0) {
        setHasAccess(true);
        setSeatType(allocations[0].seat_type);
      } else {
        setHasAccess(false);
      }
    } catch (err) {
      console.error('Access check error:', err);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserX className="h-10 w-10 text-gray-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Noch nicht eingeladen
          </h1>
          
          <p className="text-gray-600 mb-6">
            Um das Mieterportal zu nutzen, benötigen Sie eine Einladung 
            von Ihrem Vermieter oder Ihrer Hausverwaltung.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 text-left mb-6">
            <p className="text-sm text-blue-800 font-medium mb-2">
              So funktioniert's:
            </p>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Bitten Sie Ihren Vermieter, Sie einzuladen</li>
              <li>2. Sie erhalten eine E-Mail mit einem Link</li>
              <li>3. Klicken Sie auf den Link und melden Sie sich an</li>
            </ol>
          </div>

          <div className="space-y-3">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Einladung akzeptieren
            </Button>
            <a 
              href="/"
              className="block text-gray-500 hover:text-gray-700"
            >
              Zurück zur Startseite
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
}