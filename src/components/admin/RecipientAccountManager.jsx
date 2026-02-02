import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Building2, CreditCard, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function RecipientAccountManager() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        payment_provider: 'stripe',
        stripe_account_id: '',
        bank_details: {
            account_holder: '',
            iban: '',
            bic: '',
            bank_name: ''
        }
    });

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            const data = await base44.entities.RecipientAccount.list();
            setAccounts(data);
        } catch (error) {
            console.error('Failed to load accounts:', error);
            toast.error('Fehler beim Laden der Konten');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await base44.functions.invoke('createRecipientAccount', formData);
            
            if (response.data.success) {
                toast.success('Empfängerkonto erfolgreich erstellt');
                setShowDialog(false);
                loadAccounts();
                resetForm();
            }
        } catch (error) {
            console.error('Failed to create account:', error);
            toast.error('Fehler beim Erstellen des Kontos');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            payment_provider: 'stripe',
            stripe_account_id: '',
            bank_details: {
                account_holder: '',
                iban: '',
                bic: '',
                bank_name: ''
            }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Empfängerkonten</h2>
                    <p className="text-sm text-gray-600">Verwalten Sie Zahlungsempfänger</p>
                </div>
                <Button onClick={() => setShowDialog(true)} className="bg-violet-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Neues Konto
                </Button>
            </div>

            <div className="grid gap-4">
                {accounts.map((account) => (
                    <Card key={account.id} className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                                    {account.payment_provider === 'stripe' ? (
                                        <CreditCard className="w-6 h-6 text-violet-600" />
                                    ) : (
                                        <Building2 className="w-6 h-6 text-violet-600" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-gray-900">{account.name}</h3>
                                    <div className="flex gap-2 items-center">
                                        <Badge variant="outline" className="text-xs">
                                            {account.payment_provider.toUpperCase()}
                                        </Badge>
                                        {account.verification_status === 'verifiziert' ? (
                                            <Badge className="bg-green-100 text-green-800">
                                                <Check className="w-3 h-3 mr-1" />
                                                Verifiziert
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-yellow-100 text-yellow-800">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                Nicht verifiziert
                                            </Badge>
                                        )}
                                    </div>
                                    {account.stripe_account_id && (
                                        <p className="text-sm text-gray-500 font-mono">
                                            {account.stripe_account_id}
                                        </p>
                                    )}
                                    {account.bank_details?.iban && (
                                        <p className="text-sm text-gray-500 font-mono">
                                            {account.bank_details.iban}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Badge variant={account.is_active ? "default" : "secondary"}>
                                {account.is_active ? 'Aktiv' : 'Inaktiv'}
                            </Badge>
                        </div>
                    </Card>
                ))}

                {accounts.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>Noch keine Empfängerkonten vorhanden</p>
                        <p className="text-sm mt-1">Erstellen Sie ein Konto, um Zahlungen zu empfangen</p>
                    </div>
                )}
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Neues Empfängerkonto erstellen</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Name des Empfängers</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="z.B. Hausverwaltung Müller GmbH"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Zahlungsanbieter</Label>
                            <Select
                                value={formData.payment_provider}
                                onValueChange={(value) => setFormData({ ...formData, payment_provider: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="stripe">Stripe</SelectItem>
                                    <SelectItem value="bank">Banküberweisung</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.payment_provider === 'stripe' && (
                            <div className="space-y-2">
                                <Label>Stripe Connect Account ID</Label>
                                <Input
                                    value={formData.stripe_account_id}
                                    onChange={(e) => setFormData({ ...formData, stripe_account_id: e.target.value })}
                                    placeholder="acct_..."
                                    required={formData.payment_provider === 'stripe'}
                                />
                                <p className="text-xs text-gray-500">
                                    Erstellen Sie einen Stripe Connect Account im Stripe Dashboard
                                </p>
                            </div>
                        )}

                        {formData.payment_provider === 'bank' && (
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-sm text-gray-900">Bankverbindung</h4>
                                
                                <div className="space-y-2">
                                    <Label>Kontoinhaber</Label>
                                    <Input
                                        value={formData.bank_details.account_holder}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            bank_details: { ...formData.bank_details, account_holder: e.target.value }
                                        })}
                                        required={formData.payment_provider === 'bank'}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>IBAN</Label>
                                    <Input
                                        value={formData.bank_details.iban}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            bank_details: { ...formData.bank_details, iban: e.target.value }
                                        })}
                                        placeholder="DE89 3704 0044 0532 0130 00"
                                        required={formData.payment_provider === 'bank'}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>BIC</Label>
                                        <Input
                                            value={formData.bank_details.bic}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                bank_details: { ...formData.bank_details, bic: e.target.value }
                                            })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Bankname</Label>
                                        <Input
                                            value={formData.bank_details.bank_name}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                bank_details: { ...formData.bank_details, bank_name: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowDialog(false)}
                                className="flex-1"
                            >
                                Abbrechen
                            </Button>
                            <Button type="submit" className="flex-1 bg-violet-600">
                                Konto erstellen
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}