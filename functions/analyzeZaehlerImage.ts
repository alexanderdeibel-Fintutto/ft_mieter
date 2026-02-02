import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { image_url, meter_type, imageBase64, imageMediaType } = await req.json();

        if (!image_url && !imageBase64) {
            return Response.json({
                error: 'image_url oder imageBase64 ist erforderlich'
            }, { status: 400 });
        }

        // Nutze den zentralen AI Core Service für OCR
        let imageData = imageBase64;
        let mediaType = imageMediaType || "image/jpeg";
        
        // Falls nur URL vorhanden, Bild herunterladen und zu base64 konvertieren
        if (!imageData && image_url) {
            try {
                const imgResponse = await fetch(image_url);
                const imgBlob = await imgResponse.arrayBuffer();
                imageData = btoa(String.fromCharCode(...new Uint8Array(imgBlob)));
                mediaType = imgResponse.headers.get('content-type') || 'image/jpeg';
            } catch (e) {
                return Response.json({ error: 'Bild konnte nicht geladen werden: ' + e.message }, { status: 400 });
            }
        }

        const result = await base44.functions.invoke('aiCoreService', {
            action: 'ocr',
            prompt: `Analysiere dieses Zählerbild (Typ: ${meter_type || 'unbekannt'}) und extrahiere:
1. Aktueller Zählerstand (numerisch)
2. Zählernummer (falls sichtbar)
3. Confidence-Level (0-100%)
4. Warnungen/Probleme
5. Bildqualität (gut/mittel/schlecht)

Antworte als JSON: { "meter_reading": number, "meter_number": string, "confidence": number, "warnings": string[], "image_quality": string }`,
            imageBase64: imageData,
            imageMediaType: mediaType,
            userId: user.email,
            featureKey: 'ocr',
        });

        if (!result.data.success) {
            throw new Error(result.data.error);
        }

        // Parse JSON aus Content
        let analysis;
        try {
            analysis = JSON.parse(result.data.content);
        } catch {
            // Fallback wenn kein valides JSON
            analysis = { 
                meter_reading: 0, 
                confidence: 0, 
                image_quality: "schlecht", 
                warnings: ["Konnte keine strukturierten Daten extrahieren"],
                raw_response: result.data.content
            };
        }

        return Response.json({
            success: true,
            data: analysis,
            meter_type: meter_type || 'unbekannt',
            analyzed_at: new Date().toISOString(),
            usage: result.data.usage,
        });

    } catch (error) {
        console.error('analyzeZaehlerImage error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});