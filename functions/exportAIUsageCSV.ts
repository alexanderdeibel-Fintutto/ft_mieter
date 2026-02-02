import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const url = new URL(req.url);
    const dateFrom = url.searchParams.get('from');
    const dateTo = url.searchParams.get('to');

    let filter = { success: true };
    if (dateFrom) {
      filter.created_date = { $gte: dateFrom };
    }
    if (dateTo) {
      if (filter.created_date) {
        filter.created_date.$lte = dateTo;
      } else {
        filter.created_date = { $lte: dateTo };
      }
    }

    const logs = await base44.asServiceRole.entities.AIUsageLog.filter(filter);

    // CSV Header
    const headers = [
      'Datum',
      'User',
      'Feature',
      'Modell',
      'Input Tokens',
      'Output Tokens',
      'Cache Creation',
      'Cache Read',
      'Kosten (EUR)',
      'Kosten ohne Cache (EUR)',
      'Response Zeit (ms)',
      'Erfolg',
      'Kontext'
    ];

    // CSV Rows
    const rows = logs.map(log => [
      new Date(log.created_date).toISOString(),
      log.user_email || '',
      log.feature || '',
      log.model || '',
      log.input_tokens || 0,
      log.output_tokens || 0,
      log.cache_creation_tokens || 0,
      log.cache_read_tokens || 0,
      (log.cost_eur || 0).toFixed(4),
      (log.cost_without_cache_eur || 0).toFixed(4),
      log.response_time_ms || 0,
      log.success ? 'Ja' : 'Nein',
      log.context_type || ''
    ]);

    // Build CSV
    const csvLines = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ];
    const csv = csvLines.join('\n');

    // Return CSV file
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="ai-usage-${Date.now()}.csv"`
      }
    });

  } catch (error) {
    console.error('CSV export error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});