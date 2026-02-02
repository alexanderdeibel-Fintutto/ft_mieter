import React from 'react';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

export default function EnhancedUsageProgressBar({ 
    current, 
    limit, 
    label, 
    showPercentage = true,
    warningThreshold = 80,
    description = null,
    tier = 'basic'
}) {
    const isUnlimited = limit === -1;
    
    if (isUnlimited) {
        return (
            <div className="space-y-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-green-900">{label}</p>
                        <p className="text-xs text-green-700 mt-0.5">Unbegrenzt verfügbar auf deinem {tier}-Plan</p>
                    </div>
                </div>
                {description && <p className="text-xs text-green-700 ml-7">{description}</p>}
            </div>
        );
    }

    const percentage = Math.round((current / limit) * 100);
    const isWarning = percentage >= warningThreshold;
    const isExceeded = current >= limit;
    const remaining = Math.max(0, limit - current);

    let colorClass = 'bg-blue-100';
    let textColorClass = 'text-blue-600';
    let icon = null;

    if (isExceeded) {
        colorClass = 'bg-red-100';
        textColorClass = 'text-red-600';
        icon = <AlertCircle className="w-4 h-4" />;
    } else if (isWarning) {
        colorClass = 'bg-orange-100';
        textColorClass = 'text-orange-600';
        icon = <TrendingUp className="w-4 h-4" />;
    }

    return (
        <div className={`space-y-3 p-4 rounded-lg border ${
            isExceeded ? 'bg-red-50 border-red-200' : 
            isWarning ? 'bg-orange-50 border-orange-200' : 
            'bg-blue-50 border-blue-200'
        }`}>
            <div className="flex items-center gap-2">
                {icon && icon}
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-700">{label}</p>
                        <span className={`font-semibold text-sm ${textColorClass}`}>
                            {current} / {limit}
                        </span>
                    </div>
                    {!isExceeded && (
                        <p className={`text-xs mt-1 ${textColorClass}`}>
                            {remaining} von {limit} verbleibend
                        </p>
                    )}
                </div>
            </div>
            <Progress 
                value={Math.min(percentage, 100)} 
                className="h-2"
            />
            {showPercentage && (
                <div className="flex justify-between items-center">
                    <p className={`text-xs ${
                        isExceeded ? 'text-red-700' : 
                        isWarning ? 'text-orange-700' : 
                        'text-gray-600'
                    }`}>
                        {percentage}% ausgeschöpft
                    </p>
                    {isExceeded && (
                        <p className="text-xs text-red-700 font-medium">Limit erreicht</p>
                    )}
                </div>
            )}
            {description && (
                <p className="text-xs text-gray-600 mt-2">{description}</p>
            )}
        </div>
    );
}