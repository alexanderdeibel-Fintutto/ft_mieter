import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { GripVertical, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PendingPaymentsWidget from './widgets/PendingPaymentsWidget';
import UpcomingRepairsWidget from './widgets/UpcomingRepairsWidget';
import BuildingMetricsWidget from './widgets/BuildingMetricsWidget';
import RecentDocumentsWidget from './widgets/RecentDocumentsWidget';
import DashboardCustomizer from './DashboardCustomizer';

const AVAILABLE_WIDGETS = [
  { id: 'pending_payments', name: 'Offene Mietzahlungen', component: PendingPaymentsWidget },
  { id: 'upcoming_repairs', name: 'Bevorstehende Reparaturen', component: UpcomingRepairsWidget },
  { id: 'building_metrics', name: 'Gebäudemetriken', component: BuildingMetricsWidget },
  { id: 'recent_documents', name: 'Kürzlich hochgeladene Dokumente', component: RecentDocumentsWidget },
];

export default function AdminDashboardOverview() {
  const [activeWidgets, setActiveWidgets] = useState([]);
  const [widgetOrder, setWidgetOrder] = useState([]);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lade Benutzer-Konfiguration aus localStorage
    const saved = localStorage.getItem('dashboard_widgets_config');
    if (saved) {
      const config = JSON.parse(saved);
      setActiveWidgets(config.active || AVAILABLE_WIDGETS.map(w => w.id));
      setWidgetOrder(config.order || AVAILABLE_WIDGETS.map(w => w.id));
    } else {
      setActiveWidgets(AVAILABLE_WIDGETS.map(w => w.id));
      setWidgetOrder(AVAILABLE_WIDGETS.map(w => w.id));
    }
    setLoading(false);
  }, []);

  const handleWidgetToggle = (widgetId) => {
    setActiveWidgets(prev =>
      prev.includes(widgetId)
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const handleReorderWidgets = (newOrder) => {
    setWidgetOrder(newOrder);
  };

  const handleSaveConfig = () => {
    localStorage.setItem('dashboard_widgets_config', JSON.stringify({
      active: activeWidgets,
      order: widgetOrder
    }));
    setShowCustomizer(false);
  };

  const orderedWidgets = widgetOrder
    .filter(id => activeWidgets.includes(id))
    .map(id => AVAILABLE_WIDGETS.find(w => w.id === id))
    .filter(Boolean);

  if (loading) {
    return <div className="p-8">Lädt...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Wichtige Kennzahlen auf einen Blick</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomizer(true)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Anpassen
          </Button>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {orderedWidgets.map((widget) => {
            const WidgetComponent = widget.component;
            return (
              <div
                key={widget.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <WidgetComponent />
              </div>
            );
          })}
        </div>

        {/* Customizer Modal */}
        {showCustomizer && (
          <DashboardCustomizer
            availableWidgets={AVAILABLE_WIDGETS}
            activeWidgets={activeWidgets}
            widgetOrder={widgetOrder}
            onToggleWidget={handleWidgetToggle}
            onReorderWidgets={handleReorderWidgets}
            onSave={handleSaveConfig}
            onClose={() => setShowCustomizer(false)}
          />
        )}
      </div>
    </div>
  );
}