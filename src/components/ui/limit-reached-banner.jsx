import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function LimitReachedBanner({ limit, current, remaining, onUpgrade, onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4 mb-4 rounded flex items-start justify-between gap-4"
        >
            <div className="flex items-start gap-3 flex-1">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-amber-900">
                        Limit erreicht
                    </h3>
                    <p className="text-sm text-amber-800 mt-1">
                        Du hast {current}/{limit} Einträge verwendet. Upgrade jetzt für unbegrenzte Einträge!
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700"
                    onClick={onUpgrade}
                >
                    Upgraden
                </Button>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-amber-600 hover:text-amber-700"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </motion.div>
    );
}