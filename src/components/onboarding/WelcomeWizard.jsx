import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Users, MessageSquare, Wrench, DollarSign, FileText, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WelcomeWizard({ onComplete, userType = 'mieter' }) {
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState([]);

  const steps = [
    {
      title: '👋 Willkommen bei FinTuttO!',
      subtitle: 'Ihre All-in-One Lösung für Wohnen, Vermieten und mehr',
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Home className="w-12 h-12 text-white" />
          </div>
          <p className="text-lg text-gray-700">
            Wir machen Wohnen und Verwalten einfach, sicher und transparent.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-xs text-gray-600">Einfach</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Check className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600">Sicher</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <Check className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-xs text-gray-600">Transparent</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '🎯 Was interessiert Sie?',
      subtitle: 'Wählen Sie, was für Sie wichtig ist',
      content: (
        <div className="space-y-3">
          {[
            { id: 'community', icon: Users, label: 'Nachbarschaft & Community', color: 'blue' },
            { id: 'chat', icon: MessageSquare, label: 'Chat & Mietrechtsberatung', color: 'green' },
            { id: 'repairs', icon: Wrench, label: 'Reparaturen & Mängel', color: 'orange' },
            { id: 'finances', icon: DollarSign, label: 'Finanzen & Zahlungen', color: 'purple' },
            { id: 'documents', icon: FileText, label: 'Dokumente & Verträge', color: 'red' },
          ].map((interest) => {
            const Icon = interest.icon;
            const isSelected = selectedInterests.includes(interest.id);
            return (
              <motion.div
                key={interest.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => {
                    setSelectedInterests((prev) =>
                      prev.includes(interest.id)
                        ? prev.filter((i) => i !== interest.id)
                        : [...prev, interest.id]
                    );
                  }}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    isSelected
                      ? `border-${interest.color}-500 bg-${interest.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSelected ? `bg-${interest.color}-500` : 'bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <span className="font-medium text-gray-900">{interest.label}</span>
                  {isSelected && <Check className="w-5 h-5 text-green-600 ml-auto" />}
                </button>
              </motion.div>
            );
          })}
        </div>
      ),
    },
    {
      title: '✨ Hauptfunktionen',
      subtitle: 'Das können Sie mit der App machen',
      content: (
        <div className="space-y-4">
          {[
            {
              icon: '💬',
              title: 'Kostenlose Mietrechtsberatung',
              desc: 'KI-gestützte Beratung zu allen Mietfragen',
            },
            {
              icon: '👥',
              title: 'Nachbarschafts-Community',
              desc: 'Vernetzen Sie sich mit Ihren Nachbarn',
            },
            {
              icon: '🔧',
              title: 'Reparaturmanagement',
              desc: 'Mängel melden und verfolgen',
            },
            {
              icon: '💰',
              title: 'Transparente Finanzen',
              desc: 'Alle Zahlungen und Kosten im Überblick',
            },
            {
              icon: '📄',
              title: 'Dokumentenverwaltung',
              desc: 'Alle wichtigen Dokumente an einem Ort',
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-2xl">{feature.icon}</span>
              <div>
                <p className="font-semibold text-gray-900">{feature.title}</p>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      title: '🚀 Los geht\'s!',
      subtitle: 'Sie sind startklar',
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <Check className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-900">Alles bereit!</p>
            <p className="text-gray-600">
              Wir haben die App für Sie personalisiert. Entdecken Sie jetzt alle Funktionen!
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tipp:</strong> Klicken Sie auf das ❓ Symbol oben rechts für Hilfe zu jeder Funktion
            </p>
          </div>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 md:p-8">
          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full transition-all ${
                  idx <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{currentStep.title}</h2>
                <p className="text-gray-600">{currentStep.subtitle}</p>
              </div>

              <div>{currentStep.content}</div>
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Zurück
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} className="ml-auto">
                Weiter <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => onComplete(selectedInterests)}
                className="ml-auto bg-green-600 hover:bg-green-700"
              >
                App starten! 🎉
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}