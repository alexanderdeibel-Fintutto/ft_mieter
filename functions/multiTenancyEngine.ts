import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 94: Advanced Multi-Tenancy & Tenant Isolation System
 * Verwaltet Tenants, Konfigurationen und Isolations-Policies
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

        if (action === 'create_tenant') {
            const { tenant_name, tenant_slug, tier, isolation_level, primary_contact_email } = await req.json();

            if (!tenant_name || !tenant_slug) {
                return Response.json({ error: 'tenant_name, tenant_slug required' }, { status: 400 });
            }

            const tenant_id = crypto.randomUUID();
            const now = new Date().toISOString();
            const trialEnds = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

            const tenant = await base44.asServiceRole.entities.Tenant.create({
                organization_id,
                tenant_id,
                tenant_name,
                tenant_slug,
                status: 'trial',
                tier: tier || 'free',
                isolation_level: isolation_level || 'shared_database',
                primary_contact_email: primary_contact_email || '',
                created_at: now,
                trial_ends_at: trialEnds,
                last_activity_at: now
            });

            return Response.json({ tenant_created: true, tenant_id: tenant.id });

        } else if (action === 'update_tenant_status') {
            const { tenant_id, status } = await req.json();

            if (!tenant_id || !status) {
                return Response.json({ error: 'tenant_id, status required' }, { status: 400 });
            }

            const updateData = { status };

            if (status === 'active') {
                updateData.subscription_started_at = new Date().toISOString();
            }

            await base44.asServiceRole.entities.Tenant.update(tenant_id, updateData);

            return Response.json({ tenant_updated: true });

        } else if (action === 'set_tenant_config') {
            const { tenant_id, config_key, config_value, config_type, category } = await req.json();

            if (!tenant_id || !config_key || config_value === undefined) {
                return Response.json({ error: 'tenant_id, config_key, config_value required' }, { status: 400 });
            }

            const existing = await base44.asServiceRole.entities.TenantConfiguration.filter({
                organization_id,
                tenant_id,
                config_key
            });

            if (existing.length > 0) {
                await base44.asServiceRole.entities.TenantConfiguration.update(existing[0].id, {
                    config_value,
                    updated_at: new Date().toISOString()
                });
                return Response.json({ config_updated: true });
            }

            const config_id = crypto.randomUUID();

            await base44.asServiceRole.entities.TenantConfiguration.create({
                organization_id,
                config_id,
                tenant_id,
                config_key,
                config_value,
                config_type: config_type || 'string',
                category: category || 'features',
                created_at: new Date().toISOString()
            });

            return Response.json({ config_created: true });

        } else if (action === 'create_isolation_policy') {
            const { tenant_id, policy_name, policy_type, isolation_level, rules } = await req.json();

            if (!tenant_id || !policy_name || !policy_type) {
                return Response.json({ error: 'tenant_id, policy_name, policy_type required' }, { status: 400 });
            }

            const policy_id = crypto.randomUUID();

            const policy = await base44.asServiceRole.entities.TenantIsolationPolicy.create({
                organization_id,
                policy_id,
                tenant_id,
                policy_name,
                policy_type,
                isolation_level: isolation_level || 'medium',
                rules: rules || [],
                status: 'active',
                created_at: new Date().toISOString()
            });

            return Response.json({ policy_created: true, policy_id: policy.id });

        } else if (action === 'record_policy_violation') {
            const { policy_id } = await req.json();

            if (!policy_id) {
                return Response.json({ error: 'policy_id required' }, { status: 400 });
            }

            const policies = await base44.asServiceRole.entities.TenantIsolationPolicy.filter({
                organization_id,
                id: policy_id
            });

            if (policies.length === 0) {
                return Response.json({ error: 'Policy not found' }, { status: 404 });
            }

            const policy = policies[0];

            await base44.asServiceRole.entities.TenantIsolationPolicy.update(policy_id, {
                violations_count: (policy.violations_count || 0) + 1,
                last_violation_at: new Date().toISOString()
            });

            return Response.json({ violation_recorded: true });

        } else if (action === 'update_tenant_usage') {
            const { tenant_id, storage_used_mb, api_requests_count } = await req.json();

            if (!tenant_id) {
                return Response.json({ error: 'tenant_id required' }, { status: 400 });
            }

            const tenants = await base44.asServiceRole.entities.Tenant.filter({
                organization_id,
                id: tenant_id
            });

            if (tenants.length === 0) {
                return Response.json({ error: 'Tenant not found' }, { status: 404 });
            }

            const tenant = tenants[0];
            const updateData = {
                last_activity_at: new Date().toISOString()
            };

            if (storage_used_mb !== undefined) {
                updateData.storage_used_mb = storage_used_mb;
            }

            if (api_requests_count !== undefined) {
                updateData.api_requests_count = (tenant.api_requests_count || 0) + api_requests_count;
            }

            await base44.asServiceRole.entities.Tenant.update(tenant_id, updateData);

            return Response.json({ usage_updated: true });

        } else if (action === 'get_dashboard_data') {
            const [tenants, configs, policies] = await Promise.all([
                base44.asServiceRole.entities.Tenant.filter({ organization_id }, '-created_at', 50),
                base44.asServiceRole.entities.TenantConfiguration.filter({ organization_id }, '-created_at', 100),
                base44.asServiceRole.entities.TenantIsolationPolicy.filter({ organization_id }, '-created_at', 50)
            ]);

            const tenantStats = {
                total_tenants: tenants.length,
                active_tenants: tenants.filter(t => t.status === 'active').length,
                trial_tenants: tenants.filter(t => t.status === 'trial').length,
                suspended_tenants: tenants.filter(t => t.status === 'suspended').length,
                inactive_tenants: tenants.filter(t => t.status === 'inactive').length,
                churned_tenants: tenants.filter(t => t.status === 'churned').length,
                by_tier: {},
                by_isolation: {},
                total_users: tenants.reduce((sum, t) => sum + (t.user_count || 0), 0),
                total_storage_mb: tenants.reduce((sum, t) => sum + (t.storage_used_mb || 0), 0),
                total_api_requests: tenants.reduce((sum, t) => sum + (t.api_requests_count || 0), 0)
            };

            tenants.forEach(t => {
                tenantStats.by_tier[t.tier] = (tenantStats.by_tier[t.tier] || 0) + 1;
                tenantStats.by_isolation[t.isolation_level] = (tenantStats.by_isolation[t.isolation_level] || 0) + 1;
            });

            const configStats = {
                total_configs: configs.length,
                by_category: {}
            };

            configs.forEach(c => {
                configStats.by_category[c.category] = (configStats.by_category[c.category] || 0) + 1;
            });

            const policyStats = {
                total_policies: policies.length,
                active_policies: policies.filter(p => p.status === 'active').length,
                inactive_policies: policies.filter(p => p.status === 'inactive').length,
                total_violations: policies.reduce((sum, p) => sum + (p.violations_count || 0), 0),
                by_type: {},
                by_isolation_level: {}
            };

            policies.forEach(p => {
                policyStats.by_type[p.policy_type] = (policyStats.by_type[p.policy_type] || 0) + 1;
                policyStats.by_isolation_level[p.isolation_level] = (policyStats.by_isolation_level[p.isolation_level] || 0) + 1;
            });

            return Response.json({
                tenants: tenants.slice(0, 30),
                configs: configs.slice(0, 40),
                policies: policies.slice(0, 30),
                tenant_stats: tenantStats,
                config_stats: configStats,
                policy_stats: policyStats
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Multi-tenancy engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});