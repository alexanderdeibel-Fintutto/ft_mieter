import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import MieterFinancesWithSearch from '../components/mieterapp/MieterFinancesWithSearch';
import SkeletonLoader from '../components/states/SkeletonLoader';
import { useToast } from '@/components/notifications/ToastSystem';

export default function MieterFinances() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const user = await base44.auth.me();
        // Mock data - replace with actual entity in production
        const mockTransactions = [
          {
            id: '1',
            description: 'Miete Januar',
            amount: 850,
            status: 'completed',
            created_at: new Date(Date.now() - 864000000).toISOString()
          },
          {
            id: '2',
            description: 'Nebenkosten Dezember',
            amount: 120,
            status: 'pending',
            created_at: new Date(Date.now() - 432000000).toISOString()
          },
          {
            id: '3',
            description: 'Kaution',
            amount: 1700,
            status: 'completed',
            created_at: new Date(Date.now() - 2592000000).toISOString()
          }
        ];
        setTransactions(mockTransactions);
        addToast('Finanzen geladen', 'success', 1500);
      } catch (error) {
        console.error('Failed to load transactions:', error);
        addToast('Fehler beim Laden der Finanzen', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Finanzen</h1>
      <MieterFinancesWithSearch transactions={transactions} />
    </div>
  );
}