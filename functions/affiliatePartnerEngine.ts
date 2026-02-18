import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from "npm:@supabase/supabase-js";

/**
 * Affiliate Partner Engine
 * Manages direct affiliate partnerships, offers, tracking, and revenue.
 * Supports both network partners (Sovendus, Awin) and direct partnerships.
 *
 * Revenue models: CPC, CPL, CPA, CPS (revenue share)
 */

// Curated partner categories relevant to German tenants, landlords, and property managers
const PARTNER_CATEGORIES = {
  umzug: { name: 'Umzug & Transport', icon: '📦', relevance: ['mieter'] },
  energie: { name: 'Strom & Gas', icon: '⚡', relevance: ['mieter', 'vermieter'] },
  versicherung: { name: 'Versicherungen', icon: '🛡️', relevance: ['mieter', 'vermieter'] },
  internet: { name: 'Internet & TV', icon: '📡', relevance: ['mieter'] },
  handwerker: { name: 'Handwerker', icon: '🔨', relevance: ['vermieter', 'hausmeister'] },
  moebel: { name: 'Möbel & Einrichtung', icon: '🛋️', relevance: ['mieter'] },
  reinigung: { name: 'Reinigung', icon: '🧹', relevance: ['vermieter', 'hausmeister'] },
  finanzen: { name: 'Finanzen & Kredit', icon: '💰', relevance: ['mieter', 'vermieter'] },
  sicherheit: { name: 'Sicherheit & Schlüssel', icon: '🔒', relevance: ['mieter', 'vermieter', 'hausmeister'] },
  garten: { name: 'Garten & Außenbereich', icon: '🌿', relevance: ['vermieter', 'hausmeister'] },
};

