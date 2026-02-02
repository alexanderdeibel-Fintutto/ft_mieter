import React from 'react';
import { Check, Clock, AlertTriangle, ChevronRight, CreditCard, FileText, Zap, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const PAYMENT_TYPES = {
    rent: { icon: Home, label: 'Miete', color: 'bg-violet-100 text-violet-600' },
    utilities: { icon: Zap, label: 'Nebenkosten', color: 'bg-blue-100 text-blue-600' },
    deposit: { icon: CreditCard, label: 'Kaution', color: 'bg-emerald-100 text-emerald-600' },
    other: { icon: FileText, label: 'Sonstiges', color: 'bg-gray-100 text-gray-600' }
};

const STATUS_CONFIG = {
    paid: {
        label: 'Bezahlt',
        icon: Check,
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        badgeColor: 'bg-emerald-100 text-emerald-700',
        iconColor: 'text-emerald-600'
    },
    pending: {
        label: 'Offen',
        icon: Clock,
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        badgeColor: 'bg-amber-100 text-amber-700',
        iconColor: 'text-amber-600'
    },
    overdue: {
        label: 'Überfällig',
        icon: AlertTriangle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        badgeColor: 'bg-red-100 text-red-700',
        iconColor: 'text-red-600'
    }
};

export default function PaymentCard({ payment, onPay, onViewDetails, index = 0 }) {
    const status = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
    const paymentType = PAYMENT_TYPES[payment.type] || PAYMENT_TYPES.other;
    const StatusIcon = status.icon;
    const TypeIcon = paymentType.icon;

    const dueDate = new Date(payment.due_date);
    const isUpcoming = payment.status === 'pending' && dueDate > new Date();
    const daysUntilDue = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white rounded-xl border ${status.borderColor} p-4 hover:shadow-md transition-all duration-200`}
        >
            <div className="flex items-start gap-3">
                {/* Type Icon */}
                <div className={`p-2.5 rounded-xl ${paymentType.color}`}>
                    <TypeIcon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="font-semibold text-gray-900 truncate">
                                {payment.description || paymentType.label}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {dueDate.toLocaleDateString('de-DE', { 
                                    day: 'numeric',
                                    month: 'long', 
                                    year: 'numeric' 
                                })}
                            </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold text-gray-900">
                                €{payment.amount?.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                            </p>
                            <Badge className={`${status.badgeColor} font-medium`}>
                                <StatusIcon className={`w-3 h-3 mr-1 ${status.iconColor}`} />
                                {status.label}
                            </Badge>
                        </div>
                    </div>

                    {/* Additional Info & Actions */}
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {payment.reference && (
                                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                    Ref: {payment.reference}
                                </span>
                            )}
                            {isUpcoming && daysUntilDue <= 7 && (
                                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded font-medium">
                                    Fällig in {daysUntilDue} {daysUntilDue === 1 ? 'Tag' : 'Tagen'}
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {payment.status !== 'paid' && onPay && (
                                <Button 
                                    size="sm" 
                                    onClick={() => onPay(payment)}
                                    className="bg-violet-600 hover:bg-violet-700 text-white"
                                >
                                    <CreditCard className="w-4 h-4 mr-1" />
                                    Bezahlen
                                </Button>
                            )}
                            {onViewDetails && (
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => onViewDetails(payment)}
                                    className="text-gray-500"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}