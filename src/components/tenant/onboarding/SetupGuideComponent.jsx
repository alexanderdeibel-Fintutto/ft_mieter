import React, { useState } from 'react';
import { BookOpen, CheckCircle, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SetupGuideComponent({ onComplete }) {
  const [completedGuides, setCompletedGuides] = useState([]);

  const guides = [
    {
      id: 'profile',
      title: 'Profil vervollständigen',
      description: 'Aktualisiere deine Kontaktinformationen und Voreinstellungen',
      steps: [
        'Gehe zu deinen Profileinstellungen',
        'Füge deine Telefonnummer hinzu',
        'Wähle deine Benachrichtigungsvoreinstellungen',
        'Speichere deine Änderungen'
      ]
    },
    {
      id: 'documents',
      title: 'Dokumente hochladen',
      description: 'Organisiere deine Wohnungsdokumente',
      steps: [
        'Navigiere zu "Meine Dokumente"',
        'Lade den Mietvertrag hoch',
        'Speichere deine Kaution',
        'Organisiere deine Dateien in Ordnern'
      ]
    },
    {
      id: 'payments',
      title: 'Zahlungen einrichten',
      description: 'Richte deine bevorzugte Zahlungsmethode ein',
      steps: [
        'Gehe zu Zahlungseinstellungen',
        'Füge deine Bankverbindung hinzu',
        'Aktiviere Erinnerungen für fällige Zahlungen',
        'Bestätige deine Einrichtung'
      ]
    },
    {
      id: 'repairs',
      title: 'Support verstehen',
      description: 'Lerne, wie du Reparaturen anfordern kannst',
      steps: [
        'Besuche den "Reparaturen" Bereich',
        'Verstehe die Prioritätsstufen',
        'Lerne, wie du den Status verfolgst',
        'Speichere die Kontaktinformation des Supports'
      ]
    }
  ];

  const handleCompleteGuide = (id) => {
    if (!completedGuides.includes(id)) {
      setCompletedGuides([...completedGuides, id]);
      if (completedGuides.length === guides.length - 1) {
        onComplete();
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="pt-6">
          <p className="text-blue-900 dark:text-blue-300 text-sm">
            Folge diesen Schritten, um dich vollständig in deinem Portal einzurichten.
          </p>
        </CardContent>
      </Card>

      {guides.map((guide) => {
        const isCompleted = completedGuides.includes(guide.id);
        
        return (
          <Card
            key={guide.id}
            className={`bg-white dark:bg-gray-800 cursor-pointer transition-all ${isCompleted ? 'border-green-200 dark:border-green-800' : ''}`}
          >
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-semibold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                      {guide.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{guide.description}</p>
                  </div>
                </div>

                {/* Steps */}
                <div className="ml-9">
                  <ol className="space-y-2">
                    {guide.steps.map((step, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{idx + 1}.</span> {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Button */}
                {!isCompleted && (
                  <div className="ml-9">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompleteGuide(guide.id)}
                      className="mt-2"
                    >
                      Als abgeschlossen markieren
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {completedGuides.length === guides.length && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-green-900 dark:text-green-300 font-semibold">
              🎉 Onboarding abgeschlossen!
            </p>
            <p className="text-green-800 dark:text-green-400 text-sm mt-2">
              Du bist jetzt bereit, dein Portal vollständig zu nutzen.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}