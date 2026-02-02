import React, { useState } from 'react';
import { useSubscription } from '@/components/integrations/stripe';
import { useFeatureLimits, useTrackFeatureUsage } from '@/components/featuregate/useFeatureLimits';
import FeatureGateGuard from '@/components/featuregate/FeatureGateGuard';
import LimitReachedBanner from '@/components/featuregate/LimitReachedBanner';
import EnhancedUsageProgressBar from '@/components/featuregate/EnhancedUsageProgressBar';
import LetterPreviewPanel from '@/components/letterxpress/LetterPreviewPanel';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const LETTER_TYPES = [
    { value: 'standard', label: 'Standard (schwarz-weiß)', price: 0.89 },
    { value: 'colored', label: 'Farbig', price: 1.99 },
    { value: 'duplex', label: 'Beidseitig', price: 0.99 }
];

export default function LetterXpressPage() {
    const { subscriptionTier } = useSubscription();
    const { usage: letterCount, remaining, allowed } = useFeatureLimits('letterXpressLetters');
    const trackUsage = useTrackFeatureUsage('letterXpressLetters');
    
    const [formData, setFormData] = useState({
        recipientName: '',
        recipientStreet: '',
        recipientPostalCode: '',
        recipientCity: '',
        content: '',
        letterType: 'standard',
        senderName: '',
        senderStreet: '',
        senderPostalCode: '',
        senderCity: ''
    });
    const [loading, setLoading] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [sentLetters, setSentLetters] = useState([]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSendLetter = async (e) => {
        e.preventDefault();

        if (!allowed) {
            setShowUpgradeModal(true);
            return;
        }

        // Validation
        if (!formData.recipientName || !formData.recipientStreet || !formData.recipientPostalCode || !formData.recipientCity) {
            toast.error('Bitte fülle alle Empfänger-Felder aus');
            return;
        }

        if (!formData.content) {
            toast.error('Bitte schreibe den Brief-Inhalt');
            return;
        }

        setLoading(true);

        try {
            const response = await base44.functions.invoke('letterxpressIntegration', {
                letter_type: formData.letterType,
                recipient_name: formData.recipientName,
                recipient_street: formData.recipientStreet,
                recipient_postal_code: formData.recipientPostalCode,
                recipient_city: formData.recipientCity,
                content_html: `<html><body><pre>${formData.content}</pre></body></html>`,
                sender_name: formData.senderName,
                sender_street: formData.senderStreet,
                sender_postal_code: formData.senderPostalCode,
                sender_city: formData.senderCity
            });

            if (response.data.success) {
                // Track sent letter
                setSentLetters(prev => [{
                    id: response.data.id,
                    recipient: `${formData.recipientName}, ${formData.recipientCity}`,
                    type: formData.letterType,
                    cost: response.data.cost,
                    timestamp: new Date(),
                    status: 'sent'
                }, ...prev]);

                toast.success(`Brief versendet! Kosten: €${response.data.cost}`, {
                    description: 'Tracking-ID: ' + response.data.id,
                    duration: 5000
                });
                trackUsage({ letterType: formData.letterType, cost: response.data.cost });
                
                // Reset form
                setFormData({
                    recipientName: '', recipientStreet: '', recipientPostalCode: '', recipientCity: '',
                    content: '', letterType: 'standard',
                    senderName: '', senderStreet: '', senderPostalCode: '', senderCity: ''
                });
            } else {
                toast.error(response.data.message || 'Fehler beim Versenden', {
                    description: 'Bitte überprüfe deine Angaben und versuche es später erneut.'
                });
            }
        } catch (error) {
            console.error(error);
            toast.error('Brief konnte nicht versendet werden', {
                description: 'Ein technischer Fehler ist aufgetreten. Bitte versuche es später erneut.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Briefe versenden</h1>
                    <p className="text-gray-600">Versende wichtige Briefe direkt von der App mit LetterXpress</p>
                </div>

                {/* Usage Progress */}
                <div className="mb-6">
                    <EnhancedUsageProgressBar
                        current={letterCount}
                        limit={subscriptionTier === 'basic' ? 3 : subscriptionTier === 'pro' ? 10 : -1}
                        label="Monatliches Limit"
                        tier={subscriptionTier}
                        description={subscriptionTier === 'basic' 
                            ? '3 Briefe pro Monat. Upgrade für mehr Briefe.' 
                            : subscriptionTier === 'pro'
                            ? '10 Briefe pro Monat'
                            : 'Unbegrenzte Briefe'}
                    />
                </div>

                {!allowed && (
                    <LimitReachedBanner
                        feature="Briefe"
                        currentLimit={letterCount}
                        maxLimit={-1}
                        message={`Du hast dein Limit für LetterXpress-Briefe in diesem Monat erreicht (${remaining}/${subscriptionTier === 'basic' ? 3 : subscriptionTier === 'pro' ? 10 : '∞'})`}
                        onUpgradeClick={() => setShowUpgradeModal(true)}
                        severity="error"
                        tier={subscriptionTier}
                    />
                )}

            <FeatureGateGuard
                feature="letterXpressLetters"
                currentUsage={letterCount}
                showBannerOnLimit={false}
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Letter Type Selection */}
                        <Card>
                        <CardHeader>
                            <CardTitle>Brief-Typ</CardTitle>
                            <CardDescription>Wähle das Format für deinen Brief</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {LETTER_TYPES.map(type => (
                                    <label key={type.value} className="relative">
                                        <input
                                            type="radio"
                                            name="letterType"
                                            value={type.value}
                                            checked={formData.letterType === type.value}
                                            onChange={(e) => handleInputChange('letterType', e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                                            formData.letterType === type.value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                            <div className="font-medium text-sm mb-1">{type.label}</div>
                                            <div className="text-lg font-bold text-blue-600">€{type.price.toFixed(2)}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recipient */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Empfänger</CardTitle>
                            <CardDescription>Adresse des Empfängers</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder="Name"
                                value={formData.recipientName}
                                onChange={(e) => handleInputChange('recipientName', e.target.value)}
                            />
                            <Input
                                placeholder="Straße und Hausnummer"
                                value={formData.recipientStreet}
                                onChange={(e) => handleInputChange('recipientStreet', e.target.value)}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    placeholder="Postleitzahl"
                                    value={formData.recipientPostalCode}
                                    onChange={(e) => handleInputChange('recipientPostalCode', e.target.value)}
                                />
                                <Input
                                    placeholder="Stadt"
                                    value={formData.recipientCity}
                                    onChange={(e) => handleInputChange('recipientCity', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sender */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Absender (optional)</CardTitle>
                            <CardDescription>Deine Adresse - wenn nicht ausgefüllt, wird deine Standard-Adresse verwendet</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder="Name"
                                value={formData.senderName}
                                onChange={(e) => handleInputChange('senderName', e.target.value)}
                            />
                            <Input
                                placeholder="Straße und Hausnummer"
                                value={formData.senderStreet}
                                onChange={(e) => handleInputChange('senderStreet', e.target.value)}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    placeholder="Postleitzahl"
                                    value={formData.senderPostalCode}
                                    onChange={(e) => handleInputChange('senderPostalCode', e.target.value)}
                                />
                                <Input
                                    placeholder="Stadt"
                                    value={formData.senderCity}
                                    onChange={(e) => handleInputChange('senderCity', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Inhalt</CardTitle>
                            <CardDescription>Der Text für deinen Brief</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Schreibe deinen Brieftext hier..."
                                value={formData.content}
                                onChange={(e) => handleInputChange('content', e.target.value)}
                                rows={10}
                                className="font-mono text-sm"
                            />
                        </CardContent>
                    </Card>

                        {/* Submit */}
                        <div className="flex gap-3">
                            <Button
                                onClick={handleSendLetter}
                                disabled={loading || !allowed}
                                size="lg"
                                className="gap-2 w-full bg-blue-600 hover:bg-blue-700"
                            >
                                <Send className="w-4 h-4" />
                                {loading ? 'Wird versendet...' : 'Brief versendet'}
                            </Button>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="lg:col-span-1">
                        <LetterPreviewPanel formData={formData} />
                    </div>
                </div>

                {/* Sent Letters History */}
                {sentLetters.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">Versendete Briefe</h2>
                        <div className="grid gap-3">
                            {sentLetters.map((letter) => (
                                <Card key={letter.id} className="hover:shadow-md transition">
                                    <CardContent className="pt-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1">
                                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm">{letter.recipient}</p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {letter.timestamp.toLocaleTimeString('de-DE')} · {letter.type === 'standard' ? 'Standard' : letter.type === 'colored' ? 'Farbig' : 'Beidseitig'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-semibold text-sm">€{letter.cost.toFixed(2)}</p>
                                                <p className="text-xs text-gray-600 mt-1">Versendet</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </FeatureGateGuard>
            </div>
        </div>
    );
}