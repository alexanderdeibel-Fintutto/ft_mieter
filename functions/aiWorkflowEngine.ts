import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { triggerType, triggerData } = await req.json();

    // Lade aktive Workflow-Regeln für diesen Trigger
    const rules = await base44.asServiceRole.entities.AIWorkflowRule.filter({
      trigger_type: triggerType,
      is_active: true
    });

    const results = [];

    for (const rule of rules) {
      // Prüfe Cooldown
      if (rule.last_execution) {
        const lastExec = new Date(rule.last_execution);
        const now = new Date();
        const minutesSince = (now - lastExec) / 1000 / 60;
        
        if (minutesSince < (rule.cooldown_minutes || 60)) {
          continue; // Skip wegen Cooldown
        }
      }

      // Prüfe Trigger-Bedingung
      if (!checkTriggerCondition(rule.trigger_config, triggerData)) {
        continue;
      }

      // Führe Aktion aus
      const actionResult = await executeAction(base44, rule.action_type, rule.action_config, triggerData);

      // Update Regel
      await base44.asServiceRole.entities.AIWorkflowRule.update(rule.id, {
        execution_count: (rule.execution_count || 0) + 1,
        last_execution: new Date().toISOString()
      });

      results.push({
        rule_id: rule.id,
        rule_name: rule.rule_name,
        action_result: actionResult
      });
    }

    return Response.json({
      success: true,
      executed_rules: results.length,
      results
    });

  } catch (error) {
    console.error('Workflow engine error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});

function checkTriggerCondition(config, data) {
  if (!config) return true;

  // Budget-Schwellenwert prüfen
  if (config.threshold !== undefined && data.value !== undefined) {
    return data.value >= config.threshold;
  }

  // Klassifizierung prüfen
  if (config.classification && data.classification) {
    return config.classification === data.classification;
  }

  // Kosten-Spike prüfen
  if (config.spike_percentage && data.increase_percentage) {
    return data.increase_percentage >= config.spike_percentage;
  }

  return true;
}

async function executeAction(base44, actionType, config, data) {
  switch (actionType) {
    case 'send_email':
      return await sendEmailAction(base44, config, data);
    
    case 'send_notification':
      return await sendNotificationAction(base44, config, data);
    
    case 'create_task':
      return await createTaskAction(base44, config, data);
    
    case 'webhook':
      return await webhookAction(config, data);
    
    case 'disable_feature':
      return await disableFeatureAction(base44, config);
    
    default:
      return { success: false, error: 'Unknown action type' };
  }
}

async function sendEmailAction(base44, config, data) {
  try {
    const subject = config.subject || 'AI Workflow Alert';
    const body = formatTemplate(config.body_template || 'Alert: {message}', data);
    const recipients = config.recipients || ['admin@example.com'];

    for (const recipient of recipients) {
      await base44.integrations.Core.SendEmail({
        to: recipient,
        subject,
        body
      });
    }

    return { success: true, action: 'email_sent', recipients };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function sendNotificationAction(base44, config, data) {
  try {
    const message = formatTemplate(config.message || 'Workflow triggered: {message}', data);
    const userIds = config.user_ids || [];

    for (const userId of userIds) {
      await base44.asServiceRole.entities.Notification.create({
        user_id: userId,
        type: 'workflow',
        title: config.title || 'AI Workflow Alert',
        message,
        priority: config.priority || 'normal'
      });
    }

    return { success: true, action: 'notification_sent', count: userIds.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createTaskAction(base44, config, data) {
  try {
    const task = await base44.asServiceRole.entities.MaintenanceTask.create({
      title: config.task_title || 'AI Workflow Task',
      description: formatTemplate(config.task_description || '', data),
      status: 'pending',
      priority: config.priority || 'medium'
    });

    return { success: true, action: 'task_created', task_id: task.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function webhookAction(config, data) {
  try {
    const response = await fetch(config.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'ai_workflow_trigger',
        data
      })
    });

    return { 
      success: response.ok, 
      action: 'webhook_called',
      status: response.status 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function disableFeatureAction(base44, config) {
  try {
    const featureKey = config.feature_key;
    if (!featureKey) {
      return { success: false, error: 'No feature_key specified' };
    }

    const features = await base44.asServiceRole.entities.AIFeatureConfig.filter({
      feature_key: featureKey
    });

    if (features.length > 0) {
      await base44.asServiceRole.entities.AIFeatureConfig.update(features[0].id, {
        is_enabled: false
      });
      return { success: true, action: 'feature_disabled', feature: featureKey };
    }

    return { success: false, error: 'Feature not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function formatTemplate(template, data) {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  return result;
}