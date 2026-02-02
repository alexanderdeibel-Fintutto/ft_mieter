import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 51: Advanced Container Orchestration & Deployment System
 * Verwaltet Container Images, Deployments und Pipelines
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, organization_id } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'create_image') {
            const { image_name, image_tag, registry, size_bytes } = await req.json();

            if (!image_name || !image_tag || !registry) {
                return Response.json({ error: 'image_name, image_tag, registry required' }, { status: 400 });
            }

            const image = await base44.asServiceRole.entities.ContainerImage.create({
                organization_id,
                image_name,
                image_tag,
                registry,
                size_bytes: size_bytes || 0,
                build_timestamp: new Date().toISOString()
            });

            return Response.json({ image_created: true, image_id: image.id });

        } else if (action === 'get_images') {
            const images = await base44.asServiceRole.entities.ContainerImage.filter({
                organization_id
            }, '-build_timestamp', 200);

            return Response.json({ images });

        } else if (action === 'scan_image') {
            const { image_id } = await req.json();

            if (!image_id) {
                return Response.json({ error: 'image_id required' }, { status: 400 });
            }

            // Simulate vulnerability scan
            const vulnCount = Math.floor(Math.random() * 10);

            await base44.asServiceRole.entities.ContainerImage.update(image_id, {
                scan_status: vulnCount > 5 ? 'failed' : 'passed',
                vulnerabilities_count: vulnCount
            });

            return Response.json({ scan_completed: true, vulnerabilities: vulnCount });

        } else if (action === 'create_deployment') {
            const { deployment_name, image_id, namespace, replicas, environment } = await req.json();

            if (!deployment_name || !image_id || !namespace) {
                return Response.json({ error: 'deployment_name, image_id, namespace required' }, { status: 400 });
            }

            const deployment = await base44.asServiceRole.entities.ContainerDeployment.create({
                organization_id,
                deployment_name,
                image_id,
                namespace,
                replicas: replicas || 1,
                environment: environment || 'development',
                status: 'pending',
                deployed_by: user.id,
                deployed_at: new Date().toISOString()
            });

            return Response.json({ deployment_created: true, deployment_id: deployment.id });

        } else if (action === 'get_deployments') {
            const deployments = await base44.asServiceRole.entities.ContainerDeployment.filter({
                organization_id
            }, '-deployed_at', 200);

            return Response.json({ deployments });

        } else if (action === 'scale_deployment') {
            const { deployment_id, replicas } = await req.json();

            if (!deployment_id || !replicas) {
                return Response.json({ error: 'deployment_id, replicas required' }, { status: 400 });
            }

            await base44.asServiceRole.entities.ContainerDeployment.update(deployment_id, {
                replicas,
                status: 'scaling'
            });

            // Simulate scaling completion
            setTimeout(async () => {
                await base44.asServiceRole.entities.ContainerDeployment.update(deployment_id, {
                    replicas_available: replicas,
                    status: 'running'
                });
            }, 2000);

            return Response.json({ scaling_started: true, target_replicas: replicas });

        } else if (action === 'update_deployment_status') {
            const { deployment_id, status, replicas_available } = await req.json();

            if (!deployment_id || !status) {
                return Response.json({ error: 'deployment_id, status required' }, { status: 400 });
            }

            await base44.asServiceRole.entities.ContainerDeployment.update(deployment_id, {
                status,
                replicas_available: replicas_available || 0
            });

            return Response.json({ status_updated: true });

        } else if (action === 'create_pipeline') {
            const { pipeline_name, deployment_id, trigger_type } = await req.json();

            if (!pipeline_name || !deployment_id) {
                return Response.json({ error: 'pipeline_name, deployment_id required' }, { status: 400 });
            }

            const pipeline = await base44.asServiceRole.entities.DeploymentPipeline.create({
                organization_id,
                pipeline_name,
                deployment_id,
                trigger_type: trigger_type || 'manual',
                status: 'pending',
                triggered_by: user.id,
                started_at: new Date().toISOString()
            });

            return Response.json({ pipeline_created: true, pipeline_id: pipeline.id });

        } else if (action === 'run_pipeline') {
            const { pipeline_id } = await req.json();

            if (!pipeline_id) {
                return Response.json({ error: 'pipeline_id required' }, { status: 400 });
            }

            const stages = [
                { name: 'build', status: 'running', started_at: new Date().toISOString() },
                { name: 'test', status: 'pending' },
                { name: 'deploy', status: 'pending' }
            ];

            await base44.asServiceRole.entities.DeploymentPipeline.update(pipeline_id, {
                status: 'running',
                current_stage: 'build',
                stages
            });

            return Response.json({ pipeline_started: true });

        } else if (action === 'update_pipeline_stage') {
            const { pipeline_id, stage_name, stage_status } = await req.json();

            if (!pipeline_id || !stage_name || !stage_status) {
                return Response.json({ error: 'pipeline_id, stage_name, stage_status required' }, { status: 400 });
            }

            const pipelines = await base44.asServiceRole.entities.DeploymentPipeline.filter({
                organization_id,
                id: pipeline_id
            });

            if (pipelines.length === 0) {
                return Response.json({ error: 'Pipeline not found' }, { status: 404 });
            }

            const pipeline = pipelines[0];
            const updatedStages = pipeline.stages.map(stage => 
                stage.name === stage_name 
                    ? { ...stage, status: stage_status, completed_at: new Date().toISOString() }
                    : stage
            );

            await base44.asServiceRole.entities.DeploymentPipeline.update(pipeline_id, {
                stages: updatedStages,
                current_stage: stage_name
            });

            return Response.json({ stage_updated: true });

        } else if (action === 'get_pipelines') {
            const pipelines = await base44.asServiceRole.entities.DeploymentPipeline.filter({
                organization_id
            }, '-started_at', 200);

            return Response.json({ pipelines });

        } else if (action === 'get_dashboard_data') {
            const [images, deployments, pipelines] = await Promise.all([
                base44.asServiceRole.entities.ContainerImage.filter({ organization_id }),
                base44.asServiceRole.entities.ContainerDeployment.filter({ organization_id }),
                base44.asServiceRole.entities.DeploymentPipeline.filter({ organization_id }, '-started_at', 100)
            ]);

            const imagesByRegistry = {};
            const deploymentsByStatus = {};
            const deploymentsByEnv = {};
            
            images.forEach(img => {
                imagesByRegistry[img.registry] = (imagesByRegistry[img.registry] || 0) + 1;
            });

            deployments.forEach(dep => {
                deploymentsByStatus[dep.status] = (deploymentsByStatus[dep.status] || 0) + 1;
                deploymentsByEnv[dep.environment] = (deploymentsByEnv[dep.environment] || 0) + 1;
            });

            const stats = {
                total_images: images.length,
                scanned_images: images.filter(i => i.scan_status !== 'pending').length,
                vulnerable_images: images.filter(i => i.scan_status === 'failed').length,
                total_deployments: deployments.length,
                running_deployments: deployments.filter(d => d.status === 'running').length,
                failed_deployments: deployments.filter(d => d.status === 'failed').length,
                total_pipelines: pipelines.length,
                running_pipelines: pipelines.filter(p => p.status === 'running').length,
                successful_pipelines: pipelines.filter(p => p.status === 'success').length
            };

            return Response.json({
                images,
                deployments,
                pipelines: pipelines.slice(0, 50),
                stats,
                images_by_registry: imagesByRegistry,
                deployments_by_status: deploymentsByStatus,
                deployments_by_environment: deploymentsByEnv
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Container orchestration engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});