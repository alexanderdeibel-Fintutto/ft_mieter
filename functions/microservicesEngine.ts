import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 48: Advanced Microservices Architecture & Service Registry System
 * Verwaltet Microservices, Service Registry und Dependencies
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

        if (action === 'create_service') {
            const { service_name, service_type, version, endpoint_url } = await req.json();

            if (!service_name || !service_type || !version) {
                return Response.json({ error: 'service_name, service_type, version required' }, { status: 400 });
            }

            const service = await base44.asServiceRole.entities.Microservice.create({
                organization_id,
                service_name,
                service_type,
                version,
                endpoint_url: endpoint_url || '',
                status: 'stopped'
            });

            return Response.json({ service_created: true, service_id: service.id });

        } else if (action === 'get_services') {
            const services = await base44.asServiceRole.entities.Microservice.filter({
                organization_id
            }, '-created_date', 200);

            return Response.json({ services });

        } else if (action === 'update_service_status') {
            const { service_id, status } = await req.json();

            if (!service_id || !status) {
                return Response.json({ error: 'service_id, status required' }, { status: 400 });
            }

            await base44.asServiceRole.entities.Microservice.update(service_id, {
                status,
                last_deployed_at: new Date().toISOString()
            });

            return Response.json({ status_updated: true });

        } else if (action === 'scale_service') {
            const { service_id, instance_count } = await req.json();

            if (!service_id || !instance_count) {
                return Response.json({ error: 'service_id, instance_count required' }, { status: 400 });
            }

            await base44.asServiceRole.entities.Microservice.update(service_id, {
                instance_count,
                status: 'scaling'
            });

            return Response.json({ service_scaled: true, new_count: instance_count });

        } else if (action === 'register_instance') {
            const { service_id, instance_id, host, port } = await req.json();

            if (!service_id || !instance_id || !host || !port) {
                return Response.json({ error: 'service_id, instance_id, host, port required' }, { status: 400 });
            }

            const registry = await base44.asServiceRole.entities.ServiceRegistry.create({
                organization_id,
                service_id,
                instance_id,
                host,
                port,
                health_status: 'unknown',
                registered_at: new Date().toISOString()
            });

            return Response.json({ instance_registered: true, registry_id: registry.id });

        } else if (action === 'get_service_instances') {
            const { service_id } = await req.json();

            if (!service_id) {
                return Response.json({ error: 'service_id required' }, { status: 400 });
            }

            const instances = await base44.asServiceRole.entities.ServiceRegistry.filter({
                organization_id,
                service_id
            });

            return Response.json({ instances });

        } else if (action === 'heartbeat') {
            const { instance_id, health_status, response_time_ms } = await req.json();

            if (!instance_id) {
                return Response.json({ error: 'instance_id required' }, { status: 400 });
            }

            const instances = await base44.asServiceRole.entities.ServiceRegistry.filter({
                organization_id,
                instance_id
            });

            if (!instances || instances.length === 0) {
                return Response.json({ error: 'Instance not found' }, { status: 404 });
            }

            await base44.asServiceRole.entities.ServiceRegistry.update(instances[0].id, {
                health_status: health_status || 'healthy',
                last_heartbeat: new Date().toISOString(),
                response_time_ms: response_time_ms || 0
            });

            return Response.json({ heartbeat_recorded: true });

        } else if (action === 'create_dependency') {
            const { source_service_id, target_service_id, dependency_type } = await req.json();

            if (!source_service_id || !target_service_id || !dependency_type) {
                return Response.json({ error: 'source_service_id, target_service_id, dependency_type required' }, { status: 400 });
            }

            const dep = await base44.asServiceRole.entities.ServiceDependency.create({
                organization_id,
                source_service_id,
                target_service_id,
                dependency_type
            });

            return Response.json({ dependency_created: true, dependency_id: dep.id });

        } else if (action === 'get_dependencies') {
            const { service_id } = await req.json();

            let dependencies;
            if (service_id) {
                const [source, target] = await Promise.all([
                    base44.asServiceRole.entities.ServiceDependency.filter({ organization_id, source_service_id: service_id }),
                    base44.asServiceRole.entities.ServiceDependency.filter({ organization_id, target_service_id: service_id })
                ]);
                dependencies = [...source, ...target];
            } else {
                dependencies = await base44.asServiceRole.entities.ServiceDependency.filter({ organization_id });
            }

            return Response.json({ dependencies });

        } else if (action === 'get_dashboard_data') {
            const [services, registry, dependencies] = await Promise.all([
                base44.asServiceRole.entities.Microservice.filter({ organization_id }),
                base44.asServiceRole.entities.ServiceRegistry.filter({ organization_id }),
                base44.asServiceRole.entities.ServiceDependency.filter({ organization_id })
            ]);

            const servicesByType = {};
            const servicesByStatus = {};
            const servicesByEnvironment = {};
            
            services.forEach(s => {
                servicesByType[s.service_type] = (servicesByType[s.service_type] || 0) + 1;
                servicesByStatus[s.status] = (servicesByStatus[s.status] || 0) + 1;
                servicesByEnvironment[s.environment] = (servicesByEnvironment[s.environment] || 0) + 1;
            });

            const stats = {
                total_services: services.length,
                running_services: services.filter(s => s.status === 'running').length,
                stopped_services: services.filter(s => s.status === 'stopped').length,
                error_services: services.filter(s => s.status === 'error').length,
                total_instances: registry.length,
                healthy_instances: registry.filter(i => i.health_status === 'healthy').length,
                unhealthy_instances: registry.filter(i => i.health_status === 'unhealthy').length,
                total_dependencies: dependencies.length,
                critical_dependencies: dependencies.filter(d => d.is_critical).length
            };

            return Response.json({
                services,
                registry,
                dependencies,
                stats,
                services_by_type: servicesByType,
                services_by_status: servicesByStatus,
                services_by_environment: servicesByEnvironment
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Microservices engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});