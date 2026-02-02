import React from 'react';
import { Users, MessageCircle, Calendar } from 'lucide-react';

export default function GroupStatsPanel({ group }) {
    return (
        <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-lg p-3">
            <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-violet-600" />
                    <span className="text-lg font-bold text-gray-900">{group.members?.length || 0}</span>
                </div>
                <p className="text-xs text-gray-600">Mitglieder</p>
            </div>
            <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-lg font-bold text-gray-900">12</span>
                </div>
                <p className="text-xs text-gray-600">Beiträge</p>
            </div>
            <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span className="text-lg font-bold text-gray-900">3</span>
                </div>
                <p className="text-xs text-gray-600">Events</p>
            </div>
        </div>
    );
}