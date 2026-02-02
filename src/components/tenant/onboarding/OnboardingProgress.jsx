import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

export default function OnboardingProgress({ completedSteps }) {
  const steps = [
    { id: 'lease', label: 'Mietvertrag unterzeichnen' },
    { id: 'welcome', label: 'Willkommenspaket erhalten' },
    { id: 'setup', label: 'Einrichtung abschließen' },
  ];

  const progress = (completedSteps.length / steps.length) * 100;

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Fortschritt
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {completedSteps.length}/{steps.length}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {steps.map((step) => (
              <div key={step.id} className="flex items-start gap-3">
                {completedSteps.includes(step.id) ? (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400 dark:text-gray-600 flex-shrink-0 mt-1" />
                )}
                <span className={`text-sm ${completedSteps.includes(step.id) ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent } from '@/components/ui/card';