import React from 'react';
import { Progress } from '@/components/ui/progress';

export default function UsageProgressBar({ 
    current, 
    limit, 
    label, 
    showPercentage = true,
    warningThreshold = 80 
}) {
    const isUnlimited = limit === -1;
    
    if (isUnlimited) {
        return (
            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{label}</span>
                    <span className="text-green-600 font-medium">Unlimited</span>
                </div>
            </div>
        );
    }

    const percentage = Math.round((current / limit) * 100);
    const isWarning = percentage >= warningThreshold;
    const isExceeded = current >= limit;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{label}</span>
                <span className={`font-medium ${
                    isExceeded ? 'text-red-600' : 
                    isWarning ? 'text-orange-600' : 
                    'text-gray-700'
                }`}>
                    {current} / {limit}
                </span>
            </div>
            <Progress 
                value={Math.min(percentage, 100)} 
                className={`h-2 ${
                    isExceeded ? 'bg-red-100' : 
                    isWarning ? 'bg-orange-100' : 
                    'bg-gray-100'
                }`}
            />
            {showPercentage && (
                <p className={`text-xs ${
                    isExceeded ? 'text-red-600' : 
                    isWarning ? 'text-orange-600' : 
                    'text-gray-500'
                }`}>
                    {percentage}% ausgeschöpft
                </p>
            )}
        </div>
    );
}