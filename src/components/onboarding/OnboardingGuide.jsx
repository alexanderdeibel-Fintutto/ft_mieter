import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, ArrowRight, Play, Clock, X } from 'lucide-react';

export default function OnboardingGuide({ userRole = 'user' }) {
  const [steps, setSteps] = useState([]);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [selectedStep, setSelectedStep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('getting_started');

  useEffect(() => {
    loadOnboardingSteps();
  }, [userRole]);

  const loadOnboardingSteps = async () => {
    try {
      const allSteps = await base44.entities.AIOnboardingStep.filter({
        is_active: true,
        role: { $in: [userRole, 'all'] }
      });

      const sorted = allSteps.sort((a, b) => a.order - b.order);
      setSteps(sorted);

      // Lade completed steps
      const interactions = await base44.entities.UserInteractionAnalytics.filter({
        interaction_type: 'onboarding_step'
      });

      setCompletedSteps(new Set(interactions.map(i => i.element_id)));
    } catch (error) {
      console.error('Failed to load steps:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeStep = async (stepKey) => {
    try {
      await base44.functions.invoke('trackUserInteraction', {
        interaction_type: 'onboarding_step',
        element_id: stepKey,
        source: 'onboarding',
        is_successful: true
      });

      setCompletedSteps(prev => new Set([...prev, stepKey]));
    } catch (error) {
      console.error('Failed to track completion:', error);
    }
  };

  const handleNavigate = (step) => {
    completeStep(step.step_key);
    if (step.action_url) {
      window.location.href = step.action_url;
    }
  };

  const categorySteps = steps.filter(s => s.category === currentCategory);
  const completedInCategory = categorySteps.filter(s => completedSteps.has(s.step_key)).length;
  const progressPercent = (completedInCategory / categorySteps.length) * 100;

  const categories = [
    { id: 'getting_started', label: '🚀 Erste Schritte', icon: '🚀' },
    { id: 'features', label: '✨ Features', icon: '✨' },
    { id: 'workflows', label: '⚡ Workflows', icon: '⚡' },
    { id: 'reporting', label: '📊 Berichte', icon: '📊' },
    { id: 'settings', label: '⚙️ Einstellungen', icon: '⚙️' }
  ];

  const activeCategorySteps = categories.filter(c => 
    steps.some(s => s.category === c.id)
  );

  if (loading) {
    return <div className="text-center py-4">Lade Onboarding...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {activeCategorySteps.map(cat => (
          <Button
            key={cat.id}
            variant={currentCategory === cat.id ? 'default' : 'outline'}
            onClick={() => setCurrentCategory(cat.id)}
            size="sm"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Progress */}
      {categorySteps.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              Fortschritt: {completedInCategory}/{categorySteps.length}
            </span>
            <span className="text-xs text-gray-500">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <Progress value={progressPercent} />
        </div>
      )}

      {/* Steps */}
      <div className="grid gap-4">
        {categorySteps.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              Keine Schritte in dieser Kategorie
            </CardContent>
          </Card>
        ) : (
          categorySteps.map((step, index) => {
            const isCompleted = completedSteps.has(step.step_key);

            return (
              <Card
                key={step.step_key}
                className={`cursor-pointer transition-all ${
                  isCompleted ? 'opacity-60' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedStep(step)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-full text-sm font-bold ${
                        isCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-base">{step.step_title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>

                          {step.tips && step.tips.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              💡 {step.tips[0]}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {step.estimated_time_seconds && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {Math.ceil(step.estimated_time_seconds / 60)}min
                            </Badge>
                          )}

                          {isCompleted && (
                            <Badge className="bg-green-100 text-green-800">
                              ✓ Erledigt
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-4 flex gap-2">
                        {step.action_url && (
                          <Button
                            size="sm"
                            onClick={() => handleNavigate(step)}
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            {step.action_label || 'Öffnen'}
                          </Button>
                        )}

                        {step.video_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              completeStep(step.step_key);
                              window.open(step.video_url, '_blank');
                            }}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Video
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedStep(step)}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Step Detail Dialog */}
      {selectedStep && (
        <Dialog open={!!selectedStep} onOpenChange={() => setSelectedStep(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <DialogTitle>{selectedStep.step_title}</DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStep(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-base">{selectedStep.description}</p>

              {selectedStep.tips && selectedStep.tips.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2">💡 Tipps & Tricks</h4>
                  <ul className="space-y-1">
                    {selectedStep.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-gray-700">
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedStep.video_url && (
                <div>
                  <Button
                    onClick={() => {
                      completeStep(selectedStep.step_key);
                      window.open(selectedStep.video_url, '_blank');
                    }}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Video-Tutorial ansehen
                  </Button>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedStep(null)}
                >
                  Schließen
                </Button>

                {selectedStep.action_url && (
                  <Button
                    onClick={() => handleNavigate(selectedStep)}
                    className="flex-1"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    {selectedStep.action_label || 'Jetzt starten'}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}