import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Paperclip, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import SeatAccessGuard from '@/components/SeatAccessGuard';

function TasksContent() {
    const [user, setUser] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskStatus, setTaskStatus] = useState('');
    const [taskNote, setTaskNote] = useState('');

    useEffect(() => {
        const load = async () => {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
        };
        load();
    }, []);

    const { data: tasks = [], refetch } = useQuery({
        queryKey: ['tasks', user?.id],
        queryFn: async () => {
            if (!user) return [];
            return base44.entities.MaintenanceTask.filter({
                assigned_to: user.id
            });
        },
        enabled: !!user
    });

    const handleStatusUpdate = async () => {
        if (!selectedTask || !taskStatus) {
            toast.error('Status auswählen');
            return;
        }

        try {
            await base44.entities.MaintenanceTask.update(selectedTask.id, {
                status: taskStatus
            });
            toast.success('Status aktualisiert');
            setSelectedTask(null);
            setTaskStatus('');
            refetch();
        } catch (error) {
            toast.error('Fehler beim Aktualisieren');
        }
    };

    const priorityColor = {
        low: 'bg-blue-100 text-blue-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        urgent: 'bg-red-100 text-red-800'
    };

    const statusColor = {
        open: 'border-red-200 bg-red-50',
        in_progress: 'border-yellow-200 bg-yellow-50',
        completed: 'border-green-200 bg-green-50',
        cancelled: 'border-gray-200 bg-gray-50'
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Aufgaben verwalten</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Task List */}
                <div className="lg:col-span-2 space-y-3">
                    {tasks.map(task => (
                        <Card
                            key={task.id}
                            className={`cursor-pointer transition-all ${
                                selectedTask?.id === task.id
                                    ? 'ring-2 ring-blue-500 ' + statusColor[task.status]
                                    : statusColor[task.status]
                            }`}
                            onClick={() => setSelectedTask(task)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-lg">{task.title}</h3>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColor[task.priority]}`}>
                                        {task.priority}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 capitalize">{task.category}</span>
                                    <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded capitalize">
                                        {task.status}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Task Details */}
                {selectedTask && (
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Aufgaben-Details</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedTask(null)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <Select value={taskStatus} onValueChange={setTaskStatus}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Status wählen..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open">Offen</SelectItem>
                                            <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                                            <SelectItem value="completed">Abgeschlossen</SelectItem>
                                            <SelectItem value="cancelled">Abgebrochen</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Notiz</label>
                                    <Textarea
                                        placeholder="Notiz hinzufügen..."
                                        value={taskNote}
                                        onChange={(e) => setTaskNote(e.target.value)}
                                        className="mt-1 h-20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        onClick={handleStatusUpdate}
                                    >
                                        Status aktualisieren
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        <Paperclip className="w-4 h-4 mr-2" />
                                        Foto hinzufügen
                                    </Button>
                                </div>

                                {selectedTask.due_date && (
                                    <div className="p-3 bg-gray-50 rounded">
                                        <p className="text-xs text-gray-600">Fällig am</p>
                                        <p className="font-medium">
                                            {new Date(selectedTask.due_date).toLocaleDateString('de-DE')}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function HausmeisterTasks() {
    return (
        <SeatAccessGuard appId="hausmeisterpro">
            <TasksContent />
        </SeatAccessGuard>
    );
}