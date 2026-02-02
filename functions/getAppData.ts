import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Zentrale Funktion zum Abrufen von App-Daten basierend auf Nutzer-Rolle
 * Liefert nur die Daten, auf die der Nutzer Zugriff hat (rollenbasiert)
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data_type, filters = {} } = await req.json();

        // Hole Seat Allocations des Nutzers
        const allocations = await base44.entities.SeatAllocation.filter({
            receiving_user_id: user.id,
            is_active: true
        });

        if (allocations.length === 0) {
            return Response.json({ error: 'No active seat allocations' }, { status: 403 });
        }

        const userScopes = allocations.map(a => ({
            app_id: a.app_id,
            seat_type: a.seat_type,
            access_scope: a.access_scope || {}
        }));

        let result = [];

        // Rollenbasierte Datenabfragen
        switch (data_type) {
            case 'buildings':
                result = await getBuildingsData(base44, user, userScopes, filters);
                break;
            case 'units':
                result = await getUnitsData(base44, user, userScopes, filters);
                break;
            case 'leases':
                result = await getLeasesData(base44, user, userScopes, filters);
                break;
            case 'service_requests':
                result = await getServiceRequestsData(base44, user, userScopes, filters);
                break;
            case 'billing_statements':
                result = await getBillingStatementsData(base44, user, userScopes, filters);
                break;
            case 'payment_transactions':
                result = await getPaymentTransactionsData(base44, user, userScopes, filters);
                break;
            default:
                return Response.json({ error: 'Unknown data_type' }, { status: 400 });
        }

        return Response.json({ data: result, user_scopes: userScopes });
    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function getBuildingsData(base44, user, userScopes, filters) {
    // Vermieter & Hausmeister: Ihre Gebäude
    // Mieter: Gebäude seiner Wohnung(en)
    
    const hasMieterAccess = userScopes.some(s => s.seat_type === 'mieter');
    
    if (hasMieterAccess) {
        // Mieter: Nur sein Gebäude
        const allocations = await base44.entities.SeatAllocation.filter({
            receiving_user_id: user.id,
            seat_type: 'mieter'
        });
        
        const unitIds = allocations.map(a => a.access_scope?.unit_id).filter(Boolean);
        if (unitIds.length === 0) return [];
        
        const units = await base44.entities.Unit.filter({ id: { $in: unitIds } });
        const buildingIds = [...new Set(units.map(u => u.building_id))];
        
        return base44.entities.Building.filter({ id: { $in: buildingIds } });
    }

    // Vermieter/Hausmeister: Ihre Organisationen
    const orgs = await base44.entities.OrgMembership.filter({
        user_id: user.id,
        is_active: true
    });
    
    const orgIds = orgs.map(o => o.organization_id);
    return base44.entities.Building.filter({ organization_id: { $in: orgIds } });
}

async function getUnitsData(base44, user, userScopes, filters) {
    const hasMieterAccess = userScopes.some(s => s.seat_type === 'mieter');
    
    if (hasMieterAccess) {
        const allocations = await base44.entities.SeatAllocation.filter({
            receiving_user_id: user.id,
            seat_type: 'mieter'
        });
        const unitIds = allocations.map(a => a.access_scope?.unit_id).filter(Boolean);
        return unitIds.length > 0 ? base44.entities.Unit.filter({ id: { $in: unitIds } }) : [];
    }

    const orgs = await base44.entities.OrgMembership.filter({
        user_id: user.id,
        is_active: true
    });
    const orgIds = orgs.map(o => o.organization_id);
    const buildings = await base44.entities.Building.filter({ organization_id: { $in: orgIds } });
    const buildingIds = buildings.map(b => b.id);
    
    return buildingIds.length > 0 ? base44.entities.Unit.filter({ building_id: { $in: buildingIds } }) : [];
}

async function getLeasesData(base44, user, userScopes, filters) {
    const hasMieterAccess = userScopes.some(s => s.seat_type === 'mieter');
    
    if (hasMieterAccess) {
        // Mieter: Nur sein Mietvertrag
        return base44.entities.Lease.filter({ created_by: user.email });
    }

    // Vermieter/Hausmeister: Alle Mietverträge ihrer Gebäude
    const units = await getUnitsData(base44, user, userScopes, filters);
    const unitIds = units.map(u => u.id);
    
    return unitIds.length > 0 ? base44.entities.Lease.filter({ unit_id: { $in: unitIds } }) : [];
}

async function getServiceRequestsData(base44, user, userScopes, filters) {
    const hasMieterAccess = userScopes.some(s => s.seat_type === 'mieter');
    
    if (hasMieterAccess) {
        // Mieter: Nur seine Service Requests
        return base44.entities.ServiceRequest.filter({ user_id: user.id });
    }

    // Hausmeister: Requests seiner Units
    const units = await getUnitsData(base44, user, userScopes, filters);
    const unitIds = units.map(u => u.id);
    
    return unitIds.length > 0 ? base44.entities.ServiceRequest.filter({ unit_id: { $in: unitIds } }) : [];
}

async function getBillingStatementsData(base44, user, userScopes, filters) {
    const hasMieterAccess = userScopes.some(s => s.seat_type === 'mieter');
    
    if (hasMieterAccess) {
        // Mieter: Nur seine Abrechnungen
        return base44.entities.BillingStatement.filter({ user_id: user.id });
    }

    // Vermieter: Abrechnungen seiner Units
    const units = await getUnitsData(base44, user, userScopes, filters);
    const unitIds = units.map(u => u.id);
    
    if (unitIds.length === 0) return [];
    
    // Hole alle Abrechnungen der Units (via Leases)
    const leases = await base44.entities.Lease.filter({ unit_id: { $in: unitIds } });
    return base44.entities.BillingStatement.filter({ 
        user_id: { $in: leases.map(l => l.tenant_id) }
    });
}

async function getPaymentTransactionsData(base44, user, userScopes, filters) {
    const hasMieterAccess = userScopes.some(s => s.seat_type === 'mieter');
    
    if (hasMieterAccess) {
        // Mieter: Nur seine Zahlungen
        return base44.entities.PaymentTransaction.filter({ user_id: user.id });
    }

    // Vermieter: Zahlungen seiner Mieter
    const units = await getUnitsData(base44, user, userScopes, filters);
    const unitIds = units.map(u => u.id);
    
    if (unitIds.length === 0) return [];
    
    const leases = await base44.entities.Lease.filter({ unit_id: { $in: unitIds } });
    return base44.entities.PaymentTransaction.filter({
        user_id: { $in: leases.map(l => l.tenant_id) }
    });
}