import React from 'react';
import { Eye, Heart, MessageCircle } from 'lucide-react';

export default function ListingStatsBar({ views = 0, favorites = 0, messages = 0 }) {
    return (
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs text-gray-600">
            <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-gray-400" />
                <span>{views} Aufrufe</span>
            </div>
            <div className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-400" />
                <span>{favorites} Favoriten</span>
            </div>
            <div className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>{messages} Nachrichten</span>
            </div>
        </div>
    );
}