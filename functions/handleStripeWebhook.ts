import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.4.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
    if (req.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature');

        // Verify webhook signature
        const event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            webhookSecret
        );

        const base44 = createClientFromRequest(req);

        switch (event.type) {
            // ===== CHECKOUT EVENTS =====
            case 'checkout.session.completed': {
                const session = event.data.object;
                const { user_id, org_id, app_id } = session.metadata;

                if (session.payment_status === 'paid') {
                    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
                    const priceId = lineItems.data[0]?.price?.id;

                    const product = await base44.asServiceRole.entities.Product.filter({
                        stripe_price_monthly: priceId
                    });

                    if (product.length > 0 && org_id) {
                        await base44.asServiceRole.entities.Subscription.create({
                            organization_id: org_id,
                            product_id: product[0].product_id,
                            status: 'active',
                            stripe_subscription_id: session.subscription,
                            stripe_customer_id: session.customer,
                            current_period_start: new Date().toISOString(),
                            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                            metadata: { app_id, user_id }
                        });

                        if (session.customer) {
                            await base44.asServiceRole.entities.Organization.update(org_id, {
                                stripe_customer_id: session.customer
                            });
                        }

                        // Log activity
                        await base44.asServiceRole.entities.ActivityLog.create({
                            organization_id: org_id,
                            action: 'subscription_created',
                            details: `Subscription created for ${product[0].product_name}`,
                            metadata: { stripe_session_id: session.id }
                        });
                    }
                }
                break;
            }

            case 'checkout.session.expired': {
                const session = event.data.object;
                await base44.asServiceRole.entities.ActivityLog.create({
                    action: 'checkout_expired',
                    details: `Checkout session expired: ${session.id}`
                });
                break;
            }

            // ===== SUBSCRIPTION EVENTS =====
            case 'customer.subscription.created': {
                const subscription = event.data.object;
                const priceId = subscription.items.data[0]?.price?.id;
                
                const product = await base44.asServiceRole.entities.Product.filter({
                    stripe_price_monthly: priceId
                });

                if (product.length > 0) {
                    const orgs = await base44.asServiceRole.entities.Organization.filter({
                        stripe_customer_id: subscription.customer
                    });

                    if (orgs.length > 0) {
                        await base44.asServiceRole.entities.Subscription.create({
                            organization_id: orgs[0].id,
                            product_id: product[0].product_id,
                            status: subscription.status,
                            stripe_subscription_id: subscription.id,
                            stripe_customer_id: subscription.customer,
                            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
                        });
                    }
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const subs = await base44.asServiceRole.entities.Subscription.filter({
                    stripe_subscription_id: subscription.id
                });

                if (subs.length > 0) {
                    await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
                        status: subscription.status,
                        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        cancel_at_period_end: subscription.cancel_at_period_end
                    });

                    await base44.asServiceRole.entities.ActivityLog.create({
                        organization_id: subs[0].organization_id,
                        action: 'subscription_updated',
                        details: `Subscription status changed to ${subscription.status}`
                    });
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const subs = await base44.asServiceRole.entities.Subscription.filter({
                    stripe_subscription_id: subscription.id
                });

                if (subs.length > 0) {
                    await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
                        status: 'canceled',
                        canceled_at: new Date().toISOString()
                    });

                    await base44.asServiceRole.entities.ActivityLog.create({
                        organization_id: subs[0].organization_id,
                        action: 'subscription_canceled',
                        details: 'Subscription canceled',
                        metadata: { reason: subscription.cancellation_details?.reason }
                    });
                }
                break;
            }

            case 'customer.subscription.paused': {
                const subscription = event.data.object;
                const subs = await base44.asServiceRole.entities.Subscription.filter({
                    stripe_subscription_id: subscription.id
                });

                if (subs.length > 0) {
                    await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
                        status: 'paused',
                        paused_at: new Date().toISOString()
                    });
                }
                break;
            }

            case 'customer.subscription.resumed': {
                const subscription = event.data.object;
                const subs = await base44.asServiceRole.entities.Subscription.filter({
                    stripe_subscription_id: subscription.id
                });

                if (subs.length > 0) {
                    await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
                        status: 'active',
                        paused_at: null
                    });
                }
                break;
            }

            // ===== INVOICE EVENTS =====
            case 'invoice.created': {
                const invoice = event.data.object;
                const subs = await base44.asServiceRole.entities.Subscription.filter({
                    stripe_subscription_id: invoice.subscription
                });

                if (subs.length > 0) {
                    await base44.asServiceRole.entities.Invoice.create({
                        organization_id: subs[0].organization_id,
                        subscription_id: subs[0].id,
                        stripe_invoice_id: invoice.id,
                        amount: invoice.amount_due / 100,
                        currency: invoice.currency,
                        status: invoice.status,
                        invoice_pdf: invoice.invoice_pdf,
                        due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null
                    });
                }
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object;
                const invoices = await base44.asServiceRole.entities.Invoice.filter({
                    stripe_invoice_id: invoice.id
                });

                if (invoices.length > 0) {
                    await base44.asServiceRole.entities.Invoice.update(invoices[0].id, {
                        status: 'paid',
                        paid_at: new Date().toISOString()
                    });

                    const subs = await base44.asServiceRole.entities.Subscription.filter({
                        stripe_subscription_id: invoice.subscription
                    });

                    if (subs.length > 0) {
                        await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
                            status: 'active',
                            current_period_start: new Date(invoice.period_start * 1000).toISOString(),
                            current_period_end: new Date(invoice.period_end * 1000).toISOString()
                        });

                        await base44.asServiceRole.entities.ActivityLog.create({
                            organization_id: subs[0].organization_id,
                            action: 'payment_succeeded',
                            details: `Payment of ${invoice.amount_paid / 100} ${invoice.currency.toUpperCase()} received`
                        });
                    }
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const invoices = await base44.asServiceRole.entities.Invoice.filter({
                    stripe_invoice_id: invoice.id
                });

                if (invoices.length > 0) {
                    await base44.asServiceRole.entities.Invoice.update(invoices[0].id, {
                        status: 'payment_failed'
                    });

                    const subs = await base44.asServiceRole.entities.Subscription.filter({
                        stripe_subscription_id: invoice.subscription
                    });

                    if (subs.length > 0) {
                        await base44.asServiceRole.entities.ActivityLog.create({
                            organization_id: subs[0].organization_id,
                            action: 'payment_failed',
                            details: 'Payment failed',
                            metadata: { 
                                invoice_id: invoice.id,
                                attempt_count: invoice.attempt_count 
                            }
                        });

                        // Send notification
                        await base44.asServiceRole.integrations.Core.SendEmail({
                            to: invoice.customer_email,
                            subject: 'Zahlung fehlgeschlagen - MieterApp',
                            body: `Hallo,\n\ndie Zahlung für dein Abonnement ist fehlgeschlagen. Bitte aktualisiere deine Zahlungsmethode.\n\nBetrag: ${invoice.amount_due / 100} ${invoice.currency.toUpperCase()}`
                        });
                    }
                }
                break;
            }

            case 'invoice.upcoming': {
                const invoice = event.data.object;
                const subs = await base44.asServiceRole.entities.Subscription.filter({
                    stripe_subscription_id: invoice.subscription
                });

                if (subs.length > 0) {
                    const orgs = await base44.asServiceRole.entities.Organization.filter({
                        id: subs[0].organization_id
                    });

                    if (orgs.length > 0 && orgs[0].billing_email) {
                        await base44.asServiceRole.integrations.Core.SendEmail({
                            to: orgs[0].billing_email,
                            subject: 'Bevorstehende Zahlung - MieterApp',
                            body: `Hallo,\n\nin wenigen Tagen wird dein Abonnement automatisch verlängert.\n\nBetrag: ${invoice.amount_due / 100} ${invoice.currency.toUpperCase()}\nFällig am: ${new Date(invoice.period_end * 1000).toLocaleDateString('de-DE')}`
                        });
                    }
                }
                break;
            }

            // ===== PAYMENT METHOD EVENTS =====
            case 'payment_method.attached': {
                const paymentMethod = event.data.object;
                const orgs = await base44.asServiceRole.entities.Organization.filter({
                    stripe_customer_id: paymentMethod.customer
                });

                if (orgs.length > 0) {
                    await base44.asServiceRole.entities.ActivityLog.create({
                        organization_id: orgs[0].id,
                        action: 'payment_method_added',
                        details: `Zahlungsmethode hinzugefügt: ${paymentMethod.type}`
                    });
                }
                break;
            }

            case 'payment_method.detached': {
                const paymentMethod = event.data.object;
                const orgs = await base44.asServiceRole.entities.Organization.filter({
                    stripe_customer_id: paymentMethod.customer
                });

                if (orgs.length > 0) {
                    await base44.asServiceRole.entities.ActivityLog.create({
                        organization_id: orgs[0].id,
                        action: 'payment_method_removed',
                        details: `Zahlungsmethode entfernt: ${paymentMethod.type}`
                    });
                }
                break;
            }

            // ===== CUSTOMER EVENTS =====
            case 'customer.updated': {
                const customer = event.data.object;
                const orgs = await base44.asServiceRole.entities.Organization.filter({
                    stripe_customer_id: customer.id
                });

                if (orgs.length > 0) {
                    await base44.asServiceRole.entities.Organization.update(orgs[0].id, {
                        billing_email: customer.email,
                        metadata: { stripe_metadata: customer.metadata }
                    });
                }
                break;
            }

            case 'customer.deleted': {
                const customer = event.data.object;
                const orgs = await base44.asServiceRole.entities.Organization.filter({
                    stripe_customer_id: customer.id
                });

                if (orgs.length > 0) {
                    await base44.asServiceRole.entities.ActivityLog.create({
                        organization_id: orgs[0].id,
                        action: 'customer_deleted',
                        details: 'Stripe customer deleted'
                    });
                }
                break;
            }

            // ===== CHARGE EVENTS =====
            case 'charge.succeeded': {
                const charge = event.data.object;
                await base44.asServiceRole.entities.ActivityLog.create({
                    action: 'charge_succeeded',
                    details: `Charge successful: ${charge.amount / 100} ${charge.currency.toUpperCase()}`,
                    metadata: { charge_id: charge.id }
                });
                break;
            }

            case 'charge.failed': {
                const charge = event.data.object;
                await base44.asServiceRole.entities.ActivityLog.create({
                    action: 'charge_failed',
                    details: `Charge failed: ${charge.failure_message}`,
                    metadata: { charge_id: charge.id }
                });
                break;
            }

            case 'charge.refunded': {
                const charge = event.data.object;
                await base44.asServiceRole.entities.ActivityLog.create({
                    action: 'charge_refunded',
                    details: `Charge refunded: ${charge.amount_refunded / 100} ${charge.currency.toUpperCase()}`,
                    metadata: { charge_id: charge.id }
                });
                break;
            }

            // ===== DISPUTE EVENTS =====
            case 'charge.dispute.created': {
                const dispute = event.data.object;
                await base44.asServiceRole.entities.ActivityLog.create({
                    action: 'dispute_created',
                    details: `Dispute created: ${dispute.reason}`,
                    metadata: { dispute_id: dispute.id, amount: dispute.amount / 100 }
                });
                break;
            }

            case 'charge.dispute.closed': {
                const dispute = event.data.object;
                await base44.asServiceRole.entities.ActivityLog.create({
                    action: 'dispute_closed',
                    details: `Dispute closed: ${dispute.status}`,
                    metadata: { dispute_id: dispute.id }
                });
                break;
            }

            // ===== REFUND EVENTS =====
            case 'refund.created': {
                const refund = event.data.object;
                await base44.asServiceRole.entities.ActivityLog.create({
                    action: 'refund_created',
                    details: `Refund created: ${refund.amount / 100} ${refund.currency.toUpperCase()}`,
                    metadata: { refund_id: refund.id, reason: refund.reason }
                });
                break;
            }

            case 'refund.updated': {
                const refund = event.data.object;
                await base44.asServiceRole.entities.ActivityLog.create({
                    action: 'refund_updated',
                    details: `Refund status: ${refund.status}`,
                    metadata: { refund_id: refund.id }
                });
                break;
            }

            // Log unhandled events for monitoring
            default: {
                console.log(`Unhandled event type: ${event.type}`);
                await base44.asServiceRole.entities.ActivityLog.create({
                    action: 'webhook_unhandled_event',
                    details: `Unhandled Stripe event: ${event.type}`,
                    metadata: { event_id: event.id }
                });
            }
        }

        return Response.json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return Response.json({ error: error.message }, { status: 400 });
    }
});