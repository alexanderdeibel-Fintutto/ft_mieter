import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SEED_PARTNERS = [
  { id: "verivox_strom", name: "Verivox Stromvergleich", category: "energie", description: "Deutschlands Nr. 1 Vergleichsportal fuer Strom", offer_headline: "Bis zu 500 Euro/Jahr beim Strom sparen", offer_description: "Vergleiche ueber 1.000 Stromanbieter und wechsle in nur 5 Minuten.", affiliate_url: "https://www.verivox.de/strom/", revenue_model: "cpa", commission: 45.00, priority: 100, target_audience: ["mieter", "vermieter"], trigger_contexts: ["dashboard", "nebenkosten", "onboarding"], is_active: true },
  { id: "check24_strom", name: "CHECK24 Strom", category: "energie", description: "Ueber 850 Stromanbieter vergleichen", offer_headline: "Stromanbieterwechsel in 5 Minuten", offer_description: "Finde den guenstigsten Stromanbieter und spare sofort.", affiliate_url: "https://www.check24.de/strom/", revenue_model: "cpa", commission: 40.00, priority: 90, target_audience: ["mieter", "vermieter"], trigger_contexts: ["dashboard", "nebenkosten"], is_active: true },
  { id: "huk24", name: "HUK24 Hausratversicherung", category: "versicherung", description: "Guenstiger Hausratschutz vom Testsieger", offer_headline: "Hausrat ab 2,93 Euro/Monat", offer_description: "Testsieger-Hausratversicherung zu Top-Konditionen.", affiliate_url: "https://www.huk24.de/hausratversicherung", revenue_model: "cpl", commission: 12.00, priority: 80, target_audience: ["mieter"], trigger_contexts: ["onboarding", "einzug", "dashboard"], is_active: true },
  { id: "myhammer", name: "MyHammer", category: "handwerk", description: "Handwerker in deiner Naehe finden", offer_headline: "Handwerker einfach und schnell finden", offer_description: "Erhalte bis zu 5 Angebote von geprueften Handwerkern.", affiliate_url: "https://www.my-hammer.de/", revenue_model: "cpl", commission: 8.00, priority: 70, target_audience: ["mieter", "vermieter", "hausmeister"], trigger_contexts: ["reparatur", "mangel", "dashboard"], is_active: true },
  { id: "check24_internet", name: "CHECK24 Internet", category: "telekommunikation", description: "DSL und Kabel Internet vergleichen", offer_headline: "Internet-Tarife ab 9,99 Euro/Monat", offer_description: "Finde den besten Internet-Tarif fuer deine Adresse.", affiliate_url: "https://www.check24.de/internet/", revenue_model: "cpa", commission: 35.00, priority: 75, target_audience: ["mieter"], trigger_contexts: ["einzug", "onboarding", "dashboard"], is_active: true },
  { id: "movinga", name: "Movinga", category: "umzug", description: "Stressfreier Umzug zum Festpreis", offer_headline: "Umzugsangebote ab 299 Euro", offer_description: "Professioneller Umzugsservice zum garantierten Festpreis.", affiliate_url: "https://www.movinga.de/", revenue_model: "cpl", commission: 15.00, priority: 60, target_audience: ["mieter"], trigger_contexts: ["einzug", "kuendigung"], is_active: true },
  { id: "home24", name: "home24", category: "einrichtung", description: "Moebel und Einrichtung online kaufen", offer_headline: "Bis zu 60% Rabatt auf Moebel", offer_description: "Ueber 100.000 Moebel und Wohnaccessoires.", affiliate_url: "https://www.home24.de/", revenue_model: "cps", commission: 6.00, priority: 50, target_audience: ["mieter"], trigger_contexts: ["einzug", "onboarding"], is_active: true },
  { id: "helpling", name: "Helpling", category: "reinigung", description: "Professionelle Reinigungskraefte buchen", offer_headline: "Putzfrau ab 13 Euro/Stunde", offer_description: "Gepruefte und versicherte Reinigungskraefte in deiner Naehe.", affiliate_url: "https://www.helpling.de/", revenue_model: "cpa", commission: 20.00, priority: 55, target_audience: ["mieter", "vermieter"], trigger_contexts: ["auszug", "dashboard"], is_active: true },
];

