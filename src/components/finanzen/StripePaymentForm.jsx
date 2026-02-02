import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// Diese Komponente wird innerhalb des Stripe Elements Providers gerendert
function CheckoutForm({ billingStatement, amount, onSuccess, onCancel }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            // Payment Element submission
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setMessage(submitError.message);
                setLoading(false);
                return;
            }

            // PaymentMethod erstellen
            const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
                elements,
            });

            if (paymentMethodError) {
                setMessage(paymentMethodError.message);
                setLoading(false);
                return;
            }

            // Backend-Funktion aufrufen
            const response = await base44.functions.invoke('processPayment', {
                billing_statement_id: billingStatement.id,
                payment_method_type: 'card',
                payment_method_id: paymentMethod.id,
                amount: amount
            });

            if (response.data.success) {
                toast.success('Zahlung erfolgreich!');
                onSuccess(response.data);
            } else {
                setMessage(response.data.error || 'Zahlung fehlgeschlagen');
                toast.error('Zahlung fehlgeschlagen');
            }

        } catch (error) {
            console.error('Payment error:', error);
            setMessage(error.message || 'Ein Fehler ist aufgetreten');
            toast.error('Zahlung fehlgeschlagen');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Zu zahlender Betrag</span>
                    <span className="text-2xl font-bold text-gray-900">{amount.toFixed(2)} €</span>
                </div>
                <div className="text-xs text-gray-500">
                    Rechnung {billingStatement.invoice_number || billingStatement.period}
                </div>
            </div>

            <PaymentElement />

            {message && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {message}
                </div>
            )}

            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1"
                >
                    Abbrechen
                </Button>
                <Button
                    type="submit"
                    disabled={!stripe || loading}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Wird verarbeitet...
                        </>
                    ) : (
                        <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            {amount.toFixed(2)} € jetzt zahlen
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}

export default function StripePaymentForm({ billingStatement, amount, onSuccess, onCancel }) {
    const [stripePromise, setStripePromise] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStripeConfig();
    }, []);

    const loadStripeConfig = async () => {
        try {
            const response = await base44.functions.invoke('getStripePublishableKey');
            const { publishableKey } = response.data;
            
            if (publishableKey) {
                setStripePromise(loadStripe(publishableKey));
            } else {
                toast.error('Stripe Konfiguration fehlt');
            }
        } catch (error) {
            console.error('Failed to load Stripe config:', error);
            toast.error('Stripe konnte nicht geladen werden');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
        );
    }

    if (!stripePromise) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                Stripe ist nicht konfiguriert. Bitte kontaktieren Sie die Verwaltung.
            </div>
        );
    }

    const options = {
        mode: 'payment',
        amount: Math.round(amount * 100),
        currency: 'eur',
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#8b5cf6',
            }
        }
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            <CheckoutForm 
                billingStatement={billingStatement}
                amount={amount}
                onSuccess={onSuccess}
                onCancel={onCancel}
            />
        </Elements>
    );
}