import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

export default function GuidedTour({ tourId, steps, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(`tour_${tourId}`);
    if (!completed) {
      setTimeout(() => setShow(true), 1000);
    }
  }, [tourId]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`tour_${tourId}`, 'true');
    setShow(false);
    if (onComplete) onComplete();
  };

  if (!show || !steps[currentStep]) return null;

  const step = steps[currentStep];
  const element = document.querySelector(step.selector);
  const rect = element?.getBoundingClientRect();

  return (
    <AnimatePresence>
      {/* Backdrop with spotlight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ pointerEvents: 'none' }}
      >
        <div className="absolute inset-0 bg-black/60" style={{ pointerEvents: 'auto' }} />
        {rect && (
          <div
            className="absolute bg-transparent border-4 border-blue-500 rounded-lg shadow-2xl"
            style={{
              top: rect.top - 8,
              left: rect.left - 8,
              width: rect.width + 16,
              height: rect.height + 16,
              pointerEvents: 'none',
            }}
          />
        )}
      </motion.div>

      {/* Tooltip */}
      {rect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed z-50"
          style={{
            top: rect.bottom + 16,
            left: rect.left,
            maxWidth: '320px',
            pointerEvents: 'auto',
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl p-5">
            <button
              onClick={handleComplete}
              className="absolute top-2 right-2 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-600">
                  Schritt {currentStep + 1} von {steps.length}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Zurück
                </Button>
              )}
              <Button size="sm" onClick={handleNext} className="flex-1">
                {currentStep < steps.length - 1 ? (
                  <>
                    Weiter <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  'Fertig'
                )}
              </Button>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1 mt-3 justify-center">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}