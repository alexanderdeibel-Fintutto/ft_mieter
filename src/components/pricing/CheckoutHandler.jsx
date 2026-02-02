import { base44 } from '@/api/base44Client';

export async function initiateCheckout(tier, billingCycle = 'monthly') {
  try {
    if (!tier.priceId) {
      throw new Error('Keine Price ID verfügbar');
    }

    const successUrl = window.location.origin + '/success';
    const cancelUrl = window.location.origin + '/pricing';

    // Invoke backend function to create Stripe Checkout Session
    const { data } = await base44.functions.invoke('stripe-checkout', {
      priceId: tier.priceId,
      successUrl: successUrl,
      cancelUrl: cancelUrl
    });

    if (data?.url) {
      window.location.href = data.url;
    } else {
      throw new Error('Keine Checkout-URL erhalten');
    }
  } catch (error) {
    console.error('Checkout-Fehler:', error);
    throw error;
  }
}

export async function handleCheckoutSuccess(sessionId) {
  try {
    // Verifikation über Backend-Funktion
    const { data } = await base44.functions.invoke('verifyCheckoutSession', {
      sessionId
    });
    return data;
  } catch (error) {
    console.error('Session-Verifikationsfehler:', error);
    throw error;
  }
}