import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zap, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UpgradeModal({ isOpen, onClose, feature, tier, price }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" />
                            Upgrade erforderlich
                        </DialogTitle>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <DialogDescription>
                        Um {feature} zu nutzen, benötigst du ein Upgrade
                    </DialogDescription>
                </DialogHeader>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 py-4"
                >
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            {tier || 'Premium'} Plan
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Nutze {feature} und viele weitere Features
                        </p>
                        <div className="text-2xl font-bold text-blue-600">
                            €{price || '4,99'}/Monat
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Später
                        </Button>
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                                // Trigger upgrade flow
                                onClose();
                            }}
                        >
                            Jetzt upgraden
                        </Button>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}