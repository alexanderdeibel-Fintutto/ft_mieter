import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

function getTopPartners(events: any[]) {
  const partnerCounts: Record<string, number> = {};
  events
    .filter((e) => e.event_type === "click" && e.partner_name)
    .forEach((e) => {
      partnerCounts[e.partner_name] = (partnerCounts[e.partner_name] || 0) + 1;
    });
  return Object.entries(partnerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, clicks]) => ({ name, clicks }));
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
    const { action = "track_event" } = body;

    if (action === "track_event") {
      const { event_type, trigger, orderId, orderValue, partner_name, voucher_code } = body;

      await supabase.from("affiliate_tracking").insert({
        user_id: userId,
        provider: "sovendus",
        event_type,
        trigger_context: trigger,
        order_id: orderId || null,
        order_value: orderValue || null,
        partner_name: partner_name || null,
        voucher_code: voucher_code || null,
        metadata: {
          user_agent: req.headers.get("user-agent"),
          referrer: req.headers.get("referer"),
        },
        created_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_analytics") {
      const { period = "30d" } = body;
      const daysBack = parseInt(period) || 30;
      const since = new Date(Date.now() - daysBack * 86400000).toISOString();

      const { data: events } = await supabase
        .from("affiliate_tracking")
        .select("event_type, provider, created_at, order_value, partner_name")
        .eq("provider", "sovendus")
        .gte("created_at", since);

      const impressions = events?.filter((e) => e.event_type === "impression").length || 0;
      const clicks = events?.filter((e) => e.event_type === "click").length || 0;
      const conversions = events?.filter((e) => e.event_type === "conversion").length || 0;
      const consents = events?.filter((e) => e.event_type === "consent_given").length || 0;

      return new Response(
        JSON.stringify({
          success: true,
          analytics: {
            period: `${daysBack}d`,
            impressions,
            clicks,
            conversions,
            consents,
            estimated_revenue: clicks * 0.75,
            ctr: impressions > 0 ? (clicks / impressions * 100).toFixed(1) : "0",
            conversion_rate: clicks > 0 ? (conversions / clicks * 100).toFixed(1) : "0",
            top_partners: getTopPartners(events || []),
          },
        }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Sovendus postback webhook - no auth required for server-to-server
    if (action === "postback") {
      const { transaction_id, commission, partner_id, partner_name } = body;

      await supabase.from("affiliate_tracking").insert({
        provider: "sovendus",
        event_type: "conversion_confirmed",
        order_id: transaction_id,
        order_value: commission,
        partner_name: partner_name || partner_id,
        metadata: { partner_id, raw_postback: body },
        created_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sovendus tracking error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
