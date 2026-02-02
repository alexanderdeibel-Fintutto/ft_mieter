import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenant_email, tenant_name } = await req.json();

    if (!tenant_email || !tenant_name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send welcome packet via email
    const emailResponse = await base44.integrations.Core.SendEmail({
      to: tenant_email,
      subject: 'Dein digitales Willkommenspaket',
      body: `
Liebe/r ${tenant_name},

willkommen in deiner neuen Wohnung! 🏠

Anbei erhältst du dein digitales Willkommenspaket mit allen wichtigen Informationen:

📋 **Hausregeln** - Regeln für ein harmonisches Zusammenleben
📞 **Kontaktinformationen** - Wer ist dein Ansprechpartner?
🚨 **Notfall-Hotline** - Bei Notfällen erreichbar 24/7
📅 **Wichtige Termine** - Zahlungstermine und Inspektionen
🗺️ **Gebäudeplan** - Orientierung in deinem Gebäude
❓ **Häufig gestellte Fragen** - Schnelle Antworten zu häufigen Fragen

Du kannst das Paket auch jederzeit in deinem Mieterportal unter "Onboarding > Willkommenspaket" abrufen und herunterladen.

Falls du Fragen hast, zögere nicht, uns zu kontaktieren!

Beste Grüße,
Deine Hausverwaltung
      `
    });

    // Log the welcome packet delivery
    await base44.asServiceRole.entities.ActivityLog?.create?.({
      user_id: user.id,
      event_type: 'welcome_packet_sent',
      description: `Welcome packet sent to ${tenant_email}`,
      metadata: {
        tenant_name: tenant_name,
        sent_at: new Date().toISOString()
      }
    }).catch(() => null); // Fail silently if entity doesn't exist

    return Response.json({
      success: true,
      message: 'Welcome packet sent successfully'
    });
  } catch (error) {
    console.error('Error in send-welcome-packet:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});