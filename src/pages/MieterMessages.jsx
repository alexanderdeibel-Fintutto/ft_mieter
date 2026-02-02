import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import MieterMessagesWithSearch from '../components/mieterapp/MieterMessagesWithSearch';
import SkeletonLoader from '../components/states/SkeletonLoader';
import { useToast } from '@/components/notifications/ToastSystem';

export default function MieterMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const user = await base44.auth.me();
        // Mock data - replace with actual entity in production
        const mockMessages = [
          {
            id: '1',
            subject: 'Wartungsarbeiten geplant',
            content: 'Am Samstag werden Wartungsarbeiten in der Heizanlage durchgeführt. Bitte seien Sie zwischen 9-12 Uhr Zuhause.',
            sender_id: 'vermieter@example.com',
            is_read: false,
            status: 'active',
            created_date: new Date(Date.now() - 3600000).toISOString(),
            attachments: {}
          },
          {
            id: '2',
            subject: 'Miete eingegangen',
            content: 'Wir bestätigen den Eingang Ihrer Miete für Januar. Vielen Dank.',
            sender_id: 'verwaltung@example.com',
            is_read: true,
            status: 'active',
            created_date: new Date(Date.now() - 86400000).toISOString(),
            attachments: { 'quittung.pdf': 'https://example.com/quittung.pdf' }
          }
        ];
        setMessages(mockMessages);
        addToast('Nachrichten geladen', 'success', 1500);
      } catch (error) {
        console.error('Failed to load messages:', error);
        addToast('Fehler beim Laden der Nachrichten', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SkeletonLoader type="list" count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Nachrichten</h1>
      <MieterMessagesWithSearch messages={messages} />
    </div>
  );
}