import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 45: Advanced Tenant Isolation & Resource Quotas System
 * Verwaltet Tenant-Isolation, Ressourcen-Quotas und Tenant-Konfigurationen
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,
            organization_id,
            policy_id,
            policy_name,
            quota_id,
            resource_name,
            resource_type,
            tenant_tier
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'create_isolation_policy') {
            if (!policy_name) {
                return Response.json({ error: 'policy_name required' }, { status: 400 });
            }

            const { isolation_level, data_isolation, network_isolation } = await req.json();

            const policy = await base44.asServiceRole.entities.TenantIsolationPolicy.create({
                organization_id,
                policy_name,
                isolation_level: isolation_level || 'moderate',
                data_isolation: data_isolation !== undefined ? data_isolation : true,
                network_isolation: network_isolation || false
            });

            return Response.json({ policy_created: true, policy_id: policy.id });

        } else if (action === 'get_isolation_policies') {
            const policies = await base44.asServiceRole.entities.TenantIsolationPolicy.filter({
                organization_id
            }, '-created_date', 100);

            return Response.json({ policies });

        } else if (action === 'create_quota_limit') {
            if (!resource_name || !resource_type) {
                return Response.json({ error: 'resource_name, resource_type required' }, { status: 400 });
            }

            const { limit_value, unit, enforcement_action } = await req.json();

            const quota = await base44.asServiceRole.entities.ResourceQuotaLimit.create({
                organization_id,
                resource_name,
                resource_type,
                limit_value: limit_value || 1000,
                unit: unit || 'count',
                enforcement_action: enforcement_action || 'block',
                last_reset_at: new Date().toISOString()
            });

            return Response.json({ quota_created: true, quota_id: quota.id });

        } else if (action === 'get_quota_limits') {
            const quotas = await base44.asServiceRole.entities.ResourceQuotaLimit.filter({
                organization_id
            }, '-created_date', 100);

            return Response.json({ quotas });

        } else if (action === 'check_quota') {
            if (!resource_type) {
                return Response.json({ error: 'resource_type required' }, { status: 400 });
            }

            const quotas = await base44.asServiceRole.entities.ResourceQuotaLimit.filter({
                organization_id,
                resource_type,
                is_active: true
            });

            if (!quotas || quotas.length === 0) {
                return Response.json({ allowed: true, no_quota: true });
            }

            const quota = quotas[0];
            const usage = quota.current_usage || 0;
            const limit = quota.limit_value;

            if (usage >= limit) {
                return Response.json({
                    allowed: false,
                    quota_exceeded: true,
                    usage,
                    limit,
                    enforcement_action: quota.enforcement_action
                });
            }

            return Response.json({
                allowed: true,
                usage,
                limit,
                remaining: limit - usage
            });

        } else if (action === 'increment_quota_usage') {
            if (!resource_type) {
                return Response.json({ error: 'resource_type required' }, { status: 400 });
            }

            const { increment } = await req.json();
            const amount = increment || 1;

            const quotas = await base44.asServiceRole.entities.ResourceQuotaLimit.filter({
                organization_id,
                resource_type,
                is_active: true
            });

            if (quotas && quotas.length > 0) {
                const quota = quotas[0];
                await base44.asServiceRole.entities.ResourceQuotaLimit.update(quota.id, {
                    current_usage: (quota.current_usage || 0) + amount
                });

                return Response.json({ usage_incremented: true, new_usage: (quota.current_usage || 0) + amount });
            }

            return Response.json({ no_quota_found: true });

        } else if (action === 'reset_quota') {
            if (!quota_id) {
                return Response.json({ error: 'quota_id required' }, { status: 400 });
            }

            await base44.asServiceRole.entities.ResourceQuotaLimit.update(quota_id, {
                current_usage: 0,
                last_reset_at: new Date().toISOString()
            });

            return Response.json({ quota_reset: true });

        } else if (action === 'create_tenant_config') {
            const { max_users, max_storage_gb } = await req.json();

            const config = await base44.asServiceRole.entities.TenantConfiguration.create({
                organization_id,
                tenant_tier: tenant_tier || 'free',
                max_users: max_users || 10,
                max_storage_gb: max_storage_gb || 5
            });

            return Response.json({ config_created: true, config_id: config.id });

        } else if (action === 'get_tenant_config') {
            const configs = await base44.asServiceRole.entities.TenantConfiguration.filter({
                organization_id
            });

            if (!configs || configs.length === 0) {
                return Response.json({ config: null });
            }

            return Response.json({ config: configs[0] });

        } else if (action === 'get_dashboard_data') {
            const [policies, quotas, config] = await Promise.all([
                base44.asServiceRole.entities.TenantIsolationPolicy.filter({ organization_id }),
                base44.asServiceRole.entities.ResourceQuotaLimit.filter({ organization_id }),
                base44.functions.invoke('tenantIsolationEngine', {
                    action: 'get_tenant_config',
                    organization_id
                })
            ]);

            const stats = {
                total_policies: policies.length,
                active_policies: policies.filter(p => p.is_active).length,
                total_quotas: quotas.length,
                active_quotas: quotas.filter(q => q.is_active).length,
                quotas_exceeded: quotas.filter(q => (q.current_usage || 0) >= q.limit_value).length,
                quotas_near_limit: quotas.filter(q => {
                    const usage = (q.current_usage || 0);
                    const limit = q.limit_value;
                    return usage >= (limit * 0.8) && usage < limit;
                }).length
            };

            return Response.json({
                policies,
                quotas,
                tenant_config: config.data.config,
                stats
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Tenant isolation engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});