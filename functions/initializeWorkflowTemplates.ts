import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const templates = [
      {
        workflow_name: 'Dokumentenanalyse Standard',
        description: 'Klassisches Workflow für vollständige Dokumentenanalyse mit OCR und Kategorisierung',
        is_template: true,
        template_category: 'document_analysis',
        steps: [
          {
            step_id: 'ocr_extract',
            feature: 'ocr',
            model: 'claude-haiku-3-5-20241022',
            max_tokens: 1000,
            order: 1,
            parameters: { language: 'de' }
          },
          {
            step_id: 'categorize',
            feature: 'categorization',
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            order: 2,
            parameters: { categories: ['contract', 'invoice', 'correspondence', 'other'] }
          },
          {
            step_id: 'extract_data',
            feature: 'analysis',
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1500,
            order: 3,
            parameters: { extract: ['key_dates', 'amounts', 'parties'] }
          }
        ],
        estimated_cost_per_run: 0.08
      },
      {
        workflow_name: 'Schnelle OCR-Verarbeitung',
        description: 'Optimierter Workflow nur für OCR mit Haiku',
        is_template: true,
        template_category: 'ocr_processing',
        steps: [
          {
            step_id: 'quick_ocr',
            feature: 'ocr',
            model: 'claude-haiku-3-5-20241022',
            max_tokens: 500,
            order: 1,
            parameters: { fast_mode: true }
          }
        ],
        estimated_cost_per_run: 0.01
      },
      {
        workflow_name: 'Mietrecht-Chat Workflow',
        description: 'Workflow für interaktive Mietrecht-Fragen mit Kontextanalyse',
        is_template: true,
        template_category: 'chat_analysis',
        steps: [
          {
            step_id: 'context_analysis',
            feature: 'analysis',
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            order: 1,
            parameters: { context_type: 'mietrecht' }
          },
          {
            step_id: 'chat_response',
            feature: 'chat',
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            order: 2,
            parameters: { language: 'de', legal_accuracy: true }
          }
        ],
        estimated_cost_per_run: 0.05
      },
      {
        workflow_name: 'Rechnungsverarbeitung',
        description: 'Spezialisierter Workflow für Rechnungs-OCR und Datenextraktion',
        is_template: true,
        template_category: 'document_analysis',
        steps: [
          {
            step_id: 'ocr_invoice',
            feature: 'ocr',
            model: 'claude-haiku-3-5-20241022',
            max_tokens: 800,
            order: 1,
            parameters: { document_type: 'invoice' }
          },
          {
            step_id: 'extract_invoice_data',
            feature: 'analysis',
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            order: 2,
            parameters: { 
              extract: ['invoice_number', 'date', 'amount', 'vat', 'due_date', 'vendor']
            }
          },
          {
            step_id: 'categorize_expense',
            feature: 'categorization',
            model: 'claude-haiku-3-5-20241022',
            max_tokens: 300,
            order: 3,
            parameters: { categories: ['material', 'maintenance', 'utilities', 'legal', 'other'] }
          }
        ],
        estimated_cost_per_run: 0.06
      },
      {
        workflow_name: 'Nebenkosten-Analyse',
        description: 'Workflow zur Analyse von Nebenkostenabrechnungen',
        is_template: true,
        template_category: 'document_analysis',
        steps: [
          {
            step_id: 'ocr_nebenkost',
            feature: 'ocr',
            model: 'claude-haiku-3-5-20241022',
            max_tokens: 1500,
            order: 1,
            parameters: { document_type: 'nebenkostenabrechnung' }
          },
          {
            step_id: 'analyze_costs',
            feature: 'analysis',
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            order: 2,
            parameters: {
              extract: ['heating', 'water', 'electricity', 'waste', 'cleaning', 'garden'],
              calculate_per_tenant: true
            }
          }
        ],
        estimated_cost_per_run: 0.07
      }
    ];

    const created = [];
    for (const template of templates) {
      try {
        const result = await base44.asServiceRole.entities.AIWorkflow.create(template);
        created.push(result);
      } catch (e) {
        console.warn(`Template ${template.workflow_name} already exists or failed:`, e.message);
      }
    }

    return Response.json({
      success: true,
      templates_created: created.length,
      templates: created
    });

  } catch (error) {
    console.error('Template initialization error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});