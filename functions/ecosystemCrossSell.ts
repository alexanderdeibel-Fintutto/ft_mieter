import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from "npm:@supabase/supabase-js";

/**
 * Ecosystem Cross-Sell Engine
 * Provides intelligent cross-sell recommendations across all Fintutto apps:
 * MieterApp, Vermietify, HausmeisterPro, Ablesung, Portal
 */

const ECOSYSTEM_APPS = {
  mieterapp: { name: 'MieterApp', url: 'https://app.mieterapp.de', icon: '🏠' },
  vermietify: { name: 'Vermietify', url: 'https://app.vermietify.de', icon: '🏢' },
  hausmeisterpro: { name: 'HausmeisterPro', url: 'https://app.hausmeisterpro.de', icon: '🔧' },
  ablesung: { name: 'Ablesung', url: 'https://app.ablesung.fintutto.de', icon: '📊' },
  portal: { name: 'Fintutto Portal', url: 'https://portal.fintutto.de', icon: '🌐' },
};

const CROSS_SELL_RULES = [
  // MieterApp → Vermietify (Mieter wird Vermieter)
  {
    source: 'mieterapp',
    target: 'vermietify',
    triggers: ['user_is_landlord', 'first_payment', 'limit_reached'],
    priority: 'high',
    getMessage: (user: any) => ({
      headline: 'Du vermietest auch?',
      body: `${user.full_name?.split(' ')[0] || 'Hey'}, mit Vermietify verwaltest du deine Immobilien professionell – Mieter, Verträge, Nebenkosten, alles in einer App.`,
      cta_text: 'Vermietify kostenlos testen',
      benefit: 'Spare bis zu 10h/Monat bei der Verwaltung',
    }),
  },
  // MieterApp → Ablesung (Zählerstand erfassen)
  {
    source: 'mieterapp',
    target: 'ablesung',
    triggers: ['meter_reading', 'zaehler_view', 'verbrauch_view'],
    priority: 'high',
    getMessage: (user: any) => ({
      headline: 'Zähler per Foto ablesen',
      body: 'Mit der Ablesung-App fotografierst du deinen Zähler und der Stand wird automatisch erkannt (OCR).',
      cta_text: 'Ablesung ausprobieren',
      benefit: 'Nie wieder Zählerstand abtippen',
    }),
  },
  // Vermietify → HausmeisterPro
  {
    source: 'vermietify',
    target: 'hausmeisterpro',
    triggers: ['repair_created', 'maintenance_needed', 'task_created'],
    priority: 'high',
    getMessage: (user: any) => ({
      headline: 'Hausmeister effizient steuern',
      body: 'Reparaturaufträge direkt an HausmeisterPro übergeben – mit Zeiterfassung, Materialverwaltung und Statusupdates.',
      cta_text: 'HausmeisterPro entdecken',
      benefit: 'Reparaturen 50% schneller abwickeln',
    }),
  },
  // Vermietify → Ablesung
  {
    source: 'vermietify',
    target: 'ablesung',
    triggers: ['nk_abrechnung_started', 'readings_missing', 'meter_due'],
    priority: 'high',
    getMessage: (user: any) => ({
      headline: 'Zählerstände digital erfassen',
      body: 'Alle Zähler per App erfassen und direkt in die Nebenkostenabrechnung übernehmen.',
      cta_text: 'Ablesung starten',
      benefit: 'NK-Abrechnung in Minuten statt Stunden',
    }),
  },
  // HausmeisterPro → Ablesung
  {
    source: 'hausmeisterpro',
    target: 'ablesung',
    triggers: ['inspection_started', 'roundgang_completed'],
    priority: 'medium',
    getMessage: (user: any) => ({
      headline: 'Zähler beim Rundgang gleich ablesen',
      body: 'Erfasse Zählerstände direkt beim Rundgang per OCR-Foto.',
      cta_text: 'Ablesung aktivieren',
      benefit: 'Zwei Aufgaben in einem Rundgang',
    }),
  },
  // Ablesung → Vermietify
  {
    source: 'ablesung',
    target: 'vermietify',
    triggers: ['readings_exported', 'readings_completed'],
    priority: 'high',
    getMessage: (user: any) => ({
      headline: 'Direkt in die NK-Abrechnung',
      body: 'Zählerstände automatisch in Vermietify übernehmen und die Nebenkostenabrechnung erstellen.',
      cta_text: 'Vermietify testen',
      benefit: 'Automatische Übernahme der Zählerstände',
    }),
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
    const {
      action = 'get_recommendation',
      source_app,
      event_type,
      event_data = {},
      dismissed_apps = [],
    } = body;

    if (action === 'get_recommendation') {
      // Find matching cross-sell rules
      const matchingRules = CROSS_SELL_RULES
        .filter(rule => rule.source === source_app)
        .filter(rule => rule.triggers.includes(event_type))
        .filter(rule => !dismissed_apps.includes(rule.target))
        .sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
        });

      if (matchingRules.length === 0) {
        return Response.json({ show_recommendation: false, reason: 'no_matching_rules' });
      }

      // Check if user already uses the target app
      const { data: userApps } = await supabase
        .from('user_profiles')
        .select('active_apps')
        .eq('id', user.id)
        .single();

      const activeApps = userApps?.active_apps || [];
      const filteredRules = matchingRules.filter(rule => !activeApps.includes(rule.target));

      if (filteredRules.length === 0) {
        return Response.json({ show_recommendation: false, reason: 'user_already_active' });
      }

      const bestRule = filteredRules[0];
      const targetApp = ECOSYSTEM_APPS[bestRule.target];
      const messaging = bestRule.getMessage(user);

      // Log the cross-sell impression
      await supabase.from('ecosystem_cross_sell_log').insert({
        user_id: user.id,
        source_app: source_app,
        target_app: bestRule.target,
        event_type: event_type,
        action: 'impression',
        created_at: new Date().toISOString(),
      }).catch(() => {}); // Don't fail on logging

      return Response.json({
        show_recommendation: true,
        recommendation_id: `${source_app}_to_${bestRule.target}_${event_type}`,
        target_app: bestRule.target,
        recommendation: {
          type: 'ecosystem_cross_sell',
          target: { app: bestRule.target },
          priority: bestRule.priority,
        },
        messaging: {
          ...messaging,
          cta_url: targetApp.url,
          dismiss_text: 'Nicht interessiert',
          icon: targetApp.icon,
        },
        personalization: {
          user_name: user.full_name?.split(' ')[0] || 'Nutzer',
          specific_benefit: messaging.benefit,
        },
        timing: {
          show_immediately: bestRule.priority === 'high',
          delay_seconds: bestRule.priority === 'high' ? 0 : 5,
        },
        placement: {
          location: bestRule.priority === 'high' ? 'modal' : 'toast',
        },
      });
    }

    if (action === 'track_click') {
      const { target_app, recommendation_id } = body;

      await supabase.from('ecosystem_cross_sell_log').insert({
        user_id: user.id,
        source_app: source_app,
        target_app: target_app,
        event_type: event_type,
        action: 'click',
        recommendation_id: recommendation_id,
        created_at: new Date().toISOString(),
      });

      return Response.json({ success: true });
    }

    if (action === 'get_ecosystem_stats') {
      // Get cross-sell performance metrics
      const { data: stats } = await supabase
        .from('ecosystem_cross_sell_log')
        .select('source_app, target_app, action')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const impressions = stats?.filter(s => s.action === 'impression').length || 0;
      const clicks = stats?.filter(s => s.action === 'click').length || 0;

      return Response.json({
        success: true,
        stats: {
          period: '30d',
          impressions,
          clicks,
          ctr: impressions > 0 ? (clicks / impressions * 100).toFixed(1) : 0,
          by_target: Object.keys(ECOSYSTEM_APPS).reduce((acc, appId) => {
            const appImpressions = stats?.filter(s => s.target_app === appId && s.action === 'impression').length || 0;
            const appClicks = stats?.filter(s => s.target_app === appId && s.action === 'click').length || 0;
            acc[appId] = { impressions: appImpressions, clicks: appClicks };
            return acc;
          }, {} as Record<string, any>),
        },
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Ecosystem cross-sell error:', error);
    return Response.json({ error: error.message, show_recommendation: false }, { status: 500 });
  }
});
