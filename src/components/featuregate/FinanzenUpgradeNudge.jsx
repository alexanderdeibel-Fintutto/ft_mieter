import React from 'react';
import UpgradeNudge from './UpgradeNudge';
import { useFeatureLimits } from './useFeatureLimits';

export default function FinanzenUpgradeNudge({ onUpgradeClick }) {
    const { usage: paymentCount } = useFeatureLimits('paymentTransactions');

    return (
        <UpgradeNudge
            usageData={{
                paymentTransactions: paymentCount,
                needsLegalAdvice: false
            }}
            onUpgradeClick={onUpgradeClick}
            position="top-right"
        />
    );
}