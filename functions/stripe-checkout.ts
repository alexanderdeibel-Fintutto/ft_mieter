import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from "npm:@supabase/supabase-js";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, successUrl, cancelUrl } = await req.json();

    if (!priceId || !successUrl || !cancelUrl) {
      return Response.json({ 
        error: 'Missing required parameters: priceId, successUrl, cancelUrl' 
      }, { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_KEY")
    );

    // Fetch pricing from v_app_pricing to validate and get product info
    const { data: prices, error: pricesError } = await supabase
      .from('v_app_pricing')
      .select('monthly_price_id, yearly_price_id, product_name, tier_name, billing_currency')
      .or(`monthly_price_id.eq.${priceId},yearly_price_id.eq.${priceId}`)
      .single();

    if (pricesError || !prices) {
      console.error('Price lookup error:', pricesError);
      return Response.json({ error: 'Price not found in catalog' }, { status: 404 });
    }

    const stripe = (await import('npm:stripe@17.4.0')).default;
    const stripeClient = stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Create Stripe Checkout Session
    const session = await stripeClient.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl,
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: {
        app_id: 'mieterapp',
        user_id: user.id,
        product_name: prices.product_name,
        tier_name: prices.tier_name
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Error in stripe-checkout:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});