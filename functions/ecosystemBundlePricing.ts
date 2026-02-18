import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from "npm:@supabase/supabase-js";

/**
 * Ecosystem Bundle Pricing Engine
 * Manages Fintutto bundle subscriptions across all apps.
 * Bundles: Mieter Plus, Vermieter Komplett, Fintutto Komplett
 */

const STRIPE_BUNDLE_PRICES = {
  mieter_plus: {
    monthly: Deno.env.get('STRIPE_PRICE_MIETER_PLUS_MONTHLY') || 'price_mieter_plus_monthly',
    yearly: Deno.env.get('STRIPE_PRICE_MIETER_PLUS_YEARLY') || 'price_mieter_plus_yearly',
  },
  vermieter_komplett: {
    monthly: Deno.env.get('STRIPE_PRICE_VERMIETER_KOMPLETT_MONTHLY') || 'price_vermieter_komplett_monthly',
    yearly: Deno.env.get('STRIPE_PRICE_VERMIETER_KOMPLETT_YEARLY') || 'price_vermieter_komplett_yearly',
  },
  fintutto_komplett: {
    monthly: Deno.env.get('STRIPE_PRICE_FINTUTTO_KOMPLETT_MONTHLY') || 'price_fintutto_komplett_monthly',
    yearly: Deno.env.get('STRIPE_PRICE_FINTUTTO_KOMPLETT_YEARLY') || 'price_fintutto_komplett_yearly',
  },
};

const BUNDLES = {
  mieter_plus: {
    id: 'mieter_plus',
    name: 'Mieter Plus',
    apps: ['mieterapp', 'ablesung'],
    monthly: 12.99,
    yearly: 124.90,
    individual_monthly: 17.49, // mieterapp pro (9.99) + ablesung basic (4.99) + extra
    features: [
      'MieterApp Pro – alle Features',
      'Ablesung Basic – OCR Zählererfassung',
      'Cross-App Verbrauchsanalyse',
      'Automatische Zähler-Erinnerungen',
    ],
  },
  vermieter_komplett: {
    id: 'vermieter_komplett',
    name: 'Vermieter Komplett',
    apps: ['vermietify', 'hausmeisterpro', 'ablesung'],
    monthly: 49.99,
    yearly: 479.90,
    individual_monthly: 79.88, // vermietify pro (39.90) + hausmeister pro (24.99) + ablesung pro (14.99)
    features: [
      'Vermietify Pro – Unbegrenzte Objekte',
      'HausmeisterPro Pro – Vollausstattung',
      'Ablesung Pro – Alle Zählertypen',
      'Cross-App Datensync',
      'Gemeinsames Analytics-Dashboard',
      'Priority Support',
    ],
  },
  fintutto_komplett: {
    id: 'fintutto_komplett',
    name: 'Fintutto Komplett',
    apps: ['mieterapp', 'vermietify', 'hausmeisterpro', 'ablesung', 'portal'],
    monthly: 69.99,
    yearly: 671.90,
    individual_monthly: 119.87,
    features: [
      'Alle 5 Apps – Premium-Zugang',
      'Cross-App Automatisierungen',
      'Gemeinsames Portal für Mieter & Vermieter',
      'Dedizierter Account Manager',
      'White-Label Option',
      'API-Zugang für alle Apps',
      'Onboarding-Support',
      'SLA-Garantie',
    ],
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_KEY")!
    );

    const body = await req.json();
    const { action = 'get_bundles', current_app = 'mieterapp' } = body;

    if (action === 'get_bundles') {
      // Return all bundles, marking which contain the current app
      const bundlesWithContext = Object.values(BUNDLES).map(bundle => ({
        ...bundle,
        includes_current_app: bundle.apps.includes(current_app),
        savings_monthly: bundle.individual_monthly - bundle.monthly,
        savings_percent: Math.round((1 - bundle.monthly / bundle.individual_monthly) * 100),
        yearly_savings: (bundle.monthly * 12) - bundle.yearly,
        stripe_prices: STRIPE_BUNDLE_PRICES[bundle.id as keyof typeof STRIPE_BUNDLE_PRICES],
      }));

      // Sort: bundles containing current app first, then by savings
      bundlesWithContext.sort((a, b) => {
        if (a.includes_current_app && !b.includes_current_app) return -1;
        if (!a.includes_current_app && b.includes_current_app) return 1;
        return b.savings_percent - a.savings_percent;
      });

      return Response.json({
        success: true,
        bundles: bundlesWithContext,
        current_app,
      });
    }

    if (action === 'create_bundle_checkout') {
      const { bundle_id, billing_cycle = 'monthly' } = body;

      const bundle = BUNDLES[bundle_id as keyof typeof BUNDLES];
      if (!bundle) {
        return Response.json({ error: 'Bundle nicht gefunden' }, { status: 400 });
      }

      const prices = STRIPE_BUNDLE_PRICES[bundle_id as keyof typeof STRIPE_BUNDLE_PRICES];
      const priceId = billing_cycle === 'yearly' ? prices.yearly : prices.monthly;

      // Get or create Stripe customer
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single();

      // Create checkout via Stripe
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
      const checkoutResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'mode': 'subscription',
          'line_items[0][price]': priceId,
          'line_items[0][quantity]': '1',
          'success_url': `${Deno.env.get('APP_URL') || 'https://app.mieterapp.de'}/#/BillingSuccess?bundle=${bundle_id}`,
          'cancel_url': `${Deno.env.get('APP_URL') || 'https://app.mieterapp.de'}/#/EcosystemPricing?canceled=true`,
          'customer_email': user.email,
          'metadata[bundle_id]': bundle_id,
          'metadata[user_id]': user.id,
          'metadata[billing_cycle]': billing_cycle,
          'metadata[apps]': bundle.apps.join(','),
          ...(profile?.stripe_customer_id ? { 'customer': profile.stripe_customer_id } : {}),
        }),
      });

      const checkoutSession = await checkoutResponse.json();

      if (checkoutSession.error) {
        throw new Error(checkoutSession.error.message);
      }

      // Log bundle interest
      await supabase.from('ecosystem_bundle_events').insert({
        user_id: user.id,
        bundle_id: bundle_id,
        action: 'checkout_started',
        billing_cycle: billing_cycle,
        created_at: new Date().toISOString(),
      }).catch(() => {});

      return Response.json({
        success: true,
        checkout_url: checkoutSession.url,
        session_id: checkoutSession.id,
      });
    }

    if (action === 'get_bundle_recommendation') {
      // Recommend the best bundle based on user's current app usage
      const { data: userApps } = await supabase
        .from('user_profiles')
        .select('active_apps, selected_plan')
        .eq('id', user.id)
        .single();

      const activeApps = userApps?.active_apps || [current_app];
      const currentPlan = userApps?.selected_plan || 'free';

      // Find the smallest bundle that covers all active apps
      let recommended = null;
      for (const bundle of Object.values(BUNDLES)) {
        const coversAll = activeApps.every((app: string) => bundle.apps.includes(app));
        if (coversAll) {
          if (!recommended || bundle.monthly < recommended.monthly) {
            recommended = bundle;
          }
        }
      }

      // If no bundle covers all, recommend the most relevant
      if (!recommended) {
        recommended = Object.values(BUNDLES).find(b => b.apps.includes(current_app)) || BUNDLES.fintutto_komplett;
      }

      return Response.json({
        success: true,
        recommendation: {
          bundle: recommended,
          reason: `Basierend auf deiner Nutzung von ${activeApps.length} App(s)`,
          savings_monthly: recommended.individual_monthly - recommended.monthly,
        },
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Bundle pricing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
