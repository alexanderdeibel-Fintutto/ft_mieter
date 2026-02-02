import React from 'react';
import { X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardWidget({ 
    id, 
    title, 
    icon, 
    children, 
    onRemove, 
    isDragging = false,
    onDragStart,
    className = ''
}) {
    return (
        <div
            draggable
            onDragStart={onDragStart}
            className={`bg-white rounded-xl border shadow-sm p-4 relative ${isDragging ? 'opacity-50' : ''} ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    <span className="text-lg">{icon}</span>
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                </div>
                {onRemove && (
                    <button
                        onClick={() => onRemove(id)}
                        className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4 text-red-500" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div>
                {children}
            </div>
        </div>
    );
}