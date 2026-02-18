import React, { useState, useEffect } from 'react';
import { FlaskConical, TrendingUp, Users, Target, Trophy, Loader2, BarChart3, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AdminABTestResults() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('abTestEngine', { action: 'list_tests' });
      if (response.data?.success) {
        setTests(response.data.tests || []);
        if (response.data.tests?.length > 0 && !selectedTest) {
          loadResults(response.data.tests[0].id);
        }
      }
    } catch (err) {
      console.error('Load tests error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async (testId) => {
    setSelectedTest(testId);
    setLoadingResults(true);
    try {
      const response = await base44.functions.invoke('abTestEngine', {
        action: 'get_results',
        test_id: testId,
      });
      if (response.data?.success) {
        setResults(response.data);
      }
    } catch (err) {
      console.error('Load results error:', err);
    } finally {
      setLoadingResults(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">A/B Test Ergebnisse</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Affiliate & Revenue Optimierung</p>
          </div>
        </div>
        <button
          onClick={loadTests}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Test Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {tests.map(test => {
          const variants = JSON.parse(test.variants || '[]');
          return (
            <button
              key={test.id}
              onClick={() => loadResults(test.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedTest === test.id
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-violet-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                test.status === 'active' ? 'bg-green-400' : test.status === 'completed' ? 'bg-blue-400' : 'bg-gray-400'
              }`} />
              {test.name}
              <span className="text-xs opacity-70">({variants.length} Varianten)</span>
            </button>
          );
        })}
      </div>

      {tests.length === 0 && (
        <div className="text-center py-16">
          <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Keine A/B Tests konfiguriert.</p>
          <p className="text-gray-400 text-sm mt-1">
            Führe die Datenbank-Setup-Function aus, um die Standard-Tests zu erstellen.
          </p>
        </div>
      )}

      {/* Results */}
      {loadingResults && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
        </div>
      )}

      {results && !loadingResults && (
        <div className="space-y-6">
          {/* Test Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg">{results.test.name}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                results.test.status === 'active'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {results.test.status === 'active' ? 'Aktiv' : results.test.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-3">Zielmetrik: <span className="font-medium">{results.test.target_metric}</span></p>

            {/* Summary */}
            <div className={`p-4 rounded-lg ${
              results.summary.is_significant
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {results.summary.is_significant ? (
                  <Trophy className="w-5 h-5 text-green-600" />
                ) : (
                  <Target className="w-5 h-5 text-amber-600" />
                )}
                <span className={`font-semibold text-sm ${
                  results.summary.is_significant ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'
                }`}>
                  {results.summary.recommendation}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {results.summary.total_users} User im Test
              </p>
            </div>
          </div>

          {/* Variant Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.results.map((variant, i) => {
              const isWinner = results.summary.winner === variant.variant_id;
              return (
                <div
                  key={variant.variant_id}
                  className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-5 transition-all ${
                    isWinner
                      ? 'border-green-400 dark:border-green-600 shadow-lg shadow-green-100 dark:shadow-green-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {variant.variant_name}
                      </h3>
                      <p className="text-xs text-gray-500">{variant.variant_id}</p>
                    </div>
                    {isWinner && (
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{variant.users}</p>
                      <p className="text-xs text-gray-500">User</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{variant.impressions}</p>
                      <p className="text-xs text-gray-500">Impressions</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{variant.click_rate}%</p>
                      <p className="text-xs text-gray-500">Klickrate</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-green-700 dark:text-green-400">{variant.conversion_rate}%</p>
                      <p className="text-xs text-gray-500">Conversion</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
