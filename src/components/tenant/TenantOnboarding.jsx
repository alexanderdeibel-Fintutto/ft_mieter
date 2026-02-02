import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, FileText, BookOpen, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LeaseSigningComponent from './onboarding/LeaseSigningComponent';
import WelcomePacketComponent from './onboarding/WelcomePacketComponent';
import SetupGuideComponent from './onboarding/SetupGuideComponent';
import OnboardingProgress from './onboarding/OnboardingProgress';

export default function TenantOnboarding() {
  const [activeTab, setActiveTab] = useState('lease');
  const [completedSteps, setCompletedSteps] = useState([]);

  const handleStepComplete = (step) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Willkommen!</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Dein Onboarding-Prozess - Schritt für Schritt
          </p>
        </div>

        {/* Progress Bar */}
        <OnboardingProgress completedSteps={completedSteps} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-8">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="lease" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Mietvertrag</span>
            </TabsTrigger>
            <TabsTrigger value="welcome" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Willkommenspaket</span>
            </TabsTrigger>
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Einrichtung</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lease">
            <LeaseSigningComponent onComplete={() => handleStepComplete('lease')} />
          </TabsContent>

          <TabsContent value="welcome">
            <WelcomePacketComponent onComplete={() => handleStepComplete('welcome')} />
          </TabsContent>

          <TabsContent value="setup">
            <SetupGuideComponent onComplete={() => handleStepComplete('setup')} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}