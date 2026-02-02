import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import useAuth from '../components/useAuth';
import AIMonthlySpendChart from '../components/admin/AIMonthlySpendChart';
import AITopFeaturesTable from '../components/admin/AITopFeaturesTable';
import AIRecommendationsWidget from '../components/admin/AIRecommendationsWidget';
import AICacheStatsWidget from '../components/ai/AICacheStatsWidget';
import AIBudgetOverview from '../components/admin/AIBudgetOverview';
import OnboardingPanel from '../components/onboarding/OnboardingPanel';
import FeatureBudgetManager from '../components/admin/FeatureBudgetManager';
import CostForecastWidget from '../components/admin/CostForecastWidget';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();

    if (authLoading) {
        return <div className="text-center py-12">Laden...</div>;
    }

    if (!user || user.role !== 'admin') {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <div className="flex items-center gap-3 text-red-800">
                            <ShieldAlert className="h-8 w-8" />
                            <div>
                                <h3 className="font-semibold text-lg">Zugriff verweigert</h3>
                                <p>Nur Administratoren können auf dieses Dashboard zugreifen.</p>
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
                <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">Übersicht der AI-Nutzung und Kostenmanagement</p>
            </div>

            {/* Cost Forecast */}
            <CostForecastWidget />

            {/* Budget Overview */}
            <AIBudgetOverview />

            {/* Cache Stats */}
            <AICacheStatsWidget />

            {/* Main Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                <AIMonthlySpendChart />
                <AITopFeaturesTable />
            </div>

            {/* Feature Budgets */}
            <FeatureBudgetManager />

            {/* Recommendations */}
            <AIRecommendationsWidget />

            {/* Onboarding Panel */}
            <OnboardingPanel userRole="admin" />

            {/* API Dashboard Link */}
            <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Admin Tools</h3>
                <Link to={createPageUrl('APIDashboard')}>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                        🔌 API Dashboard
                    </button>
                </Link>
            </div>
        </div>
    );
}