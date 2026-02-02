import { useCallback } from 'react';
import { usePushNotifications } from './PushNotificationService';
import { createPageUrl } from '../../utils';

export function useAppNotifications() {
    const { sendNotification } = usePushNotifications();

    // Repair notifications
    const notifyNewRepair = useCallback((repair, isAdmin) => {
        if (isAdmin) {
            sendNotification(
                'repairs',
                'Neue Reparaturmeldung',
                `${repair.title} - ${repair.location}`,
                {
                    data: { repairId: repair.id, type: 'new_repair' },
                    onClick: () => window.location.href = createPageUrl('Reparaturen'),
                }
            );
        }
    }, [sendNotification]);

    const notifyRepairStatusUpdate = useCallback((repair, newStatus) => {
        const statusLabels = {
            in_bearbeitung: 'In Bearbeitung',
            handwerker_beauftragt: 'Handwerker beauftragt',
            termin_vereinbart: 'Termin vereinbart',
            abgeschlossen: 'Abgeschlossen',
        };
        sendNotification(
            'repairs',
            'Reparatur-Update',
            `${repair.title}: ${statusLabels[newStatus] || newStatus}`,
            {
                data: { repairId: repair.id, type: 'repair_status' },
                onClick: () => window.location.href = createPageUrl('Reparaturen'),
            }
        );
    }, [sendNotification]);

    // Survey notifications
    const notifyNewSurvey = useCallback((survey) => {
        sendNotification(
            'surveys',
            'Neue Umfrage verfügbar',
            survey.title,
            {
                data: { surveyId: survey.id, type: 'new_survey' },
                onClick: () => window.location.href = createPageUrl('Umfragen'),
            }
        );
    }, [sendNotification]);

    const notifySurveyResponse = useCallback((survey, responseCount) => {
        sendNotification(
            'surveys',
            'Neue Umfrage-Antwort',
            `${survey.title}: ${responseCount} Teilnehmer`,
            {
                data: { surveyId: survey.id, type: 'survey_response' },
                onClick: () => window.location.href = createPageUrl('Umfragen'),
            }
        );
    }, [sendNotification]);

    // Document notifications
    const notifyNewDocument = useCallback((document) => {
        sendNotification(
            'documents',
            'Neues Dokument verfügbar',
            document.name,
            {
                data: { documentId: document.id, type: 'new_document' },
                onClick: () => window.location.href = createPageUrl('Dokumente'),
            }
        );
    }, [sendNotification]);

    // Announcement notifications
    const notifyNewAnnouncement = useCallback((announcement) => {
        const priorityText = announcement.priority === 'urgent' ? '🚨 DRINGEND: ' : 
                           announcement.priority === 'important' ? '⚠️ WICHTIG: ' : '';
        sendNotification(
            'announcements',
            `${priorityText}Neue Ankündigung`,
            announcement.title,
            {
                data: { announcementId: announcement.id, type: 'new_announcement' },
                requireInteraction: announcement.priority === 'urgent',
                onClick: () => window.location.href = createPageUrl('Ankuendigungen'),
            }
        );
    }, [sendNotification]);

    return {
        notifyNewRepair,
        notifyRepairStatusUpdate,
        notifyNewSurvey,
        notifySurveyResponse,
        notifyNewDocument,
        notifyNewAnnouncement,
    };
}

export default useAppNotifications;