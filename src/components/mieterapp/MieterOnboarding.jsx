import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

const ONBOARDING_STEPS = [
  {
    id: 'profile',
    title: 'Profil vervollständigen',
    description: 'Aktualisieren Sie Ihre persönlichen Daten und Kontaktinformationen',
    icon: '👤',
    page: 'Settings',
    duration: '5 min'
  },
  {
    id: 'documents',
    title: 'Dokumente hochladen',
    description: 'Laden Sie wichtige Dokumente wie Mietvertrag hoch',
    icon: '📄',
    page: 'Dokumente',
    duration: '10 min'
  },
  {
    id: 'meter',
    title: 'Erste Zählerablesung',
    description: 'Tragen Sie Ihre erste Zählerablesung ein',
    icon: '⚡',
    page: 'MieterMeters',
    duration: '5 min'
  },
  {
    id: 'notifications',
    title: 'Benachrichtigungen aktivieren',
    description: 'Erhalten Sie Benachrichtigungen für wichtige Updates',
    icon: '🔔',
    page: 'Settings',
    duration: '3 min'
  },
  {
    id: 'chat',
    title: 'Mietrecht-Chat kennenlernen',
    description: 'Stellen Sie Ihre erste Frage zum Mietrecht',
    icon: '💬',
    page: 'MietrechtChat',
    duration: '5 min'
  }
];

export default function MieterOnboarding() {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    const completed = localStorage.getItem('mieter_onboarding_completed');
    if (completed) {
      setShowOnboarding(false);
      return;
    }

    const savedSteps = localStorage.getItem('mieter_onboarding_steps');
    if (savedSteps) {
      setCompletedSteps(JSON.parse(savedSteps));
    }
  }, []);

  const completeStep = (stepId) => {
    const updated = [...completedSteps, stepId].filter((id, idx, arr) => arr.indexOf(id) === idx);
    setCompletedSteps(updated);
    localStorage.setItem('mieter_onboarding_steps', JSON.stringify(updated));

    if (updated.length === ONBOARDING_STEPS.length) {
      localStorage.setItem('mieter_onboarding_completed', 'true');
      setTimeout(() => setShowOnboarding(false), 1000);
    }
  };

  const progress = (completedSteps.length / ONBOARDING_STEPS.length) * 100;
  const currentStepData = ONBOARDING_STEPS[currentStep];

  if (!showOnboarding) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardTitle>Willkommen bei Mietapp! 👋</CardTitle>
          <p className="text-blue-100 mt-2">Wir helfen Ihnen, schnell loszulegen</p>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold">Schritt {completedSteps.length + 1} von {ONBOARDING_STEPS.length}</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Current Step */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-4">
              <span className="text-4xl">{currentStepData.icon}</span>
              <div className="flex-1">
                <h3 className="text-2xl font-bold">{currentStepData.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{currentStepData.description}</p>
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-sm text-gray-500">⏱️ {currentStepData.duration}</span>
                  <a
                    href={createPageUrl(currentStepData.page)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="gap-2">
                      Los geht's
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* All Steps Overview */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Ihr Fortschritt:</h4>
            <div className="space-y-2">
              {ONBOARDING_STEPS.map((step, idx) => {
                const isCompleted = completedSteps.includes(step.id);
                const isActive = idx === currentStep;

                return (
                  <button
                    key={step.id}
                    onClick={() => !isCompleted && setCurrentStep(idx)}
                    className={`w-full p-4 rounded-lg flex items-center gap-3 transition-all ${
                      isCompleted
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    )}
                    <div className="flex-1 text-left">
                      <div className={`font-medium ${isCompleted ? 'text-green-900 dark:text-green-200' : ''}`}>
                        {step.title}
                      </div>
                    </div>
                    {isCompleted && <span className="text-xs text-green-600 font-semibold">✓ Erledigt</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setShowOnboarding(false)}
            >
              Später fertigmachen
            </Button>
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Zurück
                </Button>
              )}
              {completedSteps.includes(currentStepData.id) ? (
                <Button
                  onClick={() => {
                    if (currentStep < ONBOARDING_STEPS.length - 1) {
                      setCurrentStep(currentStep + 1);
                    }
                  }}
                >
                  {currentStep === ONBOARDING_STEPS.length - 1 ? 'Fertig!' : 'Weiter'}
                </Button>
              ) : (
                <Button
                  onClick={() => completeStep(currentStepData.id)}
                  className="gap-2"
                >
                  Abgeschlossen
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}