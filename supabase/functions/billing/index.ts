import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2024-04-10",
    });

    const { action, customerId, priceId, email, successUrl, cancelUrl, subscriptionId } =
      await req.json();

    switch (action) {
      case "createCheckoutSession": {
        let customer: string | undefined;
        if (customerId) {
          customer = customerId;
        } else if (email) {
          const existing = await stripe.customers.list({ email, limit: 1 });
          if (existing.data.length > 0) customer = existing.data[0].id;
        }

        const session = await stripe.checkout.sessions.create({
          customer: customer || undefined,
          customer_email: customer ? undefined : email,
          mode: "subscription",
          payment_method_types: ["card", "sepa_debit"],
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: { user_email: email },
          allow_promotion_codes: true,
          locale: "de",
        });
        return new Response(
          JSON.stringify({ success: true, sessionId: session.id, url: session.url }),
          { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      case "createPortalSession": {
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: successUrl,
        });
        return new Response(
          JSON.stringify({ success: true, url: portalSession.url }),
          { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      case "getSubscription": {
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 1,
          expand: ["data.items.data.price.product"],
        });
        return new Response(
          JSON.stringify({ success: true, subscription: subscriptions.data[0] || null }),
          { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      case "cancelSubscription": {
        const canceledSub = await stripe.subscriptions.cancel(subscriptionId);
        return new Response(
          JSON.stringify({ success: true, subscription: canceledSub }),
          { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      case "getCustomerByEmail": {
        const customers = await stripe.customers.list({ email, limit: 1 });
        return new Response(
          JSON.stringify({ success: true, customer: customers.data[0] || null }),
          { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      case "listPrices": {
        const prices = await stripe.prices.list({
          active: true,
          expand: ["data.product"],
          type: "recurring",
        });
        const filteredPrices = prices.data.filter((price) => {
          const product = price.product;
          return product && typeof product === "object" && product.active;
        });
        return new Response(
          JSON.stringify({ success: true, prices: filteredPrices }),
          { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
