import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ECOSYSTEM_APPS: Record<string, { name: string; url: string; icon: string }> = {
  mieterapp: { name: "MieterApp", url: "https://app.mieterapp.de", icon: "home" },
  vermietify: { name: "Vermietify", url: "https://app.vermietify.de", icon: "building" },
  hausmeisterpro: { name: "HausmeisterPro", url: "https://app.hausmeisterpro.de", icon: "wrench" },
  ablesung: { name: "Ablesung", url: "https://app.ablesung.fintutto.de", icon: "bar-chart" },
  portal: { name: "Fintutto Portal", url: "https://portal.fintutto.de", icon: "globe" },
};

interface CrossSellRule {
  source: string;
  target: string;
  triggers: string[];
  priority: "high" | "medium" | "low";
  headline: string;
  body: string;
  cta_text: string;
  benefit: string;
}

const CROSS_SELL_RULES: CrossSellRule[] = [
  {
    source: "mieterapp", target: "vermietify",
    triggers: ["user_is_landlord", "first_payment", "limit_reached"],
    priority: "high",
    headline: "Du vermietest auch?",
    body: "Mit Vermietify verwaltest du deine Immobilien professionell - Mieter, Vertraege, Nebenkosten.",
    cta_text: "Vermietify kostenlos testen",
    benefit: "Spare bis zu 10h/Monat bei der Verwaltung",
  },
  {
    source: "mieterapp", target: "ablesung",
    triggers: ["meter_reading", "zaehler_view", "verbrauch_view"],
    priority: "high",
    headline: "Zaehler per Foto ablesen",
    body: "Fotografiere deinen Zaehler und der Stand wird automatisch erkannt (OCR).",
    cta_text: "Ablesung ausprobieren",
    benefit: "Nie wieder Zaehlerstand abtippen",
  },
  {
    source: "vermietify", target: "hausmeisterpro",
    triggers: ["repair_created", "maintenance_needed", "task_created"],
    priority: "high",
    headline: "Hausmeister effizient steuern",
    body: "Reparaturauftraege direkt an HausmeisterPro uebergeben - mit Zeiterfassung und Statusupdates.",
    cta_text: "HausmeisterPro entdecken",
    benefit: "Reparaturen 50% schneller abwickeln",
  },
  {
    source: "vermietify", target: "ablesung",
    triggers: ["nk_abrechnung_started", "readings_missing", "meter_due"],
    priority: "high",
    headline: "Zaehlerstaende digital erfassen",
    body: "Alle Zaehler per App erfassen und direkt in die NK-Abrechnung uebernehmen.",
    cta_text: "Ablesung starten",
    benefit: "NK-Abrechnung in Minuten statt Stunden",
  },
  {
    source: "hausmeisterpro", target: "ablesung",
    triggers: ["inspection_started", "roundgang_completed"],
    priority: "medium",
    headline: "Zaehler beim Rundgang ablesen",
    body: "Erfasse Zaehlerstaende direkt beim Rundgang per OCR-Foto.",
    cta_text: "Ablesung aktivieren",
    benefit: "Zwei Aufgaben in einem Rundgang",
  },
  {
    source: "ablesung", target: "vermietify",
    triggers: ["readings_exported", "readings_completed"],
    priority: "high",
    headline: "Direkt in die NK-Abrechnung",
    body: "Zaehlerstaende automatisch in Vermietify uebernehmen und die NK-Abrechnung erstellen.",
    cta_text: "Vermietify testen",
    benefit: "Automatische Uebernahme der Zaehlerstaende",
  },
  {
    source: "vermietify", target: "mieterapp",
    triggers: ["tenant_added", "tenant_invited"],
    priority: "medium",
    headline: "Laden Sie Ihren Mieter ein",
    body: "Ihr Mieter kann ueber die MieterApp kommunizieren, Reparaturen melden und Dokumente einsehen.",
    cta_text: "Mieter einladen",
    benefit: "Weniger Anrufe, bessere Kommunikation",
  },
];

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
    const { action = "get_recommendation", source_app, event_type, dismissed_apps = [] } = body;

    if (action === "get_recommendation") {
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

      const matchingRules = CROSS_SELL_RULES
        .filter((rule) => rule.source === source_app)
        .filter((rule) => rule.triggers.includes(event_type))
        .filter((rule) => !dismissed_apps.includes(rule.target))
        .sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2));

      if (matchingRules.length === 0) {
        return new Response(
          JSON.stringify({ show_recommendation: false, reason: "no_matching_rules" }),
          { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      const bestRule = matchingRules[0];
      const targetApp = ECOSYSTEM_APPS[bestRule.target];

      // Log impression
      if (userId) {
        await supabase
          .from("ecosystem_cross_sell_log")
          .insert({
            user_id: userId,
            source_app,
            target_app: bestRule.target,
            event_type,
            action: "impression",
            created_at: new Date().toISOString(),
          })
          .catch(() => {});
      }

      return new Response(
        JSON.stringify({
          show_recommendation: true,
          recommendation_id: `${source_app}_to_${bestRule.target}_${event_type}`,
          target_app: bestRule.target,
          messaging: {
            headline: bestRule.headline,
            body: bestRule.body,
            cta_text: bestRule.cta_text,
            cta_url: targetApp.url,
            benefit: bestRule.benefit,
            icon: targetApp.icon,
            dismiss_text: "Nicht interessiert",
          },
          timing: {
            show_immediately: bestRule.priority === "high",
            delay_seconds: bestRule.priority === "high" ? 0 : 5,
          },
          placement: {
            location: bestRule.priority === "high" ? "modal" : "toast",
          },
        }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (action === "track_click") {
      const { target_app, recommendation_id } = body;

      await supabase.from("ecosystem_cross_sell_log").insert({
        user_id: userId,
        source_app,
        target_app,
        event_type,
        action: "click",
        recommendation_id,
        created_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_ecosystem_stats") {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const { data: stats } = await supabase
        .from("ecosystem_cross_sell_log")
        .select("source_app, target_app, action")
        .gte("created_at", since);

      const impressions = stats?.filter((s) => s.action === "impression").length || 0;
      const clicks = stats?.filter((s) => s.action === "click").length || 0;

      return new Response(
        JSON.stringify({
          success: true,
          stats: {
            period: "30d",
            impressions,
            clicks,
            ctr: impressions > 0 ? (clicks / impressions * 100).toFixed(1) : "0",
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
    console.error("Ecosystem cross-sell error:", error);
    return new Response(
      JSON.stringify({ error: error.message, show_recommendation: false }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
