import React from 'react';
import UpgradeNudge from './UpgradeNudge';
import { useFeatureLimits } from './useFeatureLimits';

export default function RepairsUpgradeNudge({ onUpgradeClick }) {
    const { usage: repairCount } = useFeatureLimits('repairRequests');

    return (
        <UpgradeNudge
            usageData={{
                repairRequests: repairCount
            }}
            onUpgradeClick={onUpgradeClick}
            position="top-right"
        />
    );
}