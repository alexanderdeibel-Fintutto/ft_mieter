import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Komponente für Real-time Synchronisation von Daten
 * Subscribet zu MaintenanceTask und MeterReading Updates
 */
export default function RealTimeDataSync({ userId }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    // Real-time Subscription für Schadensmeldungen
    const unsubscribeTasks = base44.entities.MaintenanceTask.subscribe((event) => {
      // Invalidate beide Queries wenn Task sich ändert
      queryClient.invalidateQueries({ queryKey: ['openTasks'] });
      queryClient.invalidateQueries({ queryKey: ['tenantDashboard'] });

      // Benachrichtigung anzeigen
      if (event.type === 'update') {
        console.log('🔔 Schadensmeldung aktualisiert:', event.data.title);
      }
    });

    // Real-time Subscription für Zählerablesen
    const unsubscribeMeters = base44.entities.MeterReading.subscribe((event) => {
      queryClient.invalidateQueries({ queryKey: ['meters'] });
      
      if (event.type === 'create') {
        console.log('🔔 Neue Zählerablesung:', event.data.meter_number);
      }
    });

    // Cleanup
    return () => {
      unsubscribeTasks();
      unsubscribeMeters();
    };
  }, [userId, queryClient]);

  return null; // Diese Komponente rendered nichts, nur Side-effects
}