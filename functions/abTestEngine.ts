import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from "npm:@supabase/supabase-js";

/**
 * A/B Test Engine for Affiliate & Revenue Optimization
 *
 * Manages test configuration, user assignment, and result tracking.
 * Uses deterministic hashing for consistent variant assignment.
 *
 * Active Tests:
 * - affiliate_widget_placement: Dashboard bottom vs Sidebar vs Post-action
 * - verivox_banner_style: Compact vs Banner vs Card
 * - sovendus_trigger_timing: Immediate vs 3s delay vs 10s delay
 * - bundle_pricing_highlight: Vermieter Komplett vs Fintutto Komplett
 */

// Simple deterministic hash for consistent assignment
function hashUserToVariant(userId: string, testId: string, variants: string[]): string {
  let hash = 0;
  const str = `${userId}:${testId}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % variants.length;
  return variants[index];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_KEY")!
    );

    const body = await req.json();
    const { action = 'get_variant' } = body;

    // Get the variant for a specific test
    if (action === 'get_variant') {
      const { test_id } = body;

      if (!test_id) {
        return Response.json({ error: 'test_id required' }, { status: 400 });
      }

      // Check if user already has an assignment
      const { data: existing } = await supabase
        .from('ab_test_assignments')
        .select('variant')
        .eq('test_id', test_id)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Get the test config for variant details
        const { data: testConfig } = await supabase
          .from('ab_test_configs')
          .select('variants')
          .eq('id', test_id)
          .single();

        const variants = JSON.parse(testConfig?.variants || '[]');
        const variantConfig = variants.find((v: any) => v.id === existing.variant);

        return Response.json({
          success: true,
          test_id,
          variant: existing.variant,
          config: variantConfig?.config || {},
          is_new: false,
        });
      }

      // Load test configuration
      const { data: testConfig, error: testError } = await supabase
        .from('ab_test_configs')
        .select('*')
        .eq('id', test_id)
        .eq('status', 'active')
        .single();

      if (testError || !testConfig) {
        return Response.json({
          success: true,
          test_id,
          variant: 'control',
          config: {},
          is_new: false,
          note: 'Test not found or inactive',
        });
      }

      const variants = JSON.parse(testConfig.variants || '[]');
      const variantIds = variants.map((v: any) => v.id);

      // Assign variant using deterministic hash
      const assignedVariant = hashUserToVariant(user.id, test_id, variantIds);

      // Store assignment
      await supabase.from('ab_test_assignments').upsert({
        test_id,
        user_id: user.id,
        variant: assignedVariant,
        assigned_at: new Date().toISOString(),
      }, { onConflict: 'test_id,user_id' });

      const variantConfig = variants.find((v: any) => v.id === assignedVariant);

      return Response.json({
        success: true,
        test_id,
        variant: assignedVariant,
        config: variantConfig?.config || {},
        is_new: true,
      });
    }

    // Get variants for multiple tests at once
    if (action === 'get_all_variants') {
      const { test_ids = [] } = body;

      const results: Record<string, any> = {};

      for (const testId of test_ids) {
        // Check existing assignment
        const { data: existing } = await supabase
          .from('ab_test_assignments')
          .select('variant')
          .eq('test_id', testId)
          .eq('user_id', user.id)
          .single();

        if (existing) {
          const { data: testConfig } = await supabase
            .from('ab_test_configs')
            .select('variants')
            .eq('id', testId)
            .single();

          const variants = JSON.parse(testConfig?.variants || '[]');
          const variantConfig = variants.find((v: any) => v.id === existing.variant);

          results[testId] = {
            variant: existing.variant,
            config: variantConfig?.config || {},
          };
        } else {
          // Assign new variant
          const { data: testConfig } = await supabase
            .from('ab_test_configs')
            .select('*')
            .eq('id', testId)
            .eq('status', 'active')
            .single();

          if (testConfig) {
            const variants = JSON.parse(testConfig.variants || '[]');
            const variantIds = variants.map((v: any) => v.id);
            const assignedVariant = hashUserToVariant(user.id, testId, variantIds);

            await supabase.from('ab_test_assignments').upsert({
              test_id: testId,
              user_id: user.id,
              variant: assignedVariant,
            }, { onConflict: 'test_id,user_id' });

            const variantConfig = variants.find((v: any) => v.id === assignedVariant);
            results[testId] = {
              variant: assignedVariant,
              config: variantConfig?.config || {},
            };
          } else {
            results[testId] = { variant: 'control', config: {} };
          }
        }
      }

      return Response.json({ success: true, variants: results });
    }

    // Track an event for a test
    if (action === 'track_event') {
      const { test_id, event_type, variant, metadata = {} } = body;

      await supabase.from('ab_test_events').insert({
        test_id,
        user_id: user.id,
        variant: variant || 'unknown',
        event_type, // 'impression', 'click', 'conversion', 'dismiss'
        metadata,
        created_at: new Date().toISOString(),
      });

      return Response.json({ success: true });
    }

    // Get test results (admin)
    if (action === 'get_results') {
      const { test_id } = body;

      const { data: testConfig } = await supabase
        .from('ab_test_configs')
        .select('*')
        .eq('id', test_id)
        .single();

      if (!testConfig) {
        return Response.json({ error: 'Test not found' }, { status: 404 });
      }

      const variants = JSON.parse(testConfig.variants || '[]');

      // Get assignment counts
      const { data: assignments } = await supabase
        .from('ab_test_assignments')
        .select('variant')
        .eq('test_id', test_id);

      // Get events
      const { data: events } = await supabase
        .from('ab_test_events')
        .select('variant, event_type')
        .eq('test_id', test_id);

      // Calculate results per variant
      const variantResults = variants.map((v: any) => {
        const assignmentCount = assignments?.filter(a => a.variant === v.id).length || 0;
        const impressions = events?.filter(e => e.variant === v.id && e.event_type === 'impression').length || 0;
        const clicks = events?.filter(e => e.variant === v.id && e.event_type === 'click').length || 0;
        const conversions = events?.filter(e => e.variant === v.id && e.event_type === 'conversion').length || 0;

        return {
          variant_id: v.id,
          variant_name: v.name,
          users: assignmentCount,
          impressions,
          clicks,
          conversions,
          click_rate: impressions > 0 ? (clicks / impressions * 100).toFixed(1) : '0',
          conversion_rate: clicks > 0 ? (conversions / clicks * 100).toFixed(1) : '0',
        };
      });

      // Determine winner
      const metricKey = testConfig.target_metric.includes('click') ? 'click_rate' : 'conversion_rate';
      const sorted = [...variantResults].sort((a, b) => parseFloat(b[metricKey]) - parseFloat(a[metricKey]));
      const winner = sorted[0]?.variant_id || null;
      const totalUsers = assignments?.length || 0;
      const isSignificant = totalUsers >= 100; // Simplified significance check

      return Response.json({
        success: true,
        test: {
          id: testConfig.id,
          name: testConfig.name,
          status: testConfig.status,
          target_metric: testConfig.target_metric,
        },
        results: variantResults,
        summary: {
          total_users: totalUsers,
          winner: isSignificant ? winner : null,
          is_significant: isSignificant,
          recommendation: isSignificant
            ? `Variante "${sorted[0]?.variant_name}" gewinnt mit ${sorted[0]?.[metricKey]}% ${metricKey.replace('_', ' ')}`
            : `Noch nicht genug Daten (${totalUsers}/100 User). Weiterlaufen lassen.`,
        },
      });
    }

    // List all active tests (admin)
    if (action === 'list_tests') {
      const { data: tests } = await supabase
        .from('ab_test_configs')
        .select('*')
        .order('created_at', { ascending: false });

      return Response.json({ success: true, tests: tests || [] });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('A/B test engine error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
