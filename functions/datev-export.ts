import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role === 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const payload = await req.json();
    const { year, month, format = 'csv' } = payload;

    // Fetch all transactions for the period
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const transactions = await base44.asServiceRole.entities.Transaction.filter(
      { created_date: { $gte: startDate, $lte: endDate } }
    );

    // Convert to DATEV format
    const datevData = transactions.map((t) => ({
      'Umsatzdatum': new Date(t.created_date).toLocaleDateString('de-DE'),
      'Belegnummer': t.id,
      'Beschreibung': t.description || 'Miete/Nebenkosten',
      'Betrag': t.amount,
      'Typ': t.type === 'income' ? 'Einnahme' : 'Ausgabe',
      'Kategorie': 'Mieteinnahmen',
    }));

    // Generate CSV
    const headers = Object.keys(datevData[0] || {});
    const csv =
      [headers.join(';')]
        .concat(datevData.map((row) => headers.map((h) => row[h]).join(';')))
        .join('\n');

    const fileName = `datev_export_${year}_${String(month).padStart(2, '0')}.csv`;

    console.log(`✓ DATEV export generated: ${fileName}`);

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error(`DATEV export error: ${error.message}`);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});