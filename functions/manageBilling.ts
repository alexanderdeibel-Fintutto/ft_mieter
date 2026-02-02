import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

/**
 * Punkt 9: Unified Billing Management
 * Zentrales Abonnement- und Rechnungsmanagement für alle Apps
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, ...params } = await req.json();

        let result;
        switch (action) {
            case 'create_subscription':
                result = await createSubscription(base44, user, params);
                break;
            case 'cancel_subscription':
                result = await cancelSubscription(base44, user, params);
                break;
            case 'update_subscription':
                result = await updateSubscription(base44, user, params);
                break;
            case 'get_invoices':
                result = await getInvoices(base44, user, params);
                break;
            case 'get_usage':
                result = await getUsage(base44, user, params);
                break;
            default:
                return Response.json({ error: 'Unknown action' }, { status: 400 });
        }

        return Response.json(result);
    } catch (error) {
        console.error('Billing management error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function createSubscription(base44, user, params) {
    const { organization_id, product_id, price_id, payment_method_id } = params;

    // Prüfe ob Organisation bereits Subscription hat
    const existingSubs = await base44.entities.Subscription.filter({
        organization_id: organization_id,
        status: 'active'
    });

    if (existingSubs.length > 0) {
        throw new Error('Organization already has an active subscription');
    }

    // Erstelle oder hole Stripe Customer
    let stripeCustomerId;
    const org = await base44.entities.Organization.filter({ id: organization_id });
    
    if (org[0]?.stripe_customer_id) {
        stripeCustomerId = org[0].stripe_customer_id;
    } else {
        const customer = await stripe.customers.create({
            email: user.email,
            metadata: {
                organization_id: organization_id,
                user_id: user.id
            }
        });
        stripeCustomerId = customer.id;
        
        await base44.entities.Organization.update(organization_id, {
            stripe_customer_id: stripeCustomerId
        });
    }

    // Füge Payment Method hinzu
    if (payment_method_id) {
        await stripe.paymentMethods.attach(payment_method_id, {
            customer: stripeCustomerId
        });
        await stripe.customers.update(stripeCustomerId, {
            invoice_settings: {
                default_payment_method: payment_method_id
            }
        });
    }

    // Erstelle Stripe Subscription
    const stripeSubscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: price_id }],
        metadata: {
            organization_id: organization_id,
            product_id: product_id
        }
    });

    // Speichere Subscription in DB
    const subscription = await base44.entities.Subscription.create({
        organization_id: organization_id,
        product_id: product_id,
        stripe_subscription_id: stripeSubscription.id,
        stripe_customer_id: stripeCustomerId,
        status: 'active',
        current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: false
    });

    return { subscription, stripe_subscription: stripeSubscription };
}

async function cancelSubscription(base44, user, params) {
    const { subscription_id, cancel_immediately = false } = params;

    const subscription = await base44.entities.Subscription.filter({ id: subscription_id });
    if (!subscription[0]) {
        throw new Error('Subscription not found');
    }

    const sub = subscription[0];

    // Stripe Subscription kündigen
    if (cancel_immediately) {
        await stripe.subscriptions.cancel(sub.stripe_subscription_id);
        await base44.entities.Subscription.update(subscription_id, {
            status: 'canceled',
            canceled_at: new Date().toISOString()
        });
    } else {
        await stripe.subscriptions.update(sub.stripe_subscription_id, {
            cancel_at_period_end: true
        });
        await base44.entities.Subscription.update(subscription_id, {
            cancel_at_period_end: true
        });
    }

    return { message: 'Subscription canceled' };
}

async function updateSubscription(base44, user, params) {
    const { subscription_id, new_price_id } = params;

    const subscription = await base44.entities.Subscription.filter({ id: subscription_id });
    if (!subscription[0]) {
        throw new Error('Subscription not found');
    }

    const sub = subscription[0];
    const stripeSubscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);

    // Update Stripe Subscription
    const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
        items: [{
            id: stripeSubscription.items.data[0].id,
            price: new_price_id
        }],
        proration_behavior: 'create_prorations'
    });

    return { message: 'Subscription updated', subscription: updated };
}

async function getInvoices(base44, user, params) {
    const { organization_id, limit = 10 } = params;

    const org = await base44.entities.Organization.filter({ id: organization_id });
    if (!org[0]?.stripe_customer_id) {
        return { invoices: [] };
    }

    const invoices = await stripe.invoices.list({
        customer: org[0].stripe_customer_id,
        limit: limit
    });

    return { invoices: invoices.data };
}

async function getUsage(base44, user, params) {
    const { organization_id, time_range = '30d' } = params;

    const days = parseInt(time_range.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Zähle verschiedene Usage-Metriken
    const metrics = {
        documents_uploaded: 0,
        notifications_sent: 0,
        api_calls: 0,
        storage_used_mb: 0
    };

    // Dokumente
    const docs = await base44.asServiceRole.entities.Document.filter({
        organization_id: organization_id
    });
    metrics.documents_uploaded = docs.filter(d => 
        new Date(d.created_date) >= startDate
    ).length;

    // Benachrichtigungen
    const notifications = await base44.asServiceRole.entities.NotificationLog.filter({});
    metrics.notifications_sent = notifications.filter(n => 
        new Date(n.sent_at) >= startDate
    ).length;

    return { usage: metrics, period: time_range };
}