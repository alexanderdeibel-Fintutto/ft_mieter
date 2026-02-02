import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Play, Trash2, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';

const TASK_TYPES = [
    { value: 'data_cleanup', label: 'Datenlöschung' },
    { value: 'report_generation', label: 'Report-Generierung' },
    { value: 'backup', label: 'Sicherung' },
    { value: 'sync', label: 'Synchronisierung' },
    { value: 'notification', label: 'Benachrichtigung' },
    { value: 'maintenance', label: 'Wartung' }
];

const SCHEDULE_TYPES = [
    { value: 'once', label: 'Einmalig' },
    { value: 'hourly', label: 'Stündlich' },
    { value: 'daily', label: 'Täglich' },
    { value: 'weekly', label: 'Wöchentlich' },
    { value: 'monthly', label: 'Monatlich' }
];

const JOB_TYPES = [
    { value: 'data_export', label: 'Daten-Export' },
    { value: 'data_import', label: 'Daten-Import' },
    { value: 'bulk_update', label: 'Massen-Update' },
    { value: 'bulk_delete', label: 'Massen-Löschen' },
    { value: 'data_migration', label: 'Datenmigration' }
];

export default function TaskSchedulingDashboard({ organizationId }) {
    const [scheduledTasks, setScheduledTasks] = useState([]);
    const [queues, setQueues] = useState([]);
    const [batchJobs, setBatchJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tasks');
    const [showNewTask, setShowNewTask] = useState(false);
    const [showNewJob, setShowNewJob] = useState(false);
    const [taskForm, setTaskForm] = useState({
        task_name: '',
        task_type: 'data_cleanup',
        function_name: '',
        schedule_type: 'daily'
    });
    const [jobForm, setJobForm] = useState({
        job_name: '',
        job_type: 'data_export',
        total_items: ''
    });

    useEffect(() => {
        loadData();
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [tasksRes, queuesRes, jobsRes] = await Promise.all([
                base44.functions.invoke('taskSchedulingEngine', {
                    action: 'get_scheduled_tasks',
                    organization_id: organizationId
                }),
                base44.functions.invoke('taskSchedulingEngine', {
                    action: 'get_queues',
                    organization_id: organizationId
                }),
                base44.functions.invoke('taskSchedulingEngine', {
                    action: 'get_batch_jobs',
                    organization_id: organizationId
                })
            ]);

            setScheduledTasks(tasksRes.data.tasks || []);
            setQueues(queuesRes.data.queues || []);
            setBatchJobs(jobsRes.data.jobs || []);
        } catch (error) {
            console.error('Load error:', error);
            toast.error('Fehler beim Laden');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async () => {
        if (!taskForm.task_name || !taskForm.function_name) {
            toast.error('Name und Funktion erforderlich');
            return;
        }

        try {
            await base44.functions.invoke('taskSchedulingEngine', {
                action: 'create_scheduled_task',
                organization_id: organizationId,
                ...taskForm
            });

            toast.success('Aufgabe erstellt');
            setTaskForm({ task_name: '', task_type: 'data_cleanup', function_name: '', schedule_type: 'daily' });
            setShowNewTask(false);
            loadData();
        } catch (error) {
            console.error('Create error:', error);
            toast.error('Fehler beim Erstellen');
        }
    };

    const handleExecuteTask = async (taskId) => {
        try {
            await base44.functions.invoke('taskSchedulingEngine', {
                action: 'execute_task',
                organization_id: organizationId,
                task_id: taskId
            });

            toast.success('Aufgabe ausgeführt');
            loadData();
        } catch (error) {
            console.error('Execute error:', error);
            toast.error('Fehler beim Ausführen');
        }
    };

    const handleCreateJob = async () => {
        if (!jobForm.job_name || !jobForm.total_items) {
            toast.error('Name und Itemanzahl erforderlich');
            return;
        }

        try {
            await base44.functions.invoke('taskSchedulingEngine', {
                action: 'create_batch_job',
                organization_id: organizationId,
                ...jobForm,
                total_items: parseInt(jobForm.total_items)
            });

            toast.success('Batch-Job erstellt');
            setJobForm({ job_name: '', job_type: 'data_export', total_items: '' });
            setShowNewJob(false);
            loadData();
        } catch (error) {
            console.error('Create error:', error);
            toast.error('Fehler beim Erstellen');
        }
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b">
                {['tasks', 'queues', 'jobs'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'tasks' && '⏰ Geplante Aufgaben'}
                        {tab === 'queues' && '📦 Task Queues'}
                        {tab === 'jobs' && '📊 Batch-Jobs'}
                    </button>
                ))}
            </div>

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-blue-600">{scheduledTasks.length}</div>
                                <div className="text-xs text-gray-600">Aufgaben</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-green-600">
                                    {scheduledTasks.filter(t => t.enabled).length}
                                </div>
                                <div className="text-xs text-gray-600">Aktiv</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-orange-600">
                                    {scheduledTasks.reduce((sum, t) => sum + (t.execution_count || 0), 0)}
                                </div>
                                <div className="text-xs text-gray-600">Ausführungen</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-red-600">
                                    {scheduledTasks.filter(t => t.status === 'failed').length}
                                </div>
                                <div className="text-xs text-gray-600">Fehler</div>
                            </CardContent>
                        </Card>
                    </div>

                    {!showNewTask && (
                        <Button onClick={() => setShowNewTask(true)} className="w-full md:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Neue Aufgabe
                        </Button>
                    )}

                    {showNewTask && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Neue geplante Aufgabe</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="Name"
                                    value={taskForm.task_name}
                                    onChange={(e) => setTaskForm({...taskForm, task_name: e.target.value})}
                                />
                                <Select value={taskForm.task_type} onValueChange={(v) => setTaskForm({...taskForm, task_type: v})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TASK_TYPES.map(t => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder="Funktion (z.B. 'cleanupData')"
                                    value={taskForm.function_name}
                                    onChange={(e) => setTaskForm({...taskForm, function_name: e.target.value})}
                                />
                                <Select value={taskForm.schedule_type} onValueChange={(v) => setTaskForm({...taskForm, schedule_type: v})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SCHEDULE_TYPES.map(s => (
                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="flex gap-2">
                                    <Button onClick={handleCreateTask} className="flex-1">Erstellen</Button>
                                    <Button variant="outline" onClick={() => setShowNewTask(false)} className="flex-1">
                                        Abbrechen
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-3">
                        {scheduledTasks.map(task => (
                            <Card key={task.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h5 className="font-semibold text-sm">{task.task_name}</h5>
                                            <p className="text-xs text-gray-600 mt-1">Funktion: {task.function_name}</p>
                                            <div className="flex gap-2 mt-2 text-xs text-gray-600">
                                                <span>⏰ {task.schedule_type}</span>
                                                <span>🔄 {task.execution_count || 0} Ausführungen</span>
                                                <span>✓ {task.success_count || 0} erfolgreich</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={task.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                {task.enabled ? '✓ Aktiv' : '✗ Inaktiv'}
                                            </Badge>
                                            <Button size="sm" onClick={() => handleExecuteTask(task.id)}>
                                                <Play className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="destructive">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {/* Queues Tab */}
            {activeTab === 'queues' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-blue-600">{queues.length}</div>
                                <div className="text-xs text-gray-600">Queues</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {queues.reduce((sum, q) => sum + (q.pending_count || 0), 0)}
                                </div>
                                <div className="text-xs text-gray-600">Ausstehend</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-green-600">
                                    {queues.reduce((sum, q) => sum + (q.completed_count || 0), 0)}
                                </div>
                                <div className="text-xs text-gray-600">Abgeschlossen</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-red-600">
                                    {queues.reduce((sum, q) => sum + (q.failed_count || 0), 0)}
                                </div>
                                <div className="text-xs text-gray-600">Fehler</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-3">
                        {queues.map(queue => (
                            <Card key={queue.id}>
                                <CardContent className="p-4">
                                    <h5 className="font-semibold text-sm mb-2">{queue.queue_name}</h5>
                                    <div className="space-y-1 text-xs text-gray-600">
                                        <div>Ausstehend: {queue.pending_count} | Verarbeitet: {queue.processing_count} | Abgeschlossen: {queue.completed_count}</div>
                                        <div>Max. parallel: {queue.max_concurrent_tasks}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-blue-600">{batchJobs.length}</div>
                                <div className="text-xs text-gray-600">Jobs</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {batchJobs.filter(j => j.status === 'processing').length}
                                </div>
                                <div className="text-xs text-gray-600">In Verarbeitung</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-green-600">
                                    {batchJobs.filter(j => j.status === 'completed').length}
                                </div>
                                <div className="text-xs text-gray-600">Abgeschlossen</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-red-600">
                                    {batchJobs.filter(j => j.status === 'failed').length}
                                </div>
                                <div className="text-xs text-gray-600">Fehler</div>
                            </CardContent>
                        </Card>
                    </div>

                    {!showNewJob && (
                        <Button onClick={() => setShowNewJob(true)} className="w-full md:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Neuer Job
                        </Button>
                    )}

                    {showNewJob && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Neuer Batch-Job</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="Job Name"
                                    value={jobForm.job_name}
                                    onChange={(e) => setJobForm({...jobForm, job_name: e.target.value})}
                                />
                                <Select value={jobForm.job_type} onValueChange={(v) => setJobForm({...jobForm, job_type: v})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {JOB_TYPES.map(t => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder="Gesamtzahl Items"
                                    type="number"
                                    value={jobForm.total_items}
                                    onChange={(e) => setJobForm({...jobForm, total_items: e.target.value})}
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleCreateJob} className="flex-1">Erstellen</Button>
                                    <Button variant="outline" onClick={() => setShowNewJob(false)} className="flex-1">
                                        Abbrechen
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-3">
                        {batchJobs.map(job => (
                            <Card key={job.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <div className="flex-1">
                                            <h5 className="font-semibold text-sm">{job.job_name}</h5>
                                            <p className="text-xs text-gray-600">{job.job_type}</p>
                                        </div>
                                        <Badge className={
                                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            job.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                            job.status === 'failed' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }>
                                            {job.status}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{width: `${job.progress_percentage || 0}%`}}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            {job.progress_percentage || 0}% ({job.processed_items || 0}/{job.total_items})
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}