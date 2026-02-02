import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, Wrench } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import SeatAccessGuard from '@/components/SeatAccessGuard';

function HausmeisterContent() {
    const [user, setUser] = useState(null);
    const [allocation, setAllocation] = useState(null);

    useEffect(() => {
        const load = async () => {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
            const allocations = await base44.entities.SeatAllocation.filter({
                receiving_user_id: currentUser.id,
                app_id: 'hausmeisterpro',
                is_active: true
            });
            if (allocations.length > 0) {
                setAllocation(allocations[0]);
            }
        };
        load();
    }, []);

    const { data: tasks = [] } = useQuery({
        queryKey: ['tasks', allocation],
        queryFn: async () => {
            if (!allocation) return [];
            return base44.entities.MaintenanceTask.filter({
                assigned_to: user.id
            });
        },
        enabled: !!allocation && !!user
    });

    const openTasks = tasks.filter(t => t.status === 'open');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Meine Aufgaben</h1>
                <p className="text-gray-600">Hausmeister Dashboard</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium">Offen</CardTitle>
                        <AlertCircle className="w-4 h-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{openTasks.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium">In Bearbeitung</CardTitle>
                        <Clock className="w-4 h-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{inProgressTasks.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium">Abgeschlossen</CardTitle>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
                        <Wrench className="w-4 h-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Open Tasks */}
            {openTasks.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Offene Aufgaben</h2>
                    <div className="grid gap-3">
                        {openTasks.map(task => (
                            <Card key={task.id} className="border-red-200 bg-red-50">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{task.title}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                            <div className="flex gap-2 mt-2">
                                                <span className="inline-block px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full font-medium">
                                                    {task.priority}
                                                </span>
                                                <span className="inline-block px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full">
                                                    {task.category}
                                                </span>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="ml-4">
                                            Starten
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* In Progress Tasks */}
            {inProgressTasks.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">In Bearbeitung</h2>
                    <div className="grid gap-3">
                        {inProgressTasks.map(task => (
                            <Card key={task.id} className="border-yellow-200 bg-yellow-50">
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                                    <Button variant="outline" className="mt-3" size="sm">
                                        Abschließen
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {tasks.length === 0 && (
                <div className="text-center py-12">
                    <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Keine Aufgaben zugewiesen</p>
                </div>
            )}
        </div>
    );
}

export default function HausmeisterDashboard() {
    return (
        <SeatAccessGuard appId="hausmeisterpro">
            <HausmeisterContent />
        </SeatAccessGuard>
    );
}