import React from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function CrossSellBanner({ recommendation, onAccept, onDismiss }) {
    const { messaging } = recommendation;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 shadow-lg"
        >
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{messaging.icon || '✨'}</span>
                    <div>
                        <p className="font-medium">{messaging.headline}</p>
                        <p className="text-sm text-white/80">{messaging.body}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={onAccept}
                        className="flex items-center gap-2 bg-white text-purple-600 hover:bg-gray-100"
                    >
                        {messaging.cta_text}
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                    
                    <button 
                        onClick={onDismiss} 
                        className="p-2 hover:bg-white/20 rounded transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}