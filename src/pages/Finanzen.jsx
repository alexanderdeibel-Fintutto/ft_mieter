import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Wallet, 
    Bell, 
    Settings, 
    Plus, 
    FileText,
    BarChart3,
    CreditCard,
    ChevronRight,
    Download,
    Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAuth from '../components/useAuth';
import { supabase } from '../components/services/supabase';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

// Import components
import PaymentOverview from '../components/finanzen/PaymentOverview';
import PaymentHistory from '../components/finanzen/PaymentHistory';
import PaymentDetailDialog from '../components/finanzen/PaymentDetailDialog';
import UtilityCostBreakdown from '../components/finanzen/UtilityCostBreakdown';
import PaymentReminderSettings from '../components/finanzen/PaymentReminderSettings';
import QuickPayDialog from '../components/finanzen/QuickPayDialog';
import RentContractInfo from '../components/finanzen/RentContractInfo';
import BillingStatementsSection from '../components/finanzen/BillingStatementsSection';
import PaymentWarningBanner from '../components/finanzen/PaymentWarningBanner';

// Demo payments data
const DEMO_PAYMENTS = [
    { id: 1, description: 'Miete Januar 2026', amount: 850, due_date: '2026-01-01', status: 'paid', type: 'rent', paid_date: '2025-12-28', reference: 'MIETE-2026-01' },
    { id: 2, description: 'Miete Februar 2026', amount: 850, due_date: '2026-02-01', status: 'pending', type: 'rent', reference: 'MIETE-2026-02' },
    { id: 3, description: 'Nebenkosten Q4 2025', amount: 320, due_date: '2026-01-15', status: 'pending', type: 'utilities', reference: 'NK-Q4-2025' },
    { id: 4, description: 'Miete Dezember 2025', amount: 850, due_date: '2025-12-01', status: 'paid', type: 'rent', paid_date: '2025-11-29', reference: 'MIETE-2025-12' },
    { id: 5, description: 'Miete November 2025', amount: 850, due_date: '2025-11-01', status: 'paid', type: 'rent', paid_date: '2025-10-30', reference: 'MIETE-2025-11' },
    { id: 6, description: 'Nebenkosten Q3 2025', amount: 295, due_date: '2025-10-15', status: 'paid', type: 'utilities', paid_date: '2025-10-14', reference: 'NK-Q3-2025' },
    { id: 7, description: 'Miete Oktober 2025', amount: 850, due_date: '2025-10-01', status: 'paid', type: 'rent', paid_date: '2025-09-29', reference: 'MIETE-2025-10' },
    { id: 8, description: 'Miete September 2025', amount: 850, due_date: '2025-09-01', status: 'paid', type: 'rent', paid_date: '2025-08-30', reference: 'MIETE-2025-09' },
    { id: 9, description: 'Miete August 2025', amount: 850, due_date: '2025-08-01', status: 'paid', type: 'rent', paid_date: '2025-07-30', reference: 'MIETE-2025-08' },
    { id: 10, description: 'Nebenkosten Q2 2025', amount: 280, due_date: '2025-07-15', status: 'paid', type: 'utilities', paid_date: '2025-07-14', reference: 'NK-Q2-2025' },
];

