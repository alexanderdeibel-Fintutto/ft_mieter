import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronRight } from 'lucide-react';
import OnboardingGuide from './OnboardingGuide';

export default function OnboardingPanel({ userRole = 'user' }) {
  const [isOpen, setIsOpen] = useState(true);
  const [totalSteps, setTotalSteps] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);

  useEffect(() => {
    loadStats();
    // Check localStorage ob schon mal gesehen
    const seen = localStorage.getItem('onboarding_panel_shown');
    if (seen) {
      setIsOpen(false);
    } else {
      localStorage.setItem('onboarding_panel_shown', 'true');
    }
  }, []);

  const loadStats = async () => {
    try {
      const steps = await base44.entities.AIOnboardingStep.filter({
        is_active: true,
        role: { $in: [userRole, 'all'] }
      });
      setTotalSteps(steps.length);

      const interactions = await base44.entities.UserInteractionAnalytics.filter({
        interaction_type: 'onboarding_step'
      });
      setCompletedSteps(new Set(interactions.map(i => i.element_id)).size);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 left-4 z-40"
      >
        📚 Anleitung ({completedSteps}/{totalSteps})
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 w-96 max-h-[80vh] overflow-y-auto z-40 bg-white rounded-lg shadow-xl border border-gray-200">
      <Card className="border-0 rounded-lg">
        <CardHeader className="pb-3 border-b flex justify-between items-start">
          <CardTitle className="text-lg">📚 Willkommens-Anleitung</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-900">
              Fortschritt: <strong>{completedSteps}/{totalSteps}</strong> Schritte abgeschlossen
            </p>
            <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <OnboardingGuide userRole={userRole} />
        </CardContent>
      </Card>
    </div>
  );
}