import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { createPageUrl } from '../utils';
import useAuth from '../components/useAuth';
import { PLANS, createCheckoutSession, activatePlan } from '../components/services/stripe';

export default function Billing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isOnboardingComplete, loading } = useAuth();
  
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!loading && !user) {
      navigate(createPageUrl('Register'));
    }
  }, [user, loading, navigate]);
  
  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      setError('Zahlung wurde abgebrochen. Du kannst es erneut versuchen.');
    }
  }, [searchParams]);
  
  const handleSelectPlan = async (planId) => {
    setLoadingPlan(planId);
    setError(null);
    
    try {
      if (planId === 'free') {
        const result = await activatePlan('free');
        if (result.success) {
          navigate('/Dashboard');
        } else {
          setError(result.error || 'Fehler beim Aktivieren des Plans');
        }
        setLoadingPlan(null);
        return;
      }
      
      const result = await createCheckoutSession(planId);
      
      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else if (result.success && result.isFree) {
        const activateResult = await activatePlan('free');
        if (activateResult.success) {
          navigate('/Dashboard');
        }
      } else {
        setError(result.error || 'Fehler beim Erstellen der Checkout-Session');
        setLoadingPlan(null);
      }
      
    } catch (err) {
      console.error('Plan selection error:', err);
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
      setLoadingPlan(null);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  const planOrder = ['free', 'basic', 'pro', 'enterprise'];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Wähle dein Paket
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Starte kostenlos oder wähle einen Plan, der zu deinen Anforderungen passt.
            Du kannst jederzeit upgraden oder downgraden.
          </p>
        </div>
        
        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 text-sm">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 text-xs mt-1 hover:underline"
              >
                Schließen
              </button>
            </div>
          </div>
        )}
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {planOrder.map((planId) => {
            const plan = PLANS[planId];
            const isLoading = loadingPlan === planId;
            const isPopular = plan.popular;
            
            return (
              <div 
                key={planId}
                className={`
                  relative bg-white rounded-2xl shadow-lg overflow-hidden
                  transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                  ${isPopular ? 'ring-2 ring-blue-500 scale-105' : 'border border-gray-200'}
                `}
              >
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-1 text-sm font-medium flex items-center justify-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Beliebteste Wahl
                  </div>
                )}
                
                <div className={`p-6 ${isPopular ? 'pt-10' : ''}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price === 0 ? 'Gratis' : `€${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 text-sm">/Monat</span>
                    )}
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handleSelectPlan(planId)}
                    disabled={loadingPlan !== null}
                    className={`
                      w-full py-3 px-4 rounded-lg font-semibold transition-all
                      flex items-center justify-center gap-2
                      ${isPopular 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }
                      ${loadingPlan !== null ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Wird geladen...
                      </>
                    ) : (
                      plan.price === 0 ? 'Kostenlos starten' : 'Jetzt upgraden'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Alle Preise verstehen sich zzgl. MwSt. • Monatlich kündbar • Sichere Zahlung via Stripe</p>
        </div>
        
      </div>
    </div>
  );
}