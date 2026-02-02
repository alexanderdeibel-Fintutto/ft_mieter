import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Modell-Preise (USD pro 1M tokens)
const MODEL_PRICING = {
  'claude-opus-4-1-20250805': { input: 15, output: 75 },
  'claude-sonnet-4-20250514': { input: 3, output: 15 },
  'claude-haiku-3-5-20241022': { input: 0.8, output: 4 }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await base44.asServiceRole.entities.AIUsageLog.filter({
      created_date: { $gte: thirtyDaysAgo.toISOString() },
      success: true
    });

    const recommendations = [];

    // Analysiere Features
    const featureStats = {};
    logs.forEach(log => {
      const feature = log.feature || 'unknown';
      if (!featureStats[feature]) {
        featureStats[feature] = {
          totalCost: 0,
          totalRequests: 0,
          models: {},
          totalTokens: 0,
          outputTokens: 0
        };
      }
      featureStats[feature].totalCost += log.cost_eur || 0;
      featureStats[feature].totalRequests += 1;
      featureStats[feature].totalTokens += (log.input_tokens || 0);
      featureStats[feature].outputTokens += (log.output_tokens || 0);
      
      const model = log.model || 'unknown';
      if (!featureStats[feature].models[model]) {
        featureStats[feature].models[model] = { count: 0, cost: 0 };
      }
      featureStats[feature].models[model].count += 1;
      featureStats[feature].models[model].cost += (log.cost_eur || 0);
    });

    // Generiere Empfehlungen
    for (const [feature, stats] of Object.entries(featureStats)) {
      if (stats.totalRequests < 5) continue; // Ignoriere Features mit wenigen Anfragen

      const avgTokensPerRequest = stats.totalTokens / stats.totalRequests;
      const avgOutputTokens = stats.outputTokens / stats.totalRequests;
      
      // Prüfe ob teuer
      if (stats.totalCost > 5 && stats.totalRequests > 10) {
        
        // Simuliere Kosten mit Haiku
        const estHaikuInputCost = (stats.totalTokens / 1_000_000) * MODEL_PRICING['claude-haiku-3-5-20241022'].input;
        const estHaikuOutputCost = (stats.outputTokens / 1_000_000) * MODEL_PRICING['claude-haiku-3-5-20241022'].output;
        const estHaikuTotalCost = (estHaikuInputCost + estHaikuOutputCost) * 1.1; // EUR Umrechnung +10%
        
        const savings = stats.totalCost - estHaikuTotalCost;
        
        // Wenn > 20% Ersparnis möglich
        if (savings > stats.totalCost * 0.2) {
          recommendations.push({
            recommendation_type: 'model_selection',
            priority: 'high',
            title: `Modell-Upgrade für "${feature}": Claude Haiku empfohlen`,
            description: `Feature "${feature}" verbraucht durchschnittlich ${avgOutputTokens.toFixed(0)} Output-Tokens pro Anfrage. Claude Haiku ist optimiert für kurze Antworten und könnte die Kosten um ${(savings / stats.totalCost * 100).toFixed(0)}% reduzieren.`,
            potential_savings_eur: Math.round(savings * 100) / 100,
            affected_features: [feature],
            action_items: [
              `Testen Sie Claude Haiku in Test-Umgebung für "${feature}"`,
              'Prüfen Sie Output-Qualität',
              'Reduzieren Sie max_tokens falls möglich',
              'Rollen Sie nach erfolgreichen Tests aus'
            ]
          });
        }
      }

      // Prüfe auf unter-genutzte teure Modelle
      const currentModel = Object.entries(stats.models).sort((a, b) => b[1].count - a[1].count)[0];
      if (currentModel && currentModel[0] === 'claude-opus-4-1-20250805' && stats.totalRequests > 5) {
        // Wenn Opus genutzt wird aber nur wenige Output Tokens
        if (avgOutputTokens < 100) {
          recommendations.push({
            recommendation_type: 'model_selection',
            priority: 'medium',
            title: `"${feature}": Downgrade zu Claude Sonnet möglich`,
            description: `Ihr Feature nutzt Claude Opus, produziert aber durchschnittlich nur ${avgOutputTokens.toFixed(0)} Output-Tokens. Claude Sonnet ist für diese Komplexität ausreichend und günstiger.`,
            potential_savings_eur: Math.round((stats.totalCost * 0.7) * 100) / 100,
            affected_features: [feature],
            action_items: [
              'Bewerten Sie die Anforderungen neu',
              'Migrieren Sie zu Claude Sonnet',
              'Monitoring auf Qualitätseinbußen'
            ]
          });
        }
      }

      // Prüfe auf Output-Token Optimierung
      if (avgOutputTokens > 500) {
        recommendations.push({
          recommendation_type: 'cost_optimization',
          priority: 'medium',
          title: `"${feature}": Output-Tokens optimieren`,
          description: `Durchschnittlich ${avgOutputTokens.toFixed(0)} Output-Tokens pro Anfrage. Mit max_tokens-Limit können Sie 30% Kosten sparen ohne Qualität zu beeinträchtigen.`,
          potential_savings_eur: Math.round((stats.totalCost * 0.3) * 100) / 100,
          affected_features: [feature],
          action_items: [
            `Reduzieren Sie max_tokens schrittweise (z.B. von ${Math.round(avgOutputTokens * 1.5)} auf ${Math.round(avgOutputTokens * 1.2)})`,
            'Testen Sie Nutzerzufriedenheit',
            'Passen Sie Prompts an, um prägnantere Antworten zu fördern'
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
    console.error('Model recommendation error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});