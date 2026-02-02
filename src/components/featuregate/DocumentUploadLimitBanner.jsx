import React from 'react';
import { FileText, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DocumentUploadLimitBanner({ 
    currentCount, 
    onUpgradeClick,
    isWarning = false 
}) {
    return (
        <div className={`border rounded-lg p-4 mb-4 ${
            isWarning 
                ? 'bg-orange-50 border-orange-200 text-orange-900' 
                : 'bg-red-50 border-red-200 text-red-900'
        }`}>
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">
                        {isWarning ? 'Speicherlimit wird erreicht' : 'Dokumentenspeicher voll'}
                    </h3>
                    <p className="text-sm opacity-90 mb-3">
                        {isWarning 
                            ? `Du hast ${currentCount} Dokumente hochgeladen. Upgrade deinen Plan für mehr Speicher.`
                            : `Du hast dein Limit für Dokument-Uploads erreicht. Upgrade auf einen besseren Plan.`
                        }
                    </p>
                    <Button
                        size="sm"
                        onClick={onUpgradeClick}
                        className={isWarning 
                            ? 'bg-orange-600 hover:bg-orange-700' 
                            : 'bg-red-600 hover:bg-red-700'
                        }
                    >
                        <Zap className="w-4 h-4 mr-1" />
                        Upgrade
                    </Button>
                </div>
            </div>
        </div>
    );
}