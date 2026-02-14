import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PARTNER_CATEGORIES: Record<string, { name: string; icon: string; relevance: string[] }> = {
  umzug: { name: "Umzug & Transport", icon: "box", relevance: ["mieter"] },
  energie: { name: "Strom & Gas", icon: "zap", relevance: ["mieter", "vermieter"] },
  versicherung: { name: "Versicherungen", icon: "shield", relevance: ["mieter", "vermieter"] },
  internet: { name: "Internet & TV", icon: "wifi", relevance: ["mieter"] },
  handwerk: { name: "Handwerker", icon: "wrench", relevance: ["vermieter", "hausmeister"] },
  einrichtung: { name: "Moebel & Einrichtung", icon: "sofa", relevance: ["mieter"] },
  reinigung: { name: "Reinigung", icon: "sparkles", relevance: ["vermieter", "hausmeister"] },
  finanzen: { name: "Finanzen & Kredit", icon: "wallet", relevance: ["mieter", "vermieter"] },
  sicherheit: { name: "Sicherheit & Schluessel", icon: "lock", relevance: ["mieter", "vermieter", "hausmeister"] },
  garten: { name: "Garten & Aussenbereich", icon: "leaf", relevance: ["vermieter", "hausmeister"] },
  telekommunikation: { name: "Telekommunikation", icon: "phone", relevance: ["mieter"] },
};

const SEED_PARTNERS = [
  {
    id: "verivox_strom", name: "Verivox Stromvergleich", category: "energie",
    description: "Deutschlands Nr. 1 Vergleichsportal fuer Strom",
    offer_headline: "Bis zu 500 Euro/Jahr beim Strom sparen",
    offer_description: "Vergleiche ueber 1.000 Stromanbieter und wechsle in nur 5 Minuten. Bonus fuer Neukunden.",
    affiliate_url: "https://www.verivox.de/strom/", revenue_model: "cpa", commission: 45.00,
    priority: 100, target_audience: ["mieter", "vermieter"],
    trigger_contexts: ["dashboard", "nebenkosten", "onboarding"],
  },
  {
    id: "check24_strom", name: "CHECK24 Strom", category: "energie",
    description: "Ueber 850 Stromanbieter vergleichen",
    offer_headline: "Stromanbieterwechsel in 5 Minuten",
    offer_description: "Finde den guenstigsten Stromanbieter und spare sofort. TUEV-geprueft.",
    affiliate_url: "https://www.check24.de/strom/", revenue_model: "cpa", commission: 40.00,
    priority: 90, target_audience: ["mieter", "vermieter"],
    trigger_contexts: ["dashboard", "nebenkosten"],
  },
  {
    id: "huk24", name: "HUK24 Hausratversicherung", category: "versicherung",
    description: "Guenstiger Hausratschutz vom Testsieger",
    offer_headline: "Hausrat ab 2,93 Euro/Monat",
    offer_description: "Testsieger-Hausratversicherung zu Top-Konditionen. Online-Vorteil sichern.",
    affiliate_url: "https://www.huk24.de/hausratversicherung", revenue_model: "cpl", commission: 12.00,
    priority: 80, target_audience: ["mieter"],
    trigger_contexts: ["onboarding", "einzug", "dashboard"],
  },
  {
    id: "myhammer", name: "MyHammer", category: "handwerk",
    description: "Handwerker in deiner Naehe finden",
    offer_headline: "Handwerker einfach und schnell finden",
    offer_description: "Erhalte bis zu 5 Angebote von geprueften Handwerkern. Kostenlos vergleichen.",
    affiliate_url: "https://www.my-hammer.de/", revenue_model: "cpl", commission: 8.00,
    priority: 70, target_audience: ["mieter", "vermieter", "hausmeister"],
    trigger_contexts: ["reparatur", "mangel", "dashboard"],
  },
  {
    id: "check24_internet", name: "CHECK24 Internet", category: "telekommunikation",
    description: "DSL und Kabel Internet vergleichen",
    offer_headline: "Internet-Tarife ab 9,99 Euro/Monat",
    offer_description: "Finde den besten Internet-Tarif fuer deine Adresse. Cashback-Garantie.",
    affiliate_url: "https://www.check24.de/internet/", revenue_model: "cpa", commission: 35.00,
    priority: 75, target_audience: ["mieter"],
    trigger_contexts: ["einzug", "onboarding", "dashboard"],
  },
  {
    id: "movinga", name: "Movinga", category: "umzug",
    description: "Stressfreier Umzug zum Festpreis",
    offer_headline: "Umzugsangebote ab 299 Euro",
    offer_description: "Professioneller Umzugsservice zum garantierten Festpreis. Online buchen.",
    affiliate_url: "https://www.movinga.de/", revenue_model: "cpl", commission: 15.00,
    priority: 60, target_audience: ["mieter"],
    trigger_contexts: ["einzug", "kuendigung"],
  },
  {
    id: "home24", name: "home24", category: "einrichtung",
    description: "Moebel und Einrichtung online kaufen",
    offer_headline: "Bis zu 60% Rabatt auf Moebel",
    offer_description: "Ueber 100.000 Moebel und Wohnaccessoires. Gratis Lieferung ab 30 Euro.",
    affiliate_url: "https://www.home24.de/", revenue_model: "cps", commission: 6.00,
    priority: 50, target_audience: ["mieter"],
    trigger_contexts: ["einzug", "onboarding"],
  },
  {
    id: "helpling", name: "Helpling", category: "reinigung",
    description: "Professionelle Reinigungskraefte buchen",
    offer_headline: "Putzfrau ab 13 Euro/Stunde",
    offer_description: "Gepruefte und versicherte Reinigungskraefte in deiner Naehe. Online buchen.",
    affiliate_url: "https://www.helpling.de/", revenue_model: "cpa", commission: 20.00,
    priority: 55, target_audience: ["mieter", "vermieter"],
    trigger_contexts: ["auszug", "dashboard"],
  },
];

