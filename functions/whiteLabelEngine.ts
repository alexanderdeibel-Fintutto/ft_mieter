import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from "npm:@supabase/supabase-js";

/**
 * White-Label B2B Engine
 * Enables property management companies (Hausverwaltungen) to use Fintutto
 * as a white-label solution with their own branding.
 *
 * Revenue model: Per-unit per-month pricing
 * - Small (1-50 units): 2.00€/unit/month
 * - Medium (51-200 units): 1.50€/unit/month
 * - Large (201-500 units): 1.00€/unit/month
 * - Enterprise (500+ units): Custom pricing
 *
 * Features:
 * - Custom branding (logo, colors, domain)
 * - Tenant portal with company branding
 * - Bulk operations (meters, letters, notifications)
 * - API access for integration with existing systems
 * - Dedicated support & onboarding
 * - DATEV/accounting export
 * - Custom feature configuration
 */

const WHITE_LABEL_TIERS = {
  small: {
    id: 'small',
    name: 'Hausverwaltung Starter',
    min_units: 1,
    max_units: 50,
    price_per_unit: 2.00,
    min_monthly: 29.99,
    features: [
      'White-Label Mieterportal',
      'Custom Logo & Farben',
      'Mieter-App mit eigenem Branding',
      'Basis Reporting',
      'E-Mail Support',
    ],
    apps_included: ['mieterapp', 'portal'],
  },
  medium: {
    id: 'medium',
    name: 'Hausverwaltung Professional',
    min_units: 51,
    max_units: 200,
    price_per_unit: 1.50,
    min_monthly: 99.99,
    features: [
      'Alles aus Starter',
      'Vermietify mit Branding',
      'HausmeisterPro Integration',
      'LetterXpress Anbindung',
      'DATEV Export',
      'Priority Support',
      'Custom Subdomain',
    ],
    apps_included: ['mieterapp', 'vermietify', 'hausmeisterpro', 'portal'],
  },
  large: {
    id: 'large',
    name: 'Hausverwaltung Enterprise',
    min_units: 201,
    max_units: 500,
    price_per_unit: 1.00,
    min_monthly: 249.99,
    features: [
      'Alles aus Professional',
      'Alle Fintutto Apps',
      'Custom Domain',
      'API-Zugang',
      'Bulk-Operationen',
      'ELSTER Integration',
      'Dedizierter Account Manager',
      'SLA Garantie',
      'Onboarding Support',
    ],
    apps_included: ['mieterapp', 'vermietify', 'hausmeisterpro', 'ablesung', 'portal'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Hausverwaltung Custom',
    min_units: 501,
    max_units: 999999,
    price_per_unit: null, // Custom
    min_monthly: null,
    features: [
      'Alles aus Enterprise',
      'Custom Feature-Entwicklung',
      'On-Premise Option',
      'SSO/LDAP Integration',
      'Mandantenfähigkeit',
      'Custom SLA',
      'Schulungen vor Ort',
    ],
    apps_included: ['mieterapp', 'vermietify', 'hausmeisterpro', 'ablesung', 'portal'],
  },
};

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
    const { action = 'get_pricing' } = body;

    // Get white-label pricing
    if (action === 'get_pricing') {
      const { unit_count = 0 } = body;

      const tiers = Object.values(WHITE_LABEL_TIERS).map(tier => {
        let monthlyPrice = null;
        if (tier.price_per_unit !== null) {
          const unitsInTier = Math.min(Math.max(unit_count, tier.min_units), tier.max_units);
          monthlyPrice = Math.max(unitsInTier * tier.price_per_unit, tier.min_monthly || 0);
        }

        return {
          ...tier,
          calculated_monthly: monthlyPrice,
          calculated_yearly: monthlyPrice ? monthlyPrice * 10 : null, // 2 months free on yearly
          per_unit_yearly: monthlyPrice && unit_count > 0 ? (monthlyPrice * 10 / unit_count / 12).toFixed(2) : null,
        };
      });

      // Recommend best tier
      let recommended = tiers.find(t =>
        unit_count >= t.min_units && unit_count <= t.max_units
      ) || tiers[0];

      return Response.json({
        success: true,
        tiers,
        recommended: recommended.id,
        unit_count,
      });
    }

    // Create white-label tenant
    if (action === 'create_tenant') {
      const {
        company_name,
        company_email,
        company_phone,
        unit_count,
        tier_id,
        branding = {},
      } = body;

      const tier = WHITE_LABEL_TIERS[tier_id as keyof typeof WHITE_LABEL_TIERS];
      if (!tier) {
        return Response.json({ error: 'Invalid tier' }, { status: 400 });
      }

      // Create white-label organization
      const { data: org, error: orgError } = await supabase
        .from('white_label_tenants')
        .insert({
          owner_user_id: user.id,
          company_name,
          company_email,
          company_phone,
          unit_count,
          tier_id,
          branding: {
            logo_url: branding.logo_url || null,
            primary_color: branding.primary_color || '#3B82F6',
            secondary_color: branding.secondary_color || '#1E40AF',
            company_name_display: branding.company_name_display || company_name,
            custom_domain: branding.custom_domain || null,
            favicon_url: branding.favicon_url || null,
          },
          status: 'pending_setup',
          monthly_price: tier.price_per_unit ? Math.max(unit_count * tier.price_per_unit, tier.min_monthly || 0) : null,
          apps_enabled: tier.apps_included,
          features_enabled: tier.features,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orgError) {
        throw orgError;
      }

      return Response.json({
        success: true,
        tenant: org,
        next_steps: [
          'Branding konfigurieren (Logo, Farben)',
          'Objekte und Einheiten importieren',
          'Mieter einladen',
          'Zahlungsmethode hinterlegen',
        ],
      });
    }

    // Update branding
    if (action === 'update_branding') {
      const { tenant_id, branding } = body;

      const { error: updateError } = await supabase
        .from('white_label_tenants')
        .update({
          branding: branding,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tenant_id)
        .eq('owner_user_id', user.id);

      if (updateError) throw updateError;

      return Response.json({ success: true });
    }

    // Get white-label dashboard stats
    if (action === 'get_dashboard') {
      const { tenant_id } = body;

      const { data: tenant } = await supabase
        .from('white_label_tenants')
        .select('*')
        .eq('id', tenant_id)
        .eq('owner_user_id', user.id)
        .single();

      if (!tenant) {
        return Response.json({ error: 'Tenant not found' }, { status: 404 });
      }

      // Get usage stats
      const { count: activeUnits } = await supabase
        .from('white_label_units')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant_id)
        .eq('status', 'active');

      const { count: activeTenants } = await supabase
        .from('white_label_unit_tenants')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant_id)
        .eq('status', 'active');

      return Response.json({
        success: true,
        dashboard: {
          tenant,
          stats: {
            active_units: activeUnits || 0,
            active_tenants: activeTenants || 0,
            monthly_cost: tenant.monthly_price || 0,
            apps_enabled: tenant.apps_enabled?.length || 0,
          },
        },
      });
    }

    // Revenue report for white-label (admin)
    if (action === 'get_wl_revenue') {
      const { data: tenants } = await supabase
        .from('white_label_tenants')
        .select('id, company_name, unit_count, tier_id, monthly_price, status, created_at')
        .order('created_at', { ascending: false });

      const activeTenants = tenants?.filter(t => t.status === 'active') || [];
      const totalMRR = activeTenants.reduce((sum, t) => sum + (t.monthly_price || 0), 0);
      const totalUnits = activeTenants.reduce((sum, t) => sum + (t.unit_count || 0), 0);

      return Response.json({
        success: true,
        revenue: {
          total_tenants: tenants?.length || 0,
          active_tenants: activeTenants.length,
          total_units: totalUnits,
          monthly_recurring_revenue: totalMRR,
          annual_recurring_revenue: totalMRR * 12,
          avg_revenue_per_tenant: activeTenants.length > 0 ? totalMRR / activeTenants.length : 0,
          tenants: tenants || [],
        },
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('White-label engine error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
