import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Zap, Palette, Smartphone, Gamepad2, Accessibility } from 'lucide-react';

// Components
import RippleButton from '@/components/animations/RippleButton';
import EnhancedCard from '@/components/animations/EnhancedCard';
import ProgressRing from '@/components/visualization/ProgressRing';
import StreakCounter from '@/components/gamification/StreakCounter';
import AchievementBadge from '@/components/gamification/AchievementBadge';
import FloatingActionButton from '@/components/mobile/FloatingActionButton';
import BottomSheet, { SelectBottomSheet } from '@/components/mobile/BottomSheet';
import { VoiceButton } from '@/components/voice/VoiceInput';
import AccessibilityPanel from '@/components/accessibility/AccessibilityPanel';
import EnhancedFormInput from '@/components/forms/EnhancedFormInput';

export default function DesignShowcase() {
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [voiceText, setVoiceText] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Design System Showcase
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Maximale UI/UX Optimierung für das Mieterapp
          </p>
        </motion.div>

        <Tabs defaultValue="animations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-5">
            <TabsTrigger value="animations" className="flex gap-2">
              <Zap className="w-4 h-4" /> Animationen
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex gap-2">
              <Palette className="w-4 h-4" /> Farben
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex gap-2">
              <Smartphone className="w-4 h-4" /> Mobile
            </TabsTrigger>
            <TabsTrigger value="gamification" className="flex gap-2">
              <Gamepad2 className="w-4 h-4" /> Gamification
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex gap-2">
              <Accessibility className="w-4 h-4" /> A11y
            </TabsTrigger>
          </TabsList>

          {/* Animations Tab */}
          <TabsContent value="animations" className="space-y-6">
            <h2 className="text-2xl font-bold">Animation Library</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ripple Button */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ripple Button</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2 flex-wrap">
                  <RippleButton onClick={() => {}}>Ripple</RippleButton>
                  <Button variant="outline">Normal</Button>
                </CardContent>
              </Card>

              {/* Enhanced Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Enhanced Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <EnhancedCard className="p-4 text-center">
                    <p>Hover für Effekt</p>
                  </EnhancedCard>
                </CardContent>
              </Card>

              {/* Progress Ring */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progress Ring</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center py-4">
                  <ProgressRing percentage={65} size={100} label="65%" />
                </CardContent>
              </Card>

              {/* Motion Variants */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Motion Effects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {['fadeIn', 'slideInUp', 'slideInDown', 'bounce'].map((anim) => (
                    <motion.div
                      key={anim}
                      className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {anim}
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <h2 className="text-2xl font-bold">Color Palette</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Blue', color: 'bg-blue-600' },
                { name: 'Green', color: 'bg-green-600' },
                { name: 'Red', color: 'bg-red-600' },
                { name: 'Purple', color: 'bg-purple-600' },
                { name: 'Orange', color: 'bg-orange-600' },
                { name: 'Pink', color: 'bg-pink-600' },
                { name: 'Cyan', color: 'bg-cyan-600' },
                { name: 'Gray', color: 'bg-gray-600' },
              ].map((item) => (
                <motion.div
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  className="space-y-2"
                >
                  <div className={`${item.color} h-24 rounded-lg shadow-lg`} />
                  <p className="text-center font-semibold text-sm">{item.name}</p>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Mobile Tab */}
          <TabsContent value="mobile" className="space-y-6">
            <h2 className="text-2xl font-bold">Mobile Components</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bottom Sheet</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setSelectedSheet('demo')}>
                    Bottom Sheet öffnen
                  </Button>
                  <BottomSheet
                    isOpen={selectedSheet === 'demo'}
                    onClose={() => setSelectedSheet(null)}
                    title="Demo Sheet"
                  >
                    <p>Das ist ein Bottom Sheet mit verschiedenen Optionen.</p>
                  </BottomSheet>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Bottom Sheet</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setSelectedSheet('select')}>
                    Optionen wählen
                  </Button>
                  <SelectBottomSheet
                    isOpen={selectedSheet === 'select'}
                    onClose={() => setSelectedSheet(null)}
                    title="Wählen Sie eine Option"
                    options={[
                      { value: 'opt1', label: 'Option 1' },
                      { value: 'opt2', label: 'Option 2' },
                      { value: 'opt3', label: 'Option 3' },
                    ]}
                    onSelect={(val) => console.log('Selected:', val)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Voice Input</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <VoiceButton onTranscript={setVoiceText} />
                  {voiceText && (
                    <p className="text-sm text-blue-600">{voiceText}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Floating Button</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    (Siehe Bottom Right in der Preview)
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Gamification Tab */}
          <TabsContent value="gamification" className="space-y-6">
            <h2 className="text-2xl font-bold">Gamification Elements</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Streak Counter</CardTitle>
                </CardHeader>
                <CardContent>
                  <StreakCounter days={12} goal={30} color="orange" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Achievement Badges</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <AchievementBadge badgeId="first_payment" isUnlocked size="md" />
                  <AchievementBadge badgeId="speedster" isUnlocked={false} size="md" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Accessibility Tab */}
          <TabsContent value="accessibility" className="space-y-6">
            <h2 className="text-2xl font-bold">Accessibility Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AccessibilityPanel />

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Enhanced Form Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <EnhancedFormInput
                    label="Email"
                    type="email"
                    placeholder="Ihre Email"
                    validation={(val) => val.includes('@')}
                  />
                  <EnhancedFormInput
                    label="Passwort"
                    type="password"
                    placeholder="Sicher eingeben"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { title: '15+ Animations', desc: 'Smooth & performant' },
            { title: '8 Achievement Badges', desc: 'Gamification & Motivation' },
            { title: '100% Responsive', desc: 'Mobile-first design' },
            { title: 'Dark Mode', desc: 'Full theme support' },
            { title: 'Voice Input', desc: 'Speech recognition' },
            { title: 'A11y Ready', desc: 'Accessible to all' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h3 className="font-bold text-sm">{item.title}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}