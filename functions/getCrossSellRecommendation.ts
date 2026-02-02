import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from "npm:@supabase/supabase-js";

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL"),
            Deno.env.get("SUPABASE_SERVICE_KEY")
        );

        const body = await req.json();
        const { 
            event_type,
            event_data = {},
            current_page,
            app_source = 'mieterapp',
            session_state = { dismissedRecommendations: [] },
            force_check = false
        } = body;

        // Lade verfügbare Cross-Sell Apps aus fintutto_apps
        const { data: crossSellApps, error: crossSellError } = await supabase
            .from('fintutto_apps')
            .select('slug, name, tagline, description, icon_url, cta_url, primary_color')
            .contains('cross_sell_for', [app_source])
            .eq('active', true);

        if (crossSellError) {
            console.error('Error fetching cross-sell apps:', crossSellError);
        }

        const availableCrossSell = crossSellApps?.filter(app => 
            !session_state.dismissedRecommendations.includes(app.slug)
        ) || [];
        
        // Einfache Regel-basierte Empfehlungen für häufige Szenarien
        
        // Limit erreicht
        if (event_type === 'limit_reached') {
            const limitType = event_data?.limit_type;
            const currentValue = event_data?.current || 0;
            
            // Priorisiere Cross-Sell Apps wenn verfügbar
            const vermietifyApp = availableCrossSell.find(app => app.slug === 'vermietify');
            if (vermietifyApp) {
                return Response.json({
                    show_recommendation: true,
                    recommendation_id: vermietifyApp.slug,
                    recommendation: {
                        type: 'cross_sell',
                        target: {
                            app: vermietifyApp.slug
                        },
                        priority: 'high',
                        confidence: 0.95
                    },
                    messaging: {
                        headline: `${vermietifyApp.name} entdecken`,
                        body: `Du hast das Limit erreicht. Mit ${vermietifyApp.name} verwaltest du deine Immobilien mühelos.`,
                        cta_text: `Jetzt ${vermietifyApp.name} testen`,
                        cta_url: vermietifyApp.cta_url,
                        dismiss_text: 'Später',
                        icon: vermietifyApp.icon_url || '🏡'
                    },
                    personalization: {
                        user_name: user.full_name?.split(' ')[0] || 'Nutzer',
                        specific_benefit: 'Immobilienverwaltung leicht gemacht'
                    },
                    timing: {
                        show_immediately: true,
                        delay_seconds: 0
                    },
                    placement: {
                        location: 'modal',
                        page: current_page
                    }
                });
            }
            
            return Response.json({
                show_recommendation: true,
                recommendation: {
                    type: 'upgrade',
                    target: {
                        app: app_source,
                        tier: 'basic'
                    },
                    priority: 'high',
                    confidence: 0.95
                },
                messaging: {
                    headline: 'Limit erreicht',
                    body: `Du hast das Limit von ${currentValue} erreicht. Mit dem Basic-Plan gibt es keine Grenzen mehr.`,
                    cta_text: 'Upgrade auf Basic',
                    cta_url: `https://app.${app_source}.de/upgrade?tier=basic&ref=limit_${limitType}`,
                    dismiss_text: 'Später',
                    icon: '🚀'
                },
                personalization: {
                    user_name: user.full_name?.split(' ')[0] || 'Nutzer',
                    specific_benefit: 'Unbegrenzte Nutzung',
                    savings_amount: null,
                    time_savings: null
                },
                timing: {
                    show_immediately: true,
                    delay_seconds: 0
                },
                placement: {
                    location: 'modal',
                    page: current_page
                }
            });
        }

        // Feature blockiert
        if (event_type === 'feature_blocked') {
            const feature = event_data?.feature;
            
            const featureMessages = {
                'letterxpress': {
                    tier: 'basic',
                    headline: 'LetterXpress freischalten',
                    body: 'Mit LetterXpress versendest du Briefe direkt aus der App - für nur 4,90€/Monat.',
                    benefit: 'Keine Porto-Kosten mehr'
                },
                'rechtsassistent': {
                    tier: 'pro',
                    headline: 'Rechtsassistent unlimited',
                    body: 'Unbegrenzte Fragen zum Mietrecht mit dem Pro-Plan.',
                    benefit: 'Spare Anwaltskosten'
                },
                'dokumente_unlimited': {
                    tier: 'basic',
                    headline: 'Unbegrenzte Dokumente',
                    body: 'Speichere alle deine wichtigen Unterlagen ohne Limit.',
                    benefit: 'Voller Zugriff auf alle Dokumente'
                }
            };

            const msg = featureMessages[feature] || {
                tier: 'basic',
                headline: 'Feature freischalten',
                body: 'Dieses Feature ist im Basic-Plan verfügbar.',
                benefit: 'Erweiterte Funktionen'
            };

            return Response.json({
                show_recommendation: true,
                recommendation: {
                    type: 'upgrade',
                    target: {
                        app: app_source,
                        tier: msg.tier
                    },
                    priority: 'high',
                    confidence: 0.9
                },
                messaging: {
                    headline: msg.headline,
                    body: msg.body,
                    cta_text: `Upgrade auf ${msg.tier.charAt(0).toUpperCase() + msg.tier.slice(1)}`,
                    cta_url: `https://app.${app_source}.de/upgrade?tier=${msg.tier}&ref=feature_${feature}`,
                    dismiss_text: 'Nicht jetzt',
                    icon: '⭐'
                },
                personalization: {
                    user_name: user.full_name?.split(' ')[0] || 'Nutzer',
                    specific_benefit: msg.benefit
                },
                timing: {
                    show_immediately: true
                },
                placement: {
                    location: 'modal',
                    page: current_page
                }
            });
        }

        // Erfolgs-Event (z.B. erste Zahlung erfolgreich)
        if (event_type === 'success') {
            const successType = event_data?.success_type;
            
            if (successType === 'first_payment' && app_source === 'mieterapp') {
                const vermietifyApp = availableCrossSell.find(app => app.slug === 'vermietify');
                if (vermietifyApp) {
                    return Response.json({
                        show_recommendation: true,
                        recommendation_id: vermietifyApp.slug,
                        recommendation: {
                            type: 'cross_sell',
                            target: {
                                app: vermietifyApp.slug
                            },
                            priority: 'medium',
                            confidence: 0.8
                        },
                        messaging: {
                            headline: `Starte mit ${vermietifyApp.name}`,
                            body: `Glückwunsch zur ersten Zahlung! Jetzt ist der perfekte Zeitpunkt, ${vermietifyApp.name} kennenzulernen.`,
                            cta_text: `Jetzt ${vermietifyApp.name} entdecken`,
                            cta_url: vermietifyApp.cta_url,
                            dismiss_text: 'Vielleicht später',
                            icon: vermietifyApp.icon_url || '🏡'
                        },
                        timing: {
                            show_immediately: false,
                            delay_seconds: 5
                        },
                        placement: {
                            location: 'toast',
                            page: current_page
                        }
                    });
                }

                return Response.json({
                    show_recommendation: true,
                    recommendation: {
                        type: 'upgrade',
                        target: {
                            app: 'mieterapp',
                            tier: 'basic'
                        },
                        priority: 'medium',
                        confidence: 0.7
                    },
                    messaging: {
                        headline: '🎉 Erste Zahlung erfolgreich!',
                        body: 'Super! Mit MieterApp Basic behältst du alle Zahlungen im Überblick und erhältst automatische Erinnerungen.',
                        cta_text: 'Basic freischalten',
                        cta_url: 'https://app.mieterapp.de/upgrade?tier=basic&ref=success_payment',
                        dismiss_text: 'Vielleicht später',
                        icon: '💳'
                    },
                    timing: {
                        show_immediately: false,
                        delay_seconds: 3
                    },
                    placement: {
                        location: 'toast',
                        page: current_page
                    }
                });
            }
        }

        // Allgemeine Cross-Sell Empfehlung
        if (availableCrossSell.length > 0) {
            const randomApp = availableCrossSell[Math.floor(Math.random() * availableCrossSell.length)];
            return Response.json({
                show_recommendation: true,
                recommendation_id: randomApp.slug,
                recommendation: {
                    type: 'cross_sell',
                    target: {
                        app: randomApp.slug
                    },
                    priority: 'low',
                    confidence: 0.6
                },
                messaging: {
                    headline: `Entdecke ${randomApp.name}`,
                    body: randomApp.tagline || randomApp.description,
                    cta_text: `Jetzt ${randomApp.name} ansehen`,
                    cta_url: randomApp.cta_url,
                    dismiss_text: 'Nicht interessiert',
                    icon: randomApp.icon_url || '✨'
                },
                personalization: {
                    user_name: user.full_name?.split(' ')[0] || 'Nutzer'
                },
                timing: {
                    show_immediately: false,
                    delay_seconds: 10
                },
                placement: {
                    location: 'toast',
                    page: current_page
                }
            });
        }

        // Keine Empfehlung
        return Response.json({
            show_recommendation: false,
            reason: 'no_recommendation'
        });

    } catch (error) {
        console.error('Error in getCrossSellRecommendation:', error);
        return Response.json({ 
            error: error.message,
            show_recommendation: false 
        }, { status: 500 });
    }
});