const SEED_AB_TESTS = [
  { id: "affiliate_widget_placement", name: "Affiliate Widget Platzierung", description: "Testet verschiedene Positionen des Affiliate-Widgets", variants: ["dashboard_bottom", "sidebar", "post_action"], traffic_split: { dashboard_bottom: 34, sidebar: 33, post_action: 33 }, status: "active" },
  { id: "verivox_banner_style", name: "Verivox Banner Stil", description: "Testet verschiedene Darstellungen des Verivox-Widgets", variants: ["savings_focus", "comparison_focus", "urgency_focus"], traffic_split: { savings_focus: 34, comparison_focus: 33, urgency_focus: 33 }, status: "active" },
  { id: "sovendus_trigger_timing", name: "Sovendus Trigger Zeitpunkt", description: "Testet verschiedene Zeitpunkte fuer die Sovendus-Einblendung", variants: ["immediate", "delayed_5s", "delayed_scroll"], traffic_split: { immediate: 34, delayed_5s: 33, delayed_scroll: 33 }, status: "active" },
  { id: "bundle_pricing_highlight", name: "Bundle Pricing Hervorhebung", description: "Testet welches Bundle am meisten konvertiert", variants: ["mieter_plus", "vermieter_komplett", "fintutto_komplett"], traffic_split: { mieter_plus: 34, vermieter_komplett: 33, fintutto_komplett: 33 }, status: "active" },
];

const SEED_BUNDLE_CONFIGS = [
  { id: "mieter_plus", bundle_name: "Mieter Plus", metadata: { price_monthly: 12.99, price_yearly: 124.90, apps: ["mieter", "ablesung"] } },
  { id: "vermieter_komplett", bundle_name: "Vermieter Komplett", metadata: { price_monthly: 49.99, price_yearly: 479.90, apps: ["vermieter", "hausmeisterpro", "ablesung"] } },
  { id: "fintutto_komplett", bundle_name: "Fintutto Komplett", metadata: { price_monthly: 69.99, price_yearly: 671.90, apps: ["mieter", "vermieter", "hausmeisterpro", "ablesung", "portal"] } },
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const { action = "create_tables" } = body;

    if (action === "seed_partners") {
      let seeded = 0;
      for (const partner of SEED_PARTNERS) {
        const { error } = await supabase.from("affiliate_partners").upsert(partner, { onConflict: "id" });
        if (!error) seeded++;
      }
      return new Response(
        JSON.stringify({ success: true, status: "ok", seeded, total: SEED_PARTNERS.length }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (action === "seed_ab_tests") {
      let seeded = 0;
      for (const test of SEED_AB_TESTS) {
        const { error } = await supabase.from("ab_test_configs").upsert(test, { onConflict: "id" });
        if (!error) seeded++;
      }
      return new Response(
        JSON.stringify({ success: true, status: "ok", seeded, total: SEED_AB_TESTS.length }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (action === "seed_bundles") {
      let seeded = 0;
      for (const config of SEED_BUNDLE_CONFIGS) {
        const { error } = await supabase.from("ecosystem_bundle_config").upsert(config, { onConflict: "id" });
        if (!error) seeded++;
      }
      return new Response(
        JSON.stringify({ success: true, status: "ok", seeded, total: SEED_BUNDLE_CONFIGS.length }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify") {
      const tables = [
        "affiliate_partners", "affiliate_tracking", "affiliate_user_preferences",
        "ecosystem_cross_sell_log", "ecosystem_bundle_events", "transaction_usage",
        "white_label_tenants", "white_label_units", "white_label_unit_tenants",
        "ecosystem_bundle_config", "ab_test_configs", "ab_test_assignments", "ab_test_events",
      ];

      const results: Record<string, any> = {};
      for (const table of tables) {
        const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
        results[table] = error ? { error: error.message } : { count: count ?? 0, exists: true };
      }

      const allExist = Object.values(results).every((r: any) => r.exists);

      return new Response(
        JSON.stringify({
          success: allExist,
          status: allExist ? "ok" : "incomplete",
          tables: results,
          summary: `${Object.values(results).filter((r: any) => r.exists).length}/${tables.length} Tabellen vorhanden`,
        }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (action === "create_tables") {
      return new Response(
        JSON.stringify({
          success: true,
          status: "ok",
          message: "Tabellen muessen direkt im Supabase SQL Editor erstellt werden. Bitte das SQL aus supabase/migrations/20260214_complete_setup.sql verwenden.",
          sql_editor_url: `https://supabase.com/dashboard/project/${Deno.env.get("SUPABASE_URL")?.split("//")[1]?.split(".")[0]}/sql/new`,
        }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: seed_partners, seed_ab_tests, seed_bundles, verify, create_tables" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Setup database error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
