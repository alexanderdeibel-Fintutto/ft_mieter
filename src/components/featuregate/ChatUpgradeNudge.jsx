import React from 'react';
import UpgradeNudge from './UpgradeNudge';
import { useFeatureLimits } from './useFeatureLimits';

export default function ChatUpgradeNudge({ onUpgradeClick }) {
    const { usage: aiMessages } = useFeatureLimits('aiChatMessages');

    return (
        <UpgradeNudge
            usageData={{
                aiMessages: aiMessages,
                needsLegalAdvice: false
            }}
            onUpgradeClick={onUpgradeClick}
            position="top-right"
        />
    );
}