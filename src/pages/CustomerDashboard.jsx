import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldAlert, TrendingUp } from 'lucide-react';
import useAuth from '../components/useAuth';
import CustomerAIUsageWidget from '../components/admin/CustomerAIUsageWidget';
import AICacheStatsWidget from '../components/ai/AICacheStatsWidget';
import OnboardingPanel from '../components/onboarding/OnboardingPanel';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CustomerDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user) {
            loadChartData();
        }
    }, [user, authLoading]);

    const loadChartData = async () => {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const logs = await base44.entities.AIUsageLog.filter({
                user_email: user.email,
                success: true
            });

            // Aggregiere nach Tag
            const byDay = {};
            logs
                .filter(log => new Date(log.created_date) >= thirtyDaysAgo)
                .forEach(log => {
                    const day = new Date(log.created_date).toLocaleDateString('de-DE');
                    if (!byDay[day]) {
                        byDay[day] = { date: day, cost: 0, requests: 0 };
                    }
                    byDay[day].cost += log.cost_eur || 0;
                    byDay[day].requests += 1;
                });

            setChartData(
                Object.values(byDay)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(-30)
            );
        } catch (error) {
            console.error('Failed to load chart:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <div className="text-center py-12">Laden...</div>;
    }

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <div className="flex items-center gap-3 text-red-800">
                            <ShieldAlert className="h-8 w-8" />
                            <div>
                                <h3 className="font-semibold text-lg">Authentifizierung erforderlich</h3>
                                <p>Bitte melden Sie sich an, um Ihr Dashboard zu sehen.</p>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Mein AI-Dashboard</h1>
                <p className="text-gray-600">Übersicht Ihrer AI-Nutzung und Kosten</p>
            </div>

            {/* Usage Stats */}
            <CustomerAIUsageWidget userEmail={user.email} />

            {/* Cache Stats */}
            <AICacheStatsWidget />

            {/* Usage Chart */}
            {!loading && chartData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Kosten-Verlauf (letzte 30 Tage)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip 
                                    formatter={(value, name) => {
                                        if (name === 'cost') return [value.toFixed(3) + '€', 'Kosten'];
                                        return [value, 'Anfragen'];
                                    }}
                                />
                                <Line 
                                    yAxisId="left"
                                    type="monotone" 
                                    dataKey="cost" 
                                    stroke="#ef4444" 
                                    name="Kosten"
                                    dot={false}
                                />
                                <Line 
                                    yAxisId="right"
                                    type="monotone" 
                                    dataKey="requests" 
                                    stroke="#3b82f6" 
                                    name="Anfragen"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Info Card */}
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Tipp:</strong> Verwenden Sie Prompt Caching, um Kosten zu senken. Wiederkehrende Anfragen mit dem gleichen System-Prompt nutzen automatisch den Cache.
                    </p>
                </CardContent>
            </Card>

            {/* Onboarding Panel */}
            <OnboardingPanel userRole="user" />
        </div>
    );
}