function getUserIdFromRequest(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  // In production, decode JWT; here we use the sub claim
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
    const { action = "get_offers" } = body;

    if (action === "get_offers") {
      const {
        category,
        user_role = "mieter",
        context,
        limit: maxResults = 12,
        exclude_dismissed = true,
        app_id = "mieterapp",
      } = body;

      let { data: partners } = await supabase
        .from("affiliate_partners")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false })
        .limit(maxResults);

      if (!partners || partners.length === 0) {
        partners = SEED_PARTNERS as any[];
      }

      if (category) {
        partners = partners.filter((p: any) => p.category === category);
      }

      partners = partners.filter(
        (p: any) => !p.target_audience || p.target_audience.includes(user_role)
      );

      if (context) {
        partners.sort((a: any, b: any) => {
          const aMatch = a.trigger_contexts?.includes(context) ? 1 : 0;
          const bMatch = b.trigger_contexts?.includes(context) ? 1 : 0;
          return bMatch - aMatch;
        });
      }

      if (exclude_dismissed && userId) {
        const { data: dismissed } = await supabase
          .from("affiliate_user_preferences")
          .select("partner_id")
          .eq("user_id", userId)
          .eq("status", "dismissed");

        const dismissedIds = new Set(dismissed?.map((d: any) => d.partner_id) || []);
        partners = partners.filter((p: any) => !dismissedIds.has(p.id));
      }

      return new Response(
        JSON.stringify({
          success: true,
          offers: partners.slice(0, maxResults),
          categories: PARTNER_CATEGORIES,
          total: partners.length,
          app_id,
        }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (action === "track_click") {
      const { partner_id, partner_name, category, source_page, context } = body;
      const clickId = crypto.randomUUID();

      await supabase.from("affiliate_tracking").insert({
        user_id: userId,
        provider: "direct",
        event_type: "click",
        partner_name: partner_name || partner_id,
        metadata: { partner_id, category, source_page, context, click_id: clickId },
        created_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ success: true, click_id: clickId }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (action === "dismiss_offer") {
      const { partner_id, permanent = false } = body;

      await supabase.from("affiliate_user_preferences").upsert({
        user_id: userId,
        partner_id,
        status: permanent ? "dismissed" : "hidden_temporarily",
        updated_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_revenue_analytics") {
      const { period = "30d" } = body;
      const daysBack = parseInt(period) || 30;
      const since = new Date(Date.now() - daysBack * 86400000).toISOString();

      const { data: events } = await supabase
        .from("affiliate_tracking")
        .select("*")
        .gte("created_at", since);

      const byProvider: Record<string, any> = {};
      events?.forEach((e: any) => {
        const key = e.provider || "unknown";
        if (!byProvider[key]) byProvider[key] = { impressions: 0, clicks: 0, conversions: 0, revenue: 0 };
        if (e.event_type === "impression") byProvider[key].impressions++;
        if (e.event_type === "click") byProvider[key].clicks++;
        if (e.event_type === "conversion" || e.event_type === "conversion_confirmed") {
          byProvider[key].conversions++;
          byProvider[key].revenue += e.order_value || 0;
        }
      });

      const totalClicks = events?.filter((e) => e.event_type === "click").length || 0;
      const totalConversions =
        events?.filter((e) => e.event_type === "conversion" || e.event_type === "conversion_confirmed").length || 0;
      const totalRevenue =
        events
          ?.filter((e) => e.event_type === "conversion" || e.event_type === "conversion_confirmed")
          .reduce((sum, e) => sum + (e.order_value || 0), 0) || 0;

      return new Response(
        JSON.stringify({
          success: true,
          analytics: {
            period: `${daysBack}d`,
            total_clicks: totalClicks,
            total_conversions: totalConversions,
            total_revenue: totalRevenue,
            conversion_rate: totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(1) : "0",
            by_provider: byProvider,
          },
        }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (action === "seed_partners") {
      for (const partner of SEED_PARTNERS) {
        await supabase.from("affiliate_partners").upsert(partner, { onConflict: "id" });
      }
      return new Response(
        JSON.stringify({ success: true, seeded: SEED_PARTNERS.length }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Affiliate partner engine error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
