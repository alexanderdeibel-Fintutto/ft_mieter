import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from "npm:@supabase/supabase-js";

/**
 * Sovendus Tracking & Analytics
 * Tracks Sovendus voucher wall impressions, clicks, and conversions.
 * Provides analytics for affiliate revenue reporting.
 */

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
    const { action = 'track_event' } = body;

    if (action === 'track_event') {
      const { event_type, trigger, orderId, orderValue, partner_name, voucher_code } = body;

      await supabase.from('affiliate_tracking').insert({
        user_id: user.id,
        provider: 'sovendus',
        event_type: event_type, // impression, click, conversion, consent_given
        trigger_context: trigger,
        order_id: orderId || null,
        order_value: orderValue || null,
        partner_name: partner_name || null,
        voucher_code: voucher_code || null,
        metadata: {
          user_agent: req.headers.get('user-agent'),
          referrer: req.headers.get('referer'),
        },
        created_at: new Date().toISOString(),
      });

      return Response.json({ success: true });
    }

    if (action === 'get_analytics') {
      const { period = '30d' } = body;

      const daysBack = parseInt(period) || 30;
      const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

      const { data: events } = await supabase
        .from('affiliate_tracking')
        .select('event_type, provider, created_at, order_value, partner_name')
        .eq('provider', 'sovendus')
        .gte('created_at', since);

      const analytics = {
        period: `${daysBack}d`,
        impressions: events?.filter(e => e.event_type === 'impression').length || 0,
        clicks: events?.filter(e => e.event_type === 'click').length || 0,
        conversions: events?.filter(e => e.event_type === 'conversion').length || 0,
        consents: events?.filter(e => e.event_type === 'consent_given').length || 0,
        estimated_revenue: (events?.filter(e => e.event_type === 'click').length || 0) * 0.75, // avg CPC
        top_partners: getTopPartners(events || []),
      };

      analytics.ctr = analytics.impressions > 0
        ? (analytics.clicks / analytics.impressions * 100).toFixed(1)
        : '0';
      analytics.conversion_rate = analytics.clicks > 0
        ? (analytics.conversions / analytics.clicks * 100).toFixed(1)
        : '0';

      return Response.json({ success: true, analytics });
    }

    // Sovendus postback webhook for conversion tracking
    if (action === 'postback') {
      const { transaction_id, commission, partner_id, partner_name } = body;

      await supabase.from('affiliate_tracking').insert({
        provider: 'sovendus',
        event_type: 'conversion_confirmed',
        order_id: transaction_id,
        order_value: commission,
        partner_name: partner_name || partner_id,
        metadata: { partner_id, raw_postback: body },
        created_at: new Date().toISOString(),
      });

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Sovendus tracking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getTopPartners(events: any[]) {
  const partnerCounts: Record<string, number> = {};
  events.filter(e => e.event_type === 'click' && e.partner_name).forEach(e => {
    partnerCounts[e.partner_name] = (partnerCounts[e.partner_name] || 0) + 1;
  });
  return Object.entries(partnerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, clicks]) => ({ name, clicks }));
}
