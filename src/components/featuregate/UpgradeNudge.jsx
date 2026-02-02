import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/components/integrations/stripe';
import { featureChecks, getUpgradeRecommendation } from '@/components/integrations/stripe/featureLimits';
import { Crown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UpgradeModal from '@/components/integrations/stripe/UpgradeModal';

export default function UpgradeNudge({
    usageData,
    onUpgradeClick,
    position = 'top-right' // 'top-right', 'bottom-right', 'inline'
}) {
    const { subscriptionTier, refreshSubscription } = useSubscription();
    const [recommendation, setRecommendation] = useState(null);
    const [dismissed, setDismissed] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => {
        if (usageData && subscriptionTier) {
            const rec = getUpgradeRecommendation(subscriptionTier, usageData);
            setRecommendation(rec);
        }
    }, [usageData, subscriptionTier]);

    if (!recommendation || dismissed) return null;

    const positionClasses = {
        'top-right': 'fixed top-4 right-4 max-w-sm',
        'bottom-right': 'fixed bottom-4 right-4 max-w-sm',
        'inline': 'w-full'
    };

    return (
        <div className={`${positionClasses[position]} bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg p-4 z-40`}>
            <div className="flex gap-3">
                <div className="flex-shrink-0">
                    <TrendingUp className="w-5 h-5 mt-1" />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{recommendation.feature}</h4>
                    <p className="text-sm opacity-90 mb-3">{recommendation.reason}</p>
                    <p className="text-xs opacity-75 mb-3">{recommendation.savings}</p>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => {
                                setShowUpgradeModal(true);
                                if (onUpgradeClick) onUpgradeClick();
                            }}
                            className="bg-white text-purple-600 hover:bg-gray-100 gap-2"
                        >
                            <Crown className="w-4 h-4" />
                            Zu {recommendation.suggestedTier} upgraden
                        </Button>
                        <button
                            onClick={() => setDismissed(true)}
                            className="px-3 py-1 text-xs opacity-75 hover:opacity-100 transition"
                        >
                            Später
                        </button>
                    </div>
                </div>
            </div>

            <UpgradeModal 
                isOpen={showUpgradeModal} 
                onClose={() => {
                    setShowUpgradeModal(false);
                    setDismissed(true);
                }} 
                appId="mieterapp"
            />
        </div>
    );
}