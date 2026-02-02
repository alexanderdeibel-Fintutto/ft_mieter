import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 38: Multi-Tenant Billing & Usage Metering System
 * Verwaltet Nutzungs-Tracking, Quotas und automatische Rechnungserstellung
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,                    // 'track_usage', 'get_quotas', 'create_quota', 'check_quota', 'get_billing_cycles', 'create_billing_cycle', 'finalize_cycle', 'generate_invoice', 'get_invoices', 'get_usage_summary', 'reset_quota'
            organization_id,
            quota_id,
            resource_type,
            amount,
            cycle_id,
            invoice_id
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'track_usage') {
            // Track resource usage
            if (!resource_type || !amount) {
                return Response.json({ error: 'resource_type, amount required' }, { status: 400 });
            }

            // Find quota for resource
            const quotas = await base44.asServiceRole.entities.UsageQuota.filter({
                organization_id: organization_id,
                resource_type: resource_type,
                is_active: true
            });

            if (quotas.length === 0) {
                return Response.json({ 
                    usage_tracked: false,
                    error: 'No quota found for resource'
                }, { status: 404 });
            }

            const quota = quotas[0];
            const newUsed = (quota.used || 0) + amount;

            // Check if quota exceeded
            if (!quota.overage_allowed && newUsed > quota.limit) {
                return Response.json({
                    usage_tracked: false,
                    quota_exceeded: true,
                    limit: quota.limit,
                    used: quota.used
                }, { status: 403 });
            }

            // Update quota
            await base44.asServiceRole.entities.UsageQuota.update(quota.id, {
                used: newUsed
            });

            // Check alert threshold
            const usagePercent = (newUsed / quota.limit) * 100;
            if (quota.alert_threshold && usagePercent >= quota.alert_threshold && !quota.alert_sent) {
                await base44.asServiceRole.entities.UsageQuota.update(quota.id, {
                    alert_sent: true
                });
            }

            return Response.json({
                usage_tracked: true,
                used: newUsed,
                limit: quota.limit,
                remaining: quota.limit - newUsed,
                usage_percent: usagePercent.toFixed(1)
            });

        } else if (action === 'get_quotas') {
            // Get all quotas
            const quotas = await base44.asServiceRole.entities.UsageQuota.filter({
                organization_id: organization_id
            });

            const stats = {
                total: quotas.length,
                exceeded: quotas.filter(q => q.used > q.limit).length,
                near_limit: quotas.filter(q => (q.used / q.limit) >= 0.8).length
            };

            return Response.json({
                quotas: quotas,
                stats: stats
            });

        } else if (action === 'create_quota') {
            // Create new quota
            const { quota_name, limit, unit, reset_period } = await req.json();

            if (!quota_name || !resource_type || !limit || !unit) {
                return Response.json({ error: 'Missing required fields' }, { status: 400 });
            }

            const nextReset = calculateNextReset(reset_period || 'monthly');

            const quota = await base44.asServiceRole.entities.UsageQuota.create({
                organization_id: organization_id,
                quota_name: quota_name,
                resource_type: resource_type,
                limit: limit,
                unit: unit,
                reset_period: reset_period || 'monthly',
                last_reset_at: new Date().toISOString(),
                next_reset_at: nextReset
            });

            return Response.json({
                quota_created: true,
                quota_id: quota.id
            });

        } else if (action === 'check_quota') {
            // Check if quota allows usage
            if (!resource_type || !amount) {
                return Response.json({ error: 'resource_type, amount required' }, { status: 400 });
            }

            const quotas = await base44.asServiceRole.entities.UsageQuota.filter({
                organization_id: organization_id,
                resource_type: resource_type,
                is_active: true
            });

            if (quotas.length === 0) {
                return Response.json({ allowed: false, reason: 'No quota found' });
            }

            const quota = quotas[0];
            const newUsed = (quota.used || 0) + amount;
            const allowed = quota.overage_allowed || newUsed <= quota.limit;

            return Response.json({
                allowed: allowed,
                used: quota.used,
                limit: quota.limit,
                remaining: quota.limit - quota.used,
                would_exceed: newUsed > quota.limit
            });

        } else if (action === 'get_billing_cycles') {
            // Get billing cycles
            const cycles = await base44.asServiceRole.entities.BillingCycle.filter({
                organization_id: organization_id
            }, '-start_date', 100);

            return Response.json({
                cycles: cycles
            });

        } else if (action === 'create_billing_cycle') {
            // Create new billing cycle
            const { cycle_name, start_date, end_date, base_fee } = await req.json();

            if (!cycle_name || !start_date || !end_date) {
                return Response.json({ error: 'Missing required fields' }, { status: 400 });
            }

            const cycle = await base44.asServiceRole.entities.BillingCycle.create({
                organization_id: organization_id,
                cycle_name: cycle_name,
                start_date: start_date,
                end_date: end_date,
                base_fee: base_fee || 0
            });

            return Response.json({
                cycle_created: true,
                cycle_id: cycle.id
            });

        } else if (action === 'finalize_cycle') {
            // Finalize billing cycle and calculate charges
            if (!cycle_id) {
                return Response.json({ error: 'cycle_id required' }, { status: 400 });
            }

            const cycles = await base44.asServiceRole.entities.BillingCycle.filter({
                id: cycle_id
            });

            if (!cycles || cycles.length === 0) {
                return Response.json({ error: 'Cycle not found' }, { status: 404 });
            }

            const cycle = cycles[0];

            // Get all quotas for usage summary
            const quotas = await base44.asServiceRole.entities.UsageQuota.filter({
                organization_id: organization_id
            });

            const usageSummary = {};
            let overageCharges = 0;

            quotas.forEach(q => {
                usageSummary[q.resource_type] = {
                    used: q.used,
                    limit: q.limit,
                    unit: q.unit
                };

                // Calculate overage charges
                if (q.used > q.limit && q.overage_rate) {
                    const overage = q.used - q.limit;
                    overageCharges += overage * q.overage_rate;
                }
            });

            const totalAmount = cycle.base_fee + cycle.usage_charges + overageCharges;

            await base44.asServiceRole.entities.BillingCycle.update(cycle_id, {
                status: 'finalized',
                overage_charges: overageCharges,
                total_amount: totalAmount,
                usage_summary: usageSummary,
                finalized_at: new Date().toISOString()
            });

            return Response.json({
                cycle_finalized: true,
                total_amount: totalAmount,
                usage_summary: usageSummary
            });

        } else if (action === 'generate_invoice') {
            // Generate invoice from billing cycle
            if (!cycle_id) {
                return Response.json({ error: 'cycle_id required' }, { status: 400 });
            }

            const cycles = await base44.asServiceRole.entities.BillingCycle.filter({
                id: cycle_id
            });

            if (!cycles || cycles.length === 0) {
                return Response.json({ error: 'Cycle not found' }, { status: 404 });
            }

            const cycle = cycles[0];
            const invoiceNumber = `INV-${Date.now()}`;
            const invoiceDate = new Date();
            const dueDate = new Date(invoiceDate.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days

            // Create line items
            const lineItems = [];

            if (cycle.base_fee > 0) {
                lineItems.push({
                    description: 'Base Subscription Fee',
                    quantity: 1,
                    unit_price: cycle.base_fee,
                    amount: cycle.base_fee
                });
            }

            if (cycle.usage_charges > 0) {
                lineItems.push({
                    description: 'Usage Charges',
                    quantity: 1,
                    unit_price: cycle.usage_charges,
                    amount: cycle.usage_charges
                });
            }

            if (cycle.overage_charges > 0) {
                lineItems.push({
                    description: 'Overage Charges',
                    quantity: 1,
                    unit_price: cycle.overage_charges,
                    amount: cycle.overage_charges
                });
            }

            const subtotal = cycle.total_amount;
            const taxRate = 19; // 19% VAT
            const taxAmount = (subtotal * taxRate) / 100;
            const totalAmount = subtotal + taxAmount;

            const invoice = await base44.asServiceRole.entities.Invoice.create({
                organization_id: organization_id,
                invoice_number: invoiceNumber,
                billing_cycle_id: cycle_id,
                invoice_date: invoiceDate.toISOString(),
                due_date: dueDate.toISOString(),
                line_items: lineItems,
                subtotal: subtotal,
                tax_rate: taxRate,
                tax_amount: taxAmount,
                total_amount: totalAmount,
                status: 'sent'
            });

            // Update cycle with invoice reference
            await base44.asServiceRole.entities.BillingCycle.update(cycle_id, {
                invoice_id: invoice.id
            });

            return Response.json({
                invoice_generated: true,
                invoice_id: invoice.id,
                invoice_number: invoiceNumber,
                total_amount: totalAmount
            });

        } else if (action === 'get_invoices') {
            // Get all invoices
            const invoices = await base44.asServiceRole.entities.Invoice.filter({
                organization_id: organization_id
            }, '-invoice_date', 100);

            const stats = {
                total: invoices.length,
                paid: invoices.filter(i => i.status === 'paid').length,
                overdue: invoices.filter(i => i.status === 'overdue').length,
                total_revenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0)
            };

            return Response.json({
                invoices: invoices,
                stats: stats
            });

        } else if (action === 'get_usage_summary') {
            // Get usage summary for organization
            const quotas = await base44.asServiceRole.entities.UsageQuota.filter({
                organization_id: organization_id
            });

            const summary = quotas.map(q => ({
                resource_type: q.resource_type,
                quota_name: q.quota_name,
                used: q.used,
                limit: q.limit,
                unit: q.unit,
                usage_percent: ((q.used / q.limit) * 100).toFixed(1),
                exceeded: q.used > q.limit
            }));

            return Response.json({
                summary: summary
            });

        } else if (action === 'reset_quota') {
            // Reset quota usage
            if (!quota_id) {
                return Response.json({ error: 'quota_id required' }, { status: 400 });
            }

            const quotas = await base44.asServiceRole.entities.UsageQuota.filter({
                id: quota_id
            });

            if (!quotas || quotas.length === 0) {
                return Response.json({ error: 'Quota not found' }, { status: 404 });
            }

            const quota = quotas[0];
            const nextReset = calculateNextReset(quota.reset_period);

            await base44.asServiceRole.entities.UsageQuota.update(quota_id, {
                used: 0,
                alert_sent: false,
                last_reset_at: new Date().toISOString(),
                next_reset_at: nextReset
            });

            return Response.json({
                quota_reset: true
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Billing engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function calculateNextReset(period) {
    const now = new Date();
    
    switch (period) {
        case 'hourly':
            return new Date(now.getTime() + (60 * 60 * 1000)).toISOString();
        case 'daily':
            return new Date(now.getTime() + (24 * 60 * 60 * 1000)).toISOString();
        case 'weekly':
            return new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString();
        case 'monthly':
            const nextMonth = new Date(now);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            return nextMonth.toISOString();
        default:
            return null;
    }
}