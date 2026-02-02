import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Monatlicher Reset des AI-Budget-Status
 * Wird automatisch am 1. jedes Monats ausgeführt
 * 
 * Setzt api_status zurück wenn budget_exceeded war
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const user = await base44.auth.me();
    
    // Admin-Check
    if (user?.role !== 'admin') {
      return Response.json({ 
        error: 'Forbidden: Admin access required' 
      }, { status: 403 });
    }

    const settings = await base44.asServiceRole.entities.AISettings.list();
    
    if (!settings || settings.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'Keine AI-Settings gefunden' 
      });
    }

    const config = settings[0];

    // Reset nur wenn budget_exceeded
    if (config.api_status === 'budget_exceeded') {
      await base44.asServiceRole.entities.AISettings.update(config.id, {
        api_status: 'active',
        last_api_check: new Date().toISOString()
      });

      // Alle AI-Features wieder aktivieren
      const allFeatures = await base44.asServiceRole.entities.AIFeatureConfig.list();
      let reactivatedCount = 0;
      for (const feature of allFeatures) {
        if (!feature.is_enabled) {
          await base44.asServiceRole.entities.AIFeatureConfig.update(feature.id, {
            is_enabled: true
          });
          reactivatedCount++;
        }
      }

      console.log(`✓ AI-Budget-Status zurückgesetzt, ${reactivatedCount} Features reaktiviert`);
      
      return Response.json({
        success: true,
        message: `Budget-Status und ${reactivatedCount} Features erfolgreich zurückgesetzt`,
        previous_status: 'budget_exceeded',
        new_status: 'active',
        features_reactivated: reactivatedCount
      });
    }

    return Response.json({
      success: true,
      message: 'Kein Reset notwendig',
      current_status: config.api_status
    });

  } catch (error) {
    console.error('Budget Reset Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});