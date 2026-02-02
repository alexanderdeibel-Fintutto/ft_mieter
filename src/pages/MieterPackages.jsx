import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Box, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function MieterPackages() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: notifications } = useQuery({
    queryKey: ['packageNotifications', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.PackageNotification.filter(
        { recipient_id: user.email },
        '-created_date'
      );
    },
  });

  const pickupMutation = useMutation({
    mutationFn: async (notificationId) => {
      return base44.entities.PackageNotification.update(notificationId, {
        is_picked_up: true,
        picked_up_at: new Date().toISOString(),
        status: 'picked_up',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packageNotifications'] });
    },
  });

  const statusIcons = {
    notified: <AlertCircle className="w-4 h-4 text-orange-600" />,
    picked_up: <CheckCircle className="w-4 h-4 text-green-600" />,
    returned: <Clock className="w-4 h-4 text-gray-600" />,
  };

  const statusColors = {
    notified: 'bg-orange-100 text-orange-800',
    picked_up: 'bg-green-100 text-green-800',
    returned: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Box className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Pakete & Zustellungen</h1>
        </div>

        {/* Active Packages */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ausstehende Pakete</h2>
          <div className="space-y-4">
            {notifications
              ?.filter((n) => n.status === 'notified')
              .map((pkg) => (
                <Card key={pkg.id} className="hover:shadow-lg transition-shadow border-l-4 border-orange-600">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                          <h3 className="text-lg font-bold text-gray-900">
                            {pkg.package_description}
                          </h3>
                        </div>
                        <p className="text-gray-600 mt-2">📍 {pkg.location}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Gemeldet von: {pkg.notified_by}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(pkg.created_date).toLocaleDateString('de-DE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {pkg.photo_url && (
                          <img
                            src={pkg.photo_url}
                            alt="Paket"
                            className="mt-3 w-32 h-32 object-cover rounded-lg"
                          />
                        )}
                      </div>
                      <Button
                        onClick={() => pickupMutation.mutate(pkg.id)}
                        disabled={pickupMutation.isPending}
                        className="bg-orange-600 hover:bg-orange-700 whitespace-nowrap ml-4"
                      >
                        Abgeholt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {notifications?.filter((n) => n.status === 'notified').length === 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6 text-center text-gray-600">
                Keine ausstehenden Pakete 🎉
              </CardContent>
            </Card>
          )}
        </div>

        {/* Picked Up Packages */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Abgeholte Pakete</h2>
          <div className="space-y-3">
            {notifications
              ?.filter((n) => n.status === 'picked_up')
              .slice(0, 5)
              .map((pkg) => (
                <Card key={pkg.id} className="bg-green-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h3 className="text-lg font-bold text-gray-900">
                            {pkg.package_description}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Abgeholt:{' '}
                          {new Date(pkg.picked_up_at).toLocaleDateString('de-DE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Erledigt</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}