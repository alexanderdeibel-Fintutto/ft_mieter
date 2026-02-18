import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";

/**
 * Stripe Setup for Ecosystem Bundles
 * Creates Stripe Products and Prices for all Fintutto bundles.
 * Run once to set up, then store the Price IDs.
 *
 * Usage: Call with action: 'setup_bundles' or 'list_bundles'
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUNDLE_DEFINITIONS = [
  {
    id: "mieter_plus",
    name: "Fintutto Mieter Plus",
    description:
      "MieterApp Pro + Ablesung Basic im Bundle. Cross-App Verbrauchsanalyse und automatische Zaehler-Erinnerungen.",
    monthly_amount: 1299,
    yearly_amount: 12490,
    metadata: {
      bundle_id: "mieter_plus",
      apps: "mieterapp,ablesung",
      tier: "pro",
      ecosystem: "fintutto",
    },
  },
  {
    id: "vermieter_komplett",
    name: "Fintutto Vermieter Komplett",
    description:
      "Vermietify Pro + HausmeisterPro Pro + Ablesung Pro. Cross-App Datensync, gemeinsames Dashboard, Priority Support.",
    monthly_amount: 4999,
    yearly_amount: 47990,
    metadata: {
      bundle_id: "vermieter_komplett",
      apps: "vermietify,hausmeisterpro,ablesung",
      tier: "pro",
      ecosystem: "fintutto",
    },
  },
  {
    id: "fintutto_komplett",
    name: "Fintutto Komplett",
    description:
      "Alle 5 Fintutto Apps mit Premium-Zugang. Cross-App Automatisierungen, dedizierter Account Manager, White-Label Option, API-Zugang.",
    monthly_amount: 6999,
    yearly_amount: 67190,
    metadata: {
      bundle_id: "fintutto_komplett",
      apps: "mieterapp,vermietify,hausmeisterpro,ablesung,portal",
      tier: "premium",
      ecosystem: "fintutto",
    },
  },
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "STRIPE_SECRET_KEY not configured" }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-04-10" });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const { action = "setup_bundles" } = body;

    if (action === "setup_bundles") {
      const results: Record<string, unknown> = {};

      for (const bundle of BUNDLE_DEFINITIONS) {
        console.log(`Creating Stripe product: ${bundle.name}`);

        const existingProducts = await stripe.products.search({
          query: `metadata['bundle_id']:'${bundle.id}'`,
        });

        let product;
        if (existingProducts.data.length > 0) {
          product = existingProducts.data[0];
        } else {
          product = await stripe.products.create({
            name: bundle.name,
            description: bundle.description,
            metadata: bundle.metadata,
          });
        }

        const existingPrices = await stripe.prices.list({
          product: product.id,
          active: true,
        });

        let monthlyPrice = existingPrices.data.find(
          (p) => p.recurring?.interval === "month"
        );
        let yearlyPrice = existingPrices.data.find(
          (p) => p.recurring?.interval === "year"
        );

        if (!monthlyPrice) {
          monthlyPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: bundle.monthly_amount,
            currency: "eur",
            recurring: { interval: "month" },
            metadata: { bundle_id: bundle.id, billing_cycle: "monthly" },
          });
        }

        if (!yearlyPrice) {
          yearlyPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: bundle.yearly_amount,
            currency: "eur",
            recurring: { interval: "year" },
            metadata: { bundle_id: bundle.id, billing_cycle: "yearly" },
          });
        }

        results[bundle.id] = {
          product_id: product.id,
          monthly_price_id: monthlyPrice.id,
          yearly_price_id: yearlyPrice.id,
          monthly_amount: bundle.monthly_amount / 100,
          yearly_amount: bundle.yearly_amount / 100,
        };
      }

      // Store Price IDs in Supabase
      for (const [bundleId, data] of Object.entries(results)) {
        const d = data as Record<string, unknown>;
        await supabase
          .from("ecosystem_bundle_config")
          .upsert(
            {
              id: bundleId,
              bundle_name: BUNDLE_DEFINITIONS.find((b) => b.id === bundleId)?.name ?? bundleId,
              stripe_product_id: d.product_id,
              stripe_price_monthly: d.monthly_price_id,
              stripe_price_yearly: d.yearly_price_id,
              is_active: true,
              metadata: { monthly_amount: d.monthly_amount, yearly_amount: d.yearly_amount },
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          )
          .then(() => console.log(`Stored config for ${bundleId}`))
          .catch((err) => console.log("Config storage skipped:", err.message));
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Stripe bundle products and prices created successfully",
          bundles: results,
          next_steps: [
            "Copy the Price IDs into your Supabase Edge Function secrets",
            "Set STRIPE_PRICE_MIETER_PLUS_MONTHLY, STRIPE_PRICE_MIETER_PLUS_YEARLY, etc.",
            "Test checkout flow with each bundle",
          ],
        }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (action === "list_bundles") {
      const products = await stripe.products.search({
        query: "metadata['ecosystem']:'fintutto'",
      });

      const bundleProducts = await Promise.all(
        products.data.map(async (product) => {
          const prices = await stripe.prices.list({ product: product.id, active: true });
          return {
            product_id: product.id,
            name: product.name,
            bundle_id: product.metadata?.bundle_id,
            active: product.active,
            prices: prices.data.map((p) => ({
              price_id: p.id,
              amount: (p.unit_amount ?? 0) / 100,
              currency: p.currency,
              interval: p.recurring?.interval,
            })),
          };
        })
      );

      return new Response(
        JSON.stringify({ success: true, bundles: bundleProducts }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use setup_bundles or list_bundles" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Stripe setup error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
