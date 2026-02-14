import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from "npm:@supabase/supabase-js";

/**
 * Transaction Revenue Engine
 * Manages transaction-based revenue streams across the Fintutto ecosystem:
 *
 * 1. LetterXpress - Physical mail sending (markup on postage)
 * 2. SCHUFA Checks - Credit reports (per-check fee)
 * 3. OCR Processing - Document/meter reading OCR (per-scan credits)
 * 4. Digital Signatures - DocuSign/eSign (per-signature fee)
 * 5. AI Credits - Chat, analysis, recommendations (usage-based)
 * 6. SMS Notifications - Per-message fee
 *
 * Revenue model: Buy at wholesale, sell at retail with markup.
 */

// Transaction pricing configuration (in EUR)
const TRANSACTION_PRICING = {
  letterxpress: {
    name: 'LetterXpress Brief',
    description: 'Physischer Briefversand',
    cost_price: 0.85, // What we pay LetterXpress
    sell_prices: {
      free: null, // Not available
      basic: 1.99, // Included quota: 3/month, then 1.99
      pro: 1.49,   // Included quota: 10/month, then 1.49
      business: 0.99, // Included quota: unlimited at reduced rate
    },
    unit: 'Brief',
    included_quota: { free: 0, basic: 3, pro: 10, business: 999 },
  },
  schufa_check: {
    name: 'SCHUFA Bonitätsprüfung',
    description: 'Bonitätsauskunft für Mietinteressenten',
    cost_price: 4.95,
    sell_prices: {
      free: null,
      basic: 9.99,
      pro: 7.99,
      business: 5.99,
    },
    unit: 'Prüfung',
    included_quota: { free: 0, basic: 0, pro: 3, business: 10 },
  },
  ocr_scan: {
    name: 'OCR Dokumentenerkennung',
    description: 'Automatische Text-/Zählerstanderkennung',
    cost_price: 0.05,
    sell_prices: {
      free: 0.29,
      basic: 0.19,
      pro: 0.09,
      business: 0.05,
    },
    unit: 'Scan',
    included_quota: { free: 5, basic: 50, pro: 200, business: 999 },
  },
  digital_signature: {
    name: 'Digitale Signatur',
    description: 'Rechtsgültige elektronische Unterschrift',
    cost_price: 0.50,
    sell_prices: {
      free: null,
      basic: 2.99,
      pro: 1.99,
      business: 0.99,
    },
    unit: 'Signatur',
    included_quota: { free: 0, basic: 3, pro: 15, business: 999 },
  },
  ai_credit: {
    name: 'KI-Analyse',
    description: 'AI Chat, Dokumentenanalyse, Empfehlungen',
    cost_price: 0.02,
    sell_prices: {
      free: 0.10,
      basic: 0.05,
      pro: 0.00, // Included in Pro
      business: 0.00,
    },
    unit: 'Anfrage',
    included_quota: { free: 10, basic: 50, pro: 999, business: 999 },
  },
  sms_notification: {
    name: 'SMS Benachrichtigung',
    description: 'SMS an Mieter oder Vermieter',
    cost_price: 0.07,
    sell_prices: {
      free: null,
      basic: null,
      pro: 0.15,
      business: 0.10,
    },
    unit: 'SMS',
    included_quota: { free: 0, basic: 0, pro: 20, business: 100 },
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

    // Get transaction pricing for user's plan
    if (action === 'get_pricing') {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('selected_plan')
        .eq('id', user.id)
        .single();

      const plan = profile?.selected_plan || 'free';

      const pricing = Object.entries(TRANSACTION_PRICING).map(([id, config]) => ({
        id,
        name: config.name,
        description: config.description,
        unit: config.unit,
        price: config.sell_prices[plan as keyof typeof config.sell_prices] ?? null,
        included_quota: config.included_quota[plan as keyof typeof config.included_quota] || 0,
        available: config.sell_prices[plan as keyof typeof config.sell_prices] !== null,
      }));

      return Response.json({ success: true, pricing, plan });
    }

    // Check if user can perform a transaction (quota check)
    if (action === 'check_quota') {
      const { transaction_type } = body;

      const config = TRANSACTION_PRICING[transaction_type as keyof typeof TRANSACTION_PRICING];
      if (!config) {
        return Response.json({ error: 'Invalid transaction type' }, { status: 400 });
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('selected_plan')
        .eq('id', user.id)
        .single();

      const plan = profile?.selected_plan || 'free';
      const sellPrice = config.sell_prices[plan as keyof typeof config.sell_prices];

      if (sellPrice === null) {
        return Response.json({
          success: false,
          allowed: false,
          reason: 'not_available_in_plan',
          upgrade_required: true,
          message: `${config.name} ist in deinem Plan nicht verfügbar. Upgrade für Zugang.`,
        });
      }

      // Check usage this month
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('transaction_usage')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('transaction_type', transaction_type)
        .gte('created_at', monthStart.toISOString());

      const usage = count || 0;
      const quota = config.included_quota[plan as keyof typeof config.included_quota] || 0;
      const withinQuota = usage < quota;
      const chargeAmount = withinQuota ? 0 : sellPrice;

      return Response.json({
        success: true,
        allowed: true,
        usage_this_month: usage,
        quota: quota,
        within_quota: withinQuota,
        charge_amount: chargeAmount,
        unit: config.unit,
        message: withinQuota
          ? `Im Kontingent (${usage}/${quota} ${config.unit} genutzt)`
          : `Zusatzkosten: ${chargeAmount.toFixed(2)}€ pro ${config.unit}`,
      });
    }

    // Record a transaction
    if (action === 'record_transaction') {
      const { transaction_type, metadata = {} } = body;

      const config = TRANSACTION_PRICING[transaction_type as keyof typeof TRANSACTION_PRICING];
      if (!config) {
        return Response.json({ error: 'Invalid transaction type' }, { status: 400 });
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('selected_plan')
        .eq('id', user.id)
        .single();

      const plan = profile?.selected_plan || 'free';
      const sellPrice = config.sell_prices[plan as keyof typeof config.sell_prices];

      if (sellPrice === null) {
        return Response.json({ error: 'Not available in plan' }, { status: 403 });
      }

      // Check quota
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('transaction_usage')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('transaction_type', transaction_type)
        .gte('created_at', monthStart.toISOString());

      const usage = count || 0;
      const quota = config.included_quota[plan as keyof typeof config.included_quota] || 0;
      const withinQuota = usage < quota;
      const chargeAmount = withinQuota ? 0 : sellPrice;
      const margin = chargeAmount > 0 ? chargeAmount - config.cost_price : 0;

      // Record usage
      await supabase.from('transaction_usage').insert({
        user_id: user.id,
        transaction_type: transaction_type,
        plan: plan,
        cost_price: config.cost_price,
        sell_price: chargeAmount,
        margin: margin,
        within_quota: withinQuota,
        metadata: metadata,
        created_at: new Date().toISOString(),
      });

      return Response.json({
        success: true,
        charged: chargeAmount,
        margin: margin,
        remaining_quota: Math.max(0, quota - usage - 1),
      });
    }

    // Revenue analytics (admin)
    if (action === 'get_revenue_report') {
      const { period = '30d' } = body;
      const daysBack = parseInt(period) || 30;
      const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

      const { data: transactions } = await supabase
        .from('transaction_usage')
        .select('transaction_type, sell_price, cost_price, margin, within_quota')
        .gte('created_at', since);

      const report: Record<string, any> = {};
      let totalRevenue = 0;
      let totalCost = 0;
      let totalMargin = 0;
      let totalTransactions = 0;

      transactions?.forEach((t: any) => {
        const type = t.transaction_type;
        if (!report[type]) {
          report[type] = {
            name: TRANSACTION_PRICING[type as keyof typeof TRANSACTION_PRICING]?.name || type,
            count: 0,
            revenue: 0,
            cost: 0,
            margin: 0,
            paid_count: 0,
            free_count: 0,
          };
        }
        report[type].count++;
        report[type].revenue += t.sell_price || 0;
        report[type].cost += t.cost_price || 0;
        report[type].margin += t.margin || 0;
        if (t.within_quota) report[type].free_count++;
        else report[type].paid_count++;

        totalRevenue += t.sell_price || 0;
        totalCost += t.cost_price || 0;
        totalMargin += t.margin || 0;
        totalTransactions++;
      });

      return Response.json({
        success: true,
        report: {
          period: `${daysBack}d`,
          total_transactions: totalTransactions,
          total_revenue: Math.round(totalRevenue * 100) / 100,
          total_cost: Math.round(totalCost * 100) / 100,
          total_margin: Math.round(totalMargin * 100) / 100,
          margin_percent: totalRevenue > 0 ? Math.round(totalMargin / totalRevenue * 100) : 0,
          by_type: report,
        },
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Transaction revenue error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
