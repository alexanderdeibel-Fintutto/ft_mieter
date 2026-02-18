import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUNDLES: Record<string, any> = {
  mieter_plus: {
    id: "mieter_plus",
    name: "Mieter Plus",
    apps: ["mieterapp", "ablesung"],
    monthly: 12.99,
    yearly: 124.90,
    individual_monthly: 17.49,
    features: [
      "MieterApp Pro - alle Features",
      "Ablesung Basic - OCR Zaehlererfassung",
      "Cross-App Verbrauchsanalyse",
      "Automatische Zaehler-Erinnerungen",
    ],
  },
  vermieter_komplett: {
    id: "vermieter_komplett",
    name: "Vermieter Komplett",
    apps: ["vermietify", "hausmeisterpro", "ablesung"],
    monthly: 49.99,
    yearly: 479.90,
    individual_monthly: 79.88,
    features: [
      "Vermietify Pro - Unbegrenzte Objekte",
      "HausmeisterPro Pro - Vollausstattung",
      "Ablesung Pro - Alle Zaehlertypen",
      "Cross-App Datensync",
      "Gemeinsames Analytics-Dashboard",
      "Priority Support",
    ],
  },
  fintutto_komplett: {
    id: "fintutto_komplett",
    name: "Fintutto Komplett",
    apps: ["mieterapp", "vermietify", "hausmeisterpro", "ablesung", "portal"],
    monthly: 69.99,
    yearly: 671.90,
    individual_monthly: 119.87,
    features: [
      "Alle 5 Apps - Premium-Zugang",
      "Cross-App Automatisierungen",
      "Gemeinsames Portal fuer Mieter & Vermieter",
      "Dedizierter Account Manager",
      "White-Label Option",
      "API-Zugang fuer alle Apps",
      "Onboarding-Support",
      "SLA-Garantie",
    ],
  },
};

function getUserIdFromRequest(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  try {
    const token = authHeader.replace("Bearer ", "");
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const userId = getUserIdFromRequest(req);
    const body = await req.json();
    const { action = "get_bundles", current_app = "mieterapp" } = body;

    if (action === "get_bundles") {
      // Load Stripe price IDs from config table
      const { data: configRows } = await supabase
        .from("ecosystem_bundle_config")
        .select("*")
        .eq("is_active", true);

      const configMap: Record<string, any> = {};
      configRows?.forEach((row: any) => {
        configMap[row.id] = row;
      });

      const bundlesWithContext = Object.values(BUNDLES).map((bundle: any) => {
        const config = configMap[bundle.id];
        return {
          ...bundle,
          includes_current_app: bundle.apps.includes(current_app),
          savings_monthly: bundle.individual_monthly - bundle.monthly,
          savings_percent: Math.round((1 - bundle.monthly / bundle.individual_monthly) * 100),
          yearly_savings: bundle.monthly * 12 - bundle.yearly,
          stripe_prices: config
            ? { monthly: config.stripe_price_monthly, yearly: config.stripe_price_yearly }
            : null,
        };
      });

      bundlesWithContext.sort((a, b) => {
        if (a.includes_current_app && !b.includes_current_app) return -1;
        if (!a.includes_current_app && b.includes_current_app) return 1;
        return b.savings_percent - a.savings_percent;
      });

      return new Response(
        JSON.stringify({ success: true, bundles: bundlesWithContext, current_app }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (action === "create_bundle_checkout") {
      const { bundle_id, billing_cycle = "monthly" } = body;

      const bundle = BUNDLES[bundle_id];
      if (!bundle) {
        return new Response(
          JSON.stringify({ error: "Bundle nicht gefunden" }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      // Get Stripe price from config table
      const { data: config } = await supabase
        .from("ecosystem_bundle_config")
        .select("stripe_price_monthly, stripe_price_yearly")
        .eq("id", bundle_id)
        .single();

      const priceId = billing_cycle === "yearly"
        ? config?.stripe_price_yearly
        : config?.stripe_price_monthly;

      if (!priceId) {
        return new Response(
          JSON.stringify({ error: "Stripe Preis nicht konfiguriert. Bitte zuerst setupStripeBundles ausfuehren." }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) {
        return new Response(
          JSON.stringify({ error: "STRIPE_SECRET_KEY not configured" }),
          { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      const stripe = new Stripe(stripeKey, { apiVersion: "2024-04-10" });

      // Get user email from JWT
      let userEmail = "";
      const authHeader = req.headers.get("authorization");
      if (authHeader) {
        try {
          const token = authHeader.replace("Bearer ", "");
          const payload = JSON.parse(atob(token.split(".")[1]));
          userEmail = payload.email || "";
        } catch { /* empty */ }
      }

      const appUrl = Deno.env.get("APP_URL") || "https://app.mieterapp.de";
      const session = await stripe.checkout.sessions.create({
        customer_email: userEmail || undefined,
        mode: "subscription",
        payment_method_types: ["card", "sepa_debit"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/#/BillingSuccess?bundle=${bundle_id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/#/EcosystemPricing?canceled=true`,
        metadata: {
          bundle_id,
          user_id: userId || "",
          billing_cycle,
          apps: bundle.apps.join(","),
        },
        allow_promotion_codes: true,
        locale: "de",
      });

      // Log bundle checkout start
      if (userId) {
        await supabase
          .from("ecosystem_bundle_events")
          .insert({
            user_id: userId,
            bundle_id,
            action: "checkout_started",
            billing_cycle,
            created_at: new Date().toISOString(),
          })
          .catch(() => {});
      }

      return new Response(
        JSON.stringify({ success: true, checkout_url: session.url, session_id: session.id }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_bundle_recommendation") {
      const recommendation = BUNDLES.fintutto_komplett;
      if (current_app === "mieterapp") {
        return new Response(
          JSON.stringify({
            success: true,
            recommendation: {
              bundle: BUNDLES.mieter_plus,
              reason: "Basierend auf deiner MieterApp-Nutzung",
              savings_monthly: BUNDLES.mieter_plus.individual_monthly - BUNDLES.mieter_plus.monthly,
            },
          }),
          { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          recommendation: {
            bundle: recommendation,
            reason: "Das komplette Fintutto-Oekosystem",
            savings_monthly: recommendation.individual_monthly - recommendation.monthly,
          },
        }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Bundle pricing error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
