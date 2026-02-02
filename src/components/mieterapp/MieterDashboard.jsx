import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle, DollarSign, MessageSquare, Zap, FileText, Plus, Wrench,
  TrendingUp, Clock, CheckCircle2, Settings, LifeBuoy, Flame
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useToast } from '@/components/notifications/ToastSystem';
import SkeletonLoader from '@/components/states/SkeletonLoader';
import EmptyState from '@/components/states/EmptyState';
import { motion } from 'framer-motion';
import MieterQuickActions from '@/components/mieterapp/MieterQuickActions';
import RealtimeUpdateManager from '@/components/mieterapp/RealtimeUpdateManager';
import ContextualHelpPanel from '@/components/mieterapp/ContextualHelpPanel';
import MobilePrimaryActions from '@/components/mieterapp/MobilePrimaryActions';
import FAQSystem from '@/components/mieterapp/FAQSystem';
import PersonalizationPanel from '@/components/mieterapp/PersonalizationPanel';
import OfflineSyncManager from '@/components/mieterapp/OfflineSyncManager';
import ProgressRing from '@/components/visualization/ProgressRing';
import StatCard, { StatCardsGrid } from '@/components/visualization/StatCard';
import StatusTimeline from '@/components/visualization/StatusTimeline';
import { LoadingCard, ProgressBar } from '@/components/animations/LoadingStates';
import EnhancedCard from '@/components/animations/EnhancedCard';
import RippleButton from '@/components/animations/RippleButton';
import InteractiveWalkthrough from '@/components/onboarding/InteractiveWalkthrough';
import StreakCounter from '@/components/gamification/StreakCounter';
import { TriggerConfetti } from '@/components/layout/EnhancedConfetti';
import FloatingActionButton from '@/components/mobile/FloatingActionButton';

export default function MieterDashboard() {
  const { addToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    unpaidInvoices: 0,
    pendingRepairs: 0,
    unreadMessages: 0,
    meterReadingsDue: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const userData = await base44.auth.me();
      setUser(userData);

      // Load critical data
      const [invoices, repairs, messages, meters] = await Promise.all([
        base44.entities.Transaction?.filter?.({ status: 'pending', created_by: userData.email }) || [],
        base44.entities.MaintenanceTask?.filter?.({ status: 'open', created_by: userData.email }) || [],
        base44.entities.Message?.filter?.({ is_read: false, recipient_id: userData.id }) || [],
        base44.entities.MeterReading?.filter?.({ status: 'pending', created_by: userData.email }) || []
      ]);

      setDashboardData({
        unpaidInvoices: invoices.length,
        pendingRepairs: repairs.length,
        unreadMessages: messages.length,
        meterReadingsDue: meters.length
      });

      addToast('Dashboard aktualisiert', 'success', 2000);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setError('Dashboard konnte nicht geladen werden');
      addToast('Fehler beim Laden des Dashboards', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <SkeletonLoader type="card" count={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <EmptyState
            icon={AlertCircle}
            title="Fehler beim Laden"
            description={error}
            actionLabel="Erneut versuchen"
            onAction={loadData}
          />
        </div>
      </div>
    );
  }

  const QuickActionCard = ({ icon: Icon, label, count, color, action, badge }) => (
    <motion.a 
      href={action} 
      className="block group"
      aria-label={`${label}: ${count} Einträge`}
      role="button"
      tabIndex={0}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.95 }}
    >
      <Card className={`hover:shadow-xl transition-all cursor-pointer border-l-4 group-focus:ring-2 group-focus:ring-blue-500 ${color}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
                className={`h-8 w-8 mb-2 ${color.replace('border', 'text')}`}
              >
                <Icon className={`h-8 w-8`} />
              </motion.div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{label}</p>
              <motion.p 
                className="text-3xl font-bold mt-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                {count}
              </motion.p>
            </div>
            {badge && (
              <Badge className="bg-red-500 animate-ping">{badge}</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.a>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-800 pb-32 md:pb-0">
      {/* Walkthrough */}
      <InteractiveWalkthrough />

      {/* Offline Sync Indicator */}
      <OfflineSyncManager />

      {/* Header mit Animations */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.h1 
            className="text-4xl font-bold mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Willkommen, {user?.full_name?.split(' ')[0]}! 👋
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-400">Hier ist eine Übersicht Ihrer wichtigsten Aufgaben</p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Priority Alerts */}
        {(dashboardData.unpaidInvoices > 0 || dashboardData.pendingRepairs > 0) && (
          <div className="grid gap-4">
            {dashboardData.unpaidInvoices > 0 && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 dark:text-red-200">
                        {dashboardData.unpaidInvoices} unbezahlte Rechnungen
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300">Zahlungen sind fällig</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => (window.location.href = createPageUrl('MieterFinances'))}
                    >
                      Bezahlen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold mb-4">Schnellzugriff</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              icon={DollarSign}
              label="Finanzen"
              count={dashboardData.unpaidInvoices}
              color="border-blue-500 text-blue-500"
              action={createPageUrl('MieterFinances')}
              badge={dashboardData.unpaidInvoices > 0 ? '!' : null}
            />
            <QuickActionCard
              icon={Wrench}
              label="Reparaturen"
              count={dashboardData.pendingRepairs}
              color="border-yellow-500 text-yellow-500"
              action={createPageUrl('MieterRepairs')}
            />
            <QuickActionCard
              icon={MessageSquare}
              label="Nachrichten"
              count={dashboardData.unreadMessages}
              color="border-green-500 text-green-500"
              action={createPageUrl('MieterMessages')}
              badge={dashboardData.unreadMessages > 0 ? '!' : null}
            />
            <QuickActionCard
              icon={Zap}
              label="Zähler"
              count={dashboardData.meterReadingsDue}
              color="border-purple-500 text-purple-500"
              action={createPageUrl('MieterMeters')}
              badge={dashboardData.meterReadingsDue > 0 ? 'fällig' : null}
            />
          </div>
        </div>

        {/* Gamification - Streak */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          data-tour="dashboard-hero"
        >
          <StreakCounter days={7} goal={30} color="orange" />
        </motion.div>

        {/* Enhanced Features */}
        <div className="space-y-6">
          {/* Real-time Updates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            data-tour="repairs"
          >
            <RealtimeUpdateManager type="repairs" title="Aktive Reparaturen" />
          </motion.div>

          {/* Tabs for Help, Settings, etc */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-3">
              <TabsTrigger value="overview">Überblick</TabsTrigger>
              <TabsTrigger value="help" className="gap-2">
                <LifeBuoy className="h-4 w-4" />
                <span className="hidden sm:inline">Hilfe</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Einstellungen</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Häufig benötigte Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a
                    href={createPageUrl('Dokumente')}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                  >
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Meine Dokumente</span>
                  </a>
                  <a
                    href={createPageUrl('MietrechtChat')}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                  >
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    <span>Mietrecht-Chat (KI)</span>
                  </a>
                  <a
                    href={createPageUrl('MieterMessages')}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                  >
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    <span>Kontakt mit Vermieter</span>
                  </a>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="help">
              <Card>
                <CardContent className="pt-6">
                  <FAQSystem />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardContent className="pt-6">
                  <PersonalizationPanel />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Mobile Primary Actions */}
      <div className="md:hidden">
        <MobilePrimaryActions />
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={Plus}
        label="Schnellzugriff"
        color="blue"
        onClick={() => {}}
      />

      {/* Contextual Help Panel */}
      <ContextualHelpPanel context="general" />
    </div>
  );
}