import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Modell-Preise
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

    const workflows = await base44.asServiceRole.entities.AIWorkflow.filter({
      is_template: false,
      is_active: true
    });

    const optimizations = [];

    for (const workflow of workflows) {
      if (!workflow.steps || workflow.steps.length === 0) continue;

      const currentCost = workflow.estimated_cost_per_run || 0;
      
      // 1. Model-Downgrade prüfen
      for (const step of workflow.steps) {
        if (step.model === 'claude-opus-4-1-20250805') {
          const estSonnetCost = (step.max_tokens || 1000) * 0.000003;
          const savings = (currentCost * 0.7);
          
          if (savings > currentCost * 0.2) {
            optimizations.push({
              workflow_id: workflow.id,
              optimization_type: 'model_swap',
              title: `Modell-Downgrade: Opus → Sonnet`,
              description: `Schritt "${step.step_id}" kann Claude Sonnet statt Opus nutzen. Ideal für strukturierte Aufgaben.`,
              current_cost_per_run: currentCost,
              optimized_cost_per_run: currentCost * 0.3,
              potential_savings_percent: Math.round(70),
              potential_monthly_savings: workflow.execution_count > 0 
                ? Math.round((currentCost * 0.7) * workflow.execution_count * 30)
                : 0,
              impact_on_quality: 'minimal',
              implementation_difficulty: 'trivial',
              recommended_changes: [{
                step_id: step.step_id,
                old_model: step.model,
                new_model: 'claude-sonnet-4-20250514'
              }]
            });
          }
        }

        // 2. Haiku für einfache Aufgaben
        if (step.feature === 'categorization' || step.feature === 'ocr') {
          const savings = currentCost * 0.9;
          optimizations.push({
            workflow_id: workflow.id,
            optimization_type: 'model_swap',
            title: `Verwenden Sie Claude Haiku für "${step.feature}"`,
            description: `Einfache Klassifikations- und OCR-Aufgaben laufen schneller und günstiger mit Haiku.`,
            current_cost_per_run: currentCost,
            optimized_cost_per_run: currentCost * 0.1,
            potential_savings_percent: Math.round(90),
            potential_monthly_savings: workflow.execution_count > 0 
              ? Math.round(savings * workflow.execution_count * 30)
              : 0,
            impact_on_quality: 'none',
            implementation_difficulty: 'easy',
            recommended_changes: [{
              step_id: step.step_id,
              old_model: step.model,
              new_model: 'claude-haiku-3-5-20241022'
            }]
          });
          break;
        }
      }

      // 3. Token-Optimierung
      const avgTokens = workflow.steps.reduce((s, st) => s + (st.max_tokens || 1000), 0) / workflow.steps.length;
      if (avgTokens > 1500) {
        optimizations.push({
          workflow_id: workflow.id,
          optimization_type: 'parameter_tuning',
          title: 'Max-Token Limit reduzieren',
          description: `Durchschnittlich ${avgTokens} Tokens. Mit Limit von ${Math.round(avgTokens * 0.7)} sparen Sie 30% ohne Qualitätsverlust.`,
          current_cost_per_run: currentCost,
          optimized_cost_per_run: currentCost * 0.7,
          potential_savings_percent: 30,
          potential_monthly_savings: workflow.execution_count > 0 
            ? Math.round((currentCost * 0.3) * workflow.execution_count * 30)
            : 0,
          impact_on_quality: 'slight',
          implementation_difficulty: 'easy',
          recommended_changes: [{
            change: 'reduce_max_tokens',
            from: avgTokens,
            to: Math.round(avgTokens * 0.7)
          }]
        });
      }

      // 4. Redundante Steps entfernen
      if (workflow.steps.length > 2) {
        const duplicateFeatures = workflow.steps.map(s => s.feature).filter((f, i, arr) => arr.indexOf(f) !== i);
        if (duplicateFeatures.length > 0) {
          optimizations.push({
            workflow_id: workflow.id,
            optimization_type: 'consolidation',
            title: 'Redundante Workflow-Schritte konsolidieren',
            description: `Die Features ${duplicateFeatures.join(', ')} werden mehrfach ausgeführt. Können diese zusammengefasst werden?`,
            current_cost_per_run: currentCost,
            optimized_cost_per_run: currentCost * 0.5,
            potential_savings_percent: 50,
            potential_monthly_savings: workflow.execution_count > 0 
              ? Math.round((currentCost * 0.5) * workflow.execution_count * 30)
              : 0,
            impact_on_quality: 'moderate',
            implementation_difficulty: 'moderate',
            recommended_changes: [{
              action: 'consolidate',
              features: duplicateFeatures
            }]
          });
        }
      }
    }

    // Speichere Optimierungen
    for (const opt of optimizations.slice(0, 10)) {
      await base44.asServiceRole.entities.WorkflowOptimization.create(opt);
    }

    return Response.json({
      success: true,
      optimizations_found: optimizations.length,
      optimizations: optimizations.slice(0, 10)
    });

  } catch (error) {
    console.error('Optimization analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});