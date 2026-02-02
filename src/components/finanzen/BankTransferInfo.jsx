import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Check, Building2, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function BankTransferInfo({ billingStatement, amount, onComplete, onCancel }) {
    const [recipientAccount, setRecipientAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copiedField, setCopiedField] = useState(null);

    useEffect(() => {
        loadRecipientAccount();
    }, [billingStatement.recipient_account_id]);

    const loadRecipientAccount = async () => {
        try {
            const accounts = await base44.entities.RecipientAccount.filter({
                id: billingStatement.recipient_account_id
            });
            
            if (accounts.length > 0) {
                setRecipientAccount(accounts[0]);
            }
        } catch (error) {
            console.error('Failed to load recipient account:', error);
            toast.error('Empfängerdaten konnten nicht geladen werden');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success('In Zwischenablage kopiert');
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleConfirmTransfer = async () => {
        try {
            // PaymentTransaction mit Status "pending" erstellen
            await base44.entities.PaymentTransaction.create({
                user_id: billingStatement.user_id,
                amount: amount,
                type: billingStatement.type === 'monatlich' ? 'miete' : 'nebenkosten',
                description: `Überweisung für ${billingStatement.period}`,
                status: 'pending',
                payment_method: 'bankueberweisung',
                payment_gateway: 'manuell',
                recipient_account_id: recipientAccount.id,
                billing_statement_id: billingStatement.id,
                reference: `${billingStatement.invoice_number || billingStatement.period}`,
                status_history: [{
                    status: 'pending',
                    timestamp: new Date().toISOString(),
                    note: 'Überweisung vom Mieter initiiert'
                }]
            });

            toast.success('Überweisung registriert. Bitte führen Sie die Überweisung durch.');
            onComplete();
        } catch (error) {
            console.error('Failed to register transfer:', error);
            toast.error('Fehler beim Registrieren der Überweisung');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    if (!recipientAccount || !recipientAccount.bank_details) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                Keine Bankverbindung hinterlegt. Bitte kontaktieren Sie die Hausverwaltung.
            </div>
        );
    }

    const { bank_details } = recipientAccount;

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-lg border border-violet-200">
                <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-violet-600" />
                    <h3 className="font-semibold text-gray-900">Banküberweisung</h3>
                </div>
                <p className="text-sm text-gray-600">
                    Bitte überweisen Sie den fälligen Betrag auf das unten angegebene Konto.
                </p>
            </div>

            <Card className="p-4 space-y-4">
                <div className="flex justify-between items-start pb-3 border-b">
                    <div>
                        <div className="text-sm text-gray-600">Zu zahlender Betrag</div>
                        <div className="text-3xl font-bold text-gray-900">{amount.toFixed(2)} €</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-600">Rechnung</div>
                        <div className="font-semibold">{billingStatement.invoice_number || billingStatement.period}</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <BankDetailRow
                        label="Empfänger"
                        value={bank_details.account_holder}
                        onCopy={() => copyToClipboard(bank_details.account_holder, 'holder')}
                        copied={copiedField === 'holder'}
                    />
                    
                    <BankDetailRow
                        label="IBAN"
                        value={bank_details.iban}
                        onCopy={() => copyToClipboard(bank_details.iban, 'iban')}
                        copied={copiedField === 'iban'}
                    />
                    
                    {bank_details.bic && (
                        <BankDetailRow
                            label="BIC"
                            value={bank_details.bic}
                            onCopy={() => copyToClipboard(bank_details.bic, 'bic')}
                            copied={copiedField === 'bic'}
                        />
                    )}
                    
                    {bank_details.bank_name && (
                        <BankDetailRow
                            label="Bank"
                            value={bank_details.bank_name}
                            onCopy={() => copyToClipboard(bank_details.bank_name, 'bank')}
                            copied={copiedField === 'bank'}
                        />
                    )}

                    <BankDetailRow
                        label="Verwendungszweck"
                        value={billingStatement.invoice_number || billingStatement.period}
                        onCopy={() => copyToClipboard(billingStatement.invoice_number || billingStatement.period, 'reference')}
                        copied={copiedField === 'reference'}
                        highlight
                    />
                </div>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-2">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Wichtig:</p>
                        <p>Bitte geben Sie den Verwendungszweck exakt wie angegeben an, damit Ihre Zahlung korrekt zugeordnet werden kann.</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                >
                    Abbrechen
                </Button>
                <Button
                    onClick={handleConfirmTransfer}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600"
                >
                    Überweisung bestätigen
                </Button>
            </div>
        </div>
    );
}

function BankDetailRow({ label, value, onCopy, copied, highlight }) {
    return (
        <div className={`flex justify-between items-center p-3 rounded-lg ${
            highlight ? 'bg-violet-50 border border-violet-200' : 'bg-gray-50'
        }`}>
            <div>
                <div className={`text-xs ${highlight ? 'text-violet-600 font-semibold' : 'text-gray-600'}`}>
                    {label}
                </div>
                <div className={`font-mono ${highlight ? 'font-bold text-violet-900' : 'text-gray-900'}`}>
                    {value}
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={onCopy}
                className="h-8 w-8"
            >
                {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                )}
            </Button>
        </div>
    );
}