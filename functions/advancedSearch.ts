import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 15: Advanced Search & Full-Text Search System
 * Durchsucht alle Entity-Typen mit Filtern und Faceting
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
            query,
            entity_types = [],  // z.B. ['PaymentTransaction', 'Document', 'Tenant']
            filters = {},
            limit = 50,
            offset = 0,
            sort_by = 'relevance'  // 'relevance', 'created_date', 'updated_date'
        } = await req.json();

        if (!organization_id || !query) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const startTime = Date.now();
        const searchResults = [];
        const facets = {};

        // Define searchable fields per entity type
        const searchableFields = {
            PaymentTransaction: ['description', 'reference'],
            Document: ['file_name', 'tags', 'extracted_text'],
            Tenant: ['first_name', 'last_name', 'email', 'phone'],
            BillingStatement: ['invoice_number', 'period'],
            MaintenanceTask: ['title', 'description'],
            Building: ['name', 'address'],
            Unit: ['unit_number'],
            Lease: ['contract_number'],
            Organization: ['name', 'contact_email']
        };

        // Search in specified entity types or all if empty
        const typesToSearch = entity_types.length > 0 
            ? entity_types 
            : Object.keys(searchableFields);

        for (const entityType of typesToSearch) {
            if (!searchableFields[entityType]) continue;

            try {
                const results = await base44.asServiceRole.entities[entityType].filter({
                    organization_id: organization_id
                });

                // Filter by search query
                const filtered = results.filter(item => {
                    const searchFields = searchableFields[entityType];
                    const lowerQuery = query.toLowerCase();
                    
                    return searchFields.some(field => {
                        const value = item[field];
                        if (Array.isArray(value)) {
                            return value.some(v => String(v).toLowerCase().includes(lowerQuery));
                        }
                        return value && String(value).toLowerCase().includes(lowerQuery);
                    });
                });

                // Apply additional filters
                let filtered_results = filtered;
                if (filters[entityType]) {
                    filtered_results = filtered.filter(item => {
                        return Object.entries(filters[entityType]).every(([key, value]) => {
                            if (Array.isArray(value)) {
                                return value.includes(item[key]);
                            }
                            return item[key] === value;
                        });
                    });
                }

                // Sort results
                if (sort_by === 'created_date') {
                    filtered_results.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
                } else if (sort_by === 'updated_date') {
                    filtered_results.sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
                }

                // Add to results with entity type
                filtered_results.forEach(item => {
                    searchResults.push({
                        ...item,
                        _entity_type: entityType,
                        _relevance: calculateRelevance(query, item, searchableFields[entityType])
                    });
                });

                // Collect facets
                facets[entityType] = filtered_results.length;
            } catch (error) {
                console.error(`Search error for ${entityType}:`, error);
            }
        }

        // Sort by relevance if needed
        if (sort_by === 'relevance') {
            searchResults.sort((a, b) => b._relevance - a._relevance);
        }

        // Paginate
        const total = searchResults.length;
        const paginated = searchResults.slice(offset, offset + limit);

        // Log search
        await base44.asServiceRole.entities.SearchLog.create({
            organization_id: organization_id,
            user_id: user.id,
            query: query,
            entity_types: typesToSearch,
            results_count: total,
            filters_used: filters,
            response_time_ms: Date.now() - startTime,
            timestamp: new Date().toISOString()
        });

        return Response.json({
            query: query,
            total_results: total,
            results: paginated,
            facets: facets,
            limit: limit,
            offset: offset,
            response_time_ms: Date.now() - startTime
        });
    } catch (error) {
        console.error('Advanced search error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function calculateRelevance(query, item, fields) {
    let score = 0;
    const lowerQuery = query.toLowerCase();

    fields.forEach(field => {
        const value = item[field];
        if (!value) return;

        const stringValue = Array.isArray(value) 
            ? value.join(' ').toLowerCase() 
            : String(value).toLowerCase();

        // Exact match
        if (stringValue === lowerQuery) score += 100;
        // Starts with
        else if (stringValue.startsWith(lowerQuery)) score += 50;
        // Contains
        else if (stringValue.includes(lowerQuery)) score += 25;
        // Partial word match
        else if (stringValue.split(' ').some(word => word.includes(lowerQuery))) score += 10;
    });

    return score;
}