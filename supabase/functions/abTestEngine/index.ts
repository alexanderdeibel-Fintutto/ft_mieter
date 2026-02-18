import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function hashUserToVariant(userId: string, testId: string, variants: string[]): string {
  let hash = 0;
  const str = `${userId}:${testId}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % variants.length;
  return variants[index];
}

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
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { action = "get_variant" } = body;

    if (action === "get_variant") {
      const { test_id } = body;
      if (!test_id) {
        return new Response(
          JSON.stringify({ error: "test_id required" }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      const { data: existing } = await supabase
        .from("ab_test_assignments")
        .select("variant")
        .eq("test_id", test_id)
        .eq("user_id", userId)
        .single();

      if (existing) {
        const { data: testConfig } = await supabase
          .from("ab_test_configs")
          .select("variants")
          .eq("id", test_id)
          .single();

        const variants = testConfig?.variants || [];
        const variantConfig = Array.isArray(variants)
          ? variants.find((v: any) => v.id === existing.variant)
          : null;

        return new Response(
          JSON.stringify({ success: true, test_id, variant: existing.variant, config: variantConfig?.config || {}, is_new: false }),
          { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      const { data: testConfig } = await supabase
        .from("ab_test_configs")
        .select("*")
        .eq("id", test_id)
        .eq("status", "active")
        .single();

      if (!testConfig) {
        return new Response(
          JSON.stringify({ success: true, test_id, variant: "control", config: {}, is_new: false, note: "Test not found or inactive" }),
          { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      const variants = Array.isArray(testConfig.variants) ? testConfig.variants : [];
      const variantIds = variants.map((v: any) => v.id || v);
      const assignedVariant = hashUserToVariant(userId, test_id, variantIds);

      await supabase.from("ab_test_assignments").upsert({
        test_id,
        user_id: userId,
        variant: assignedVariant,
        assigned_at: new Date().toISOString(),
      }, { onConflict: "test_id,user_id" });

      const variantConfig = variants.find((v: any) => v.id === assignedVariant || v === assignedVariant);

      return new Response(
        JSON.stringify({ success: true, test_id, variant: assignedVariant, config: variantConfig?.config || {}, is_new: true }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_all_variants") {
      const { test_ids = [] } = body;
      const results: Record<string, any> = {};

      for (const testId of test_ids) {
        const { data: existing } = await supabase
          .from("ab_test_assignments")
          .select("variant")
          .eq("test_id", testId)
          .eq("user_id", userId)
          .single();

        if (existing) {
          results[testId] = { variant: existing.variant, config: {} };
        } else {
          const { data: testConfig } = await supabase
            .from("ab_test_configs")
            .select("*")
            .eq("id", testId)
            .eq("status", "active")
            .single();

          if (testConfig) {
            const variants = Array.isArray(testConfig.variants) ? testConfig.variants : [];
            const variantIds = variants.map((v: any) => v.id || v);
            const assignedVariant = hashUserToVariant(userId, testId, variantIds);

            await supabase.from("ab_test_assignments").upsert({
              test_id: testId,
              user_id: userId,
              variant: assignedVariant,
            }, { onConflict: "test_id,user_id" });

            results[testId] = { variant: assignedVariant, config: {} };
          } else {
            results[testId] = { variant: "control", config: {} };
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, variants: results }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (action === "track_event") {
      const { test_id, event_type, variant, metadata = {} } = body;

      await supabase.from("ab_test_events").insert({
        test_id,
        user_id: userId,
        variant: variant || "unknown",
        event_type,
        metadata,
        created_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_results") {
      const { test_id } = body;

      const { data: testConfig } = await supabase
        .from("ab_test_configs")
        .select("*")
        .eq("id", test_id)
        .single();

      if (!testConfig) {
        return new Response(
          JSON.stringify({ error: "Test not found" }),
          { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      const variants = Array.isArray(testConfig.variants) ? testConfig.variants : [];

      const { data: assignments } = await supabase
        .from("ab_test_assignments")
        .select("variant")
        .eq("test_id", test_id);

      const { data: events } = await supabase
        .from("ab_test_events")
        .select("variant, event_type")
        .eq("test_id", test_id);

      const variantResults = variants.map((v: any) => {
        const vid = v.id || v;
        const vname = v.name || vid;
        const assignmentCount = assignments?.filter((a) => a.variant === vid).length || 0;
        const impressions = events?.filter((e) => e.variant === vid && e.event_type === "impression").length || 0;
        const clicks = events?.filter((e) => e.variant === vid && e.event_type === "click").length || 0;
        const conversions = events?.filter((e) => e.variant === vid && e.event_type === "conversion").length || 0;

        return {
          variant_id: vid,
          variant_name: vname,
          users: assignmentCount,
          impressions,
          clicks,
          conversions,
          click_rate: impressions > 0 ? (clicks / impressions * 100).toFixed(1) : "0",
          conversion_rate: clicks > 0 ? (conversions / clicks * 100).toFixed(1) : "0",
        };
      });

      const totalUsers = assignments?.length || 0;
      const isSignificant = totalUsers >= 100;

      return new Response(
        JSON.stringify({
          success: true,
          test: { id: testConfig.id, name: testConfig.name, status: testConfig.status },
          results: variantResults,
          summary: {
            total_users: totalUsers,
            is_significant: isSignificant,
            recommendation: isSignificant
              ? `Genug Daten fuer Entscheidung (${totalUsers} User)`
              : `Noch nicht genug Daten (${totalUsers}/100 User)`,
          },
        }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (action === "list_tests") {
      const { data: tests } = await supabase
        .from("ab_test_configs")
        .select("*")
        .order("created_at", { ascending: false });

      return new Response(
        JSON.stringify({ success: true, tests: tests || [] }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("A/B test engine error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
