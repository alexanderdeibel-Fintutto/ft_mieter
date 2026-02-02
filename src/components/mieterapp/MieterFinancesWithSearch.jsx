import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MieterSearchBar from '@/components/mieterapp/MieterSearchBar';
import DataFilter from '@/components/mieterapp/DataFilter';
import { sortItems, paginateItems, getPageCount } from '@/components/utils/searchUtils';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function MieterFinancesWithSearch({ transactions = [] }) {
  const [searchResults, setSearchResults] = useState(transactions);
  const [filters, setFilters] = useState({ status: null, category: null, startDate: null, endDate: null });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Apply filters
  const filteredTransactions = useMemo(() => {
    let result = searchResults;

    if (filters.status) {
      result = result.filter(t => t.status === filters.status);
    }

    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      result = result.filter(t => {
        const tDate = new Date(t.created_at);
        return tDate >= start && tDate <= end;
      });
    }

    return result;
  }, [searchResults, filters]);

  // Apply sorting
  const sortedTransactions = useMemo(() => {
    return sortItems(filteredTransactions, sortBy, sortDir);
  }, [filteredTransactions, sortBy, sortDir]);

  // Apply pagination
  const paginatedTransactions = useMemo(() => {
    return paginateItems(sortedTransactions, currentPage, pageSize);
  }, [sortedTransactions, currentPage]);

  const pageCount = getPageCount(sortedTransactions.length, pageSize);

  const handleExport = () => {
    const csv = [
      ['Datum', 'Beschreibung', 'Betrag', 'Status'],
      ...sortedTransactions.map(t => [
        new Date(t.created_at).toLocaleDateString('de-DE'),
        t.description,
        `€ ${t.amount.toFixed(2)}`,
        t.status
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-end">
        <div className="flex-1">
          <MieterSearchBar
            items={transactions}
            searchFields={['description', 'status']}
            onResults={setSearchResults}
            placeholder="Nach Beschreibung oder Status suchen..."
          />
        </div>
        <DataFilter
          filters={filters}
          onFilterChange={setFilters}
          statuses={['pending', 'completed', 'failed']}
        />
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Exportieren
        </Button>
      </div>

      {/* Sort Options */}
      <div className="flex gap-2 items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">Sortieren nach:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="created_at">Datum</option>
          <option value="amount">Betrag</option>
          <option value="description">Beschreibung</option>
        </select>
        <button
          onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
          className="px-3 py-2 border rounded-md text-sm dark:border-gray-700"
        >
          {sortDir === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Results Info */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {sortedTransactions.length === 0 ? (
          'Keine Transaktionen gefunden'
        ) : (
          <>
            Zeige {(currentPage - 1) * pageSize + 1} bis{' '}
            {Math.min(currentPage * pageSize, sortedTransactions.length)} von{' '}
            {sortedTransactions.length} Transaktionen
          </>
        )}
      </div>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Datum</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Beschreibung</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Betrag</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {paginatedTransactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 text-sm">
                      {new Date(transaction.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 text-sm">{transaction.description}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium">
                      € {transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Zurück
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-md text-sm ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
            disabled={currentPage === pageCount}
            className="gap-2"
          >
            Weiter
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}