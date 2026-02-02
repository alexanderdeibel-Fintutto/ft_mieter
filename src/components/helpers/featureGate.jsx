import { base44 } from '@/api/base44Client';

export const FEATURES = {
    UNLIMITED_OBJECTS: 'unlimited_objects',
    UNLIMITED_UNITS: 'unlimited_units',
    UNLIMITED_DOCUMENTS: 'unlimited_documents',
    TEAM_MEMBERS: 'team_members',
    KI_RECHTSASSISTENT: 'ki_rechtsassistent',
    NK_PRUEFUNG: 'nk_pruefung',
    WINTERDIENST: 'winterdienst',
    KI_ZAEHLER: 'ki_zaehler',
    KUNDENPORTAL: 'kundenportal'
};

export async function isFeatureAvailable(appId, feature) {
    try {
        const response = await base44.functions.invoke('getUserAppAccess', {
            p_app_id: appId
        });
        const access = response.data;

        if (!access.has_access) return false;

        const featureMap = {
            [FEATURES.UNLIMITED_OBJECTS]: !access.limits?.objects || access.limits.objects > 10,
            [FEATURES.UNLIMITED_UNITS]: !access.limits?.units || access.limits.units > 50,
            [FEATURES.UNLIMITED_DOCUMENTS]: !access.limits?.documents,
            [FEATURES.TEAM_MEMBERS]: access.limits?.team_members > 1,
            [FEATURES.KI_RECHTSASSISTENT]: access.access_type !== 'free_tier',
            [FEATURES.NK_PRUEFUNG]: access.access_type !== 'free_tier',
        };

        return featureMap[feature] || false;
    } catch (error) {
        console.error('Feature check failed:', error);
        return false;
    }
}

export function getFeatureInfo(feature) {
    const info = {
        [FEATURES.UNLIMITED_OBJECTS]: { label: 'Unbegrenzte Objekte', tier: 'Basic' },
        [FEATURES.UNLIMITED_DOCUMENTS]: { label: 'Unbegrenzte Dokumente', tier: 'Basic' },
        [FEATURES.KI_RECHTSASSISTENT]: { label: 'KI-Rechtsassistent', tier: 'Plus' },
        [FEATURES.NK_PRUEFUNG]: { label: 'NK-Prüfung', tier: 'Plus' }
    };
    return info[feature] || { label: feature, tier: 'Premium' };
}