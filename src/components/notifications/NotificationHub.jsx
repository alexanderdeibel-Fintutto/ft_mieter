import React, { useState, useEffect } from 'react';
import { Bell, X, Filter, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const NOTIFICATION_TYPES = {
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: '💬' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '⚠️' },
    error: { bg: 'bg-red-50', border: 'border-red-200', icon: '❌' },
    success: { bg: 'bg-green-50', border: 'border-green-200', icon: '✅' },
    payment: { bg: 'bg-violet-50', border: 'border-violet-200', icon: '💳' }
};

export default function NotificationHub({ notifications = [], onDismiss, onMarkAllRead }) {
    const [visibleCount, setVisibleCount] = useState(5);
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleShowMore = () => setVisibleCount(prev => prev + 5);

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-gray-700" />
                    <h3 className="font-semibold text-gray-900">Benachrichtigungen</h3>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onMarkAllRead}
                        className="text-xs"
                    >
                        <CheckCheck className="w-3 h-3 mr-1" />
                        Alle gelesen
                    </Button>
                )}
            </div>

            {/* Notifications List */}
            <AnimatePresence>
                {notifications.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                        <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Keine Benachrichtigungen</p>
                    </div>
                ) : (
                    <>
                        {notifications.slice(0, visibleCount).map((notif) => {
                            const config = NOTIFICATION_TYPES[notif.type] || NOTIFICATION_TYPES.info;
                            return (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={`${config.bg} border ${config.border} rounded-lg p-3 flex gap-3`}
                                >
                                    <span className="text-lg">{config.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                        <p className="text-xs text-gray-600 mt-0.5">{notif.message}</p>
                                    </div>
                                    <button
                                        onClick={() => onDismiss(notif.id)}
                                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            );
                        })}

                        {visibleCount < notifications.length && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShowMore}
                                className="w-full"
                            >
                                Mehr anzeigen ({notifications.length - visibleCount})
                            </Button>
                        )}
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}