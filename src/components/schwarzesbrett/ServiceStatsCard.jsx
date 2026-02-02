import React from 'react';
import { Star, TrendingUp, Users, CheckCircle2 } from 'lucide-react';

export default function ServiceStatsCard({ service }) {
    return (
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-3 border border-violet-100">
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-violet-900">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        {service.rating.toFixed(1)}
                    </div>
                    <p className="text-xs text-violet-600">{service.reviewCount} Bewertungen</p>
                </div>
                <div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-violet-900">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {service.reviewCount || 0}
                    </div>
                    <p className="text-xs text-violet-600">Abgeschlossen</p>
                </div>
            </div>
            {service.verified && (
                <div className="mt-2 pt-2 border-t border-violet-200">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        ✓ Verifiziert
                    </span>
                </div>
            )}
        </div>
    );
}