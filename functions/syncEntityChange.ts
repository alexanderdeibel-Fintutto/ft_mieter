import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Synchronisiert Änderungen an Entitäten über alle Apps hinweg
 * Wird von Entity-Automationen aufgerufen
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { event, data, entity_type } = await req.json();

        if (!event || !entity_type) {
            return Response.json({ error: 'Missing event or entity_type' }, { status: 400 });
        }

        // Trigger App-spezifische Synchronisierungen
        const syncResult = await triggerSync(base44, entity_type, event.type, data);

        return Response.json({ 
            success: true, 
            synced: syncResult 
        });
    } catch (error) {
        console.error('Sync error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function triggerSync(base44, entityType, eventType, data) {
    const syncs = [];

    switch (entityType) {
        case 'BillingStatement':
            if (eventType === 'create' || eventType === 'update') {
                // Benachrichtige Mieter
                syncs.push('notify_tenant_billing');
            }
            break;

        case 'PaymentTransaction':
            if (eventType === 'create') {
                // Update BillingStatement
                syncs.push('update_billing_statement_status');
            }
            break;

        case 'ServiceRequest':
            if (eventType === 'create') {
                // Benachrichtige Hausmeister
                syncs.push('notify_hausmeister_service_request');
            } else if (eventType === 'update') {
                // Benachrichtige Mieter über Status-Änderung
                syncs.push('notify_tenant_service_request_update');
            }
            break;

        case 'MaintenanceTask':
            if (eventType === 'update') {
                // Update ServiceRequest status
                syncs.push('sync_maintenance_to_service_request');
            }
            break;

        case 'Lease':
            if (eventType === 'create') {
                // Erstelle initiale BillingStatement
                syncs.push('create_initial_billing_statements');
            }
            break;
    }

    return syncs;
}