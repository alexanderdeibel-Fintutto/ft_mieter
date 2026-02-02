import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import useAuth from '../components/useAuth';
import { createPageUrl } from '../utils';
import DashboardWidget from '../components/dashboard/DashboardWidget';
import WidgetSelector, { AVAILABLE_WIDGETS } from '../components/dashboard/WidgetSelector';
import {
    UpcomingTasksWidget,
    RepairStatusWidget,
    NextPaymentWidget,
    LatestDocumentsWidget,
    QuickStatsWidget,
    CalendarEventsWidget,
    CommunityNewsWidget
} from '../components/dashboard/DashboardWidgets';

const WIDGET_COMPONENTS = {
    'upcoming-tasks': { component: UpcomingTasksWidget, title: 'Anstehende Aufgaben', icon: '📋' },
    'repair-status': { component: RepairStatusWidget, title: 'Reparatur-Status', icon: '🔧' },
    'next-payment': { component: NextPaymentWidget, title: 'Nächste Zahlung', icon: '💰' },
    'latest-documents': { component: LatestDocumentsWidget, title: 'Letzte Dokumente', icon: '📄' },
    'calendar-events': { component: CalendarEventsWidget, title: 'Kalender-Ereignisse', icon: '📅' },
    'community-news': { component: CommunityNewsWidget, title: 'Community-News', icon: '📰' },
    'quick-stats': { component: QuickStatsWidget, title: 'Schnellübersicht', icon: '📊' },
};

const DEFAULT_WIDGETS = ['quick-stats', 'next-payment', 'upcoming-tasks', 'calendar-events'];

export default function Home() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [selectedWidgets, setSelectedWidgets] = useState(() => {
        const saved = localStorage.getItem('dashboard_widgets');
        return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
    });
    const [widgetSelectorOpen, setWidgetSelectorOpen] = useState(false);
    const [draggedWidget, setDraggedWidget] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate(createPageUrl('Register'));
        }
    }, [user, authLoading]);

    useEffect(() => {
        localStorage.setItem('dashboard_widgets', JSON.stringify(selectedWidgets));
    }, [selectedWidgets]);

    const handleAddWidget = (widgetId) => {
        if (!selectedWidgets.includes(widgetId)) {
            setSelectedWidgets([...selectedWidgets, widgetId]);
        }
    };

    const handleRemoveWidget = (widgetId) => {
        setSelectedWidgets(selectedWidgets.filter(id => id !== widgetId));
    };

    const handleDragStart = (e, widgetId) => {
        setDraggedWidget(widgetId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        if (!draggedWidget || draggedWidget === targetId) return;

        const draggedIndex = selectedWidgets.indexOf(draggedWidget);
        const targetIndex = selectedWidgets.indexOf(targetId);

        const newWidgets = [...selectedWidgets];
        newWidgets.splice(draggedIndex, 1);
        newWidgets.splice(targetIndex, 0, draggedWidget);

        setSelectedWidgets(newWidgets);
        setDraggedWidget(null);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white border-b sticky top-0 z-10 p-4">
                    <div className="max-w-6xl mx-auto">
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </header>
                <main className="p-4 max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-64 rounded-lg" />
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    const greeting = user?.full_name ? `Willkommen, ${user.full_name.split(' ')[0]}!` : 'Willkommen!';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{greeting}</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                        </div>
                        <Button
                            variant={isEditing ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setIsEditing(!isEditing)}
                            className={`transition-all ${isEditing ? 'bg-violet-600 hover:bg-violet-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            {isEditing ? 'Fertig' : 'Bearbeiten'}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Dashboard */}
            <main className="p-4 sm:p-6 max-w-6xl mx-auto">
                {/* Add Widget Button (when editing) */}
                {isEditing && (
                    <Button
                        onClick={() => setWidgetSelectorOpen(true)}
                        className="mb-6 w-full bg-violet-600 hover:bg-violet-700 transition-all transform hover:scale-105 duration-200"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Widget hinzufügen
                    </Button>
                )}

                {/* Widgets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {selectedWidgets.map(widgetId => {
                        const config = WIDGET_COMPONENTS[widgetId];
                        if (!config) return null;

                        const { component: WidgetComponent, title, icon } = config;

                        return (
                            <div
                                key={widgetId}
                                draggable={isEditing}
                                onDragStart={(e) => handleDragStart(e, widgetId)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, widgetId)}
                                className={`transition-all duration-200 ${isEditing ? 'cursor-move opacity-75 hover:opacity-100' : ''}`}
                            >
                                <DashboardWidget
                                    id={widgetId}
                                    title={title}
                                    icon={icon}
                                    onRemove={isEditing ? handleRemoveWidget : null}
                                >
                                    <WidgetComponent />
                                </DashboardWidget>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {selectedWidgets.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">Keine Widgets ausgewählt</p>
                        <Button
                            onClick={() => setWidgetSelectorOpen(true)}
                            className="bg-violet-600 hover:bg-violet-700 transition-all"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Widgets hinzufügen
                        </Button>
                    </div>
                )}
            </main>

            {/* Widget Selector Dialog */}
            <WidgetSelector
                open={widgetSelectorOpen}
                onOpenChange={setWidgetSelectorOpen}
                selectedWidgets={selectedWidgets}
                onAddWidget={handleAddWidget}
            />
        </div>
    );
}