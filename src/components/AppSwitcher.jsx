import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Grid3x3, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function AppSwitcher() {
    const [apps, setApps] = useState([]);
    const [userSeats, setUserSeats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppsAndSeats();
    }, []);

    const loadAppsAndSeats = async () => {
        try {
            setLoading(true);
            const user = await base44.auth.me();
            if (!user) return;

            // Hole alle verfügbaren Apps
            const registeredApps = await base44.entities.AppRegistry.filter({
                is_active: true
            });
            setApps(registeredApps);

            // Hole User Seat Allocations
            const seats = await base44.entities.SeatAllocation.filter({
                receiving_user_id: user.id,
                is_active: true
            });
            setUserSeats(seats);
        } catch (error) {
            console.error('Load apps error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAppInfo = (appId) => {
        return apps.find(app => app.app_id === appId);
    };

    const hasAccessToApp = (appId) => {
        return userSeats.some(seat => seat.app_id === appId);
    };

    const navigateToApp = (baseUrl) => {
        if (baseUrl) {
            window.location.href = baseUrl;
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    title="App Switcher"
                >
                    <Grid3x3 className="w-5 h-5" />
                    {userSeats.length > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>FinTuttO Apps</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {apps.map((app) => {
                            const hasAccess = hasAccessToApp(app.app_id);
                            return (
                                <button
                                    key={app.app_id}
                                    onClick={() => hasAccess && navigateToApp(app.base_url)}
                                    disabled={!hasAccess}
                                    className={`p-4 rounded-lg text-center transition ${
                                        hasAccess
                                            ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                                            : 'bg-gray-100 opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    {app.icon && (
                                        <img
                                            src={app.icon}
                                            alt={app.name}
                                            className="w-10 h-10 mx-auto mb-2 rounded"
                                        />
                                    )}
                                    <p className="font-medium text-sm">{app.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">{app.tagline}</p>
                                    {!hasAccess && (
                                        <p className="text-xs text-gray-400 mt-2">Kein Zugriff</p>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}