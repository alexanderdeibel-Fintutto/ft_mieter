import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 8: Document Management
 * Zentraler Upload für alle Apps mit automatischer Kategorisierung
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file');
        const entity_type = formData.get('entity_type');
        const entity_id = formData.get('entity_id');
        const organization_id = formData.get('organization_id');
        const category = formData.get('category') || 'other';
        const is_public = formData.get('is_public') === 'true';

        if (!file || !entity_type || !entity_id || !organization_id) {
            return Response.json({ 
                error: 'Missing required parameters' 
            }, { status: 400 });
        }

        // Upload Datei
        const uploadResult = await base44.integrations.Core.UploadFile({
            file: file
        });

        const file_url = uploadResult.file_url;

        // Extrahiere Metadaten
        const metadata = {
            file_size: file.size,
            mime_type: file.type,
            original_name: file.name,
            uploaded_at: new Date().toISOString()
        };

        // OCR für Bilder/PDFs (optional)
        let extracted_text = null;
        if (file.type.includes('image') || file.type === 'application/pdf') {
            try {
                const ocrResult = await base44.integrations.Core.InvokeLLM({
                    prompt: 'Extract all text from this document. Return only the text content, no formatting.',
                    file_urls: [file_url]
                });
                extracted_text = ocrResult;
            } catch (error) {
                console.log('OCR failed:', error);
            }
        }

        // Erstelle Document-Eintrag
        const document = await base44.entities.Document.create({
            organization_id: organization_id,
            entity_type: entity_type,
            entity_id: entity_id,
            file_name: file.name,
            file_url: file_url,
            category: category,
            uploaded_by: user.id,
            is_public: is_public,
            metadata: metadata,
            extracted_text: extracted_text,
            tags: autoTagDocument(file.name, category)
        });

        return Response.json({
            document: document,
            message: 'Document uploaded successfully'
        });
    } catch (error) {
        console.error('Document upload error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function autoTagDocument(fileName, category) {
    const tags = [category];
    const lowerName = fileName.toLowerCase();

    // Automatische Tags basierend auf Dateinamen
    if (lowerName.includes('vertrag') || lowerName.includes('contract')) tags.push('vertrag');
    if (lowerName.includes('rechnung') || lowerName.includes('invoice')) tags.push('rechnung');
    if (lowerName.includes('abrechnung') || lowerName.includes('statement')) tags.push('abrechnung');
    if (lowerName.includes('protokoll') || lowerName.includes('protocol')) tags.push('protokoll');
    if (lowerName.includes('versicherung') || lowerName.includes('insurance')) tags.push('versicherung');
    if (lowerName.includes('2024')) tags.push('2024');
    if (lowerName.includes('2025')) tags.push('2025');
    if (lowerName.includes('2026')) tags.push('2026');

    return tags;
}