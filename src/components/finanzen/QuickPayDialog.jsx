import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
    CreditCard, 
    Building2, 
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import StripePaymentForm from './StripePaymentForm';
import BankTransferInfo from './BankTransferInfo';

const PAYMENT_METHODS = [
    {
        id: 'card',
        label: 'Kredit-/Debitkarte',
        icon: CreditCard,
        description: 'Visa, Mastercard, etc.',
        popular: true
    },
    {
        id: 'bank',
        label: 'Banküberweisung',
        icon: Building2,
        description: 'Manuell überweisen',
        popular: false
    }
];

export default function QuickPayDialog({ open, onOpenChange, payment, onPaymentComplete }) {
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('card');

    if (!payment) return null;

    const handlePaymentSuccess = (data) => {
        setStep(3);
        setTimeout(() => {
            onPaymentComplete?.(payment);
            toast.success('Zahlung erfolgreich!');
            onOpenChange(false);
            setStep(1);
        }, 2000);
    };

    const handleBankTransferComplete = () => {
        onPaymentComplete?.(payment);
        onOpenChange(false);
        setStep(1);
    };

    const resetDialog = () => {
        setStep(1);
        setPaymentMethod('card');
    };

    return (
        <Dialog open={open} onOpenChange={(open) => {
            if (!open) resetDialog();
            onOpenChange(open);
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-violet-600" />
                        {step === 3 ? 'Zahlung erfolgreich' : 'Schnell bezahlen'}
                    </DialogTitle>
                </DialogHeader>

                <AnimatePresence mode="wait">
                    {/* Step 1: Payment Method Selection */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            {/* Amount */}
                            <div className="text-center py-4 bg-violet-50 rounded-xl">
                                <p className="text-sm text-violet-600 mb-1">Zu zahlender Betrag</p>
                                <p className="text-3xl font-bold text-violet-900">
                                    €{payment.amount?.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-sm text-violet-600 mt-1">{payment.description}</p>
                            </div>

                            {/* Payment Methods */}
                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                                <div className="space-y-2">
                                    {PAYMENT_METHODS.map((method) => (
                                        <label
                                            key={method.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                                paymentMethod === method.id 
                                                    ? 'border-violet-500 bg-violet-50' 
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <RadioGroupItem value={method.id} className="sr-only" />
                                            <div className={`p-2 rounded-lg ${
                                                paymentMethod === method.id ? 'bg-violet-100' : 'bg-gray-100'
                                            }`}>
                                                <method.icon className={`w-5 h-5 ${
                                                    paymentMethod === method.id ? 'text-violet-600' : 'text-gray-500'
                                                }`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-900">{method.label}</p>
                                                    {method.popular && (
                                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                                            Empfohlen
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">{method.description}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                paymentMethod === method.id 
                                                    ? 'border-violet-500 bg-violet-500' 
                                                    : 'border-gray-300'
                                            }`}>
                                                {paymentMethod === method.id && (
                                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </RadioGroup>

                            <Button 
                                className="w-full bg-violet-600 hover:bg-violet-700"
                                onClick={() => setStep(2)}
                            >
                                Weiter
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </motion.div>
                    )}

                    {/* Step 2: Payment Details */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            {paymentMethod === 'card' ? (
                                <StripePaymentForm
                                    billingStatement={payment}
                                    amount={payment.amount}
                                    onSuccess={handlePaymentSuccess}
                                    onCancel={() => setStep(1)}
                                />
                            ) : (
                                <BankTransferInfo
                                    billingStatement={payment}
                                    amount={payment.amount}
                                    onComplete={handleBankTransferComplete}
                                    onCancel={() => setStep(1)}
                                />
                            )}
                        </motion.div>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                            </motion.div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Zahlung erfolgreich!
                            </h3>
                            <p className="text-gray-500">
                                €{payment.amount?.toFixed(2)} für "{payment.description}" bezahlt.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}