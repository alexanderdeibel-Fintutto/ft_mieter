import React from 'react';
import { AlertCircle, Clock, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentWarningBanner({ type, message, onAction, actionLabel = 'Jetzt bezahlen', amount, dueDate }) {
    const getConfig = () => {
        switch (type) {
            case 'overdue':
                return {
                    icon: <AlertCircle className="w-6 h-6 text-red-600" />,
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    text: 'text-red-900',
                    button: 'bg-red-600 hover:bg-red-700'
                };
            case 'due-soon':
                return {
                    icon: <Clock className="w-6 h-6 text-amber-600" />,
                    bg: 'bg-amber-50',
                    border: 'border-amber-200',
                    text: 'text-amber-900',
                    button: 'bg-amber-600 hover:bg-amber-700'
                };
            case 'payment-plan':
                return {
                    icon: <TrendingDown className="w-6 h-6 text-orange-600" />,
                    bg: 'bg-orange-50',
                    border: 'border-orange-200',
                    text: 'text-orange-900',
                    button: 'bg-orange-600 hover:bg-orange-700'
                };
            default:
                return {
                    icon: <AlertCircle className="w-6 h-6 text-gray-600" />,
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    text: 'text-gray-900',
                    button: 'bg-gray-600 hover:bg-gray-700'
                };
        }
    };

    const config = getConfig();

    return (
        <div className={`${config.bg} border ${config.border} rounded-xl p-4`}>
            <div className="flex items-start gap-3">
                {config.icon}
                <div className="flex-1">
                    <p className={`font-semibold ${config.text} mb-1`}>{message}</p>
                    {amount && (
                        <p className={`text-sm ${config.text} mb-3`}>
                            Fälliger Betrag: <span className="font-bold">€{amount.toFixed(2)}</span>
                            {dueDate && <span> • Fällig am: {new Date(dueDate).toLocaleDateString('de-DE')}</span>}
                        </p>
                    )}
                    <Button
                        onClick={onAction}
                        className={`${config.button} text-white`}
                        size="sm"
                    >
                        {actionLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}