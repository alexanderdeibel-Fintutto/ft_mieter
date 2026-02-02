import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ClipboardList, 
    Plus, 
    Clock, 
    CheckCircle2, 
    Users,
    ChevronRight,
    BarChart3,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import useAuth from '../components/useAuth';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import CreateSurveyDialog from '../components/umfragen/CreateSurveyDialog';
import SurveyParticipateDialog from '../components/umfragen/SurveyParticipateDialog';
import SurveyResultsDialog from '../components/umfragen/SurveyResultsDialog';
import { useAppNotifications } from '../components/notifications/useAppNotifications';

const DEMO_SURVEYS = [
    {
        id: 'survey-1',
        title: 'Zufriedenheit mit der Hausverwaltung',
        description: 'Wir möchten Ihre Meinung zu unseren Dienstleistungen erfahren.',
        status: 'active',
        created_at: '2025-01-10T10:00:00',
        ends_at: '2025-02-10T23:59:59',
        questions: [
            { id: 'q1', type: 'rating', question: 'Wie zufrieden sind Sie insgesamt mit der Hausverwaltung?', required: true },
            { id: 'q2', type: 'multiple_choice', question: 'Welche Bereiche sollten verbessert werden?', options: ['Kommunikation', 'Reaktionszeit', 'Reparaturen', 'Sauberkeit', 'Nichts'], multiple: true, required: false },
            { id: 'q3', type: 'text', question: 'Haben Sie weitere Anregungen oder Wünsche?', required: false },
        ],
        responses: [
            { user_id: 'user-2', answers: { q1: 4, q2: ['Kommunikation'], q3: 'Mehr digitale Updates wären toll.' }, submitted_at: '2025-01-15T14:00:00' },
            { user_id: 'user-3', answers: { q1: 5, q2: [], q3: '' }, submitted_at: '2025-01-16T09:00:00' },
            { user_id: 'user-4', answers: { q1: 3, q2: ['Reaktionszeit', 'Reparaturen'], q3: 'Schnellere Bearbeitung von Anfragen.' }, submitted_at: '2025-01-17T11:00:00' },
        ],
        total_recipients: 12,
    },
    {
        id: 'survey-2',
        title: 'Interesse an Gemeinschaftsgarten',
        description: 'Wir prüfen die Möglichkeit einen Gemeinschaftsgarten anzulegen.',
        status: 'active',
        created_at: '2025-01-18T09:00:00',
        ends_at: '2025-01-31T23:59:59',
        questions: [
            { id: 'q1', type: 'single_choice', question: 'Hätten Sie Interesse an einem Gemeinschaftsgarten?', options: ['Ja, sehr', 'Vielleicht', 'Nein'], required: true },
            { id: 'q2', type: 'multiple_choice', question: 'Was würden Sie gerne anbauen?', options: ['Gemüse', 'Kräuter', 'Blumen', 'Obst'], multiple: true, required: false },
            { id: 'q3', type: 'single_choice', question: 'Würden Sie sich an der Pflege beteiligen?', options: ['Ja, regelmäßig', 'Gelegentlich', 'Nein'], required: true },
        ],
        responses: [
            { user_id: 'user-2', answers: { q1: 'Ja, sehr', q2: ['Gemüse', 'Kräuter'], q3: 'Ja, regelmäßig' }, submitted_at: '2025-01-19T10:00:00' },
        ],
        total_recipients: 12,
    },
    {
        id: 'survey-3',
        title: 'Bewertung der Treppenhausreinigung',
        description: 'Feedback zur neuen Reinigungsfirma.',
        status: 'closed',
        created_at: '2024-12-01T10:00:00',
        ends_at: '2024-12-31T23:59:59',
        questions: [
            { id: 'q1', type: 'rating', question: 'Wie bewerten Sie die Sauberkeit des Treppenhauses?', required: true },
            { id: 'q2', type: 'single_choice', question: 'Wird regelmäßig genug gereinigt?', options: ['Ja', 'Nein', 'Weiß nicht'], required: true },
        ],
        responses: [
            { user_id: 'user-1', answers: { q1: 4, q2: 'Ja' }, submitted_at: '2024-12-15T14:00:00' },
            { user_id: 'user-2', answers: { q1: 5, q2: 'Ja' }, submitted_at: '2024-12-16T09:00:00' },
            { user_id: 'user-3', answers: { q1: 3, q2: 'Nein' }, submitted_at: '2024-12-17T11:00:00' },
            { user_id: 'user-4', answers: { q1: 4, q2: 'Ja' }, submitted_at: '2024-12-18T10:00:00' },
            { user_id: 'user-5', answers: { q1: 4, q2: 'Ja' }, submitted_at: '2024-12-20T15:00:00' },
        ],
        total_recipients: 12,
    },
];