// Seed partner data (for initial setup)
const SEED_PARTNERS = [
  {
    id: 'verivox',
    name: 'Verivox',
    category: 'energie',
    logo_url: 'https://www.verivox.de/favicon.ico',
    description: 'Strom- und Gasvergleich – bis zu 500€/Jahr sparen',
    offer_headline: 'Bis zu 500€ sparen',
    offer_description: 'Vergleiche jetzt Strom- und Gastarife und spare bis zu 500€ im Jahr.',
    affiliate_url: 'https://www.verivox.de',
    revenue_model: 'cpa',
    commission: 30.00,
    commission_currency: 'EUR',
    is_active: true,
    priority: 10,
    target_audience: ['mieter', 'vermieter'],
    trigger_contexts: ['energy_view', 'verbrauch_view', 'first_login', 'nk_abrechnung'],
  },
  {
    id: 'check24_strom',
    name: 'CHECK24 Strom',
    category: 'energie',
    logo_url: 'https://www.check24.de/favicon.ico',
    description: 'Stromvergleich in 2 Minuten',
    offer_headline: 'Strom wechseln & sparen',
    offer_description: 'Über 1.000 Stromanbieter vergleichen und bis zu 800€ sparen.',
    affiliate_url: 'https://www.check24.de/strom/',
    revenue_model: 'cpa',
    commission: 25.00,
    commission_currency: 'EUR',
    is_active: true,
    priority: 9,
    target_audience: ['mieter'],
    trigger_contexts: ['energy_view', 'umzug', 'first_login'],
  },
  {
    id: 'huk24_hausrat',
    name: 'HUK24 Hausratversicherung',
    category: 'versicherung',
    logo_url: 'https://www.huk24.de/favicon.ico',
    description: 'Hausratversicherung ab 2,63€/Monat',
    offer_headline: 'Hausrat ab 2,63€/Monat',
    offer_description: 'Schütze dein Zuhause mit einer günstigen Hausratversicherung.',
    affiliate_url: 'https://www.huk24.de/hausratversicherung',
    revenue_model: 'cpl',
    commission: 15.00,
    commission_currency: 'EUR',
    is_active: true,
    priority: 8,
    target_audience: ['mieter'],
    trigger_contexts: ['first_login', 'mietvertrag_view', 'onboarding'],
  },
  {
    id: 'myhammer',
    name: 'MyHammer',
    category: 'handwerker',
    logo_url: 'https://www.myhammer.de/favicon.ico',
    description: 'Handwerker in deiner Nähe finden',
    offer_headline: 'Handwerker finden',
    offer_description: 'Finde geprüfte Handwerker für Reparaturen und Renovierungen.',
    affiliate_url: 'https://www.myhammer.de',
    revenue_model: 'cpl',
    commission: 5.00,
    commission_currency: 'EUR',
    is_active: true,
    priority: 7,
    target_audience: ['vermieter', 'hausmeister'],
    trigger_contexts: ['repair_created', 'maintenance_needed'],
  },
  {
    id: 'check24_internet',
    name: 'CHECK24 Internet',
    category: 'internet',
    logo_url: 'https://www.check24.de/favicon.ico',
    description: 'Internet- und DSL-Vergleich',
    offer_headline: 'Internet ab 9,99€/Monat',
    offer_description: 'Vergleiche Internet-Tarife und finde den besten Deal.',
    affiliate_url: 'https://www.check24.de/internet/',
    revenue_model: 'cpa',
    commission: 20.00,
    commission_currency: 'EUR',
    is_active: true,
    priority: 6,
    target_audience: ['mieter'],
    trigger_contexts: ['umzug', 'first_login', 'adresswechsel'],
  },
  {
    id: 'movinga',
    name: 'Movinga',
    category: 'umzug',
    logo_url: 'https://www.movinga.de/favicon.ico',
    description: 'Professioneller Umzugsservice',
    offer_headline: 'Umzug ab 299€',
    offer_description: 'Stressfrei umziehen mit professionellen Umzugshelfern.',
    affiliate_url: 'https://www.movinga.de',
    revenue_model: 'cpl',
    commission: 10.00,
    commission_currency: 'EUR',
    is_active: true,
    priority: 7,
    target_audience: ['mieter'],
    trigger_contexts: ['kuendigung', 'umzug', 'mietvertrag_ended'],
  },
  {
    id: 'home24',
    name: 'Home24',
    category: 'moebel',
    logo_url: 'https://www.home24.de/favicon.ico',
    description: 'Möbel & Einrichtung online',
    offer_headline: '15% Neukunden-Rabatt',
    offer_description: 'Richte dein neues Zuhause ein – mit 15% Rabatt für Neukunden.',
    affiliate_url: 'https://www.home24.de',
    revenue_model: 'cps',
    commission: 5.0, // 5% revenue share
    commission_currency: 'percent',
    is_active: true,
    priority: 5,
    target_audience: ['mieter'],
    trigger_contexts: ['umzug', 'first_login', 'einzug'],
  },
  {
    id: 'helpling',
    name: 'Helpling',
    category: 'reinigung',
    logo_url: 'https://www.helpling.de/favicon.ico',
    description: 'Reinigungskräfte für Wohnung & Haus',
    offer_headline: 'Putzhilfe ab 13€/Stunde',
    offer_description: 'Professionelle Reinigung für deine Wohnung oder Immobilie.',
    affiliate_url: 'https://www.helpling.de',
    revenue_model: 'cpa',
    commission: 8.00,
    commission_currency: 'EUR',
    is_active: true,
    priority: 5,
    target_audience: ['vermieter', 'hausmeister', 'mieter'],
    trigger_contexts: ['mieterwechsel', 'auszug', 'maintenance'],
  },
];

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
    const { action = 'get_offers' } = body;

    // Get personalized affiliate offers
    if (action === 'get_offers') {
      const {
        category,
        user_role = 'mieter',
        context,
        limit = 12,
        exclude_dismissed = true,
      } = body;

      // Try to load from database first
      let { data: partners, error: dbError } = await supabase
        .from('affiliate_partners')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(limit);

      // Fallback to seed data if no DB entries
      if (dbError || !partners || partners.length === 0) {
        partners = SEED_PARTNERS;
      }

      // Filter by category
      if (category) {
        partners = partners.filter((p: any) => p.category === category);
      }

      // Filter by user role/audience
      partners = partners.filter((p: any) =>
        !p.target_audience || p.target_audience.includes(user_role)
      );

      // Filter by context trigger
      if (context) {
        // Prioritize partners matching the context, but still show others
        partners.sort((a: any, b: any) => {
          const aMatch = a.trigger_contexts?.includes(context) ? 1 : 0;
          const bMatch = b.trigger_contexts?.includes(context) ? 1 : 0;
          return bMatch - aMatch;
        });
      }

      // Filter dismissed offers
      if (exclude_dismissed) {
        const { data: dismissed } = await supabase
          .from('affiliate_user_preferences')
          .select('partner_id')
          .eq('user_id', user.id)
          .eq('status', 'dismissed');

        const dismissedIds = new Set(dismissed?.map((d: any) => d.partner_id) || []);
        partners = partners.filter((p: any) => !dismissedIds.has(p.id));
      }

      return Response.json({
        success: true,
        offers: partners.slice(0, limit),
        categories: PARTNER_CATEGORIES,
        total: partners.length,
      });
    }

    // Track click on affiliate offer
    if (action === 'track_click') {
      const { partner_id, partner_name, category, source_page, context } = body;

      // Generate tracking URL with unique click ID
      const clickId = crypto.randomUUID();

      await supabase.from('affiliate_tracking').insert({
        user_id: user.id,
        provider: 'direct',
        event_type: 'click',
        partner_name: partner_name || partner_id,
        metadata: {
          partner_id,
          category,
          source_page,
          context,
          click_id: clickId,
        },
        created_at: new Date().toISOString(),
      });

      return Response.json({ success: true, click_id: clickId });
    }

    // Dismiss an offer (user doesn't want to see it)
    if (action === 'dismiss_offer') {
      const { partner_id, permanent = false } = body;

      await supabase.from('affiliate_user_preferences').upsert({
        user_id: user.id,
        partner_id: partner_id,
        status: permanent ? 'dismissed' : 'hidden_temporarily',
        updated_at: new Date().toISOString(),
      });

      return Response.json({ success: true });
    }

    // Get affiliate revenue analytics (admin)
    if (action === 'get_revenue_analytics') {
      const { period = '30d' } = body;
      const daysBack = parseInt(period) || 30;
      const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

      const { data: events } = await supabase
        .from('affiliate_tracking')
        .select('*')
        .gte('created_at', since);

      const byProvider: Record<string, any> = {};
      events?.forEach((e: any) => {
        const key = e.provider || 'unknown';
        if (!byProvider[key]) {
          byProvider[key] = { impressions: 0, clicks: 0, conversions: 0, revenue: 0 };
        }
        if (e.event_type === 'impression') byProvider[key].impressions++;
        if (e.event_type === 'click') byProvider[key].clicks++;
        if (e.event_type === 'conversion' || e.event_type === 'conversion_confirmed') {
          byProvider[key].conversions++;
          byProvider[key].revenue += e.order_value || 0;
        }
      });

      const totalClicks = events?.filter(e => e.event_type === 'click').length || 0;
      const totalConversions = events?.filter(e =>
        e.event_type === 'conversion' || e.event_type === 'conversion_confirmed'
      ).length || 0;
      const totalRevenue = events
        ?.filter(e => e.event_type === 'conversion' || e.event_type === 'conversion_confirmed')
        .reduce((sum, e) => sum + (e.order_value || 0), 0) || 0;

      return Response.json({
        success: true,
        analytics: {
          period: `${daysBack}d`,
          total_clicks: totalClicks,
          total_conversions: totalConversions,
          total_revenue: totalRevenue,
          conversion_rate: totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(1) : 0,
          by_provider: byProvider,
        },
      });
    }

    // Admin: Seed partner data
    if (action === 'seed_partners') {
      for (const partner of SEED_PARTNERS) {
        await supabase.from('affiliate_partners').upsert(partner, { onConflict: 'id' });
      }
      return Response.json({ success: true, seeded: SEED_PARTNERS.length });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Affiliate partner engine error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
