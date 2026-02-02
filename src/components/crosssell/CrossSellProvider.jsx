import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import CrossSellModal from './CrossSellModal';
import CrossSellBanner from './CrossSellBanner';
import CrossSellToast from './CrossSellToast';

const CrossSellContext = createContext(null);

// Session storage für Cross-Sell Tracking
const STORAGE_KEY = 'mieterapp_crosssell_state';
const MAX_SHOWS_PER_SESSION = 3;
const MIN_TIME_BETWEEN_SHOWS = 5 * 60 * 1000; // 5 Minuten

const getSessionState = () => {
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {
            showCount: 0,
            lastShownAt: null,
            dismissedRecommendations: []
        };
    } catch {
        return { showCount: 0, lastShownAt: null, dismissedRecommendations: [] };
    }
};

const updateSessionState = (updates) => {
    const current = getSessionState();
    const updated = { ...current, ...updates };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
};

export function CrossSellProvider({ children, appSource = 'mieterapp' }) {
    const [recommendation, setRecommendation] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [sessionState, setSessionState] = useState(getSessionState);
    const timeoutRef = useRef(null);
    const queueRef = useRef([]);

    // Prüfe ob Cross-Sell angezeigt werden soll
    const canShowCrossSell = useCallback((recommendationId) => {
        const state = getSessionState();
        
        // Max Shows erreicht?
        if (state.showCount >= MAX_SHOWS_PER_SESSION) {
            console.log('CrossSell: Max shows per session reached');
            return false;
        }

        // Zu früh seit letzter Anzeige?
        if (state.lastShownAt && Date.now() - state.lastShownAt < MIN_TIME_BETWEEN_SHOWS) {
            console.log('CrossSell: Too soon since last show');
            return false;
        }

        // Bereits dismissed?
        if (state.dismissedRecommendations.includes(recommendationId)) {
            console.log('CrossSell: Already dismissed');
            return false;
        }

        return true;
    }, []);

    const triggerCrossSell = useCallback(async (eventType, eventData = {}) => {
        try {
            const response = await base44.functions.invoke('getCrossSellRecommendation', {
                event_type: eventType,
                event_data: eventData,
                current_page: window.location.pathname,
                app_source: appSource,
                session_state: getSessionState()
            });

            const data = response.data;

            if (data.show_recommendation && canShowCrossSell(data.recommendation_id)) {
                // Queue für sequentielle Anzeige
                queueRef.current.push(data);
                
                // Wenn gerade nichts angezeigt wird, zeige sofort
                if (!isVisible && queueRef.current.length === 1) {
                    showNextInQueue();
                }
            }
        } catch (error) {
            console.error('CrossSell Error:', error);
        }
    }, [appSource, canShowCrossSell, isVisible]);

    const showNextInQueue = useCallback(() => {
        if (queueRef.current.length === 0) return;

        const data = queueRef.current[0];
        setRecommendation(data);
        
        // Intelligentes Timing
        const delay = data.timing?.delay_seconds || 0;
        const shouldDelayForUX = data.placement?.location === 'modal' && delay === 0;
        const finalDelay = shouldDelayForUX ? 1000 : delay * 1000;
        
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
            const newState = updateSessionState({
                showCount: sessionState.showCount + 1,
                lastShownAt: Date.now()
            });
            setSessionState(newState);
        }, finalDelay);
    }, [sessionState]);

    const handleClick = useCallback(() => {
        if (recommendation?.messaging?.cta_url) {
            window.open(recommendation.messaging.cta_url, '_blank');
            
            // Track conversion
            if (recommendation.recommendation_id) {
                base44.analytics.track({
                    eventName: 'crosssell_conversion',
                    properties: {
                        recommendation_id: recommendation.recommendation_id,
                        app_source: appSource,
                        target_app: recommendation.target_app
                    }
                }).catch(() => {});
            }
        }
        
        queueRef.current.shift(); // Remove from queue
        setIsVisible(false);
        setRecommendation(null);
        
        // Zeige nächste nach kurzer Pause
        setTimeout(() => showNextInQueue(), 2000);
    }, [recommendation, appSource, showNextInQueue]);

    const handleDismiss = useCallback((permanent = false) => {
        if (permanent && recommendation?.recommendation_id) {
            const newState = updateSessionState({
                dismissedRecommendations: [
                    ...sessionState.dismissedRecommendations,
                    recommendation.recommendation_id
                ]
            });
            setSessionState(newState);

            // Track dismissal
            base44.analytics.track({
                eventName: 'crosssell_dismissed',
                properties: {
                    recommendation_id: recommendation.recommendation_id,
                    app_source: appSource,
                    permanent
                }
            }).catch(() => {});
        }
        
        queueRef.current.shift(); // Remove from queue
        setIsVisible(false);
        setRecommendation(null);
        
        // Zeige nächste nach kurzer Pause
        setTimeout(() => showNextInQueue(), 3000);
    }, [recommendation, sessionState, appSource, showNextInQueue]);

    useEffect(() => {
        const handleLimitReached = (e) => triggerCrossSell('limit_reached', e.detail);
        const handleFeatureBlocked = (e) => triggerCrossSell('feature_blocked', e.detail);
        const handleSuccess = (e) => triggerCrossSell('success', e.detail);
        const handlePageView = () => {
            // Trigger auf wichtigen Seiten nach 10 Sekunden
            const importantPages = ['/home', '/finanzen', '/reparaturen', '/dokumente'];
            if (importantPages.includes(window.location.pathname)) {
                setTimeout(() => {
                    triggerCrossSell('page_view', { 
                        page: window.location.pathname,
                        time_on_page: 10 
                    });
                }, 10000);
            }
        };

        window.addEventListener('fintutto:limit_reached', handleLimitReached);
        window.addEventListener('fintutto:feature_blocked', handleFeatureBlocked);
        window.addEventListener('fintutto:success', handleSuccess);
        
        // Initial page view tracking
        handlePageView();

        return () => {
            window.removeEventListener('fintutto:limit_reached', handleLimitReached);
            window.removeEventListener('fintutto:feature_blocked', handleFeatureBlocked);
            window.removeEventListener('fintutto:success', handleSuccess);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [triggerCrossSell]);

    // Cleanup bei Unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const renderRecommendation = () => {
        if (!isVisible || !recommendation) return null;

        const placement = recommendation.placement?.location || 'modal';
        const showCount = sessionState.showCount;

        // Nach dem 2. Mal nur noch Toast/Banner, keine Modals mehr
        const effectivePlacement = showCount >= 2 && placement === 'modal' 
            ? 'toast' 
            : placement;

        switch (effectivePlacement) {
            case 'modal':
                return (
                    <CrossSellModal 
                        recommendation={recommendation}
                        onAccept={handleClick}
                        onDismiss={handleDismiss}
                        showPermanentDismiss={showCount >= 1}
                    />
                );
            case 'banner':
                return (
                    <CrossSellBanner 
                        recommendation={recommendation}
                        onAccept={handleClick}
                        onDismiss={handleDismiss}
                    />
                );
            case 'toast':
                return (
                    <CrossSellToast 
                        recommendation={recommendation}
                        onAccept={handleClick}
                        onDismiss={handleDismiss}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <CrossSellContext.Provider value={{ 
            triggerCrossSell,
            sessionState,
            canShowMore: sessionState.showCount < MAX_SHOWS_PER_SESSION
        }}>
            {children}
            {renderRecommendation()}
        </CrossSellContext.Provider>
    );
}

export const useCrossSell = () => {
    const context = useContext(CrossSellContext);
    if (!context) {
        return { triggerCrossSell: () => {} };
    }
    return context;
};