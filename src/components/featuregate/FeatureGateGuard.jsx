import React, { useState } from 'react';
import { useSubscription } from '@/components/integrations/stripe';
import { canUseFeature, getRemainingQuota } from '@/components/integrations/stripe/featureLimits';
import { UpgradeModal } from '@/components/integrations/stripe';
import LimitReachedBanner from './LimitReachedBanner';
import { Lock } from 'lucide-react';

export default function FeatureGateGuard({
    feature,
    currentUsage = 0,
    children,
    fallback = null,
    showBannerOnLimit = true,
    onLimitReached
}) {
    const { subscriptionTier } = useSubscription();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const allowed = canUseFeature(subscriptionTier, feature, currentUsage);
    const remaining = getRemainingQuota(subscriptionTier, feature, currentUsage);

    if (!allowed) {
        if (onLimitReached) {
            onLimitReached();
        }

        return (
            <>
                {showBannerOnLimit && (
                    <LimitReachedBanner
                        feature={feature}
                        currentLimit={currentUsage}
                        maxLimit={-1} // Will be calculated from config
                        message={`Feature-Limit erreicht für ${feature}`}
                        onUpgradeClick={() => setShowUpgradeModal(true)}
                        severity="error"
                        tier={subscriptionTier}
                    />
                )}
                
                {fallback || (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-1">Feature gesperrt</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Upgrade deinen Plan um auf {feature} zuzugreifen
                        </p>
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
                        >
                            Jetzt upgraden
                        </button>
                    </div>
                )}

                {showUpgradeModal && (
                    <UpgradeModal
                        onClose={() => setShowUpgradeModal(false)}
                    />
                )}
            </>
        );
    }

    if (remaining >= 0 && remaining < 5) {
        return (
            <>
                {showBannerOnLimit && (
                    <LimitReachedBanner
                        feature={feature}
                        currentLimit={currentUsage}
                        maxLimit={-1}
                        message={`Nur noch ${remaining} ${feature} verfügbar diesen Monat`}
                        onUpgradeClick={() => setShowUpgradeModal(true)}
                        severity="warning"
                        tier={subscriptionTier}
                    />
                )}
                {children}
                {showUpgradeModal && (
                    <UpgradeModal
                        onClose={() => setShowUpgradeModal(false)}
                    />
                )}
            </>
        );
    }

    return children;
}