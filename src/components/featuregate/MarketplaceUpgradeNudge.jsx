import React from 'react';
import UpgradeNudge from './UpgradeNudge';
import { useFeatureLimits } from './useFeatureLimits';

export default function MarketplaceUpgradeNudge({ onUpgradeClick }) {
    const { usage: listingCount } = useFeatureLimits('marketplaceListings');

    return (
        <UpgradeNudge
            usageData={{
                marketplaceListings: listingCount
            }}
            onUpgradeClick={onUpgradeClick}
            position="top-right"
        />
    );
}