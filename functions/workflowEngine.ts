import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 29: Custom Workflows & Automation Engine
 * Verwaltet benutzerdefinierte Workflows und deren Ausführung
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,                    // 'create_workflow', 'get_workflows', 'execute_workflow', 'get_executions', 'pause_workflow', 'delete_workflow', 'get_templates', 'create_from_template'
            organization_id,
            workflow_id,
            workflow_name,
            trigger_type,
            trigger_entity,
            steps = [],
            execution_id,
            template_id,
            template_name,
            category
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'create_workflow') {
            // Create new workflow
            if (!workflow_name || !trigger_type) {
                return Response.json({ error: 'workflow_name, trigger_type required' }, { status: 400 });
            }

            const workflow = await base44.asServiceRole.entities.Workflow.create({
                organization_id: organization_id,
                workflow_name: workflow_name,
                trigger_type: trigger_type,
                trigger_entity: trigger_entity || null,
                steps: steps,
                status: 'draft',
                is_active: false,
                created_by: user.id
            });

            return Response.json({
                workflow_created: true,
                workflow_id: workflow.id
            });

        } else if (action === 'get_workflows') {
            // Get all workflows
            const workflows = await base44.asServiceRole.entities.Workflow.filter({
                organization_id: organization_id
            }, '-created_date', 100);

            const stats = {
                total: workflows.length,
                active: workflows.filter(w => w.is_active).length,
                draft: workflows.filter(w => w.status === 'draft').length,
                total_executions: workflows.reduce((sum, w) => sum + w.execution_count, 0),
                average_success_rate: calculateAverageSuccessRate(workflows)
            };

            return Response.json({
                workflows: workflows,
                stats: stats
            });

        } else if (action === 'execute_workflow') {
            // Execute workflow manually
            if (!workflow_id) {
                return Response.json({ error: 'workflow_id required' }, { status: 400 });
            }

            const workflows = await base44.asServiceRole.entities.Workflow.filter({
                id: workflow_id
            });

            if (!workflows || workflows.length === 0) {
                return Response.json({ error: 'Workflow not found' }, { status: 404 });
            }

            const workflow = workflows[0];

            // Create execution record
            const execution = await base44.asServiceRole.entities.WorkflowExecution.create({
                organization_id: organization_id,
                workflow_id: workflow_id,
                status: 'pending',
                trigger_source: 'manual',
                started_at: new Date().toISOString(),
                context_data: {}
            });

            // Simulate workflow execution
            setTimeout(() => executeWorkflowAsync(base44, workflow, execution.id, organization_id), 100);

            // Update workflow stats
            await base44.asServiceRole.entities.Workflow.update(workflow_id, {
                execution_count: (workflow.execution_count || 0) + 1,
                last_executed_at: new Date().toISOString()
            });

            return Response.json({
                execution_started: true,
                execution_id: execution.id
            });

        } else if (action === 'get_executions') {
            // Get workflow executions
            if (!workflow_id) {
                return Response.json({ error: 'workflow_id required' }, { status: 400 });
            }

            const executions = await base44.asServiceRole.entities.WorkflowExecution.filter({
                workflow_id: workflow_id
            }, '-started_at', 100);

            const stats = {
                total: executions.length,
                completed: executions.filter(e => e.status === 'completed').length,
                failed: executions.filter(e => e.status === 'failed').length,
                average_duration: calculateAverageDuration(executions)
            };

            return Response.json({
                executions: executions,
                stats: stats
            });

        } else if (action === 'pause_workflow') {
            // Pause/resume workflow
            if (!workflow_id) {
                return Response.json({ error: 'workflow_id required' }, { status: 400 });
            }

            const workflows = await base44.asServiceRole.entities.Workflow.filter({
                id: workflow_id
            });

            if (!workflows || workflows.length === 0) {
                return Response.json({ error: 'Workflow not found' }, { status: 404 });
            }

            const newStatus = workflows[0].is_active ? false : true;
            await base44.asServiceRole.entities.Workflow.update(workflow_id, {
                is_active: newStatus,
                status: newStatus ? 'active' : 'paused'
            });

            return Response.json({
                workflow_updated: true,
                is_active: newStatus
            });

        } else if (action === 'delete_workflow') {
            // Delete workflow (soft delete)
            if (!workflow_id) {
                return Response.json({ error: 'workflow_id required' }, { status: 400 });
            }

            await base44.asServiceRole.entities.Workflow.update(workflow_id, {
                status: 'archived',
                is_active: false
            });

            return Response.json({
                workflow_deleted: true
            });

        } else if (action === 'get_templates') {
            // Get workflow templates
            const templates = await base44.asServiceRole.entities.WorkflowTemplate.filter({
                organization_id: organization_id
            }, '-usage_count', 50);

            return Response.json({
                templates: templates,
                total: templates.length
            });

        } else if (action === 'create_from_template') {
            // Create workflow from template
            if (!template_id) {
                return Response.json({ error: 'template_id required' }, { status: 400 });
            }

            const templates = await base44.asServiceRole.entities.WorkflowTemplate.filter({
                id: template_id
            });

            if (!templates || templates.length === 0) {
                return Response.json({ error: 'Template not found' }, { status: 404 });
            }

            const template = templates[0];

            // Create workflow from template
            const workflow = await base44.asServiceRole.entities.Workflow.create({
                organization_id: organization_id,
                workflow_name: template.template_name,
                trigger_type: template.template_json.trigger_type || 'manual',
                steps: template.template_json.steps || [],
                status: 'draft',
                is_active: false,
                created_by: user.id
            });

            // Update template usage
            await base44.asServiceRole.entities.WorkflowTemplate.update(template_id, {
                usage_count: (template.usage_count || 0) + 1
            });

            return Response.json({
                workflow_created: true,
                workflow_id: workflow.id,
                from_template: template.template_name
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Workflow engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function executeWorkflowAsync(base44, workflow, executionId, organizationId) {
    try {
        const execution = await base44.asServiceRole.entities.WorkflowExecution.filter({
            id: executionId
        });

        if (!execution || execution.length === 0) return;

        const exec = execution[0];
        const contextData = { ...exec.context_data };
        const completedSteps = [];
        let currentStatus = 'running';
        let errorMessage = null;

        // Execute steps
        for (const step of workflow.steps || []) {
            const startTime = Date.now();

            try {
                let stepOutput = {};

                // Simulate step execution based on type
                if (step.step_type === 'notification') {
                    stepOutput = { notification_sent: true };
                } else if (step.step_type === 'data_transform') {
                    stepOutput = { transformed: true };
                } else if (step.step_type === 'api_call') {
                    stepOutput = { api_called: true, status: 200 };
                } else {
                    stepOutput = { executed: true };
                }

                contextData[step.step_id] = stepOutput;
                completedSteps.push({
                    step_id: step.step_id,
                    status: 'completed',
                    output: stepOutput,
                    duration_ms: Date.now() - startTime,
                    timestamp: new Date().toISOString()
                });
            } catch (stepError) {
                errorMessage = stepError.message;
                currentStatus = 'failed';
                break;
            }
        }

        if (currentStatus === 'running') {
            currentStatus = 'completed';
        }

        // Update workflow execution
        await base44.asServiceRole.entities.WorkflowExecution.update(executionId, {
            status: currentStatus,
            completed_steps: completedSteps,
            context_data: contextData,
            error_message: errorMessage,
            completed_at: new Date().toISOString(),
            duration_ms: Date.now() - new Date(exec.started_at).getTime()
        });

        // Update workflow stats
        const workflows = await base44.asServiceRole.entities.Workflow.filter({
            id: workflow.id
        });

        if (workflows && workflows.length > 0) {
            const wf = workflows[0];
            const successCount = currentStatus === 'completed' 
                ? (wf.success_count || 0) + 1 
                : wf.success_count || 0;
            const failureCount = currentStatus === 'failed' 
                ? (wf.failure_count || 0) + 1 
                : wf.failure_count || 0;
            const total = successCount + failureCount;
            const errorRate = total > 0 ? Math.round((failureCount / total) * 100) : 0;

            await base44.asServiceRole.entities.Workflow.update(workflow.id, {
                success_count: successCount,
                failure_count: failureCount,
                error_rate: errorRate
            });
        }
    } catch (error) {
        console.error('Workflow execution error:', error);
    }
}

function calculateAverageSuccessRate(workflows) {
    if (workflows.length === 0) return 100;
    const totalExecution = workflows.reduce((sum, w) => sum + w.execution_count, 0);
    const totalSuccess = workflows.reduce((sum, w) => sum + w.success_count, 0);
    return totalExecution > 0 ? Math.round((totalSuccess / totalExecution) * 100) : 100;
}

function calculateAverageDuration(executions) {
    const withDuration = executions.filter(e => e.duration_ms);
    if (withDuration.length === 0) return 0;
    return Math.round(withDuration.reduce((sum, e) => sum + e.duration_ms, 0) / withDuration.length);
}