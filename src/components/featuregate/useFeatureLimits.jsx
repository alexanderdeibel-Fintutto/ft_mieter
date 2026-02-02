import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useSubscription } from '@/components/integrations/stripe';
import { canUseFeature, getRemainingQuota, featureChecks } from '@/components/integrations/stripe/featureLimits';

/**
 * Hook für Feature-Limit Checks in Components
 * Tracked Nutzung und gibt Quota-Info zurück
 */
export function useFeatureLimits(feature) {
    const { subscriptionTier, userEmail } = useSubscription();
    const [usage, setUsage] = useState(0);
    const [allowed, setAllowed] = useState(true);
    const [remaining, setRemaining] = useState(-1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsage = async () => {
            try {
                // Hole aktuelle Nutzung für dieses Feature
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);

                let count = 0;

                // Feature-spezifische Queries
                switch (feature) {
                    case 'documentUpload': {
                        const docs = await base44.entities.TaskPhoto?.filter({
                            created_by: userEmail,
                            created_date: { $gte: startOfMonth.toISOString() }
                        }).catch(() => []) || [];
                        count = docs.length;
                        break;
                    }
                    case 'repairRequests': {
                        const repairs = await base44.entities.ServiceRequest?.filter({
                            created_by: userEmail,
                            created_date: { $gte: startOfMonth.toISOString() }
                        }).catch(() => []) || [];
                        count = repairs.length;
                        break;
                    }
                    case 'aiChatMessages': {
                        const messages = await base44.entities.ChatMessage?.filter({
                            created_by: userEmail,
                            created_date: { $gte: startOfMonth.toISOString() }
                        }).catch(() => []) || [];
                        count = messages.length;
                        break;
                    }
                    case 'marketplaceListings': {
                        const listings = await base44.entities.MarketplaceListing?.filter({
                            created_by: userEmail,
                            status: 'active'
                        }).catch(() => []) || [];
                        count = listings.length;
                        break;
                    }
                    case 'letterXpressLetters': {
                        const letters = await base44.entities.LetterXpressLog?.filter({
                            user_id: userEmail,
                            created_date: { $gte: startOfMonth.toISOString() }
                        }).catch(() => []) || [];
                        count = letters.length;
                        break;
                    }
                    case 'groupChats': {
                        const groups = await base44.entities.CommunityGroup?.filter({
                            created_by: userEmail
                        }).catch(() => []) || [];
                        count = groups.length;
                        break;
                    }
                }

                setUsage(count);
                setAllowed(canUseFeature(subscriptionTier, feature, count));
                setRemaining(getRemainingQuota(subscriptionTier, feature, count));
            } catch (error) {
                console.error('Error fetching usage:', error);
            } finally {
                setLoading(false);
            }
        };

        if (subscriptionTier && userEmail) {
            fetchUsage();
        }
    }, [feature, subscriptionTier, userEmail]);

    return {
        usage,
        allowed,
        remaining,
        loading,
        unlimited: remaining === -1,
        check: featureChecks[feature]?.(subscriptionTier, usage)
    };
}

/**
 * Hook für Tracking bei Feature-Nutzung
 */
export function useTrackFeatureUsage(feature) {
    const { userEmail } = useSubscription();

    return async (metadata = {}) => {
        try {
            // Log feature usage
            await base44.entities.EventStore?.create({
                event_type: `feature_${feature}_used`,
                user_id: userEmail,
                metadata: {
                    feature,
                    timestamp: new Date().toISOString(),
                    ...metadata
                }
            }).catch(() => {});

            // Track in analytics
            base44.analytics.track({
                eventName: `feature_${feature}_used`,
                properties: metadata
            }).catch(() => {});
        } catch (error) {
            console.error('Error tracking feature usage:', error);
        }
    };
}