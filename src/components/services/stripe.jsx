import { supabase } from './supabase';

// Stripe Price IDs
export const STRIPE_PRICES = {
  free: 'price_1Sr55p52lqSgjCzeX6tlI5tv',
  basic: 'price_1Sr58r52lqSgjCze0I3R3DZ2',
  pro: 'price_1Sr5Ev52lqSgjCzehlVFvukL',
  enterprise: 'price_1Sr5IT52lqSgjCzeM6lyI8aW'
};

export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: STRIPE_PRICES.free,
    features: ['1 Projekt', 'Basis-Funktionen', 'Community Support']
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    priceId: STRIPE_PRICES.basic,
    features: ['5 Projekte', 'Alle Basis-Funktionen', 'E-Mail Support', 'Export-Funktion']
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceId: STRIPE_PRICES.pro,
    popular: true,
    features: ['Unbegrenzte Projekte', 'Premium-Funktionen', 'Priority Support', 'API-Zugang', 'Team-Funktionen']
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 89,
    priceId: STRIPE_PRICES.enterprise,
    features: ['Alles aus Pro', 'Dedicated Support', 'Custom Integrationen', 'SLA', 'Schulungen']
  }
};

export async function createCheckoutSession(planId) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Nicht eingeloggt');
    }
    
    const plan = PLANS[planId];
    if (!plan) {
      throw new Error('Ungültiger Plan');
    }
    
    // Für Free-Plan: Direkt aktivieren ohne Stripe
    if (planId === 'free') {
      return { 
        success: true, 
        isFree: true,
        planId: 'free'
      };
    }
    
    // Stripe Checkout über Backend Function
    const response = await fetch(
      'https://aaefocdqgdgexkcrjhks.supabase.co/functions/v1/smart-processor',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          planId: planId,
          successUrl: `${window.location.origin}/#/BillingSuccess?plan=${planId}`,
          cancelUrl: `${window.location.origin}/#/Billing?canceled=true`
        })
      }
    );
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return {
      success: true,
      checkoutUrl: result.url,
      sessionId: result.sessionId
    };
    
  } catch (error) {
    console.error('Checkout Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function activatePlan(planId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Nicht eingeloggt');
    }
    
    const { error } = await supabase
      .from('user_profiles')
      .update({
        selected_plan: planId,
        onboarding_completed: true,
        plan_activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Plan Activation Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}