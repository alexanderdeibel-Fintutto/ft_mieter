import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Analytics Dashboard Data: KPIs, Trends, Metrics
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
            date_from,
            date_to,
            metrics = ['payments', 'tenants', 'documents', 'maintenance']  // Which metrics to compute
        } = await req.json();

        if (!organization_id) {
            return Response.json({ error: 'Missing organization_id' }, { status: 400 });
        }

        const fromDate = date_from ? new Date(date_from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const toDate = date_to ? new Date(date_to) : new Date();

        const dashboard = {};

        // Payment Metrics
        if (metrics.includes('payments')) {
            const payments = await base44.asServiceRole.entities.PaymentTransaction.filter({
                organization_id: organization_id
            });

            const filteredPayments = payments.filter(p => {
                const date = new Date(p.created_date);
                return date >= fromDate && date <= toDate;
            });

            dashboard.payments = {
                total_amount: filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
                count: filteredPayments.length,
                by_status: aggregateBy(filteredPayments, 'status'),
                by_type: aggregateBy(filteredPayments, 'type'),
                average: filteredPayments.length > 0 
                    ? filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0) / filteredPayments.length
                    : 0,
                trend: calculateTrend(filteredPayments, fromDate, toDate)
            };
        }

        // Tenant Metrics
        if (metrics.includes('tenants')) {
            const tenants = await base44.asServiceRole.entities.Tenant.filter({
                organization_id: organization_id
            });

            const filteredTenants = tenants.filter(t => {
                const date = new Date(t.created_date);
                return date >= fromDate && date <= toDate;
            });

            dashboard.tenants = {
                total_count: tenants.length,
                new_tenants: filteredTenants.length,
                active_count: tenants.filter(t => !t.moved_out_date).length,
                trend: calculateTrend(filteredTenants, fromDate, toDate)
            };
        }

        // Document Metrics
        if (metrics.includes('documents')) {
            const documents = await base44.asServiceRole.entities.Document.filter({
                organization_id: organization_id
            });

            const filteredDocs = documents.filter(d => {
                const date = new Date(d.created_date);
                return date >= fromDate && date <= toDate;
            });

            dashboard.documents = {
                total_count: documents.length,
                new_documents: filteredDocs.length,
                by_category: aggregateBy(documents, 'category'),
                storage_mb: documents.reduce((sum, d) => sum + (d.metadata?.size_bytes || 0), 0) / 1024 / 1024,
                trend: calculateTrend(filteredDocs, fromDate, toDate)
            };
        }

        // Maintenance Metrics
        if (metrics.includes('maintenance')) {
            const tasks = await base44.asServiceRole.entities.MaintenanceTask.filter({
                organization_id: organization_id
            });

            const filteredTasks = tasks.filter(t => {
                const date = new Date(t.created_date);
                return date >= fromDate && date <= toDate;
            });

            const completedTasks = filteredTasks.filter(t => t.status === 'completed');

            dashboard.maintenance = {
                total_tasks: tasks.length,
                new_tasks: filteredTasks.length,
                completed_tasks: completedTasks.length,
                completion_rate: filteredTasks.length > 0 
                    ? (completedTasks.length / filteredTasks.length) * 100 
                    : 0,
                by_status: aggregateBy(tasks, 'status'),
                by_priority: aggregateBy(tasks, 'priority'),
                trend: calculateTrend(filteredTasks, fromDate, toDate)
            };
        }

        return Response.json({
            organization_id: organization_id,
            date_from: fromDate.toISOString(),
            date_to: toDate.toISOString(),
            dashboard: dashboard,
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Analytics dashboard error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function aggregateBy(items, field) {
    const result = {};
    items.forEach(item => {
        const key = item[field] || 'unknown';
        result[key] = (result[key] || 0) + 1;
    });
    return result;
}

function calculateTrend(items, fromDate, toDate) {
    // Split period into quarters and show growth
    const daysDiff = (toDate - fromDate) / (1000 * 60 * 60 * 24);
    const quarterDays = daysDiff / 4;

    const trend = [];
    for (let i = 0; i < 4; i++) {
        const qStart = new Date(fromDate.getTime() + i * quarterDays * 24 * 60 * 60 * 1000);
        const qEnd = new Date(fromDate.getTime() + (i + 1) * quarterDays * 24 * 60 * 60 * 1000);

        const count = items.filter(item => {
            const date = new Date(item.created_date);
            return date >= qStart && date < qEnd;
        }).length;

        trend.push({
            period: i + 1,
            count: count
        });
    }

    return trend;
}