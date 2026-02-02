import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { query, filters = {} } = await req.json();

    const results = {
      query,
      total_results: 234,
      time_ms: 45,
      results: [
        { id: '1', title: 'Mietvertrag 2025', type: 'document', relevance: 0.98 },
        { id: '2', title: 'Nebenkosten 2025', type: 'document', relevance: 0.85 },
      ],
    };
    return Response.json({ status: 'success', search: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});