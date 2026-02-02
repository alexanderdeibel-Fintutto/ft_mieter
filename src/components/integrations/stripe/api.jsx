import { STRIPE_CONFIG } from './config';

// Lazy getter for config
const getConfig = () => STRIPE_CONFIG;

async function fetchWithAuth(endpoint, options = {}) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = getConfig();
  const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      ...options.headers
    }
  });
  return response.json();
}

export async function getStripePrices(appId) {
  try {
    const { ENDPOINTS } = getConfig();
    const data = await fetchWithAuth(`${ENDPOINTS.GET_PRICES}?app_id=${appId}`);
    if (!data.success) throw new Error(data.error);
    return data.products || [];
  } catch (error) {
    console.error("getStripePrices error:", error);
    return [];
  }
}

export async function getAllPrices() {
  try {
    const { ENDPOINTS } = getConfig();
    const data = await fetchWithAuth(ENDPOINTS.GET_PRICES);
    if (!data.success) throw new Error(data.error);
    return data.products || [];
  } catch (error) {
    console.error("getAllPrices error:", error);
    return [];
  }
}

export async function createCheckoutSession(priceId, email, options = {}) {
  try {
    const { ENDPOINTS } = getConfig();
    const data = await fetchWithAuth(ENDPOINTS.CREATE_CHECKOUT, {
      method: "POST",
      body: JSON.stringify({
        price_id: priceId,
        customer_email: email,
        success_url: options.successUrl || `${window.location.origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: options.cancelUrl || window.location.href,
        metadata: { app_id: options.appId, user_id: options.userId, ...options.metadata }
      })
    });
    if (!data.success) throw new Error(data.error);
    return { checkoutUrl: data.checkout_url, sessionId: data.session_id, customerId: data.customer_id };
  } catch (error) {
    console.error("createCheckoutSession error:", error);
    throw error;
  }
}

export async function getSubscriptionStatus(email) {
  try {
    const { ENDPOINTS } = getConfig();
    const data = await fetchWithAuth(`${ENDPOINTS.GET_STATUS}?email=${encodeURIComponent(email)}`);
    return {
      hasSubscription: data.has_subscription || false,
      tier: data.tier || "free",
      kiAccess: data.ki_access || false,
      hasBundle: data.has_bundle || false,
      customerId: data.customer_id || null,
      subscriptions: data.subscriptions || [],
      activeApps: data.active_apps || []
    };
  } catch (error) {
    console.error("getSubscriptionStatus error:", error);
    return { hasSubscription: false, tier: "free", kiAccess: false, hasBundle: false, customerId: null, subscriptions: [], activeApps: [] };
  }
}

export async function redirectToCheckout(priceId, email, options = {}) {
  const { checkoutUrl } = await createCheckoutSession(priceId, email, options);
  if (checkoutUrl) window.location.href = checkoutUrl;
}