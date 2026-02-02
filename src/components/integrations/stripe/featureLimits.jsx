import { STRIPE_CONFIG } from './config';

/**
 * Helper-Funktionen für Feature-Limit-Checks in der MieterApp
 */

export const checkFeatureLimit = (tier, feature) => {
    const features = STRIPE_CONFIG.mieterappFeatures?.[tier] || STRIPE_CONFIG.mieterappFeatures.free;
    return features[feature];
};

export const hasUnlimitedAccess = (tier, feature) => {
    const limit = checkFeatureLimit(tier, feature);
    return limit === -1 || limit === true;
};

export const getRemainingQuota = (tier, feature, currentUsage) => {
    const limit = checkFeatureLimit(tier, feature);
    
    if (limit === -1) return -1; // Unlimited
    if (typeof limit === 'boolean') return limit;
    
    return Math.max(0, limit - currentUsage);
};

export const canUseFeature = (tier, feature, currentUsage = 0) => {
    const limit = checkFeatureLimit(tier, feature);
    
    if (limit === -1) return true;
    if (typeof limit === 'boolean') return limit;
    if (typeof limit === 'number') return currentUsage < limit;
    
    return false;
};

/**
 * Feature-spezifische Checks für UI
 */
export const featureChecks = {
    documentUpload: (tier, currentCount) => ({
        allowed: canUseFeature(tier, 'documentUpload', currentCount),
        remaining: getRemainingQuota(tier, 'documentUpload', currentCount),
        upgradeMessage: tier === 'free' 
            ? 'Upgrade auf Basic für unbegrenzte Dokument-Uploads' 
            : null
    }),
    
    repairRequest: (tier, monthlyCount) => ({
        allowed: canUseFeature(tier, 'repairRequests', monthlyCount),
        remaining: getRemainingQuota(tier, 'repairRequests', monthlyCount),
        upgradeMessage: tier === 'free'
            ? 'Upgrade auf Basic für unbegrenzte Reparaturmeldungen'
            : null
    }),
    
    aiChat: (tier, monthlyMessages) => ({
        allowed: canUseFeature(tier, 'aiChatMessages', monthlyMessages),
        remaining: getRemainingQuota(tier, 'aiChatMessages', monthlyMessages),
        upgradeMessage: tier === 'free'
            ? 'Upgrade auf Basic für 30 KI-Nachrichten oder auf Pro für unbegrenzte KI-Power'
            : tier === 'basic'
            ? 'Upgrade auf Pro für unbegrenzte KI-Nachrichten'
            : null
    }),
    
    mietrechtAnalyse: (tier) => ({
        allowed: checkFeatureLimit(tier, 'mietrechtAnalysen') !== 0,
        unlimited: hasUnlimitedAccess(tier, 'mietrechtAnalysen'),
        upgradeMessage: tier !== 'pro' && tier !== 'business'
            ? 'Upgrade auf Pro für detaillierte Mietrecht-Analysen mit Claude KI'
            : null
    }),
    
    letterXpress: (tier, monthlyLetters) => ({
        allowed: canUseFeature(tier, 'letterXpressLetters', monthlyLetters),
        remaining: getRemainingQuota(tier, 'letterXpressLetters', monthlyLetters),
        upgradeMessage: tier === 'free'
            ? 'Upgrade auf Basic für 3 Briefe/Monat oder auf Pro für 10 Briefe/Monat'
            : tier === 'basic'
            ? 'Upgrade auf Pro für mehr LetterXpress-Briefe'
            : null
    }),
    
    marketplaceListing: (tier, activeListings) => ({
        allowed: canUseFeature(tier, 'marketplaceListings', activeListings),
        remaining: getRemainingQuota(tier, 'marketplaceListings', activeListings),
        upgradeMessage: tier === 'free'
            ? 'Upgrade auf Basic für 10 Inserate oder auf Pro für unbegrenzte Inserate'
            : tier === 'basic'
            ? 'Upgrade auf Pro für unbegrenzte Marktplatz-Inserate'
            : null
    }),
    
    groupChat: (tier, currentGroups) => ({
        allowed: canUseFeature(tier, 'groupChats', currentGroups),
        remaining: getRemainingQuota(tier, 'groupChats', currentGroups),
        upgradeMessage: tier === 'free'
            ? 'Upgrade auf Basic für 5 Gruppenchats oder auf Pro für unbegrenzte Gruppen'
            : tier === 'basic'
            ? 'Upgrade auf Pro für unbegrenzte Gruppenchats'
            : null
    })
};

/**
 * Pricing-Empfehlungen basierend auf Nutzung
 */
export const getUpgradeRecommendation = (tier, usageData) => {
    if (tier === 'business' || tier === 'bundle') return null;
    
    const recommendations = [];
    
    // Check verschiedene Limits
    if (usageData.documentUploads >= 5 && tier === 'free') {
        recommendations.push({
            feature: 'Dokumente',
            reason: 'Du hast dein Upload-Limit erreicht',
            suggestedTier: 'basic',
            savings: 'Unbegrenzte Uploads ab 4,90€/Monat'
        });
    }
    
    if (usageData.aiMessages > 0 && tier === 'free') {
        recommendations.push({
            feature: 'KI-Assistent',
            reason: 'Du versuchst den KI-Chat zu nutzen',
            suggestedTier: 'basic',
            savings: '30 KI-Nachrichten/Monat ab 4,90€'
        });
    }
    
    if (usageData.aiMessages >= 25 && tier === 'basic') {
        recommendations.push({
            feature: 'Unlimited KI',
            reason: 'Du nutzt fast dein KI-Limit auf',
            suggestedTier: 'pro',
            savings: 'Unbegrenzte KI + Mietrecht-Analysen ab 9,90€/Monat'
        });
    }
    
    if (usageData.needsLegalAdvice && tier !== 'pro') {
        recommendations.push({
            feature: 'Mietrecht-KI',
            reason: 'Du hast Fragen zu Mietrecht',
            suggestedTier: 'pro',
            savings: 'Detaillierte rechtliche Analysen mit Claude KI'
        });
    }
    
    if (usageData.repairRequests >= 3 && tier === 'free') {
        recommendations.push({
            feature: 'Reparaturen',
            reason: 'Du meldest viele Reparaturen',
            suggestedTier: 'basic',
            savings: 'Unbegrenzte Reparaturmeldungen'
        });
    }
    
    return recommendations.length > 0 ? recommendations[0] : null;
};

export default {
    checkFeatureLimit,
    hasUnlimitedAccess,
    getRemainingQuota,
    canUseFeature,
    featureChecks,
    getUpgradeRecommendation
};