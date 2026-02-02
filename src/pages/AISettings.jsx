import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import useAuth from '../components/useAuth';
import AIBudgetOverview from '../components/admin/AIBudgetOverview';
import AIFeatureConfigTable from '../components/admin/AIFeatureConfigTable';
import AIUsageChart from '../components/ai/AIUsageChart';
import AICacheStatsWidget from '../components/ai/AICacheStatsWidget';
import AIMonthlySpendChart from '../components/admin/AIMonthlySpendChart';
import AITopFeaturesTable from '../components/admin/AITopFeaturesTable';
import AIRecommendationsWidget from '../components/admin/AIRecommendationsWidget';

export default function AISettings() {
    const { user } = useAuth();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [apiStatus, setApiStatus] = useState({ status: 'unknown', message: '' });

    // Admin-Guard
    if (user && user.role !== 'admin') {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-red-800">
                            <ShieldAlert className="h-8 w-8" />
                            <div>
                                <h3 className="font-semibold text-lg">Zugriff verweigert</h3>
                                <p>Nur Administratoren können AI-Einstellungen verwalten.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    useEffect(() => {
        if (user && user.role === 'admin') {
            loadSettings();
        }
    }, [user]);

    const loadSettings = async () => {
        try {
            const data = await base44.entities.AISettings.list();
            if (data && data.length > 0) {
                setSettings(data[0]);
            } else {
                setSettings({
                    provider: "anthropic",
                    default_model: "claude-sonnet-4-20250514",
                    is_enabled: true,
                    monthly_budget_eur: 50,
                    budget_warning_threshold: 80,
                    enable_prompt_caching: true,
                    enable_batch_processing: false,
                    rate_limit_per_user_hour: 20,
                    rate_limit_per_user_day: 100,
                    api_status: "unknown",
                });
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            toast.error('Fehler beim Laden der Einstellungen');
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            if (settings.id) {
                await base44.entities.AISettings.update(settings.id, settings);
            } else {
                const created = await base44.entities.AISettings.create(settings);
                setSettings(created);
            }
            toast.success('Einstellungen gespeichert');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Fehler beim Speichern');
        } finally {
            setSaving(false);
        }
    };

    const testApiConnection = async () => {
        setTesting(true);
        try {
            const response = await base44.functions.invoke('aiCoreService', {
                action: 'chat',
                prompt: 'Test',
                userId: user.email,
                featureKey: 'chat',
                maxTokens: 10,
            });

            if (response.data.success) {
                setApiStatus({ status: 'active', message: 'Verbindung erfolgreich' });
                setSettings(prev => ({ ...prev, api_status: 'active', last_api_check: new Date().toISOString() }));
                toast.success('API-Verbindung erfolgreich');
            } else {
                setApiStatus({ status: 'error', message: response.data.error });
                setSettings(prev => ({ ...prev, api_status: 'error' }));
                toast.error('API-Test fehlgeschlagen');
            }
        } catch (error) {
            setApiStatus({ status: 'error', message: error.message });
            setSettings(prev => ({ ...prev, api_status: 'error' }));
            toast.error('API-Test fehlgeschlagen');
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="text-center py-12">Lade Einstellungen...</div>
            </div>
        );
    }

    const getStatusIcon = () => {
        if (apiStatus.status === 'active') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        if (apiStatus.status === 'error') return <XCircle className="w-5 h-5 text-red-500" />;
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">🤖 AI-Einstellungen</h1>
                <div className="flex gap-2">
                    <Button onClick={() => window.location.href = '/AIUsageReports'} variant="outline">
                        📊 Berichte
                    </Button>
                    <Button onClick={() => window.location.href = '/AIWorkflowAutomation'} variant="outline">
                        ⚡ Workflows
                    </Button>
                    <Button onClick={() => window.location.href = '/AISystemPrompts'} variant="outline">
                        📝 Prompts
                    </Button>
                    <Button onClick={saveSettings} disabled={saving}>
                        {saving ? 'Speichern...' : 'Änderungen speichern'}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                <div className="grid lg:grid-cols-2 gap-6">
                    <AIBudgetOverview />
                    <AICacheStatsWidget />
                </div>
                
                <AIUsageChart />
                
                <div className="grid lg:grid-cols-2 gap-6">
                    <AIMonthlySpendChart />
                    <AITopFeaturesTable />
                </div>

                <AIRecommendationsWidget />
                
                {/* Allgemeine Einstellungen */}
                <Card>
                    <CardHeader>
                        <CardTitle>⚙️ Allgemeine Einstellungen</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>AI-Features aktiviert</Label>
                                <p className="text-sm text-gray-500">Globaler An/Aus-Schalter</p>
                            </div>
                            <Switch
                                checked={settings?.is_enabled}
                                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, is_enabled: checked }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Standard-Modell</Label>
                            <Select
                                value={settings?.default_model}
                                onValueChange={(value) => setSettings(prev => ({ ...prev, default_model: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="claude-haiku-3-5-20241022">Claude Haiku 3.5 (Schnell & günstig)</SelectItem>
                                    <SelectItem value="claude-sonnet-4-20250514">Claude Sonnet 4 ⭐ (Empfohlen)</SelectItem>
                                    <SelectItem value="claude-opus-4-20250514">Claude Opus 4 (Höchste Qualität)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Prompt-Caching</Label>
                                <p className="text-sm text-gray-500">Bis zu 90% Ersparnis</p>
                            </div>
                            <Switch
                                checked={settings?.enable_prompt_caching}
                                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_prompt_caching: checked }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Budget & Limits */}
                <Card>
                    <CardHeader>
                        <CardTitle>💰 Budget & Limits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Monatliches Budget (€)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="1000"
                                    value={settings?.monthly_budget_eur}
                                    onChange={(e) => setSettings(prev => ({ ...prev, monthly_budget_eur: parseFloat(e.target.value) }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Warnung bei (%)</Label>
                                <Input
                                    type="number"
                                    min="50"
                                    max="100"
                                    value={settings?.budget_warning_threshold}
                                    onChange={(e) => setSettings(prev => ({ ...prev, budget_warning_threshold: parseFloat(e.target.value) }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Rate-Limit pro Stunde</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={settings?.rate_limit_per_user_hour}
                                    onChange={(e) => setSettings(prev => ({ ...prev, rate_limit_per_user_hour: parseInt(e.target.value) }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Rate-Limit pro Tag</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="500"
                                    value={settings?.rate_limit_per_user_day}
                                    onChange={(e) => setSettings(prev => ({ ...prev, rate_limit_per_user_day: parseInt(e.target.value) }))}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <AIFeatureConfigTable />

                {/* API-Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>🔑 API-Verbindung</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                            <div className="flex items-center gap-3">
                                {getStatusIcon()}
                                <div>
                                    <div className="font-medium">Anthropic API</div>
                                    <div className="text-sm text-gray-500">{apiStatus.message || 'Noch nicht getestet'}</div>
                                </div>
                            </div>
                            <Button onClick={testApiConnection} disabled={testing} variant="outline">
                                {testing ? 'Teste...' : 'Verbindung testen'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}