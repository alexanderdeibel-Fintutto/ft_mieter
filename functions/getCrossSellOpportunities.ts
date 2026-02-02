import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 4: Cross-Selling & Unified Recommendations
 * Empfiehlt passende Apps basierend auf Nutzer-Verhalten und Rollen
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { current_app_id } = await req.json();

        // Hole User Seats
        const seats = await base44.entities.SeatAllocation.filter({
            receiving_user_id: user.id,
            is_active: true
        });

        const activeApps = seats.map(s => s.app_id);

        // Bestimme Recommendations basierend auf Rolle & aktiven Apps
        const recommendations = getRecommendations(activeApps, user.role, current_app_id);

        return Response.json({
            recommendations: recommendations,
            current_user_role: user.role,
            active_apps: activeApps
        });
    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function getRecommendations(activeApps, userRole, currentAppId) {
    const allApps = {
        vermietify: {
            name: 'Vermietify',
            description: 'Vermögensmanagement für Vermieter',
            icon: '🏢',
            targetAudience: ['vermieter'],
            complementary: ['hausmeisterpro', 'mieterapp'],
            features: ['Immobilienverwaltung', 'Mietverträge', 'Zahlungsabwicklung']
        },
        hausmeisterpro: {
            name: 'Hausmeister Pro',
            description: 'Wartungs- & Instandhaltungsmanagement',
            icon: '🔧',
            targetAudience: ['hausmeister', 'vermieter'],
            complementary: ['vermietify', 'mieterapp'],
            features: ['Aufgabenverwaltung', 'Zeiterfassung', 'Berichte']
        },
        mieterapp: {
            name: 'Mieter Portal',
            description: 'Tenant Portal für Mietern',
            icon: '🏠',
            targetAudience: ['mieter'],
            complementary: ['vermietify'],
            features: ['Mietverträge', 'Zahlungen', 'Wartungsanfragen']
        },
        rechner: {
            name: 'Immobilien Rechner',
            description: 'Finanzielle Berechnungen & Analysen',
            icon: '📊',
            targetAudience: ['vermieter', 'investor'],
            complementary: ['vermietify'],
            features: ['Rendite-Rechner', 'Nebenkosten', 'Steuern']
        }
    };

    const recommendations = [];

    // Für Vermieter: Empfehle zusätzliche Tools
    if (userRole === 'admin' || userRole === 'owner') {
        // Vermietify + Hausmeister Pro + Rechner
        ['vermietify', 'hausmeisterpro', 'rechner'].forEach(appId => {
            if (!activeApps.includes(appId) && appId !== currentAppId) {
                recommendations.push({
                    ...allApps[appId],
                    app_id: appId,
                    priority: appId === 'rechner' ? 'medium' : 'high',
                    reason: 'Ergänzende Tools für effiziente Verwaltung'
                });
            }
        });
    }

    // Für Hausmeister: Empfehle Vermietify für Koordination
    if (userRole === 'hausmeister') {
        if (!activeApps.includes('vermietify')) {
            recommendations.push({
                ...allApps.vermietify,
                app_id: 'vermietify',
                priority: 'medium',
                reason: 'Bessere Koordination mit Vermieter'
            });
        }
    }

    // Für Mieter: Keine Empfehlung nötig
    // Standardempfehlung: Rechner für finanzielle Planung
    if (!activeApps.includes('rechner') && currentAppId !== 'rechner') {
        recommendations.push({
            ...allApps.rechner,
            app_id: 'rechner',
            priority: 'low',
            reason: 'Tools zur finanziellen Planung'
        });
    }

    return recommendations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    });
}