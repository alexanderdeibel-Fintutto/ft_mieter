import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

/**
 * Sovendus Postback Webhook
 * Public endpoint (no auth) for Sovendus server-to-server conversion notifications.
 *
 * Configure this URL in Sovendus Partner Dashboard:
 * https://aaefocdqgdgexkcrjhks.supabase.co/functions/v1/sovendusPostback
 *
 * Sovendus sends: GET/POST with transaction_id, network_commission, partner_name, etc.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Shared secret for webhook verification (optional, set in Supabase secrets)
const WEBHOOK_SECRET = Deno.env.get("SOVENDUS_WEBHOOK_SECRET") || "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let data: Record<string, string> = {};

    // Sovendus may send as GET query params or POST body
    if (req.method === "GET") {
      const url = new URL(req.url);
      url.searchParams.forEach((value, key) => {
        data[key] = value;
      });
    } else {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await req.json();
      } else if (contentType.includes("form")) {
        const formData = await req.formData();
        formData.forEach((value, key) => {
          data[key] = String(value);
        });
      } else {
        // Try JSON
        try { data = await req.json(); } catch { /* empty */ }
      }
    }

    // Verify webhook secret if configured
    if (WEBHOOK_SECRET && data.secret !== WEBHOOK_SECRET) {
      console.warn("Sovendus postback: invalid secret");
      return new Response(
        JSON.stringify({ error: "Invalid webhook secret" }),
        { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const transactionId = data.transaction_id || data.transactionId || data.tid || "";
    const commission = parseFloat(data.commission || data.network_commission || data.payout || "0");
    const partnerName = data.partner_name || data.partnerName || data.merchant || "unknown";
    const partnerId = data.partner_id || data.partnerId || "";
    const orderId = data.order_id || data.orderId || transactionId;
    const userId = data.user_id || data.userId || null;

    // Store confirmed conversion
    await supabase.from("affiliate_tracking").insert({
      user_id: userId,
      provider: "sovendus",
      event_type: "conversion_confirmed",
      order_id: orderId,
      order_value: commission,
      partner_name: partnerName,
      metadata: {
        partner_id: partnerId,
        transaction_id: transactionId,
        raw_postback: data,
        received_at: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    });

    console.log(`Sovendus postback received: ${transactionId}, commission: ${commission}, partner: ${partnerName}`);

    // Return success (Sovendus expects 200 OK)
    return new Response(
      JSON.stringify({ success: true, transaction_id: transactionId }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sovendus postback error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
