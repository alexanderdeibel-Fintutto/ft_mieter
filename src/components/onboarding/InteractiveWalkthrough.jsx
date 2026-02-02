import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WALKTHROUGH_STEPS = [
  {
    target: '[data-tour="dashboard-hero"]',
    title: 'Willkommen! 👋',
    description: 'Dies ist Ihr Mietwohnungs-Dashboard. Hier finden Sie alle wichtigen Informationen.',
    position: 'bottom'
  },
  {
    target: '[data-tour="quick-actions"]',
    title: 'Schnellzugriffe',
    description: 'Mit nur einem Klick können Sie Zahlungen, Reparaturen und mehr verwalten.',
    position: 'bottom'
  },
  {
    target: '[data-tour="finances"]',
    title: 'Finanzen verwalten',
    description: 'Sehen Sie Ihre Zahlungen, Rechnungen und Zahlungsplan im Überblick.',
    position: 'left'
  },
  {
    target: '[data-tour="repairs"]',
    title: 'Reparaturen melden',
    description: 'Schnell Schäden melden und den Status verfolgen.',
    position: 'left'
  },
  {
    target: '[data-tour="messages"]',
    title: 'Nachrichten',
    description: 'Kommunizieren Sie direkt mit Ihrem Vermieter oder Verwalter.',
    position: 'left'
  }
];

export default function InteractiveWalkthrough() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('walkthrough_completed');
  });
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const step = WALKTHROUGH_STEPS[currentStep];

  useEffect(() => {
    if (!isActive || !step) return;

    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 20,
        left: rect.left
      });
    }
  }, [currentStep, isActive]);

  const handleNext = () => {
    if (currentStep < WALKTHROUGH_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('walkthrough_completed', 'true');
    setIsActive(false);
  };

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30"
          onClick={handleComplete}
        />

        {/* Tooltip */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 50
          }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-sm"
        >
          {/* Close Button */}
          <button
            onClick={handleComplete}
            className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {step.title}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {step.description}
            </p>

            {/* Progress */}
            <div className="flex gap-1 my-4">
              {WALKTHROUGH_STEPS.map((_, idx) => (
                <motion.div
                  key={idx}
                  className={`h-1 flex-1 rounded-full ${
                    idx <= currentStep
                      ? 'bg-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleComplete}
                className="flex-1"
              >
                Überspringen
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {currentStep === WALKTHROUGH_STEPS.length - 1 ? 'Fertig' : 'Weiter'}
                {currentStep < WALKTHROUGH_STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}