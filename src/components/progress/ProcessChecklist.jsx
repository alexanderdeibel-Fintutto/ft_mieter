import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Circle, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

export default function ProcessChecklist({ steps, currentStep, onStepClick }) {
  const completedSteps = steps.filter((s, idx) => idx < currentStep).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Ihr Fortschritt</span>
          <span className="text-sm font-normal text-gray-600">
            {completedSteps} von {steps.length} abgeschlossen
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="h-2" />
        
        <div className="space-y-2">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            const isUpcoming = idx > currentStep;

            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onStepClick && onStepClick(idx)}
                disabled={isUpcoming}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : isCompleted
                      ? 'bg-green-50 hover:bg-green-100'
                      : 'bg-gray-50 opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isCompleted
                      ? 'bg-green-500'
                      : isCurrent
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Circle className="w-5 h-5 text-white" fill="white" />
                  )}
                </div>
                
                <div className="flex-1 text-left">
                  <p className={`font-medium ${isCurrent ? 'text-blue-900' : 'text-gray-900'}`}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-600">{step.description}</p>
                  )}
                </div>

                {isCurrent && <ArrowRight className="w-5 h-5 text-blue-500 shrink-0" />}
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}