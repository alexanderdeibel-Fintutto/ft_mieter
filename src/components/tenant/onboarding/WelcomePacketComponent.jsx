import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Package, Mail, Download, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function WelcomePacketComponent({ onComplete }) {
  const [packetSent, setPacketSent] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current_user'],
    queryFn: async () => await base44.auth.me()
  });

  const requestWelcomePacket = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('send-welcome-packet', {
        tenant_email: user.email,
        tenant_name: user.full_name
      });
      return response.data;
    },
    onSuccess: () => {
      setPacketSent(true);
      onComplete();
    }
  });

  const packetItems = [
    { name: 'Hausregeln', icon: '📋' },
    { name: 'Kontaktinformationen', icon: '📞' },
    { name: 'Notfall-Hotline', icon: '🚨' },
    { name: 'Wichtige Termine', icon: '📅' },
    { name: 'Gebäudeplan', icon: '🗺️' },
    { name: 'Häufig gestellte Fragen', icon: '❓' }
  ];

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-600" />
          Willkommenspaket
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-gray-600 dark:text-gray-400">
          Erhalte dein digitales Willkommenspaket mit allen wichtigen Informationen für deinen Wohnungsbeginn.
        </p>

        {!packetSent ? (
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-3">Inhalte deines Pakets:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {packetItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-purple-800 dark:text-purple-200 text-sm">
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={() => requestWelcomePacket.mutate()}
              disabled={requestWelcomePacket.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
            >
              <Mail className="w-4 h-4" />
              {requestWelcomePacket.isPending ? 'Wird vorbereitet...' : 'Willkommenspaket anfordern'}
            </Button>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Das Paket wird dir per E-Mail zugesendet und steht auch hier zum Download zur Verfügung.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-green-900 dark:text-green-300 font-semibold">
                Willkommenspaket versendet!
              </p>
              <p className="text-green-800 dark:text-green-400 text-sm mt-2">
                Du erhältst es gleich per E-Mail. Überprüfe dein Postfach.
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => window.open(`mailto:${user?.email}?subject=Willkommenspaket`)}
            >
              <Download className="w-4 h-4" />
              PDF herunterladen
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}