import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Download, 
    CreditCard, 
    Calendar, 
    FileText, 
    Check, 
    Clock, 
    AlertTriangle,
    Copy,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
    paid: { label: 'Bezahlt', icon: Check, color: 'bg-emerald-100 text-emerald-700' },
    pending: { label: 'Offen', icon: Clock, color: 'bg-amber-100 text-amber-700' },
    overdue: { label: 'Überfällig', icon: AlertTriangle, color: 'bg-red-100 text-red-700' }
};

export default function PaymentDetailDialog({ open, onOpenChange, payment, onPay }) {
    const [copied, setCopied] = React.useState(false);

    if (!payment) return null;

    const status = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
    const StatusIcon = status.icon;

    const bankDetails = {
        iban: 'DE89 3704 0044 0532 0130 00',
        bic: 'COBADEFFXXX',
        recipient: 'Hausverwaltung Mustermann GmbH',
        reference: payment.reference || `MIETE-${payment.id}-${new Date(payment.due_date).getMonth() + 1}`
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(`${label} kopiert!`);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-violet-600" />
                        Zahlungsdetails
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Amount & Status */}
                    <div className="text-center py-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Betrag</p>
                        <p className="text-3xl font-bold text-gray-900">
                            €{payment.amount?.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                        </p>
                        <Badge className={`mt-2 ${status.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                        </Badge>
                    </div>

                    {/* Payment Info */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-500">Beschreibung</span>
                            <span className="text-sm font-medium text-gray-900">{payment.description}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-500">Fälligkeitsdatum</span>
                            <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {new Date(payment.due_date).toLocaleDateString('de-DE', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                        {payment.paid_date && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Bezahlt am</span>
                                <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" />
                                    {new Date(payment.paid_date).toLocaleDateString('de-DE')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Bank Details for Pending Payments */}
                    {payment.status !== 'paid' && (
                        <div className="bg-violet-50 rounded-xl p-4 space-y-3">
                            <h4 className="font-semibold text-violet-900 text-sm">Bankverbindung</h4>
                            
                            {[
                                { label: 'Empfänger', value: bankDetails.recipient },
                                { label: 'IBAN', value: bankDetails.iban },
                                { label: 'BIC', value: bankDetails.bic },
                                { label: 'Verwendungszweck', value: bankDetails.reference }
                            ].map((item) => (
                                <div key={item.label} className="flex justify-between items-center">
                                    <span className="text-xs text-violet-700">{item.label}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-mono text-violet-900">{item.value}</span>
                                        <button
                                            onClick={() => copyToClipboard(item.value, item.label)}
                                            className="p-1 hover:bg-violet-100 rounded transition-colors"
                                        >
                                            <Copy className="w-3.5 h-3.5 text-violet-600" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        {payment.status !== 'paid' && onPay && (
                            <Button 
                                className="flex-1 bg-violet-600 hover:bg-violet-700"
                                onClick={() => {
                                    onPay(payment);
                                    onOpenChange(false);
                                }}
                            >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Jetzt bezahlen
                            </Button>
                        )}
                        <Button variant="outline" className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            PDF herunterladen
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}