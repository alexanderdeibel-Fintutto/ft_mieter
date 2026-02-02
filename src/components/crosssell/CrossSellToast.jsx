import React, { useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function CrossSellToast({ recommendation, onAccept, onDismiss }) {
    const { messaging } = recommendation;

    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 8000);

        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed bottom-24 right-4 z-50 max-w-md bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden"
        >
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{messaging.icon || '✨'}</span>
                    <div>
                        <p className="font-semibold">{messaging.headline}</p>
                    </div>
                </div>
                <button 
                    onClick={onDismiss}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            
            <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">{messaging.body}</p>
                
                <div className="flex gap-2">
                    <Button
                        onClick={onAccept}
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                        {messaging.cta_text}
                        <ArrowRight className="w-3 h-3" />
                    </Button>
                    
                    <Button
                        onClick={onDismiss}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                    >
                        {messaging.dismiss_text || 'Später'}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}