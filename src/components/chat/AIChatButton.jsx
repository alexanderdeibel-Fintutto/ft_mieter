import React, { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import MieterAIChat from './MieterAIChat';

export default function AIChatButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    const handleToggle = () => {
        if (isOpen && isMinimized) {
            setIsMinimized(false);
        } else {
            setIsOpen(!isOpen);
            setIsMinimized(false);
        }
    };

    return (
        <>
            {/* Chat Window */}
            <AnimatePresence>
                <MieterAIChat 
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    isMinimized={isMinimized}
                    onToggleMinimize={() => setIsMinimized(!isMinimized)}
                />
            </AnimatePresence>

            {/* Floating Button (only when chat is closed) */}
            {!isOpen && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="fixed bottom-24 right-4 z-40"
                >
                    <Button
                        onClick={handleToggle}
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <Sparkles className="w-6 h-6" />
                    </Button>
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-violet-500 items-center justify-center">
                            <Bot className="w-2.5 h-2.5 text-white" />
                        </span>
                    </span>
                </motion.div>
            )}
        </>
    );
}