import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, entity_name, entity_id, data, old_data } = await req.json();

    // Fetch all active rules for this entity
    const rules = await base44.asServiceRole.entities.WorkflowRule.filter({
      trigger_entity: entity_name,
      trigger_event: event.type,
      is_active: true
    });

    for (const rule of rules) {
      const conditionsMet = evaluateConditions(rule.conditions, data, old_data);
      
      if (conditionsMet) {
        // Execute all actions
        for (const action of rule.actions) {
          await executeAction(base44, action, data, entity_name, entity_id);
        }

        // Increment execution count
        await base44.asServiceRole.entities.WorkflowRule.update(rule.id, {
          execution_count: (rule.execution_count || 0) + 1
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Workflow execution error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function evaluateConditions(conditions, data, old_data) {
  if (!conditions || conditions.length === 0) return true;

  return conditions.every(condition => {
    const value = data[condition.field];
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'contains':
        return String(value).includes(condition.value);
      case 'greaterThan':
        return Number(value) > Number(condition.value);
      case 'lessThan':
        return Number(value) < Number(condition.value);
      case 'in':
        return condition.value.split(',').includes(String(value));
      default:
        return true;
    }
  });
}

async function executeAction(base44, action, data, entityName, entityId) {
  const { type, config } = action;

  switch (type) {
    case 'notify':
      const recipient = config.recipient === 'assigned_to' ? data.assigned_to : config.recipient;
      await base44.integrations.Core.SendEmail({
        to: recipient,
        subject: 'Workflow Benachrichtigung',
        body: config.message
      });
      break;

    case 'create_task':
      await base44.asServiceRole.entities.MaintenanceTask.create({
        title: config.title,
        description: `Automatisch erstellt für ${entityName} #${entityId}`,
        priority: config.priority,
        assigned_to: config.assigned_to,
        status: 'open'
      });
      break;

    case 'update_field':
      await base44.asServiceRole.entities[entityName].update(entityId, {
        [config.field]: config.value
      });
      break;

    case 'send_email':
      await base44.integrations.Core.SendEmail({
        to: config.email,
        subject: config.subject,
        body: config.body
      });
      break;
  }
}