function SurveyCard({ survey, onParticipate, onViewResults, isAdmin, hasParticipated }) {
    const isActive = survey.status === 'active' && new Date(survey.ends_at) > new Date();
    const responseRate = Math.round((survey.responses.length / survey.total_recipients) * 100);
    const daysLeft = Math.ceil((new Date(survey.ends_at) - new Date()) / (1000 * 60 * 60 * 24));

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all"
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{survey.title}</h3>
                        {isActive ? (
                            <Badge className="bg-green-100 text-green-700">Aktiv</Badge>
                        ) : (
                            <Badge className="bg-gray-100 text-gray-600">Beendet</Badge>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{survey.description}</p>
                </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(survey.created_at).toLocaleDateString('de-DE')}
                </span>
                {isActive && daysLeft > 0 && (
                    <span className="flex items-center gap-1 text-amber-600">
                        <Clock className="w-3 h-3" />
                        Noch {daysLeft} Tag{daysLeft !== 1 ? 'e' : ''}
                    </span>
                )}
                <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {survey.responses.length}/{survey.total_recipients} Teilnehmer
                </span>
            </div>

            {/* Progress */}
            <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Teilnahmequote</span>
                    <span className="font-medium">{responseRate}%</span>
                </div>
                <Progress value={responseRate} className="h-2" />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {isAdmin ? (
                    <Button
                        onClick={() => onViewResults(survey)}
                        className="flex-1 bg-violet-600 hover:bg-violet-700"
                        size="sm"
                    >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Ergebnisse
                    </Button>
                ) : isActive && !hasParticipated ? (
                    <Button
                        onClick={() => onParticipate(survey)}
                        className="flex-1 bg-violet-600 hover:bg-violet-700"
                        size="sm"
                    >
                        Teilnehmen
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                ) : hasParticipated ? (
                    <div className="flex-1 flex items-center justify-center gap-2 text-green-600 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Bereits teilgenommen
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center gap-2 text-gray-500 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        Umfrage beendet
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default function Umfragen() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [surveys, setSurveys] = useState(DEMO_SURVEYS);
    const [activeTab, setActiveTab] = useState('active');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [participateDialog, setParticipateDialog] = useState(null);
    const [resultsDialog, setResultsDialog] = useState(null);

    const isAdmin = user?.email?.includes('admin') || user?.role === 'admin';
    const currentUserId = user?.id || 'user-1';
    const { notifyNewSurvey, notifySurveyResponse } = useAppNotifications();

    useEffect(() => {
        if (!authLoading && !user) {
            navigate(createPageUrl('Register'));
        }
    }, [user, authLoading, navigate]);

    const handleCreateSurvey = (newSurvey) => {
        const survey = {
            id: `survey-${Date.now()}`,
            ...newSurvey,
            status: 'active',
            created_at: new Date().toISOString(),
            responses: [],
            total_recipients: 12,
        };
        setSurveys(prev => [survey, ...prev]);
        setCreateDialogOpen(false);
        toast.success('Umfrage erstellt');
        
        // Notify all tenants about new survey
        notifyNewSurvey(survey);
    };

    const handleSubmitResponse = (surveyId, answers) => {
        setSurveys(prev => prev.map(s => {
            if (s.id === surveyId) {
                const updatedSurvey = {
                    ...s,
                    responses: [...s.responses, {
                        user_id: currentUserId,
                        answers,
                        submitted_at: new Date().toISOString()
                    }]
                };
                
                // Notify admin about new response
                notifySurveyResponse(updatedSurvey, updatedSurvey.responses.length);
                
                return updatedSurvey;
            }
            return s;
        }));
        setParticipateDialog(null);
        toast.success('Vielen Dank für Ihre Teilnahme!');
    };

    const hasParticipated = (survey) => {
        return survey.responses.some(r => r.user_id === currentUserId);
    };

    const activeSurveys = surveys.filter(s => s.status === 'active' && new Date(s.ends_at) > new Date());
    const closedSurveys = surveys.filter(s => s.status === 'closed' || new Date(s.ends_at) <= new Date());
    
    const displaySurveys = activeTab === 'active' ? activeSurveys : closedSurveys;

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-100 rounded-xl">
                            <ClipboardList className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Umfragen</h1>
                            <p className="text-xs text-gray-500">
                                {activeSurveys.length} aktiv
                            </p>
                        </div>
                    </div>
                    {isAdmin && (
                        <Button
                            onClick={() => setCreateDialogOpen(true)}
                            className="bg-violet-600 hover:bg-violet-700"
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Neue Umfrage
                        </Button>
                    )}
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full justify-start px-4 h-12 bg-transparent">
                        <TabsTrigger value="active" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                            Aktiv ({activeSurveys.length})
                        </TabsTrigger>
                        <TabsTrigger value="closed" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
                            Beendet ({closedSurveys.length})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </header>

            {/* Stats for Admin */}
            {isAdmin && (
                <div className="p-4 pb-0">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-violet-50 rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-violet-600">{surveys.length}</p>
                            <p className="text-xs text-violet-600">Gesamt</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-green-600">
                                {Math.round(surveys.reduce((acc, s) => acc + s.responses.length, 0) / surveys.length)}
                            </p>
                            <p className="text-xs text-green-600">Ø Teilnehmer</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-blue-600">
                                {Math.round((surveys.reduce((acc, s) => acc + (s.responses.length / s.total_recipients), 0) / surveys.length) * 100)}%
                            </p>
                            <p className="text-xs text-blue-600">Ø Quote</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Surveys List */}
            <div className="p-4 space-y-3">
                <AnimatePresence>
                    {displaySurveys.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p>Keine {activeTab === 'active' ? 'aktiven' : 'beendeten'} Umfragen</p>
                            {isAdmin && activeTab === 'active' && (
                                <Button onClick={() => setCreateDialogOpen(true)} className="mt-4 bg-violet-600 hover:bg-violet-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Erste Umfrage erstellen
                                </Button>
                            )}
                        </div>
                    ) : (
                        displaySurveys.map(survey => (
                            <SurveyCard
                                key={survey.id}
                                survey={survey}
                                onParticipate={setParticipateDialog}
                                onViewResults={setResultsDialog}
                                isAdmin={isAdmin}
                                hasParticipated={hasParticipated(survey)}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Create Dialog */}
            {isAdmin && (
                <CreateSurveyDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                    onSubmit={handleCreateSurvey}
                />
            )}

            {/* Participate Dialog */}
            <SurveyParticipateDialog
                open={!!participateDialog}
                onOpenChange={(open) => !open && setParticipateDialog(null)}
                survey={participateDialog}
                onSubmit={handleSubmitResponse}
            />

            {/* Results Dialog */}
            <SurveyResultsDialog
                open={!!resultsDialog}
                onOpenChange={(open) => !open && setResultsDialog(null)}
                survey={resultsDialog}
            />
        </div>
    );
}