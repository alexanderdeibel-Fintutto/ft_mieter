import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';
import { useToast } from '@/components/notifications/ToastSystem';

const STATUS_ICONS = {
  pending: Clock,
  completed: CheckCircle,
  failed: AlertCircle,
  in_progress: Zap
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  in_progress: 'bg-blue-100 text-blue-800'
};

export default function RealtimeUpdateManager({ type = 'repairs', title = 'Aktive Reparaturen' }) {
  const { addToast } = useToast();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpdates();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToUpdates();

    return () => unsubscribe?.();
  }, []);

  const loadUpdates = async () => {
    try {
      // Mock data - replace with actual real-time subscription
      const mockUpdates = [
        {
          id: '1',
          title: 'Heizung reparieren',
          status: 'in_progress',
          progress: 65,
          description: 'Handwerker vor Ort',
          updatedAt: new Date(Date.now() - 1800000),
          eta: '14:30 Uhr'
        },
        {
          id: '2',
          title: 'Wasserhahn Küche',
          status: 'pending',
          progress: 0,
          description: 'Geplant für Samstag',
          updatedAt: new Date(Date.now() - 86400000),
          eta: 'Samstag 10:00'
        }
      ];
      setUpdates(mockUpdates);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load updates:', error);
    }
  };

  const subscribeToUpdates = () => {
    // Real-time subscription
    const interval = setInterval(() => {
      // Check for updates
    }, 5000);

    return () => clearInterval(interval);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="outline">{updates.length} aktiv</Badge>
      </div>

      {updates.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">Keine aktiven Updates</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {updates.map((update) => {
            const Icon = STATUS_ICONS[update.status];
            return (
              <Card
                key={update.id}
                className={`p-4 border-l-4 ${
                  update.status === 'completed'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                    : update.status === 'failed'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                    : update.status === 'in_progress'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                    : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm">{update.title}</h4>
                      <Badge className={STATUS_COLORS[update.status]}>
                        {update.status === 'in_progress' && `${update.progress}%`}
                        {update.status === 'pending' && 'Geplant'}
                        {update.status === 'completed' && 'Fertig'}
                        {update.status === 'failed' && 'Problem'}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {update.description}
                    </p>

                    {update.progress > 0 && update.status === 'in_progress' && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${update.progress}%` }}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>
                        Aktualisiert{' '}
                        {Math.floor((Date.now() - update.updatedAt) / 60000) < 1
                          ? 'gerade eben'
                          : `vor ${Math.floor((Date.now() - update.updatedAt) / 60000)} min`}
                      </span>
                      <span className="font-semibold">ETA: {update.eta}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}