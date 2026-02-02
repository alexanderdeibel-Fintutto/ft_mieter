import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SYSTEM_PROMPTS = {
  miethoehe: `Du bist ein erfahrener Mietrechts-Experte spezialisiert auf Fragen zur Miethöhe. 
  Antworte in freundlichem Deutsch und basiere deine Antworten auf deutschem Mietrecht.
  Erkläre komplexe Konzepte verständlich. Gib praktische Tipps und Hinweise auf relevante Gesetze.`,
  
  maengel: `Du bist ein Mietrechts-Experte für Mängel und Instandhaltung in Mietwohnungen.
  Erkläre Mietrecht bezüglich Mängeln, Gewährleistungsrechte und Verfahren. Gib praktische Ratschläge.`,
  
  kuendigung: `Du bist ein Kündigungs-Rechts-Experte. Erkläre die Rechte und Pflichten bei 
  Wohnungskündigungen unter deutschem Mietrecht. Beantworte Fragen zu Kündigungsfristen und Verfahren.`,
  
  nebenkosten: `Du bist ein Nebenkosten-Spezialist. Erkläre, was zu Nebenkosten gehört, wie sie 
  berechnet werden und welche Rechte Mieter haben. Antworte auf Fragen zur Nebenkosten-Abrechnung.`,
  
  sonstiges: `Du bist ein erfahrener Mietrechts-Berater für alle Fragen rund um das deutsche Mietrecht.
  Antworte hilfreich und verständlich in Deutsch.`,
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { messages, context } = payload;

    if (!messages || messages.length === 0) {
      return Response.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    // Letztes User-Message extrahieren
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      return Response.json({ error: 'No user message found' }, { status: 400 });
    }

    // Topic aus Kontext oder default
    const topic = context?.building_address || context?.topic || 'sonstiges';

    // Nutze den zentralen AI Core Service
    const result = await base44.functions.invoke('aiCoreService', {
      action: 'chat',
      prompt: lastUserMessage.content,
      systemPrompt: SYSTEM_PROMPTS[topic] || SYSTEM_PROMPTS.sonstiges,
      userId: user.email,
      featureKey: 'chat',
      conversationId: context?.conversation_id,
    });

    if (!result.data.success) {
      throw new Error(result.data.error);
    }

    console.log(`✓ Mietrecht Chat via aiCoreService - Topic: ${topic}`);

    // Formatierte Antwort wie erwartet
    return Response.json({
      success: true,
      message: result.data.content,
      metadata: {
        topic,
        tokens_used: result.data.usage.input_tokens + result.data.usage.output_tokens,
        cost_eur: result.data.usage.cost_eur,
        savings_eur: result.data.usage.savings_eur,
      },
    });

  } catch (error) {
    console.error(`Mietrecht Chat error: ${error.message}`);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});