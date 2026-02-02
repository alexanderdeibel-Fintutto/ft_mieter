import React, { useState } from 'react';
import { X, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LimitReachedBanner({ 
    feature, 
    currentLimit, 
    maxLimit, 
    message,
    onUpgradeClick,
    onDismiss,
    tier = 'free',
    severity = 'warning' // 'warning' | 'error'
}) {
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed) return null;

    const severityStyles = {
        warning: 'bg-orange-50 border-orange-200 text-orange-900',
        error: 'bg-red-50 border-red-200 text-red-900'
    };

    const buttonVariant = severity === 'error' ? 'destructive' : 'default';

    const handleDismiss = () => {
        setIsDismissed(true);
        onDismiss?.();
    };

    return (
        <div className={`border rounded-lg p-4 ${severityStyles[severity]}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">
                            {severity === 'error' ? 'Limit erreicht' : 'Limit fast erreicht'}
                        </h3>
                        <p className="text-sm opacity-90">
                            {message || `Du hast ${currentLimit}/${maxLimit} ${feature} verwendet`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    aria-label="Schließen"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            {onUpgradeClick && (
                <div className="mt-4 flex gap-2">
                    <Button
                        size="sm"
                        onClick={onUpgradeClick}
                        className="gap-2"
                    >
                        <Zap className="w-4 h-4" />
                        Upgrade
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDismiss}
                    >
                        Später
                    </Button>
                </div>
            )}
        </div>
    );
}