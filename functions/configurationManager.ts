import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 36: Advanced Configuration Management & Feature Flags
 * Verwaltet Konfigurationen und Feature Flags mit Versionierung
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,                    // 'create_config', 'get_configs', 'update_config', 'delete_config', 'create_flag', 'get_flags', 'update_flag', 'toggle_flag', 'get_flag_value', 'get_history', 'restore_config'
            organization_id,
            config_id,
            flag_id,
            config_key,
            config_name,
            value,
            flag_name,
            flag_key,
            rollout_percentage,
            is_enabled,
            environment,
            reason,
            category,
            flag_type
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'create_config') {
            // Create configuration
            if (!config_key || !config_name || value === undefined) {
                return Response.json({ error: 'config_key, config_name, value required' }, { status: 400 });
            }

            const config = await base44.asServiceRole.entities.Configuration.create({
                organization_id: organization_id,
                config_key: config_key,
                config_name: config_name,
                value: value.toString(),
                category: category || 'custom',
                environment: environment || 'production',
                updated_by: user.id
            });

            // Log change
            await base44.asServiceRole.entities.ConfigurationHistory.create({
                organization_id: organization_id,
                config_id: config.id,
                change_type: 'created',
                new_value: value.toString(),
                changed_by: user.id,
                changed_at: new Date().toISOString(),
                reason: reason || 'Initial creation'
            });

            return Response.json({
                config_created: true,
                config_id: config.id
            });

        } else if (action === 'get_configs') {
            // Get all configurations
            const filter = {
                organization_id: organization_id
            };

            if (environment) {
                filter.environment = environment;
            }

            const configs = await base44.asServiceRole.entities.Configuration.filter(
                filter,
                '-updated_date',
                200
            );

            const stats = {
                total: configs.length,
                by_category: groupByCategory(configs),
                by_environment: groupByEnvironment(configs),
                active: configs.filter(c => c.is_active).length
            };

            return Response.json({
                configs: configs,
                stats: stats
            });

        } else if (action === 'update_config') {
            // Update configuration
            if (!config_id || value === undefined) {
                return Response.json({ error: 'config_id, value required' }, { status: 400 });
            }

            const configs = await base44.asServiceRole.entities.Configuration.filter({
                id: config_id
            });

            if (!configs || configs.length === 0) {
                return Response.json({ error: 'Config not found' }, { status: 404 });
            }

            const oldValue = configs[0].value;

            // Update config
            await base44.asServiceRole.entities.Configuration.update(config_id, {
                value: value.toString(),
                updated_by: user.id
            });

            // Log change
            await base44.asServiceRole.entities.ConfigurationHistory.create({
                organization_id: organization_id,
                config_id: config_id,
                change_type: 'updated',
                old_value: oldValue,
                new_value: value.toString(),
                changed_by: user.id,
                changed_at: new Date().toISOString(),
                reason: reason || 'Configuration update'
            });

            return Response.json({
                config_updated: true
            });

        } else if (action === 'delete_config') {
            // Delete configuration
            if (!config_id) {
                return Response.json({ error: 'config_id required' }, { status: 400 });
            }

            const configs = await base44.asServiceRole.entities.Configuration.filter({
                id: config_id
            });

            if (configs && configs.length > 0) {
                await base44.asServiceRole.entities.ConfigurationHistory.create({
                    organization_id: organization_id,
                    config_id: config_id,
                    change_type: 'deleted',
                    old_value: configs[0].value,
                    changed_by: user.id,
                    changed_at: new Date().toISOString(),
                    reason: reason || 'Configuration deleted'
                });
            }

            await base44.asServiceRole.entities.Configuration.delete(config_id);

            return Response.json({
                config_deleted: true
            });

        } else if (action === 'create_flag') {
            // Create feature flag
            if (!flag_name || !flag_key) {
                return Response.json({ error: 'flag_name, flag_key required' }, { status: 400 });
            }

            const flag = await base44.asServiceRole.entities.FeatureFlag.create({
                organization_id: organization_id,
                flag_name: flag_name,
                flag_key: flag_key,
                flag_type: flag_type || 'boolean',
                environment: environment || 'production',
                created_by: user.id,
                created_date: new Date().toISOString()
            });

            return Response.json({
                flag_created: true,
                flag_id: flag.id
            });

        } else if (action === 'get_flags') {
            // Get all feature flags
            const filter = {
                organization_id: organization_id
            };

            if (environment) {
                filter.environment = environment;
            }

            const flags = await base44.asServiceRole.entities.FeatureFlag.filter(
                filter,
                '-created_date',
                200
            );

            const stats = {
                total: flags.length,
                enabled: flags.filter(f => f.is_enabled).length,
                by_status: groupByStatus(flags),
                rolling_out: flags.filter(f => f.rollout_percentage > 0 && f.rollout_percentage < 100).length
            };

            return Response.json({
                flags: flags,
                stats: stats
            });

        } else if (action === 'update_flag') {
            // Update feature flag
            if (!flag_id) {
                return Response.json({ error: 'flag_id required' }, { status: 400 });
            }

            const updateData = {};
            if (flag_name) updateData.flag_name = flag_name;
            if (rollout_percentage !== undefined) updateData.rollout_percentage = rollout_percentage;
            if (is_enabled !== undefined) updateData.is_enabled = is_enabled;

            await base44.asServiceRole.entities.FeatureFlag.update(flag_id, updateData);

            return Response.json({
                flag_updated: true
            });

        } else if (action === 'toggle_flag') {
            // Toggle feature flag on/off
            if (!flag_id) {
                return Response.json({ error: 'flag_id required' }, { status: 400 });
            }

            const flags = await base44.asServiceRole.entities.FeatureFlag.filter({
                id: flag_id
            });

            if (!flags || flags.length === 0) {
                return Response.json({ error: 'Flag not found' }, { status: 404 });
            }

            const flag = flags[0];
            const newState = !flag.is_enabled;

            await base44.asServiceRole.entities.FeatureFlag.update(flag_id, {
                is_enabled: newState
            });

            return Response.json({
                flag_toggled: true,
                new_state: newState
            });

        } else if (action === 'get_flag_value') {
            // Get flag value for user (respecting rollout %)
            if (!flag_key) {
                return Response.json({ error: 'flag_key required' }, { status: 400 });
            }

            const flags = await base44.asServiceRole.entities.FeatureFlag.filter({
                organization_id: organization_id,
                flag_key: flag_key
            });

            if (!flags || flags.length === 0) {
                return Response.json({ flag_enabled: false });
            }

            const flag = flags[0];

            // Check if user is in enabled/disabled lists
            if (user.id && flag.enabled_for_users.includes(user.id)) {
                return Response.json({ flag_enabled: true });
            }

            if (user.id && flag.disabled_for_users.includes(user.id)) {
                return Response.json({ flag_enabled: false });
            }

            // Check rollout percentage
            if (flag.is_enabled) {
                if (flag.rollout_percentage === 100) {
                    return Response.json({ flag_enabled: true });
                } else if (flag.rollout_percentage > 0) {
                    // Consistent hashing for user
                    const hash = simpleHash(user.id + flag.id) % 100;
                    const enabled = hash < flag.rollout_percentage;
                    return Response.json({ flag_enabled: enabled });
                }
            }

            return Response.json({ flag_enabled: false });

        } else if (action === 'get_history') {
            // Get configuration change history
            const filter = {
                organization_id: organization_id
            };

            if (config_id) {
                filter.config_id = config_id;
            }

            const history = await base44.asServiceRole.entities.ConfigurationHistory.filter(
                filter,
                '-changed_at',
                500
            );

            return Response.json({
                history: history,
                total: history.length
            });

        } else if (action === 'restore_config') {
            // Restore config from history
            if (!config_id) {
                return Response.json({ error: 'config_id required' }, { status: 400 });
            }

            const history = await base44.asServiceRole.entities.ConfigurationHistory.filter({
                config_id: config_id,
                change_type: 'updated'
            }, '-changed_at', 1);

            if (!history || history.length === 0) {
                return Response.json({ error: 'No history found' }, { status: 404 });
            }

            const previousChange = history[0];

            // Restore to previous value
            await base44.asServiceRole.entities.Configuration.update(config_id, {
                value: previousChange.old_value,
                updated_by: user.id
            });

            // Log restoration
            await base44.asServiceRole.entities.ConfigurationHistory.create({
                organization_id: organization_id,
                config_id: config_id,
                change_type: 'updated',
                old_value: previousChange.new_value,
                new_value: previousChange.old_value,
                changed_by: user.id,
                changed_at: new Date().toISOString(),
                reason: 'Configuration restored'
            });

            return Response.json({
                config_restored: true
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Configuration manager error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function groupByCategory(configs) {
    return configs.reduce((acc, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
    }, {});
}

function groupByEnvironment(configs) {
    return configs.reduce((acc, c) => {
        acc[c.environment] = (acc[c.environment] || 0) + 1;
        return acc;
    }, {});
}

function groupByStatus(flags) {
    return flags.reduce((acc, f) => {
        acc[f.status] = (acc[f.status] || 0) + 1;
        return acc;
    }, {});
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}