import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ListChecks, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function JobSchedulerDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('jobs');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('jobSchedulerEngine', {
                action: 'get_dashboard_data',
                organization_id: organizationId
            });
            setData(res.data);
        } catch (error) {
            console.error('Load error:', error);
            toast.error('Fehler beim Laden');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) {
        return <div className="p-4 text-center text-gray-500">Lädt...</div>;
    }

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        running: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        timeout: 'bg-orange-100 text-orange-800',
        cancelled: 'bg-gray-100 text-gray-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['jobs', 'queues', 'tasks'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'jobs' && '⏰ Jobs'}
                        {tab === 'queues' && '📋 Queues'}
                        {tab === 'tasks' && '⚡ Tasks'}
                    </button>
                ))}
            </div>

            {activeTab === 'jobs' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_jobs}</div>
                            <div className="text-xs text-gray-600">Jobs</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.active_jobs}</div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{data.stats.completed_tasks}</div>
                            <div className="text-xs text-gray-600">Ausgeführt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Nach Typ</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.jobs_by_type || {}).map(([type, count]) => (
                                    <Badge key={type} variant="outline">
                                        {type}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.jobs.map(job => (
                            <Card key={job.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{job.job_name}</h5>
                                                <Badge variant="outline">{job.job_type}</Badge>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Funktion: {job.task_function}
                                            </p>
                                            {job.schedule && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Schedule: {job.schedule}
                                                </p>
                                            )}
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Priorität: {job.priority}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Timeout: {job.timeout_seconds}s
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Retries: {job.retry_count}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-green-600">
                                                    Erfolg: {job.success_count || 0}
                                                </span>
                                                <span className="text-xs text-red-600">
                                                    Fehler: {job.failure_count || 0}
                                                </span>
                                            </div>
                                            {job.last_run_at && (
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    Letzter Run: {new Date(job.last_run_at).toLocaleString('de-DE')}
                                                </span>
                                            )}
                                            {job.next_run_at && (
                                                <span className="text-xs text-gray-600 mt-1 inline-block ml-4">
                                                    Nächster: {new Date(job.next_run_at).toLocaleString('de-DE')}
                                                </span>
                                            )}
                                        </div>
                                        <Badge className={job.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {job.is_active ? 'aktiv' : 'inaktiv'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'queues' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.total_queues}</div>
                            <div className="text-xs text-gray-600">Queues</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.stats.pending_tasks}</div>
                            <div className="text-xs text-gray-600">Wartend</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.running_tasks}</div>
                            <div className="text-xs text-gray-600">Laufend</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.success_rate}%</div>
                            <div className="text-xs text-gray-600">Erfolgsrate</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-3">
                        {data.queues.map(queue => (
                            <Card key={queue.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <ListChecks className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{queue.queue_name}</h5>
                                                <Badge variant="outline">{queue.queue_type}</Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Max Workers: {queue.max_workers}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Concurrency: {queue.concurrency_limit}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Retention: {queue.retention_hours}h
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-yellow-600">
                                                    Pending: {queue.pending_tasks || 0}
                                                </span>
                                                <span className="text-xs text-blue-600">
                                                    Running: {queue.running_tasks || 0}
                                                </span>
                                                <span className="text-xs text-green-600">
                                                    Completed: {queue.completed_tasks || 0}
                                                </span>
                                                <span className="text-xs text-red-600">
                                                    Failed: {queue.failed_tasks || 0}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge className={queue.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {queue.is_active ? 'aktiv' : 'inaktiv'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'tasks' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{data.stats.pending_tasks}</div>
                            <div className="text-xs text-gray-600">Pending</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.stats.running_tasks}</div>
                            <div className="text-xs text-gray-600">Running</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.stats.completed_tasks}</div>
                            <div className="text-xs text-gray-600">Completed</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-xs text-gray-600 mb-2">Status</div>
                            <div className="flex flex-wrap gap-1">
                                {Object.entries(data.tasks_by_status || {}).map(([status, count]) => (
                                    <Badge key={status} className={statusColors[status]}>
                                        {status}: {count}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.tasks.map(task => {
                            const queue = data.queues.find(q => q.id === task.queue_id);
                            return (
                                <Card key={task.id}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-blue-600" />
                                                    <span className="font-semibold text-sm">{task.task_name}</span>
                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                        {task.task_id.substring(0, 8)}...
                                                    </code>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Queue: {queue?.queue_name || 'Unknown'}
                                                </p>
                                                {task.worker_id && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Worker: {task.worker_id}
                                                    </p>
                                                )}
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs text-gray-600">
                                                        Priorität: {task.priority}
                                                    </span>
                                                    {task.retry_count > 0 && (
                                                        <span className="text-xs text-orange-600">
                                                            Retries: {task.retry_count}
                                                        </span>
                                                    )}
                                                    {task.duration_ms && (
                                                        <span className="text-xs text-gray-600">
                                                            Dauer: {task.duration_ms}ms
                                                        </span>
                                                    )}
                                                </div>
                                                {task.started_at && (
                                                    <span className="text-xs text-gray-600 mt-2 inline-block">
                                                        Start: {new Date(task.started_at).toLocaleString('de-DE')}
                                                    </span>
                                                )}
                                                {task.error_message && (
                                                    <p className="text-xs text-red-600 mt-1">
                                                        Error: {task.error_message}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge className={statusColors[task.status]}>
                                                {task.status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}