export default function Finanzen() {
    const navigate = useNavigate();
    const { user, supabaseProfile, loading: authLoading } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Dialog states
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showPaymentDetail, setShowPaymentDetail] = useState(false);
    const [showReminderSettings, setShowReminderSettings] = useState(false);
    const [showQuickPay, setShowQuickPay] = useState(false);
    const [paymentToPay, setPaymentToPay] = useState(null);
    const [billingStatements, setBillingStatements] = useState([]);
    
    // Reminder settings
    const [reminderSettings, setReminderSettings] = useState({
        enabled: true,
        daysBefore: '3',
        pushNotification: true,
        emailNotification: true,
        repeatReminder: false,
        autoPayEnabled: false
    });

    useEffect(() => {
        if (!authLoading && !user) {
            navigate(createPageUrl('Register'));
            return;
        }
        if (user) {
            loadPayments();
            loadBillingStatements();
        }
    }, [user, authLoading]);

    const loadBillingStatements = async () => {
        try {
            const statements = await base44.entities.BillingStatement.filter(
                { user_id: user.id || user.email }, 
                '-period'
            );
            if (statements && statements.length > 0) {
                setBillingStatements(statements);
            } else {
                // Demo billing statements
                setBillingStatements([
                    {
                        id: '1',
                        user_id: user.id,
                        period: '2025',
                        type: 'nebenkostenabrechnung',
                        total_amount: 1180,
                        paid_amount: 1200,
                        outstanding_amount: -20,
                        status: 'bezahlt',
                        due_date: '2025-12-31',
                        document_url: null
                    },
                    {
                        id: '2',
                        user_id: user.id,
                        period: '2026-01',
                        type: 'monatlich',
                        total_amount: 1170,
                        paid_amount: 850,
                        outstanding_amount: 320,
                        status: 'teilbezahlt',
                        due_date: '2026-01-31',
                        document_url: null
                    }
                ]);
            }
        } catch (error) {
            console.error('Fehler beim Laden der Abrechnungen:', error);
        }
    };

    const loadPayments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('tenant_payments')
            .select('*')
            .eq('tenant_id', user.id)
            .order('due_date', { ascending: false });
        
        if (!error && data && data.length > 0) {
            setPayments(data);
        } else {
            setPayments(DEMO_PAYMENTS);
        }
        setLoading(false);
    };

    const handleViewPaymentDetails = (payment) => {
        setSelectedPayment(payment);
        setShowPaymentDetail(true);
    };

    const handlePay = (payment) => {
        setPaymentToPay(payment);
        setShowQuickPay(true);
    };

    const handlePaymentComplete = (payment) => {
        // Update payment status locally
        setPayments(prev => prev.map(p => 
            p.id === payment.id 
                ? { ...p, status: 'paid', paid_date: new Date().toISOString() }
                : p
        ));
    };

    // Calculate stats
    const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalOpen = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const nextPayment = payments.find(p => p.status === 'pending');
    const monthlyRent = supabaseProfile?.rent_amount || 850;

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-100 rounded-xl">
                                <Wallet className="w-6 h-6 text-violet-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Finanzen</h1>
                                <p className="text-xs text-gray-500">Überblick & Zahlungen</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setShowReminderSettings(true)}
                            >
                                <Bell className="w-5 h-5 text-gray-500" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full justify-start px-4 h-12 bg-transparent border-0">
                        <TabsTrigger 
                            value="overview" 
                            className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Übersicht
                        </TabsTrigger>
                        <TabsTrigger 
                            value="payments"
                            className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"
                        >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Zahlungen
                        </TabsTrigger>
                        <TabsTrigger 
                            value="contract"
                            className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Vertrag
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </header>

            {/* Content */}
            <main className="p-4 space-y-4 pb-24">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="m-0 space-y-4">
                        {/* Payment Warnings */}
                        {totalOverdue > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <PaymentWarningBanner
                                    type="overdue"
                                    message="Zahlungen überfällig!"
                                    amount={totalOverdue}
                                    onAction={() => {
                                        if (nextPayment) handlePay(nextPayment);
                                    }}
                                    actionLabel="Sofort bezahlen"
                                />
                            </motion.div>
                        )}

                        {totalOpen > 0 && totalOverdue === 0 && nextPayment?.due_date && new Date(nextPayment.due_date) - new Date() < 3 * 24 * 60 * 60 * 1000 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <PaymentWarningBanner
                                    type="due-soon"
                                    message="Zahlung fällig in den nächsten 3 Tagen"
                                    amount={totalOpen}
                                    dueDate={nextPayment?.due_date}
                                    onAction={() => handlePay(nextPayment)}
                                />
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <PaymentOverview
                                totalPaid={totalPaid}
                                totalOpen={totalOpen}
                                totalOverdue={totalOverdue}
                                monthlyRent={monthlyRent}
                                nextPaymentDate={nextPayment?.due_date}
                            />
                        </motion.div>

                        {/* Quick Actions */}
                        {totalOpen > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="p-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl text-white"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-violet-100">Offene Zahlungen</p>
                                        <p className="text-2xl font-bold">€{totalOpen.toFixed(2)}</p>
                                    </div>
                                    <Button 
                                        className="bg-white text-violet-600 hover:bg-violet-50"
                                        onClick={() => {
                                            if (nextPayment) handlePay(nextPayment);
                                        }}
                                    >
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Jetzt bezahlen
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <UtilityCostBreakdown />
                        </motion.div>

                        {/* Recent Payments Preview */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-xl border p-4"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900">Letzte Zahlungen</h3>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setActiveTab('payments')}
                                >
                                    Alle anzeigen
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {payments.slice(0, 3).map((payment, index) => (
                                    <div 
                                        key={payment.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => handleViewPaymentDetails(payment)}
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{payment.description}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(payment.due_date).toLocaleDateString('de-DE')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">€{payment.amount?.toFixed(2)}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                payment.status === 'paid' 
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : payment.status === 'overdue'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {payment.status === 'paid' ? 'Bezahlt' : payment.status === 'overdue' ? 'Überfällig' : 'Offen'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </TabsContent>

                    {/* Payments Tab */}
                    <TabsContent value="payments" className="m-0">
                        <PaymentHistory
                            payments={payments}
                            onPaymentSelect={handleViewPaymentDetails}
                            onPay={handlePay}
                        />
                    </TabsContent>

                    {/* Contract Tab */}
                    <TabsContent value="contract" className="m-0 space-y-4">
                        <RentContractInfo 
                            onViewContract={() => navigate(createPageUrl('Vertrag'))}
                        />
                        
                        {/* Billing Statements Section */}
                        <BillingStatementsSection statements={billingStatements} />
                    </TabsContent>
                </Tabs>
            </main>

            {/* Dialogs */}
            <PaymentDetailDialog
                open={showPaymentDetail}
                onOpenChange={setShowPaymentDetail}
                payment={selectedPayment}
                onPay={handlePay}
            />

            <PaymentReminderSettings
                open={showReminderSettings}
                onOpenChange={setShowReminderSettings}
                settings={reminderSettings}
                onSave={setReminderSettings}
            />

            <QuickPayDialog
                open={showQuickPay}
                onOpenChange={setShowQuickPay}
                payment={paymentToPay}
                onPaymentComplete={handlePaymentComplete}
            />
        </div>
    );
}