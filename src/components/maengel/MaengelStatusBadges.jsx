import React from 'react';
import { AlertTriangle, Clock, Zap } from 'lucide-react';

export default function MaengelStatusBadges({ mangel }) {
    return (
        <div className="flex flex-wrap gap-2">
            {mangel.isUrgent && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    Dringend
                </span>
            )}
            {mangel.status === 'in_progress' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    <Zap className="w-3 h-3" />
                    In Arbeit
                </span>
            )}
            {mangel.statusHistory?.length > 1 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    <Clock className="w-3 h-3" />
                    {Math.floor((new Date() - new Date(mangel.created_at)) / 86400000)} Tage offen
                </span>
            )}
        </div>
    );
}