import React from 'react';
import { Check, Clock, Wrench, CheckCircle2, AlertCircle, User, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_CONFIG = {
    reported: {
        label: 'Gemeldet',
        description: 'Mangel wurde erfasst',
        icon: AlertCircle,
        color: 'text-amber-500',
        bgColor: 'bg-amber-100',
        borderColor: 'border-amber-500'
    },
    confirmed: {
        label: 'Bestätigt',
        description: 'Von der Verwaltung gesehen',
        icon: Check,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-500'
    },
    in_progress: {
        label: 'In Bearbeitung',
        description: 'Handwerker beauftragt',
        icon: Wrench,
        color: 'text-violet-500',
        bgColor: 'bg-violet-100',
        borderColor: 'border-violet-500'
    },
    resolved: {
        label: 'Behoben',
        description: 'Mangel wurde behoben',
        icon: CheckCircle2,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-100',
        borderColor: 'border-emerald-500'
    }
};

const STATUS_ORDER = ['reported', 'confirmed', 'in_progress', 'resolved'];

export default function StatusTimeline({ currentStatus, statusHistory = [] }) {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-600" />
                Status-Verlauf
            </h3>

            <div className="relative">
                {STATUS_ORDER.map((status, index) => {
                    const config = STATUS_CONFIG[status];
                    const Icon = config.icon;
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    const historyEntry = statusHistory.find(h => h.status === status);

                    return (
                        <motion.div
                            key={status}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex gap-3 pb-6 last:pb-0"
                        >
                            {/* Timeline Line */}
                            <div className="flex flex-col items-center">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center
                                    ${isCompleted ? config.bgColor : 'bg-gray-100'}
                                    ${isCurrent ? `ring-2 ring-offset-2 ${config.borderColor}` : ''}
                                `}>
                                    <Icon className={`w-5 h-5 ${isCompleted ? config.color : 'text-gray-400'}`} />
                                </div>
                                {index < STATUS_ORDER.length - 1 && (
                                    <div className={`
                                        w-0.5 flex-1 min-h-[24px]
                                        ${index < currentIndex ? 'bg-violet-500' : 'bg-gray-200'}
                                    `} />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pt-1">
                                <div className="flex items-center gap-2">
                                    <h4 className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {config.label}
                                    </h4>
                                    {isCurrent && (
                                        <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full">
                                            Aktuell
                                        </span>
                                    )}
                                </div>
                                <p className={`text-sm ${isCompleted ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {config.description}
                                </p>
                                {historyEntry && (
                                    <div className="mt-2 text-xs text-gray-400 space-y-1">
                                        <p>
                                            {new Date(historyEntry.timestamp).toLocaleDateString('de-DE', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                        {historyEntry.updatedBy && (
                                            <p className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {historyEntry.updatedBy}
                                            </p>
                                        )}
                                        {historyEntry.note && (
                                            <p className="flex items-start gap-1 bg-gray-50 p-2 rounded text-gray-600">
                                                <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                {historyEntry.note}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

export { STATUS_CONFIG, STATUS_ORDER };