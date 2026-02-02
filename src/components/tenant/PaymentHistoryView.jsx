import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentHistoryView() {
  const { data: user } = useQuery({
    queryKey: ['current_user'],
    queryFn: async () => await base44.auth.me()
  });

  const { data: leases = [] } = useQuery({
    queryKey: ['my_leases', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const result = await base44.entities.Lease.filter({
        tenant_id: user.id
      });
      return result || [];
    },
    enabled: !!user?.id
  });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['payment_history', leases.map(l => l.id).join(',')],
    queryFn: async () => {
      if (!leases.length) return [];
      // Fetch transactions for all user's leases
      const allTransactions = [];
      for (const lease of leases) {
        const result = await base44.entities.Transaction.filter(
          { lease_id: lease.id },
          '-date',
          100
        );
        allTransactions.push(...(result || []));
      }
      return allTransactions;
    },
    enabled: leases.length > 0
  });

  const statusConfig = {
    paid: { icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', label: 'Bezahlt' },
    pending: { icon: AlertCircle, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: 'Ausstehend' },
    overdue: { icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Überfällig' },
  };

  const typeLabels = {
    rent: '🏠 Miete',
    utilities: '💡 Nebenkosten',
    deposit: '🏦 Kaution',
    refund: '↩️ Rückzahlung',
    other: '📋 Sonstiges'
  };

  const totalPaid = transactions
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalPending = transactions
    .filter(t => ['pending', 'overdue'].includes(t.status))
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  if (isLoading) {
    return <div className="text-center py-8">Lädt...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Insgesamt bezahlt</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              €{totalPaid.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ausstehend</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              €{totalPending.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <p className="text-blue-900 dark:text-blue-300">Keine Zahlungshistorie verfügbar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {transactions.map(transaction => {
            const config = statusConfig[transaction.status];
            const Icon = config.icon;
            const typeLabel = typeLabels[transaction.type] || transaction.type;
            
            return (
              <Card key={transaction.id} className="bg-white dark:bg-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {typeLabel}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.date).toLocaleDateString('de-DE')}
                        {transaction.due_date && (
                          <span className="ml-2">
                            (Fällig: {new Date(transaction.due_date).toLocaleDateString('de-DE')})
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        €{transaction.amount?.toFixed(2)}
                      </p>
                      <div className={`flex items-center gap-1 justify-end mt-1 text-sm ${config.color}`}>
                        <Icon className="w-4 h-4" />
                        {config.label}
                      </div>
                    </div>
                  </div>
                  {transaction.reference && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Ref: {transaction.reference}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}