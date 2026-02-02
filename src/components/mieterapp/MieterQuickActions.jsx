import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Wrench, Zap, FileText, Phone, HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/notifications/ToastSystem';
import SmartTooltip from '@/components/onboarding/SmartTooltip';

const QUICK_ACTIONS = [
  {
    id: 'payment',
    label: 'Zahlung',
    icon: DollarSign,
    color: 'bg-blue-500',
    tooltip: 'Schnelle Mietzahlung oder Nebenkosten-Transfer',
    action: 'openPayment'
  },
  {
    id: 'repair',
    label: 'Reparatur melden',
    icon: Wrench,
    color: 'bg-red-500',
    tooltip: 'Defekt oder Mangel schnell melden',
    action: 'openRepair'
  },
  {
    id: 'meter',
    label: 'Zähler ablesen',
    icon: Zap,
    color: 'bg-yellow-500',
    tooltip: 'Strom-/Wasserzähler schnell fotografieren',
    action: 'openMeter'
  },
  {
    id: 'document',
    label: 'Dokument hochladen',
    icon: FileText,
    color: 'bg-purple-500',
    tooltip: 'Wichtiges Dokument speichern',
    action: 'openDocument'
  },
  {
    id: 'contact',
    label: 'Vermieter kontaktieren',
    icon: Phone,
    color: 'bg-green-500',
    tooltip: 'Direkter Kontakt zum Verwalter/Vermieter',
    action: 'openContact'
  },
  {
    id: 'help',
    label: 'Hilfe',
    icon: HelpCircle,
    color: 'bg-gray-500',
    tooltip: 'Häufig gestellte Fragen und Support',
    action: 'openHelp'
  }
];

export default function MieterQuickActions() {
  const { addToast } = useToast();
  const [activeAction, setActiveAction] = useState(null);

  const handleAction = (action) => {
    setActiveAction(action);
    addToast(`${action.label} wird geladen...`, 'info', 1500);
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-0 shadow-md">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Schnellzugriffe</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Dialog key={action.id} open={activeAction?.id === action.id} onOpenChange={(open) => !open && setActiveAction(null)}>
                <DialogTrigger asChild>
                  <SmartTooltip title={action.tooltip} description="">
                    <Button
                      onClick={() => handleAction(action)}
                      className={`${action.color} text-white h-auto flex flex-col gap-2 py-4 hover:shadow-lg transition-all`}
                      aria-label={action.label}
                    >
                      <Icon className="h-6 w-6 mx-auto" />
                      <span className="text-xs font-medium text-center">{action.label}</span>
                    </Button>
                  </SmartTooltip>
                </DialogTrigger>

                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <Icon className={`h-6 w-6 text-white p-1.5 rounded ${action.color}`} />
                      {action.label}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    {action.id === 'payment' && (
                      <div className="space-y-3">
                        <Button className="w-full" variant="default">
                          Schnellzahlung
                        </Button>
                        <Button className="w-full" variant="outline">
                          Zahlungsplan
                        </Button>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Sichere Zahlung via Stripe oder Banküberweisung
                        </p>
                      </div>
                    )}

                    {action.id === 'repair' && (
                      <div className="space-y-3">
                        <textarea
                          placeholder="Beschreiben Sie das Problem..."
                          className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                          rows="4"
                        />
                        <Button className="w-full">Melden</Button>
                      </div>
                    )}

                    {action.id === 'meter' && (
                      <div className="space-y-3">
                        <Button className="w-full">Kamera öffnen</Button>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Foto des Zählers mit OCR-Erkennung
                        </p>
                      </div>
                    )}

                    {action.id === 'document' && (
                      <div className="space-y-3">
                        <Button className="w-full">Datei auswählen</Button>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Verschlüsselt gespeichert
                        </p>
                      </div>
                    )}

                    {action.id === 'contact' && (
                      <div className="space-y-3">
                        <Button className="w-full">Chat öffnen</Button>
                        <Button className="w-full" variant="outline">
                          Nachricht schreiben
                        </Button>
                      </div>
                    )}

                    {action.id === 'help' && (
                      <div className="space-y-3">
                        <Button className="w-full" variant="outline">
                          FAQ
                        </Button>
                        <Button className="w-full" variant="outline">
                          Live-Chat Support
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}