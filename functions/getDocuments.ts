import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Document Retrieval mit Filtering & Search
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            organization_id,
            entity_type,
            entity_id,
            category,
            search_query,
            tags,
            uploaded_by,
            date_from,
            date_to,
            limit = 50
        } = await req.json();

        // Basis-Filter
        let filters = {};
        if (organization_id) filters.organization_id = organization_id;
        if (entity_type) filters.entity_type = entity_type;
        if (entity_id) filters.entity_id = entity_id;
        if (category) filters.category = category;
        if (uploaded_by) filters.uploaded_by = uploaded_by;

        // Lade Dokumente
        let documents = await base44.asServiceRole.entities.Document.filter(filters);

        // Zusätzliche Filter
        if (date_from) {
            documents = documents.filter(doc => 
                new Date(doc.created_date) >= new Date(date_from)
            );
        }
        if (date_to) {
            documents = documents.filter(doc => 
                new Date(doc.created_date) <= new Date(date_to)
            );
        }

        // Volltextsuche
        if (search_query) {
            const query = search_query.toLowerCase();
            documents = documents.filter(doc => 
                doc.file_name.toLowerCase().includes(query) ||
                doc.extracted_text?.toLowerCase().includes(query) ||
                doc.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Tag-Filter
        if (tags && Array.isArray(tags)) {
            documents = documents.filter(doc => 
                tags.some(tag => doc.tags?.includes(tag))
            );
        }

        // Sortiere nach Datum (neueste zuerst)
        documents.sort((a, b) => 
            new Date(b.created_date) - new Date(a.created_date)
        );

        // Limit
        documents = documents.slice(0, limit);

        // Lade Uploader-Info
        const enrichedDocs = await Promise.all(
            documents.map(async (doc) => {
                try {
                    const uploader = await base44.asServiceRole.entities.User.filter({ 
                        id: doc.uploaded_by 
                    });
                    return {
                        ...doc,
                        uploader_name: uploader[0]?.full_name || 'Unbekannt'
                    };
                } catch (error) {
                    return {
                        ...doc,
                        uploader_name: 'Unbekannt'
                    };
                }
            })
        );

        return Response.json({
            documents: enrichedDocs,
            total: enrichedDocs.length
        });
    } catch (error) {
        console.error('Get documents error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});