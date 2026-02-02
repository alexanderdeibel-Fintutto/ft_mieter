import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Prüfe ob Steps schon existieren
    const existing = await base44.asServiceRole.entities.AIOnboardingStep.filter({});
    if (existing.length > 0) {
      return Response.json({ success: false, message: 'Steps already exist' });
    }

    const adminSteps = [
      {
        step_key: 'admin_dashboard_intro',
        step_title: 'Willkommen im Admin Dashboard',
        description: 'Das Admin Dashboard gibt Ihnen einen Überblick über alle KI-Nutzung, Kosten und Empfehlungen.',
        role: 'admin',
        order: 1,
        category: 'getting_started',
        action_label: 'Zum Dashboard',
        action_url: '/AdminDashboard',
        estimated_time_seconds: 120,
        tips: [
          'Nutzen Sie die Widgets zur Überwachung der monatlichen Ausgaben',
          'Setzen Sie Budget-Limits, um Kosten zu kontrollieren',
          'Überprüfen Sie regelmäßig die Empfehlungen zur Kostenoptimierung'
        ]
      },
      {
        step_key: 'workflow_automation',
        step_title: 'Workflow-Automatisierung einrichten',
        description: 'Erstellen Sie automatisierte Regeln, die auf KI-Analysen reagieren, z.B. Eskalations-E-Mails bei Budget-Überschreitung.',
        role: 'admin',
        order: 2,
        category: 'workflows',
        action_label: 'Zur Workflow-Seite',
        action_url: '/AIWorkflowAutomation',
        estimated_time_seconds: 300,
        tips: [
          'Starten Sie mit einfachen Regeln wie Budget-Schwellenwerten',
          'Testen Sie die Regel mit kleinen Cooldown-Zeiten zuerst',
          'Nutzen Sie Webhooks für externe Systeme'
        ]
      },
      {
        step_key: 'system_prompts',
        step_title: 'System-Prompts verwalten',
        description: 'Passen Sie die KI-Verhalten durch benutzerdefinierte System-Prompts für verschiedene Features an.',
        role: 'admin',
        order: 3,
        category: 'features',
        action_label: 'Zur Prompt-Verwaltung',
        action_url: '/AISystemPrompts',
        estimated_time_seconds: 240,
        tips: [
          'Erstellen Sie kontextspezifische Prompts für Ihr Unternehmen',
          'Nutzen Sie Variablen wie {user_name} und {context}',
          'Setzen Sie einen Prompt als Standard für das Feature'
        ]
      },
      {
        step_key: 'usage_reports',
        step_title: 'Nutzungsberichte und Analysen',
        description: 'Analysieren Sie detaillierte KI-Nutzung nach Feature, Nutzer und Zeit. Exportieren Sie Daten als CSV.',
        role: 'admin',
        order: 4,
        category: 'reporting',
        action_label: 'Zu Berichten',
        action_url: '/AIUsageReports',
        estimated_time_seconds: 180,
        tips: [
          'Filtern Sie Berichte nach Datumsbereich',
          'Exportieren Sie regelmäßig für externe Analysen',
          'Nutzen Sie Kosten pro Feature zur Budget-Planung'
        ]
      },
      {
        step_key: 'budget_settings',
        step_title: 'Budget und Limits konfigurieren',
        description: 'Legen Sie monatliche Budgets und Rate Limits fest, um Kosten unter Kontrolle zu halten.',
        role: 'admin',
        order: 5,
        category: 'settings',
        action_label: 'Zu AI-Einstellungen',
        action_url: '/AISettings',
        estimated_time_seconds: 150,
        tips: [
          'Setzen Sie realistische monatliche Budgets',
          'Nutzen Sie Budget-Warnungen bei hoher Auslastung',
          'Rate Limits pro User und Feature optimieren'
        ]
      },
      {
        step_key: 'recommendations_review',
        step_title: 'KI-Empfehlungen nutzen',
        description: 'Überprüfen Sie täglich KI-generierte Empfehlungen für Kostenoptimierung und Effizienzverbesserungen.',
        role: 'admin',
        order: 6,
        category: 'getting_started',
        estimated_time_seconds: 120,
        tips: [
          'Implementieren Sie Empfehlungen zur Kosteneinsparung',
          'Überprüfen Sie deaktivierte Features bei Budget-Überschreitung',
          'Nutzen Sie Prompt Caching für häufige Anfragen'
        ]
      }
    ];

    const userSteps = [
      {
        step_key: 'user_dashboard_intro',
        step_title: 'Willkommen bei Ihrem AI-Dashboard',
        description: 'Überwachen Sie Ihre persönliche KI-Nutzung und Kosten.',
        role: 'user',
        order: 1,
        category: 'getting_started',
        action_label: 'Zum Dashboard',
        action_url: '/CustomerDashboard',
        estimated_time_seconds: 120,
        tips: [
          'Überprüfen Sie monatliche Kosten und Anfragen',
          'Identifizieren Sie Ihre am häufigsten genutzten Features',
          'Nutzen Sie Cache Hits zur Kostenreduktion'
        ]
      },
      {
        step_key: 'cache_optimization',
        step_title: 'Prompt Caching verstehen',
        description: 'Lernen Sie, wie Prompt Caching Ihre Kosten reduzieren kann.',
        role: 'user',
        order: 2,
        category: 'features',
        estimated_time_seconds: 150,
        tips: [
          'Verwenden Sie konsistente System-Prompts',
          'Strukturieren Sie wiederkehrende Anfragen',
          'Cache wird automatisch genutzt - keine extra Konfiguration nötig'
        ]
      },
      {
        step_key: 'cost_monitoring',
        step_title: 'Kosten überwachen',
        description: 'Nutzen Sie die Kosten-Charts, um Ihre Ausgaben im Auge zu behalten.',
        role: 'user',
        order: 3,
        category: 'reporting',
        estimated_time_seconds: 100,
        tips: [
          'Überprüfen Sie regelmäßig Ihre Kosten',
          'Nutzen Sie günstigere Modelle für nicht-kritische Aufgaben',
          'Reduzieren Sie max_tokens für schnellere Antworten'
        ]
      }
    ];

    const allSteps = [...adminSteps, ...userSteps];

    for (const step of allSteps) {
      await base44.asServiceRole.entities.AIOnboardingStep.create(step);
    }

    return Response.json({
      success: true,
      created_count: allSteps.length,
      admin_steps: adminSteps.length,
      user_steps: userSteps.length
    });
  } catch (error) {
    console.error('Generation error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});