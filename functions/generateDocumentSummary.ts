import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * WELLE 4: AI Document Summary Generation
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { document_id, document_name } = await req.json();

    if (!document_id) {
      return Response.json({ error: 'document_id required' }, { status: 400 });
    }

    // Nutze LLM für Zusammenfassung
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Erstelle eine kurze, prägnante Zusammenfassung des Dokuments "${document_name}".
      
      Die Zusammenfassung sollte:
      - Max. 3 Sätze sein
      - Die Hauptpunkte hervorheben
      - Auf Deutsch sein
      - Geschäftsfähig sein`,
    });

    return Response.json({
      status: 'success',
      summary: response,
      document_id,
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});