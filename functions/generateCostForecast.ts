import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysSoFar = now.getDate();

    // Lade Logs diesen Monat
    const logs = await base44.asServiceRole.entities.AIUsageLog.filter({
      created_date: { $gte: startOfMonth.toISOString() },
      success: true
    });

    const totalCostSoFar = logs.reduce((sum, log) => sum + (log.cost_eur || 0), 0);
    
    // Extrapoliere auf ganzen Monat
    const projectedCost = (totalCostSoFar / daysSoFar) * daysInMonth;

    // Kosten nach Feature
    const featureCosts = {};
    const featureRequests = {};
    logs.forEach(log => {
      const feature = log.feature || 'unknown';
      featureCosts[feature] = (featureCosts[feature] || 0) + (log.cost_eur || 0);
      featureRequests[feature] = (featureRequests[feature] || 0) + 1;
    });

    // Projizierte Kosten pro Feature
    const projectedFeatureCosts = {};
    for (const [feature, cost] of Object.entries(featureCosts)) {
      projectedFeatureCosts[feature] = (cost / daysSoFar) * daysInMonth;
    }

    // Lade Settings und Feature-Budgets
    const settings = await base44.asServiceRole.entities.AISettings.list();
    const globalBudget = settings.length > 0 ? settings[0].monthly_budget_eur : 0;

    const featureBudgets = await base44.asServiceRole.entities.FeatureBudget.filter({
      is_enabled: true
    });

    // Prognose-Analyse
    const forecast = {
      generated_at: new Date().toISOString(),
      days_passed: daysSoFar,
      days_remaining: daysInMonth - daysSoFar,
      cost_so_far: Math.round(totalCostSoFar * 100) / 100,
      projected_total_cost: Math.round(projectedCost * 100) / 100,
      global_budget: globalBudget,
      will_exceed_budget: globalBudget > 0 && projectedCost > globalBudget,
      budget_overage: globalBudget > 0 ? Math.round((projectedCost - globalBudget) * 100) / 100 : 0,
      budget_status: globalBudget > 0 
        ? Math.round((projectedCost / globalBudget) * 100)
        : 0,
      features: []
    };

    // Feature-Details
    for (const feature of Object.keys(featureCosts)) {
      const budget = featureBudgets.find(fb => fb.feature_key === feature);
      const projectedFeatureCost = projectedFeatureCosts[feature];
      const featureBudgetAmount = budget?.monthly_budget_eur || 0;

      forecast.features.push({
        feature_key: feature,
        cost_so_far: Math.round(featureCosts[feature] * 100) / 100,
        projected_cost: Math.round(projectedFeatureCost * 100) / 100,
        requests: featureRequests[feature],
        avg_cost_per_request: Math.round((featureCosts[feature] / featureRequests[feature]) * 10000) / 10000,
        has_budget: budget ? true : false,
        budget_limit: featureBudgetAmount,
        will_exceed_feature_budget: featureBudgetAmount > 0 && projectedFeatureCost > featureBudgetAmount,
        feature_budget_usage: featureBudgetAmount > 0 
          ? Math.round((projectedFeatureCost / featureBudgetAmount) * 100)
          : 0
      });
    }

    // Generiere Warnungen
    const warnings = [];
    
    if (forecast.will_exceed_budget) {
      warnings.push({
        severity: 'critical',
        message: `Gesamtbudget wird um ${forecast.budget_overage}€ überschritten`,
        feature_key: 'global'
      });
    }

    for (const feature of forecast.features) {
      if (feature.will_exceed_feature_budget) {
        warnings.push({
          severity: 'high',
          message: `Feature "${feature.feature_key}" überschreitet Budget um ${(feature.projected_cost - feature.budget_limit).toFixed(2)}€`,
          feature_key: feature.feature_key
        });
      }
    }

    forecast.warnings = warnings;

    return Response.json({ success: true, forecast });
  } catch (error) {
    console.error('Forecast error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});