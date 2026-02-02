import React from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function CrossSellModal({ recommendation, onAccept, onDismiss, showPermanentDismiss = false }) {
    const { messaging, personalization } = recommendation;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
                
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                    <button 
                        onClick={onDismiss}
                        className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                            {messaging.icon || '✨'}
                        </div>
                        <Sparkles className="w-6 h-6 text-yellow-300" />
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-2">{messaging.headline}</h2>
                    
                    {personalization?.user_name && (
                        <p className="text-white/80 text-sm">
                            Speziell für dich, {personalization.user_name}
                        </p>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-600 mb-6">{messaging.body}</p>
                    
                    {/* Benefits */}
                    {(personalization?.savings_amount || personalization?.time_savings || personalization?.specific_benefit) && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <p className="font-medium text-green-800 mb-2">Dein Vorteil:</p>
                            <ul className="space-y-1 text-sm text-green-700">
                                {personalization.savings_amount && (
                                    <li>💰 Spare {personalization.savings_amount}€</li>
                                )}
                                {personalization.time_savings && (
                                    <li>⏱️ {personalization.time_savings}</li>
                                )}
                                {personalization.specific_benefit && (
                                    <li>✅ {personalization.specific_benefit}</li>
                                )}
                            </ul>
                        </div>
                    )}

                    {/* CTAs */}
                    <div className="space-y-3">
                        <Button
                            onClick={onAccept}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                            {messaging.cta_text}
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => onDismiss(false)}
                                className="flex-1 px-6 py-2 text-gray-500 text-sm hover:text-gray-700"
                            >
                                {messaging.dismiss_text || 'Vielleicht später'}
                            </button>
                            {showPermanentDismiss && (
                                <button
                                    onClick={() => onDismiss(true)}
                                    className="px-4 py-2 text-xs text-gray-400 hover:text-gray-600"
                                >
                                    Nicht mehr zeigen
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}