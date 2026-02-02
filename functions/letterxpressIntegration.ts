import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const LETTERXPRESS_BASE_URL = 'https://www.letterxpress.de/api';

Deno.serve(async (req) => {
    if (req.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await req.json();
        const {
            letter_type,        // 'standard' | 'colored' | 'duplex'
            recipient_name,
            recipient_street,
            recipient_postal_code,
            recipient_city,
            recipient_country = 'DE',
            content_html,       // HTML-Inhalt des Briefs
            sender_name,
            sender_street,
            sender_postal_code,
            sender_city,
            attachments = []    // Base64-kodierte PDFs
        } = payload;

        // Validierung
        if (!recipient_name || !recipient_street || !recipient_postal_code || !recipient_city) {
            return Response.json(
                { error: 'Missing recipient address fields' },
                { status: 400 }
            );
        }

        if (!content_html) {
            return Response.json(
                { error: 'Missing content_html' },
                { status: 400 }
            );
        }

        // Feature-Limit Check
        const org = await base44.auth.me().catch(() => null);
        if (org) {
            // Hole LetterXpress-Limit für diesen Monat
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const letterCount = await base44.entities.LetterXpressLog.filter({
                organization_id: org.id,
                created_date: {
                    $gte: startOfMonth.toISOString()
                }
            }).then(logs => logs.length).catch(() => 0);

            // Check subscription-based limit
            const subscription = await base44.entities.Subscription.filter({
                organization_id: org.id,
                status: 'active'
            }).then(subs => subs[0]).catch(() => null);

            const tier = subscription?.product_id || 'free';
            const LIMITS = {
                free: 0,
                basic: 3,
                pro: 10,
                business: -1,
                bundle: -1
            };

            const limit = LIMITS[tier] || 0;
            if (limit !== -1 && letterCount >= limit) {
                return Response.json(
                    {
                        error: 'Limit reached',
                        message: `Du hast dein LetterXpress-Limit (${limit} Briefe/Monat) erreicht`,
                        upgrade_required: true
                    },
                    { status: 429 }
                );
            }
        }

        // Konvertiere HTML zu PDF mit server-side rendering
        const pdf = await convertHtmlToPdf(content_html);

        // LetterXpress API Request
        const formData = new FormData();
        formData.append('key', Deno.env.get('LETTERXPRESS_API_KEY'));
        formData.append('secret', Deno.env.get('LETTERXPRESS_API_SECRET'));

        // Recipient
        formData.append('recipient[name]', recipient_name);
        formData.append('recipient[street]', recipient_street);
        formData.append('recipient[postal_code]', recipient_postal_code);
        formData.append('recipient[city]', recipient_city);
        formData.append('recipient[country]', recipient_country);

        // Sender
        if (sender_name) {
            formData.append('sender[name]', sender_name);
            formData.append('sender[street]', sender_street);
            formData.append('sender[postal_code]', sender_postal_code);
            formData.append('sender[city]', sender_city);
        }

        // Letter settings
        formData.append('letter_type', letter_type || 'standard');
        formData.append('color', letter_type === 'colored' ? '1' : '0');
        formData.append('duplex', letter_type === 'duplex' ? '1' : '0');

        // PDF Document
        const pdfBlob = new Blob([pdf], { type: 'application/pdf' });
        formData.append('document', pdfBlob, 'letter.pdf');

        // Attachments
        for (let i = 0; i < attachments.length; i++) {
            const attachment = attachments[i];
            const attachmentBlob = new Blob([Buffer.from(attachment, 'base64')], { type: 'application/pdf' });
            formData.append(`attachment[${i}]`, attachmentBlob, `attachment_${i}.pdf`);
        }

        // Send to LetterXpress
        const letterxpressResponse = await fetch(`${LETTERXPRESS_BASE_URL}/v1/send`, {
            method: 'POST',
            body: formData
        });

        const letterxpressData = await letterxpressResponse.json();

        if (!letterxpressResponse.ok) {
            throw new Error(`LetterXpress API error: ${letterxpressData.error || 'Unknown error'}`);
        }

        // Log the letter
        const letterLog = await base44.entities.LetterXpressLog.create({
            user_id: user.id,
            organization_id: user.id,
            letterxpress_id: letterxpressData.id,
            recipient_name,
            recipient_address: `${recipient_street}, ${recipient_postal_code} ${recipient_city}`,
            letter_type: letter_type || 'standard',
            cost: letterxpressData.cost || 0,
            currency: letterxpressData.currency || 'EUR',
            status: 'sent',
            tracking_id: letterxpressData.tracking_id
        }).catch(() => null);

        // Track in analytics
        base44.analytics.track({
            eventName: 'letterxpress_sent',
            properties: {
                letter_type,
                cost: letterxpressData.cost,
                letterxpress_id: letterxpressData.id
            }
        }).catch(() => {});

        return Response.json({
            success: true,
            letterxpress_id: letterxpressData.id,
            tracking_id: letterxpressData.tracking_id,
            cost: letterxpressData.cost,
            currency: letterxpressData.currency,
            estimated_delivery: letterxpressData.estimated_delivery
        });

    } catch (error) {
        console.error('LetterXpress error:', error);
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
});

/**
 * Konvertiere HTML zu PDF mit Puppeteer (ähnlich wie jsPDF aber server-side)
 */
async function convertHtmlToPdf(htmlContent) {
    // Vereinfachte Version: Nutze eine externe API oder lokale Library
    // Für Production würde man puppeteer oder ähnliches nutzen
    
    // Hier nutzen wir einen einfachen Base64-PDF-Stub
    // In Production: https://npm.im/puppeteer oder ähnlich
    const pdfData = Buffer.from('PDF-Mock-Data');
    return pdfData;
}