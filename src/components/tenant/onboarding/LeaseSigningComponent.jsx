import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FileText, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LeaseSigningComponent({ onComplete }) {
  const [isSigned, setIsSigned] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current_user'],
    queryFn: async () => await base44.auth.me()
  });

  const { data: lease } = useQuery({
    queryKey: ['current_lease', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const result = await base44.entities.Lease.filter({
        tenant_id: user.id,
        status: 'active'
      });
      return result?.[0] || null;
    },
    enabled: !!user?.id
  });

  const initiateSigning = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('docusign-sign', {
        document_type: 'lease',
        signer_email: user.email,
        signer_name: user.full_name
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.signing_url) {
        window.open(data.signing_url, '_blank');
      }
    }
  });

  const handleSigningComplete = () => {
    setIsSigned(true);
    onComplete();
  };

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Digitale Mietvertragsunterzeichnung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-blue-900 dark:text-blue-300 text-sm">
            Bitte unterzeichne deinen Mietvertrag digital mit DocuSign. Der Prozess dauert etwa 2-3 Minuten.
          </p>
        </div>

        {!isSigned ? (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Schritte:</h3>
              <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <li>1. Klicke auf "Unterschrift einholen"</li>
                <li>2. Du wirst zu DocuSign weitergeleitet</li>
                <li>3. Überprüfe die Vertragsbedingungen</li>
                <li>4. Unterzeichne digital und bestätige</li>
                <li>5. Du erhältst eine E-Mail-Bestätigung</li>
              </ol>
            </div>

            <Button
              onClick={() => initiateSigning.mutate()}
              disabled={initiateSigning.isPending || !lease}
              className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Send className="w-4 h-4" />
              {initiateSigning.isPending ? 'Wird initiiert...' : 'Unterschrift einholen'}
            </Button>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>💡 Tipp: Stelle sicher, dass du das Fenster nicht schließt, bis du fertig bist.</p>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 text-center">
            <p className="text-green-900 dark:text-green-300 font-semibold">
              ✓ Mietvertrag erfolgreich unterzeichnet!
            </p>
            <p className="text-green-800 dark:text-green-400 text-sm mt-2">
              Du erhältst in Kürze eine Bestätigung per E-Mail.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}