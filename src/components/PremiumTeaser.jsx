import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PremiumTeaser({ modules, onModuleSelect, onDismiss }) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mb-6"
            >
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardHeader className="relative pb-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-blue-600" />
                                <CardTitle className="text-lg">Noch mehr Details?</CardTitle>
                            </div>
                            <button
                                onClick={() => {
                                    setDismissed(true);
                                    onDismiss?.();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-gray-600">
                            Freischalten für detaillierte Analysen:
                        </p>
                        <div className="grid gap-2">
                            {modules?.map((module) => (
                                <Button
                                    key={module.id}
                                    variant="outline"
                                    className="justify-between h-auto py-3 px-4 border-blue-200 hover:bg-blue-100"
                                    onClick={() => onModuleSelect(module)}
                                >
                                    <span className="text-left">
                                        <div className="font-medium text-gray-900">{module.label}</div>
                                        <div className="text-xs text-gray-600">{module.description}</div>
                                    </span>
                                    <span className="text-blue-600 font-semibold ml-2">€{module.price}</span>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}