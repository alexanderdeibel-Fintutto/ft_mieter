import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LocalizationDashboard({ organizationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('languages');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, [organizationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await base44.functions.invoke('localizationEngine', {
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
        translated: 'bg-blue-100 text-blue-800',
        reviewed: 'bg-purple-100 text-purple-800',
        approved: 'bg-green-100 text-green-800',
        published: 'bg-indigo-100 text-indigo-800',
        in_progress: 'bg-orange-100 text-orange-800',
        completed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        cancelled: 'bg-gray-100 text-gray-800'
    };

    const jobTypeColors = {
        import: 'bg-blue-100 text-blue-800',
        export: 'bg-purple-100 text-purple-800',
        extraction: 'bg-green-100 text-green-800',
        validation: 'bg-orange-100 text-orange-800',
        sync: 'bg-indigo-100 text-indigo-800',
        translation: 'bg-pink-100 text-pink-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b">
                {['languages', 'translations', 'jobs'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${
                            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab === 'languages' && '🌍 Sprachen'}
                        {tab === 'translations' && '📝 Übersetzungen'}
                        {tab === 'jobs' && '⚙️ Jobs'}
                    </button>
                ))}
            </div>

            {activeTab === 'languages' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.language_stats.total_languages}
                            </div>
                            <div className="text-xs text-gray-600">Sprachen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.language_stats.active_languages}
                            </div>
                            <div className="text-xs text-gray-600">Aktiv</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.language_stats.avg_coverage}%
                            </div>
                            <div className="text-xs text-gray-600">Ø Abdeckung</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-indigo-600">
                                {data.language_stats.total_translations}
                            </div>
                            <div className="text-xs text-gray-600">Übersetzungen</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.languages.map(language => (
                            <Card key={language.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm">{language.language_name}</h5>
                                                <Badge variant="outline">{language.language_code}</Badge>
                                                {language.is_rtl && (
                                                    <Badge variant="outline" className="text-xs">RTL</Badge>
                                                )}
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Locale: {language.locale}
                                                </span>
                                                {language.region_code && (
                                                    <span className="text-xs text-gray-600">
                                                        Region: {language.region_code}
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-600">
                                                    Währung: {language.currency_code}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Datums-Format: {language.date_format}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Zeit-Format: {language.time_format}
                                                </span>
                                            </div>
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-gray-600">
                                                        Übersetzungen: {language.translated_keys} / {language.total_keys}
                                                    </span>
                                                    <span className="text-xs font-semibold">
                                                        {language.translation_coverage}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="h-2 rounded-full bg-green-500"
                                                        style={{ width: `${language.translation_coverage}%` }}
                                                    />
                                                </div>
                                            </div>
                                            {language.last_update && (
                                                <span className="text-xs text-gray-600 mt-2 inline-block">
                                                    Aktualisiert: {new Date(language.last_update).toLocaleString('de-DE')}
                                                </span>
                                            )}
                                        </div>
                                        <Badge className={language.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {language.is_active ? 'ON' : 'OFF'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'translations' && (
                <>
                    <div className="grid grid-cols-5 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.translation_stats.total_keys}
                            </div>
                            <div className="text-xs text-gray-600">Gesamt-Keys</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">
                                {data.translation_stats.pending}
                            </div>
                            <div className="text-xs text-gray-600">Ausstehend</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.translation_stats.translated}
                            </div>
                            <div className="text-xs text-gray-600">Übersetzt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.translation_stats.approved}
                            </div>
                            <div className="text-xs text-gray-600">Genehmigt</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {data.translation_stats.reviewed}
                            </div>
                            <div className="text-xs text-gray-600">Überprüft</div>
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.translations.map(translation => (
                            <Card key={translation.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-600" />
                                                <span className="font-semibold text-sm font-mono">
                                                    {translation.key}
                                                </span>
                                                <Badge variant="outline" className="text-xs">
                                                    {translation.language_code}
                                                </Badge>
                                                {translation.context && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {translation.context}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-xs text-gray-600 mb-1">
                                                    <span className="font-semibold">Original:</span> {translation.original_text}
                                                </p>
                                                {translation.translated_text && (
                                                    <p className="text-xs text-gray-600">
                                                        <span className="font-semibold">Übersetzung:</span> {translation.translated_text}
                                                    </p>
                                                )}
                                            </div>
                                            {translation.notes && (
                                                <p className="text-xs text-gray-500 mt-1 italic">
                                                    Note: {translation.notes}
                                                </p>
                                            )}
                                        </div>
                                        <Badge className={statusColors[translation.status]}>
                                            {translation.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'jobs' && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{data.job_stats.total_jobs}</div>
                            <div className="text-xs text-gray-600">Jobs</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{data.job_stats.completed_jobs}</div>
                            <div className="text-xs text-gray-600">Abgeschlossen</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-orange-600">{data.job_stats.in_progress}</div>
                            <div className="text-xs text-gray-600">In Bearbeitung</div>
                        </CardContent></Card>
                        <Card><CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{data.job_stats.failed_jobs}</div>
                            <div className="text-xs text-gray-600">Fehlgeschlagen</div>
                        </CardContent></Card>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <Card><CardContent className="p-4">
                            <h4 className="font-semibold text-sm mb-2">Jobs nach Status</h4>
                            {Object.entries(data.jobs_by_status || {}).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between">
                                    <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
                                        {status}
                                    </Badge>
                                    <span className="text-sm font-semibold">{count}</span>
                                </div>
                            ))}
                        </CardContent></Card>
                    </div>

                    <div className="space-y-2">
                        {data.jobs.map(job => (
                            <Card key={job.id}>
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                {job.status === 'completed' && (
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                )}
                                                <span className="font-semibold text-sm">
                                                    {job.job_id.substring(0, 12)}...
                                                </span>
                                                <Badge className={jobTypeColors[job.job_type]}>
                                                    {job.job_type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Von: {job.source_language}
                                                </span>
                                                {job.target_languages && job.target_languages.length > 0 && (
                                                    <span className="text-xs text-gray-600">
                                                        Nach: {job.target_languages.join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    Keys: {job.processed_keys || 0} / {job.total_keys || 0}
                                                </span>
                                                <span className="text-xs text-green-600">
                                                    Übersetzt: {job.translated_keys || 0}
                                                </span>
                                                {job.failed_keys > 0 && (
                                                    <span className="text-xs text-red-600">
                                                        Fehler: {job.failed_keys}
                                                    </span>
                                                )}
                                            </div>
                                            {job.progress_percentage !== undefined && (
                                                <div className="mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                            <div 
                                                                className="h-2 rounded-full bg-blue-500"
                                                                style={{ width: `${job.progress_percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-semibold">
                                                            {job.progress_percentage}%
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            <span className="text-xs text-gray-600 mt-2 inline-block">
                                                {new Date(job.started_at).toLocaleString('de-DE')}
                                            </span>
                                        </div>
                                        <Badge className={statusColors[job.status]}>
                                            {job.status}
                                        </Badge>
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