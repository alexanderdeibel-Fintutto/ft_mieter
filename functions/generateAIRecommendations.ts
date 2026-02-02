import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const recommendations = [];

    // Lade Nutzungsdaten der letzten 30 Tage
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await base44.asServiceRole.entities.AIUsageLog.filter({
      created_date: { $gte: thirtyDaysAgo.toISOString() },
      success: true
    });

    // Analyse 1: Hohe Kosten durch ineffiziente Feature-Nutzung
    const featureCosts = {};
    const featureRequests = {};
    
    logs.forEach(log => {
      const feature = log.feature || 'unknown';
      featureCosts[feature] = (featureCosts[feature] || 0) + (log.cost_eur || 0);
      featureRequests[feature] = (featureRequests[feature] || 0) + 1;
    });

    for (const [feature, cost] of Object.entries(featureCosts)) {
      const avgCostPerRequest = cost / featureRequests[feature];
      
      // Wenn durchschnittliche Kosten > 0.01€, empfehle günstigeres Modell
      if (avgCostPerRequest > 0.01) {
        recommendations.push({
          recommendation_type: 'model_selection',
          priority: cost > 10 ? 'high' : 'medium',
          title: `Hohe Kosten bei ${feature}`,
          description: `Feature "${feature}" verursacht hohe durchschnittliche Kosten von ${avgCostPerRequest.toFixed(4)}€ pro Anfrage. Erwägen Sie, auf ein günstigeres Modell (z.B. Haiku 3.5) umzusteigen.`,
          potential_savings_eur: Math.round(cost * 0.7 * 100) / 100, // 70% Einsparung möglich
          affected_features: [feature],
          action_items: [
            'In AI-Einstellungen Feature-Konfiguration öffnen',
            `Für "${feature}" Modell auf "claude-haiku-3-5-20241022" umstellen`,
            'Max Tokens reduzieren falls möglich'
          ]
        });
      }
    }

    // Analyse 2: Ungenutzte Features
    const allFeatures = await base44.asServiceRole.entities.AIFeatureConfig.list();
    const usedFeatures = new Set(Object.keys(featureCosts));
    
    allFeatures.forEach(feature => {
      if (feature.is_enabled && !usedFeatures.has(feature.feature_key)) {
        recommendations.push({
          recommendation_type: 'feature_usage',
          priority: 'low',
          title: `Ungenutztes Feature: ${feature.display_name}`,
          description: `Das Feature "${feature.display_name}" ist aktiviert, wurde aber in den letzten 30 Tagen nicht genutzt. Deaktivieren Sie es, um Übersicht zu verbessern.`,
          potential_savings_eur: 0,
          affected_features: [feature.feature_key],
          action_items: [
            'Prüfen Sie, ob das Feature noch benötigt wird',
            'Falls nicht, deaktivieren Sie es in der Feature-Konfiguration'
          ]
        });
      }
    });

    // Analyse 3: Prompt Caching nicht optimal genutzt
    const totalCost = logs.reduce((sum, log) => sum + (log.cost_eur || 0), 0);
    const cacheReadTokens = logs.reduce((sum, log) => sum + (log.cache_read_tokens || 0), 0);
    const totalInputTokens = logs.reduce((sum, log) => sum + (log.input_tokens || 0), 0);
    
    if (totalInputTokens > 0) {
      const cacheHitRate = cacheReadTokens / totalInputTokens;
      
      if (cacheHitRate < 0.3 && totalCost > 5) {
        recommendations.push({
          recommendation_type: 'cost_optimization',
          priority: 'high',
          title: 'Prompt Caching wenig genutzt',
          description: `Ihre Cache-Hit-Rate liegt bei nur ${(cacheHitRate * 100).toFixed(1)}%. Durch bessere Nutzung von Prompt Caching können Sie bis zu 90% der Kosten für wiederholte Anfragen sparen.`,
          potential_savings_eur: Math.round(totalCost * 0.5 * 100) / 100,
          affected_features: Object.keys(featureCosts),
          action_items: [
            'Stellen Sie sicher, dass Prompt Caching aktiviert ist',
            'Verwenden Sie konsistente System-Prompts',
            'Strukturieren Sie Prompts so, dass häufige Teile gecacht werden können'
          ]
        });
      }
    }

    // Analyse 4: Budget-Warnung
    const settings = await base44.asServiceRole.entities.AISettings.list();
    if (settings.length > 0) {
      const config = settings[0];
      const monthlyBudget = config.monthly_budget_eur || 50;
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthLogs = logs.filter(log => new Date(log.created_date) >= startOfMonth);
      const monthCost = monthLogs.reduce((sum, log) => sum + (log.cost_eur || 0), 0);
      
      const usage = (monthCost / monthlyBudget) * 100;
      
      if (usage > 80) {
        recommendations.push({
          recommendation_type: 'budget_alert',
          priority: usage > 100 ? 'critical' : 'high',
          title: usage > 100 ? 'Budget überschritten!' : 'Budget-Warnung',
          description: `Sie haben bereits ${usage.toFixed(1)}% Ihres monatlichen AI-Budgets von ${monthlyBudget}€ verbraucht. Aktueller Verbrauch: ${monthCost.toFixed(2)}€.`,
          potential_savings_eur: 0,
          affected_features: Object.keys(featureCosts),
          action_items: usage > 100 ? [
            'Budget wurde überschritten - alle Features wurden automatisch deaktiviert',
            'Erhöhen Sie das monatliche Budget in den AI-Einstellungen',
            'Oder warten Sie bis zum nächsten Monat'
          ] : [
            'Überwachen Sie die Nutzung genau',
            'Erwägen Sie, weniger kritische Features zu deaktivieren',
            'Prüfen Sie, ob günstigere Modelle ausreichen'
          ]
        });
      }
    }

    // Speichere Empfehlungen
    for (const rec of recommendations) {
      await base44.asServiceRole.entities.AIRecommendation.create({
        ...rec,
        generated_at: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      recommendations_generated: recommendations.length,
      recommendations
    });

  } catch (error) {
    console.error('Recommendations generation error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});