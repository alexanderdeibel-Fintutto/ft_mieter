import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineIndicator from './components/OfflineIndicator';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import { Toaster } from '@/components/ui/sonner';
import { PushNotificationProvider } from './components/notifications/PushNotificationService';
import AIChatButton from './components/chat/AIChatButton';
import { CrossSellProvider } from './components/crosssell/CrossSellProvider';
import { SubscriptionProvider } from './components/integrations/stripe';
import useAuth from './components/useAuth';
import AIBudgetWarningBanner from './components/ai/AIBudgetWarningBanner';
import WelcomeWizard from './components/onboarding/WelcomeWizard';
import FeatureDiscovery from './components/discovery/FeatureDiscovery';
import QuickHelp from './components/help/QuickHelp';
import SmartBottomNav from './components/navigation/SmartBottomNav';
import GlobalSearchTrigger from './components/search/GlobalSearchTrigger';
import SmartNotifications from './components/notifications/SmartNotifications';
import { DarkModeProvider } from './components/theme/DarkModeProvider';
import DarkModeToggle from './components/theme/DarkModeToggle';
import OfflineSync from './components/offline/OfflineSync';
import VoiceCommands from './components/voice/VoiceCommands';
import KeyboardShortcutsHelp from './components/shortcuts/KeyboardShortcutsHelp';
import { LanguageProvider } from './components/i18n/LanguageProvider';
import LanguageSelector from './components/i18n/LanguageSelector';
import { useLanguage } from './components/i18n/useLanguage';
import AppSidebar from './components/navigation/AppSidebar';
import MieterNavigation from './components/navigation/MieterNavigation';
import NotificationBell from './components/notifications/NotificationBell';
import BudgetAlert from './components/notifications/BudgetAlert';
import MieterOnboarding from './components/mieterapp/MieterOnboarding';
import { ToastProvider } from './components/notifications/ToastSystem';
import AccessibilityHelper from './components/mieterapp/AccessibilityHelper';
import EnhancedThemeProvider from './components/theme/EnhancedThemeProvider';
import PageLoadingBar from './components/layout/PageLoadingBar';

export default function Layout({ children, currentPageName }) {
    const { user, loading: authLoading } = useAuth();
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const publicPages = ['Login', 'Register', 'Verify', 'Onboarding', 'Invite'];
    const isPublicPage = publicPages.includes(currentPageName);

    useEffect(() => {
        const saved = localStorage.getItem('sidebar_collapsed');
        if (saved) {
            setSidebarCollapsed(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        if (authLoading || !user || isPublicPage) return;
        
        const completed = localStorage.getItem('onboarding_completed');
        if (!completed) {
            setShowOnboarding(true);
        }
    }, [user, authLoading, isPublicPage]);

    const handleOnboardingComplete = (interests) => {
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem('user_interests', JSON.stringify(interests));
        setShowOnboarding(false);
    };

    const handleSidebarToggle = () => {
        const newState = !sidebarCollapsed;
        setSidebarCollapsed(newState);
        localStorage.setItem('sidebar_collapsed', JSON.stringify(newState));
    };

    // Check if user is a tenant (Mieter)
    const isMieter = user?.role === 'user' && !user?.is_admin;

    if (isPublicPage) {
        return (
            <ErrorBoundary>
                <OfflineIndicator />
                <Toaster />
                {children}
            </ErrorBoundary>
        );
    }

    return (
      <ErrorBoundary>
        <AccessibilityHelper />
        <EnhancedThemeProvider>
          <LanguageProvider>
            <DarkModeProvider>
              <SubscriptionProvider userEmail={user?.email} currentAppId="mieterapp">
                <ToastProvider>
                  <PushNotificationProvider>
                  <CrossSellProvider appSource="mieterapp">
                                <PageLoadingBar />
                                <KeyboardShortcuts />
                                    <SmartNotifications />
                                    <OfflineSync />
                                    <AIBudgetWarningBanner />
                                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex">
                                    <OfflineIndicator />

                                    {/* Sidebar - Show MieterNavigation for tenants */}
                                    {isMieter ? (
                                        <MieterNavigation 
                                            isCollapsed={sidebarCollapsed}
                                            onToggleCollapse={handleSidebarToggle}
                                        />
                                    ) : (
                                        <AppSidebar 
                                            isCollapsed={sidebarCollapsed}
                                            onToggleCollapse={handleSidebarToggle}
                                        />
                                    )}

                                    {/* Main Content Area */}
                                    <div className="flex-1 flex flex-col">
                                        {/* Header with Search - Simplified for Mieter on mobile */}
                                        <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4">
                                            <div className="flex items-center gap-3 max-w-7xl mx-auto">
                                                {!isMieter && <GlobalSearchTrigger />}
                                                <VoiceCommands />
                                                <NotificationBell />
                                                <DarkModeToggle />
                                                {!isMieter && <LanguageSelector />}
                                            </div>
                                        </div>

                                        {/* Page Content - Adjust padding for mobile nav */}
                                        <main className={`flex-1 pb-20 ${isMieter ? 'pt-16 md:pt-0' : ''}`}>{children}</main>
                                    </div>

                                    <SmartBottomNav />
                                    <AIChatButton />
                                    <QuickHelp />
                                    <FeatureDiscovery />
                                    <KeyboardShortcutsHelp />
                                    {!isMieter && <BudgetAlert />}
                                    {isMieter && <MieterOnboarding />}
                                    <Toaster />
                                    {showOnboarding && (
                                        <WelcomeWizard onComplete={handleOnboardingComplete} />
                                    )}
                                </div>
                            </CrossSellProvider>
                            </PushNotificationProvider>
                            </ToastProvider>
                            </SubscriptionProvider>
                            </DarkModeProvider>
                            </LanguageProvider>
                            </EnhancedThemeProvider>
                            </ErrorBoundary>
                            );
                            }