import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RecipientAccountManager from '../components/admin/RecipientAccountManager';

export default function AdminPayments() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const currentUser = await base44.auth.me();
            
            if (!currentUser || currentUser.role !== 'admin') {
                navigate('/');
                return;
            }
            
            setUser(currentUser);
        } catch (error) {
            console.error('Auth check failed:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Zahlungsverwaltung</h1>
                            <p className="text-sm text-gray-600">Admin-Bereich für Zahlungseinstellungen</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <Tabs defaultValue="accounts" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="accounts">Empfängerkonten</TabsTrigger>
                        <TabsTrigger value="settings">Einstellungen</TabsTrigger>
                    </TabsList>

                    <TabsContent value="accounts">
                        <RecipientAccountManager />
                    </TabsContent>

                    <TabsContent value="settings">
                        <div className="bg-white rounded-lg border p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Stripe Webhook Konfiguration</h3>
                            <div className="space-y-4 text-sm text-gray-600">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="font-semibold text-blue-900 mb-2">Webhook-URL:</p>
                                    <code className="block bg-white p-2 rounded border text-xs font-mono break-all">
                                        {window.location.origin}/functions/handleStripeWebhook
                                    </code>
                                </div>
                                
                                <div>
                                    <p className="font-semibold text-gray-900 mb-2">Events zum Abhören:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li>payment_intent.succeeded</li>
                                        <li>payment_intent.payment_failed</li>
                                    </ul>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-yellow-900">
                                        ⚠️ Konfigurieren Sie diese Webhook-URL in Ihrem Stripe Dashboard unter 
                                        <strong> Developers → Webhooks</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}