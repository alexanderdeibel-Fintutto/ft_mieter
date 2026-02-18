import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from "npm:@supabase/supabase-js";
import Stripe from 'npm:stripe@17.4.0';

/**
 * Stripe Setup for Ecosystem Bundles
 * Creates Stripe Products and Prices for all Fintutto bundles.
 * Run once to set up, then store the Price IDs.
 *
 * Usage: Call with action: 'setup_bundles'
 * Returns: Map of bundle_id -> { monthly_price_id, yearly_price_id }
 */

const BUNDLE_DEFINITIONS = [
  {
    id: 'mieter_plus',
    name: 'Fintutto Mieter Plus',
    description: 'MieterApp Pro + Ablesung Basic im Bundle. Cross-App Verbrauchsanalyse und automatische Zähler-Erinnerungen.',
    monthly_amount: 1299, // 12.99 EUR in cents
    yearly_amount: 12490, // 124.90 EUR in cents
    metadata: {
      bundle_id: 'mieter_plus',
      apps: 'mieterapp,ablesung',
      tier: 'pro',
      ecosystem: 'fintutto',
    },
  },
  {
    id: 'vermieter_komplett',
    name: 'Fintutto Vermieter Komplett',
    description: 'Vermietify Pro + HausmeisterPro Pro + Ablesung Pro. Cross-App Datensync, gemeinsames Dashboard, Priority Support.',
    monthly_amount: 4999, // 49.99 EUR
    yearly_amount: 47990, // 479.90 EUR
    metadata: {
      bundle_id: 'vermieter_komplett',
      apps: 'vermietify,hausmeisterpro,ablesung',
      tier: 'pro',
      ecosystem: 'fintutto',
    },
  },
  {
    id: 'fintutto_komplett',
    name: 'Fintutto Komplett',
    description: 'Alle 5 Fintutto Apps mit Premium-Zugang. Cross-App Automatisierungen, dedizierter Account Manager, White-Label Option, API-Zugang.',
    monthly_amount: 6999, // 69.99 EUR
    yearly_amount: 67190, // 671.90 EUR
    metadata: {
      bundle_id: 'fintutto_komplett',
      apps: 'mieterapp,vermietify,hausmeisterpro,ablesung,portal',
      tier: 'premium',
      ecosystem: 'fintutto',
    },
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.is_admin) {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return Response.json({ error: 'STRIPE_SECRET_KEY not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_KEY")!
    );

    const body = await req.json();
    const { action = 'setup_bundles' } = body;

    if (action === 'setup_bundles') {
      const results: Record<string, any> = {};

      for (const bundle of BUNDLE_DEFINITIONS) {
        console.log(`Creating Stripe product: ${bundle.name}`);

        // Check if product already exists
        const existingProducts = await stripe.products.search({
          query: `metadata['bundle_id']:'${bundle.id}'`,
        });

        let product;
        if (existingProducts.data.length > 0) {
          product = existingProducts.data[0];
          console.log(`Product already exists: ${product.id}`);
        } else {
          // Create product
          product = await stripe.products.create({
            name: bundle.name,
            description: bundle.description,
            metadata: bundle.metadata,
          });
          console.log(`Created product: ${product.id}`);
        }

        // Check for existing prices
        const existingPrices = await stripe.prices.list({
          product: product.id,
          active: true,
        });

        let monthlyPrice = existingPrices.data.find(
          (p: any) => p.recurring?.interval === 'month'
        );
        let yearlyPrice = existingPrices.data.find(
          (p: any) => p.recurring?.interval === 'year'
        );

        // Create monthly price if not exists
        if (!monthlyPrice) {
          monthlyPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: bundle.monthly_amount,
            currency: 'eur',
            recurring: { interval: 'month' },
            metadata: {
              bundle_id: bundle.id,
              billing_cycle: 'monthly',
            },
          });
          console.log(`Created monthly price: ${monthlyPrice.id}`);
        }

        // Create yearly price if not exists
        if (!yearlyPrice) {
          yearlyPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: bundle.yearly_amount,
            currency: 'eur',
            recurring: { interval: 'year' },
            metadata: {
              bundle_id: bundle.id,
              billing_cycle: 'yearly',
            },
          });
          console.log(`Created yearly price: ${yearlyPrice.id}`);
        }

        results[bundle.id] = {
          product_id: product.id,
          monthly_price_id: monthlyPrice.id,
          yearly_price_id: yearlyPrice.id,
          monthly_amount: bundle.monthly_amount / 100,
          yearly_amount: bundle.yearly_amount / 100,
        };
      }

      // Store Price IDs in Supabase for runtime use
      for (const [bundleId, data] of Object.entries(results)) {
        await supabase.from('ecosystem_bundle_config').upsert({
          bundle_id: bundleId,
          stripe_product_id: (data as any).product_id,
          stripe_monthly_price_id: (data as any).monthly_price_id,
          stripe_yearly_price_id: (data as any).yearly_price_id,
          monthly_amount: (data as any).monthly_amount,
          yearly_amount: (data as any).yearly_amount,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'bundle_id' }).catch((err: any) => {
          console.log('Config table may not exist yet, skipping storage:', err.message);
        });
      }

      return Response.json({
        success: true,
        message: 'Stripe bundle products and prices created successfully',
        bundles: results,
        next_steps: [
          'Copy the Price IDs into your environment variables or config',
          'Update ecosystemBundlePricing.ts with the real Price IDs',
          'Test checkout flow with each bundle',
        ],
      });
    }

    if (action === 'list_bundles') {
      // List existing bundle products from Stripe
      const products = await stripe.products.search({
        query: "metadata['ecosystem']:'fintutto'",
      });

      const bundleProducts = await Promise.all(
        products.data.map(async (product: any) => {
          const prices = await stripe.prices.list({
            product: product.id,
            active: true,
          });

          return {
            product_id: product.id,
            name: product.name,
            bundle_id: product.metadata?.bundle_id,
            active: product.active,
            prices: prices.data.map((p: any) => ({
              price_id: p.id,
              amount: p.unit_amount / 100,
              currency: p.currency,
              interval: p.recurring?.interval,
            })),
          };
        })
      );

      return Response.json({ success: true, bundles: bundleProducts });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Stripe setup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
