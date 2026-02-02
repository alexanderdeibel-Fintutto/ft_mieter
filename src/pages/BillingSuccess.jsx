import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { activatePlan, PLANS } from '../components/services/stripe';

export default function BillingSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  
  const planId = searchParams.get('plan') || 'basic';
  const plan = PLANS[planId];
  
  useEffect(() => {
    const finalizePurchase = async () => {
      try {
        const result = await activatePlan(planId);
        
        if (result.success) {
          setStatus('success');
          
          setTimeout(() => {
            navigate('/Dashboard');
          }, 3000);
          
        } else {
          setStatus('error');
          setError(result.error || 'Fehler beim Aktivieren des Plans');
        }
        
      } catch (err) {
        console.error('Finalize error:', err);
        setStatus('error');
        setError('Ein unerwarteter Fehler ist aufgetreten');
      }
    };
    
    finalizePurchase();
  }, [planId, navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Zahlung wird verarbeitet...
            </h1>
            <p className="text-gray-600">
              Bitte warte einen Moment, während wir deine Zahlung bestätigen.
            </p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Willkommen an Bord! 🎉
            </h1>
            <p className="text-gray-600 mb-4">
              Dein <strong>{plan?.name || 'Plan'}</strong> wurde erfolgreich aktiviert.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Du wirst in wenigen Sekunden zum Dashboard weitergeleitet...
            </p>
            <button
              onClick={() => navigate('/Dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Jetzt starten
            </button>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Ups, etwas ist schiefgelaufen
            </h1>
            <p className="text-gray-600 mb-4">
              {error || 'Bitte kontaktiere unseren Support.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/Billing')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Zurück zur Paketauswahl
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Erneut versuchen
              </button>
            </div>
          </>
        )}
        
      </div>
    </div>
  );
}