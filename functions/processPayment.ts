import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.4.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            billing_statement_id, 
            payment_method_type, // 'card', 'sepa_debit', 'paypal'
            payment_method_id,   // Token/ID vom Frontend
            amount 
        } = await req.json();

        // BillingStatement laden
        const billingStatement = await base44.entities.BillingStatement.get(billing_statement_id);
        
        if (!billingStatement || billingStatement.user_id !== user.id) {
            return Response.json({ error: 'Billing statement not found or access denied' }, { status: 404 });
        }

        // RecipientAccount laden
        const recipientAccount = await base44.asServiceRole.entities.RecipientAccount.get(
            billingStatement.recipient_account_id
        );

        if (!recipientAccount || !recipientAccount.stripe_account_id) {
            return Response.json({ 
                error: 'Recipient account not configured for Stripe payments' 
            }, { status: 400 });
        }

        // Zahlung bei Stripe erstellen (mit Transfer zum Connected Account)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // In Cents
            currency: 'eur',
            payment_method: payment_method_id,
            confirm: true,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never'
            },
            transfer_data: {
                destination: recipientAccount.stripe_account_id,
            },
            metadata: {
                user_id: user.id,
                billing_statement_id: billing_statement_id,
                user_email: user.email
            }
        });

        // PaymentTransaction in Datenbank erstellen
        const transaction = await base44.entities.PaymentTransaction.create({
            user_id: user.id,
            amount: amount,
            type: billingStatement.type === 'monatlich' ? 'miete' : 'nebenkosten',
            description: `Zahlung für ${billingStatement.period}`,
            status: paymentIntent.status === 'succeeded' ? 'bezahlt' : 'pending',
            payment_method: payment_method_type === 'card' ? 'kreditkarte' : payment_method_type,
            payment_gateway: 'stripe',
            payment_gateway_id: paymentIntent.id,
            recipient_account_id: recipientAccount.id,
            billing_statement_id: billing_statement_id,
            paid_date: paymentIntent.status === 'succeeded' ? new Date().toISOString().split('T')[0] : null,
            fee_amount: 0,
            status_history: [{
                status: paymentIntent.status,
                timestamp: new Date().toISOString(),
                note: 'Payment created'
            }],
            metadata: {
                stripe_payment_intent_id: paymentIntent.id
            }
        });

        // Wenn Zahlung erfolgreich, BillingStatement aktualisieren
        if (paymentIntent.status === 'succeeded') {
            const newPaidAmount = (billingStatement.paid_amount || 0) + amount;
            const newOutstandingAmount = billingStatement.total_amount - newPaidAmount;
            
            await base44.entities.BillingStatement.update(billing_statement_id, {
                paid_amount: newPaidAmount,
                outstanding_amount: newOutstandingAmount,
                status: newOutstandingAmount <= 0 ? 'bezahlt' : 'teilbezahlt',
                settled_date: newOutstandingAmount <= 0 ? new Date().toISOString() : billingStatement.settled_date,
                transactions: [...(billingStatement.transactions || []), transaction.id]
            });
        }

        return Response.json({
            success: true,
            transaction_id: transaction.id,
            payment_status: paymentIntent.status,
            client_secret: paymentIntent.client_secret
        });

    } catch (error) {
        console.error('Payment processing error:', error);
        return Response.json({ 
            error: error.message || 'Payment processing failed',
            details: error.raw?.message 
        }, { status: 500 });
    }
});