import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Test-Funktion für den AI Core Service
 * Testet alle wichtigen Funktionen und gibt einen detaillierten Report zurück
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = {
      timestamp: new Date().toISOString(),
      tests: [],
      overall_success: true,
    };

    // Test 1: Settings laden
    console.log("Test 1: AISettings laden...");
    try {
      const settings = await base44.entities.AISettings.list();
      results.tests.push({
        name: "AISettings laden",
        success: true,
        data: settings?.[0] || null,
      });
    } catch (e) {
      results.tests.push({
        name: "AISettings laden",
        success: false,
        error: e.message,
      });
      results.overall_success = false;
    }

    // Test 2: Feature Config laden
    console.log("Test 2: AIFeatureConfig laden...");
    try {
      const features = await base44.entities.AIFeatureConfig.list();
      results.tests.push({
        name: "AIFeatureConfig laden",
        success: true,
        count: features?.length || 0,
        features: features?.map(f => f.feature_key),
      });
    } catch (e) {
      results.tests.push({
        name: "AIFeatureConfig laden",
        success: false,
        error: e.message,
      });
      results.overall_success = false;
    }

    // Test 3: Einfacher Chat-Request
    console.log("Test 3: Chat-Request...");
    try {
      const chatResult = await base44.functions.invoke('aiCoreService', {
        action: 'chat',
        prompt: 'Was ist eine Nebenkostenabrechnung? Antworte in maximal 2 Sätzen.',
        userId: user.email,
        featureKey: 'chat',
      });

      results.tests.push({
        name: "Chat-Request",
        success: chatResult.data.success,
        response_length: chatResult.data.content?.length || 0,
        cost_eur: chatResult.data.usage?.cost_eur,
        cache_savings: chatResult.data.usage?.savings_eur,
        model: chatResult.data.model,
      });

      if (!chatResult.data.success) {
        results.overall_success = false;
      }
    } catch (e) {
      results.tests.push({
        name: "Chat-Request",
        success: false,
        error: e.message,
      });
      results.overall_success = false;
    }

    // Test 4: Zweiter Request mit gleichem System-Prompt (sollte Cache nutzen)
    console.log("Test 4: Chat-Request mit Cache...");
    try {
      const chatResult2 = await base44.functions.invoke('aiCoreService', {
        action: 'chat',
        prompt: 'Nenne mir 3 typische Positionen.',
        userId: user.email,
        featureKey: 'chat',
      });

      results.tests.push({
        name: "Chat-Request mit Cache",
        success: chatResult2.data.success,
        cache_read_tokens: chatResult2.data.usage?.cache_read_tokens || 0,
        cache_used: (chatResult2.data.usage?.cache_read_tokens || 0) > 0,
        cost_eur: chatResult2.data.usage?.cost_eur,
      });
    } catch (e) {
      results.tests.push({
        name: "Chat-Request mit Cache",
        success: false,
        error: e.message,
      });
    }

    // Test 5: Usage Logs prüfen
    console.log("Test 5: Usage Logs prüfen...");
    try {
      const logs = await base44.entities.AIUsageLog.list('-created_date', 5);
      results.tests.push({
        name: "Usage Logs",
        success: true,
        count: logs?.length || 0,
        latest_log: logs?.[0] || null,
      });
    } catch (e) {
      results.tests.push({
        name: "Usage Logs",
        success: false,
        error: e.message,
      });
    }

    // Test 6: Budget Check
    console.log("Test 6: Budget Check...");
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const logs = await base44.entities.AIUsageLog.filter({
        created_date: { $gte: startOfMonth.toISOString() }
      });
      
      const totalCost = logs?.reduce((sum, log) => sum + (log.cost_eur || 0), 0) || 0;
      const settings = await base44.entities.AISettings.list();
      const budget = settings?.[0]?.monthly_budget_eur || 50;

      results.tests.push({
        name: "Budget Check",
        success: true,
        total_cost: Math.round(totalCost * 100) / 100,
        budget,
        percent: Math.round((totalCost / budget) * 100),
        remaining: Math.round((budget - totalCost) * 100) / 100,
      });
    } catch (e) {
      results.tests.push({
        name: "Budget Check",
        success: false,
        error: e.message,
      });
    }

    return Response.json({
      success: results.overall_success,
      message: results.overall_success 
        ? "Alle Tests erfolgreich!" 
        : "Einige Tests fehlgeschlagen. Siehe Details.",
      results,
    });

  } catch (error) {
    console.error("Test Suite Error:", error);
    return Response.json({ 
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
});