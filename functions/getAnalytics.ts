import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 7: Analytics Backend
 * Aggregiert und berechnet Metriken aus allen Apps
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { organization_id, time_range = '30d' } = await req.json();

        if (!organization_id) {
            return Response.json({ error: 'Missing organization_id' }, { status: 400 });
        }

        // Parse time range
        const days = parseInt(time_range.replace('d', ''));
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Berechne KPIs
        const kpis = await calculateKPIs(base44, organization_id, startDate);
        
        // Lade Chart-Daten
        const charts = await loadChartData(base44, organization_id, startDate);

        return Response.json({
            kpis: kpis,
            charts: charts,
            period: {
                start: startDate.toISOString(),
                end: new Date().toISOString(),
                days: days
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function calculateKPIs(base44, orgId, startDate) {
    // Einnahmen
    const payments = await base44.asServiceRole.entities.PaymentTransaction.filter({
        status: 'bezahlt'
    });
    
    const recentPayments = payments.filter(p => 
        new Date(p.paid_date) >= startDate
    );
    
    const totalRevenue = recentPayments.reduce((sum, p) => sum + p.amount, 0);

    // Vorheriger Zeitraum zum Vergleich
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - (new Date() - startDate) / (1000 * 60 * 60 * 24));
    
    const previousPayments = payments.filter(p => 
        new Date(p.paid_date) >= previousStartDate && 
        new Date(p.paid_date) < startDate
    );
    
    const previousRevenue = previousPayments.reduce((sum, p) => sum + p.amount, 0);
    const revenueChange = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
        : 0;

    // Mieter
    const leases = await base44.asServiceRole.entities.Lease.filter({
        status: 'active'
    });
    
    const activeTenants = leases.length;

    // Objekte
    const buildings = await base44.asServiceRole.entities.Building.filter({
        organization_id: orgId
    });
    
    const totalProperties = buildings.length;

    // Offene Aufgaben
    const tasks = await base44.asServiceRole.entities.MaintenanceTask.filter({
        status: 'open'
    });
    
    const openTasks = tasks.length;

    return {
        total_revenue: totalRevenue,
        revenue_change: parseFloat(revenueChange),
        active_tenants: activeTenants,
        tenant_change: 0, // TODO: Historische Daten
        total_properties: totalProperties,
        property_change: 0,
        open_tasks: openTasks,
        task_change: 0
    };
}

async function loadChartData(base44, orgId, startDate) {
    // Einnahmen-Timeline (letzte 12 Monate)
    const revenueTimeline = [];
    for (let i = 11; i >= 0; i--) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - i);
        const monthName = monthDate.toLocaleDateString('de-DE', { month: 'short' });
        
        revenueTimeline.push({
            month: monthName,
            revenue: Math.floor(Math.random() * 50000) + 30000, // Mock-Daten
            costs: Math.floor(Math.random() * 20000) + 10000
        });
    }

    // Auslastung
    const units = await base44.asServiceRole.entities.Unit.filter({});
    const occupancyBreakdown = [
        { name: 'Belegt', value: units.filter(u => u.status === 'occupied').length },
        { name: 'Leer', value: units.filter(u => u.status === 'vacant').length },
        { name: 'Wartung', value: units.filter(u => u.status === 'maintenance').length }
    ];

    // Wartungsstatistiken
    const tasks = await base44.asServiceRole.entities.MaintenanceTask.filter({});
    const categories = ['sanitaer', 'elektro', 'heizung', 'fenster', 'dach', 'sonstiges'];
    
    const maintenanceStats = categories.map(cat => ({
        category: cat,
        open: tasks.filter(t => t.category === cat && t.status === 'open').length,
        in_progress: tasks.filter(t => t.category === cat && t.status === 'in_progress').length,
        completed: tasks.filter(t => t.category === cat && t.status === 'completed').length
    }));

    // Zahlungsstatus (letzte 6 Monate)
    const paymentStatus = [];
    for (let i = 5; i >= 0; i--) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - i);
        const monthName = monthDate.toLocaleDateString('de-DE', { month: 'short' });
        
        paymentStatus.push({
            month: monthName,
            paid: Math.floor(Math.random() * 80) + 50,
            pending: Math.floor(Math.random() * 20) + 5,
            overdue: Math.floor(Math.random() * 10) + 2
        });
    }

    return {
        revenue_timeline: revenueTimeline,
        occupancy_breakdown: occupancyBreakdown,
        maintenance_stats: maintenanceStats,
        payment_status: paymentStatus
    };
}