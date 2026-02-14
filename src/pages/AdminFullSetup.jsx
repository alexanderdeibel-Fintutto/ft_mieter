import React, { useState, useCallback } from 'react';
import {
  Database, CreditCard, Users, FlaskConical, CheckCircle2,
  XCircle, Loader2, Play, RotateCcw, ChevronDown, ChevronRight,
  Copy, ExternalLink, Shield, Zap, Package, TestTube2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SETUP_STEPS = [
  {
    id: 'database',
    title: 'Datenbank-Tabellen erstellen',
    description: '13 Tabellen fuer Affiliate, Cross-Sell, Bundles, Transactions, White-Label und A/B Testing',
    icon: Database,
    action: 'create_tables',
    function: 'setupDatabase',
    color: 'blue',
  },
  {
    id: 'partners',
    title: 'Affiliate-Partner laden',
    description: '8 kuratierte Partner: Verivox, CHECK24, HUK24, MyHammer, Movinga, Home24, Helpling',
    icon: Users,
    action: 'seed_partners',
    function: 'setupDatabase',
    color: 'green',
  },
  {
    id: 'abtests',
    title: 'A/B-Tests konfigurieren',
    description: '4 Tests: Widget-Platzierung, Verivox-Stil, Sovendus-Timing, Bundle-Hervorhebung',
    icon: FlaskConical,
    action: 'seed_ab_tests',
    function: 'setupDatabase',
    color: 'purple',
  },
  {
    id: 'stripe',
    title: 'Stripe Bundle-Produkte erstellen',
    description: '3 Bundles: Mieter Plus, Vermieter Komplett, Fintutto Komplett (mit Monats-/Jahrespreisen)',
    icon: CreditCard,
    action: 'setup_bundles',
    function: 'setupStripeBundles',
    color: 'indigo',
  },
  {
    id: 'verify',
    title: 'Setup verifizieren',
    description: 'Prueft ob alle Tabellen, Partner und Konfigurationen korrekt angelegt wurden',
    icon: Shield,
    action: 'verify',
    function: 'setupDatabase',
    color: 'emerald',
  },
];

function StepCard({ step, status, result, onRun }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = step.icon;

  const statusColors = {
    idle: 'border-gray-200 dark:border-gray-700',
    running: 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10',
    success: 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10',
    error: 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10',
  };

  return (
    <div className={`rounded-xl border-2 transition-all ${statusColors[status]} overflow-hidden`}>
      <div className="p-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-${step.color}-100 dark:bg-${step.color}-900/30 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 text-${step.color}-600 dark:text-${step.color}-400`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">{step.title}</h3>
            {status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            {status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
            {status === 'running' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{step.description}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {result && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={() => onRun(step)}
            disabled={status === 'running'}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              status === 'running'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : status === 'success'
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : status === 'error'
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {status === 'running' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Laeuft...</>
            ) : status === 'success' ? (
              <><RotateCcw className="w-4 h-4" /> Erneut</>
            ) : status === 'error' ? (
              <><RotateCcw className="w-4 h-4" /> Nochmal</>
            ) : (
              <><Play className="w-4 h-4" /> Ausfuehren</>
            )}
          </button>
        </div>
      </div>

      {expanded && result && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
          <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-x-auto max-h-60">
            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function AdminFullSetup() {
  const [stepStatuses, setStepStatuses] = useState({});
  const [stepResults, setStepResults] = useState({});
  const [sqlCopied, setSqlCopied] = useState(false);
  const [runningAll, setRunningAll] = useState(false);

  const runStep = useCallback(async (step) => {
    setStepStatuses(prev => ({ ...prev, [step.id]: 'running' }));
    setStepResults(prev => ({ ...prev, [step.id]: null }));

    try {
      const response = await base44.functions.invoke(step.function, {
        action: step.action,
      });

      if (response.data?.success || response.data?.status === 'ok') {
        setStepStatuses(prev => ({ ...prev, [step.id]: 'success' }));
        setStepResults(prev => ({ ...prev, [step.id]: response.data }));
      } else {
        setStepStatuses(prev => ({ ...prev, [step.id]: 'error' }));
        setStepResults(prev => ({ ...prev, [step.id]: response.data?.error || response.data || 'Unbekannter Fehler' }));
      }
    } catch (err) {
      setStepStatuses(prev => ({ ...prev, [step.id]: 'error' }));
      setStepResults(prev => ({ ...prev, [step.id]: err.message || 'Verbindungsfehler' }));
    }
  }, []);

  const runAll = async () => {
    setRunningAll(true);
    for (const step of SETUP_STEPS) {
      await runStep(step);
      // Short pause between steps
      await new Promise(r => setTimeout(r, 500));
    }
    setRunningAll(false);
  };

  const completedCount = Object.values(stepStatuses).filter(s => s === 'success').length;
  const totalSteps = SETUP_STEPS.length;

  const handleCopySQL = async () => {
    try {
      const sqlText = `-- Fintutto Complete Setup - In Supabase SQL Editor einfuegen
-- Siehe: supabase/migrations/20260214_complete_setup.sql im Repository`;
      await navigator.clipboard.writeText(sqlText);
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 2000);
    } catch (e) {}
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Zap className="w-7 h-7 text-amber-500" />
            Fintutto Revenue System Setup
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Alle 7 Revenue-Prioritaeten in 5 Schritten einrichten
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{completedCount}/{totalSteps}</div>
          <div className="text-xs text-gray-500">Schritte erledigt</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / totalSteps) * 100}%` }}
        />
      </div>

      {/* Run All button */}
      <div className="flex gap-3">
        <button
          onClick={runAll}
          disabled={runningAll}
          className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {runningAll ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Setup laeuft...</>
          ) : (
            <><Play className="w-5 h-5" /> Alles ausfuehren</>
          )}
        </button>
      </div>

      {/* Alternative: SQL Editor */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
              Alternative: SQL direkt ausfuehren
            </p>
            <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
              Falls die Edge Functions noch nicht deployed sind, kopiere das SQL aus
              <code className="bg-amber-100 dark:bg-amber-800 px-1.5 py-0.5 rounded mx-1 font-mono">
                supabase/migrations/20260214_complete_setup.sql
              </code>
              und fuege es im Supabase SQL Editor ein.
            </p>
            <a
              href="https://supabase.com/dashboard/project/aaefocdqgdgexkcrjhks/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300 hover:underline mt-2 font-medium"
            >
              <ExternalLink className="w-3 h-3" /> Supabase SQL Editor oeffnen
            </a>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {SETUP_STEPS.map((step) => (
          <StepCard
            key={step.id}
            step={step}
            status={stepStatuses[step.id] || 'idle'}
            result={stepResults[step.id]}
            onRun={runStep}
          />
        ))}
      </div>

      {/* Stripe Dashboard hint */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div>
            <p className="font-medium text-indigo-800 dark:text-indigo-200 text-sm">
              Stripe Konfiguration
            </p>
            <p className="text-indigo-700 dark:text-indigo-300 text-xs mt-1">
              Stelle sicher, dass <code className="bg-indigo-100 dark:bg-indigo-800 px-1.5 py-0.5 rounded font-mono">STRIPE_SECRET_KEY</code> als
              Environment Variable in den Supabase Edge Functions konfiguriert ist.
            </p>
            <a
              href="https://supabase.com/dashboard/project/aaefocdqgdgexkcrjhks/settings/functions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indigo-700 dark:text-indigo-300 hover:underline mt-2 font-medium"
            >
              <ExternalLink className="w-3 h-3" /> Edge Function Settings oeffnen
            </a>
          </div>
        </div>
      </div>

      {/* Post-setup checklist */}
      {completedCount === totalSteps && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-xl p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">Setup abgeschlossen!</h2>
          <p className="text-green-700 dark:text-green-300 text-sm">
            Alle Revenue-Systeme sind konfiguriert. Die Widgets sind bereits im Dashboard integriert.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-left">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-800">
              <Package className="w-5 h-5 text-green-500 mb-1" />
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">8 Partner aktiv</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-800">
              <TestTube2 className="w-5 h-5 text-purple-500 mb-1" />
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">4 A/B-Tests aktiv</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-800">
              <CreditCard className="w-5 h-5 text-indigo-500 mb-1" />
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">3 Bundles bereit</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
