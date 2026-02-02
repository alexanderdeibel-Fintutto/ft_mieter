import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function PendingPaymentsWidget() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['pending_payments'],
    queryFn: async () => {
      const result = await base44.entities.Transaction.filter({
        status: 'pending'
      }, '-due_date', 100);
      return result || [];
    }
  });

  const totalPending = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const overdueCount = transactions.filter(t => new Date(t.due_date) < new Date()).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Offene Mietzahlungen
        </h3>
        <AlertCircle className="w-5 h-5 text-red-500" />
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Gesamtbetrag ausstehend</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            €{totalPending.toFixed(2)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Überfällig</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{overdueCount}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Anzahl Zahlungen</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{transactions.length}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-sm text-gray-500">Lädt...</div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-green-600 dark:text-green-400">✓ Keine ausstehenden Zahlungen</p>
        ) : (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 mb-2">Älteste Zahlung</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date(transactions[0]?.due_date).toLocaleDateString('de-DE')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}