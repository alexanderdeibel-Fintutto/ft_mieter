import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 67: Advanced Feature Flags & A/B Testing System
 * Verwaltet Feature Flags, A/B Tests und Test-Ergebnisse
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

        if (action === 'create_flag') {
            const { flag_key, flag_name, description, flag_type, default_value, environments } = await req.json();

            if (!flag_key || !flag_name) {
                return Response.json({ error: 'flag_key, flag_name required' }, { status: 400 });
            }

            const flag = await base44.asServiceRole.entities.FeatureFlag.create({
                organization_id,
                flag_key,
                flag_name,
                description: description || '',
                flag_type: flag_type || 'boolean',
                default_value: default_value || 'false',
                environments: environments || ['prod']
            });

            return Response.json({ flag_created: true, flag_id: flag.id });

        } else if (action === 'update_flag') {
            const { flag_id, enabled, rollout_percentage, targeting_rules } = await req.json();

            if (!flag_id) {
                return Response.json({ error: 'flag_id required' }, { status: 400 });
            }

            const updates = {};
            if (enabled !== undefined) updates.enabled = enabled;
            if (rollout_percentage !== undefined) updates.rollout_percentage = rollout_percentage;
            if (targeting_rules) updates.targeting_rules = targeting_rules;

            await base44.asServiceRole.entities.FeatureFlag.update(flag_id, updates);

            return Response.json({ flag_updated: true });

        } else if (action === 'evaluate_flag') {
            const { flag_key, user_id, environment } = await req.json();

            if (!flag_key) {
                return Response.json({ error: 'flag_key required' }, { status: 400 });
            }

            const flags = await base44.asServiceRole.entities.FeatureFlag.filter({
                organization_id,
                flag_key
            });

            if (flags.length === 0) {
                return Response.json({ enabled: false, value: null, reason: 'flag_not_found' });
            }

            const flag = flags[0];

            if (!flag.enabled) {
                await base44.asServiceRole.entities.FeatureFlag.update(flag.id, {
                    total_evaluations: (flag.total_evaluations || 0) + 1
                });
                return Response.json({ enabled: false, value: flag.default_value, reason: 'flag_disabled' });
            }

            // Check environment
            if (environment && flag.environments.length > 0 && !flag.environments.includes(environment)) {
                return Response.json({ enabled: false, value: flag.default_value, reason: 'environment_mismatch' });
            }

            // Rollout percentage
            if (flag.rollout_percentage < 100) {
                const hash = user_id ? hashString(user_id) : Math.random() * 100;
                const userPercentage = hash % 100;
                
                if (userPercentage >= flag.rollout_percentage) {
                    await base44.asServiceRole.entities.FeatureFlag.update(flag.id, {
                        total_evaluations: (flag.total_evaluations || 0) + 1
                    });
                    return Response.json({ enabled: false, value: flag.default_value, reason: 'rollout_percentage' });
                }
            }

            // Flag is enabled
            await base44.asServiceRole.entities.FeatureFlag.update(flag.id, {
                total_evaluations: (flag.total_evaluations || 0) + 1,
                enabled_count: (flag.enabled_count || 0) + 1
            });

            return Response.json({ enabled: true, value: flag.default_value, reason: 'enabled' });

        } else if (action === 'get_flags') {
            const flags = await base44.asServiceRole.entities.FeatureFlag.filter({
                organization_id
            }, '-created_date');

            return Response.json({ flags });

        } else if (action === 'create_test') {
            const { test_key, test_name, description, variants, primary_metric, traffic_allocation } = await req.json();

            if (!test_key || !test_name || !variants || variants.length < 2) {
                return Response.json({ error: 'test_key, test_name, variants (min 2) required' }, { status: 400 });
            }

            const test = await base44.asServiceRole.entities.ABTest.create({
                organization_id,
                test_key,
                test_name,
                description: description || '',
                variants,
                primary_metric: primary_metric || 'conversion',
                traffic_allocation: traffic_allocation || 100
            });

            return Response.json({ test_created: true, test_id: test.id });

        } else if (action === 'start_test') {
            const { test_id } = await req.json();

            if (!test_id) {
                return Response.json({ error: 'test_id required' }, { status: 400 });
            }

            await base44.asServiceRole.entities.ABTest.update(test_id, {
                status: 'running',
                started_at: new Date().toISOString()
            });

            return Response.json({ test_started: true });

        } else if (action === 'stop_test') {
            const { test_id } = await req.json();

            if (!test_id) {
                return Response.json({ error: 'test_id required' }, { status: 400 });
            }

            await base44.asServiceRole.entities.ABTest.update(test_id, {
                status: 'completed',
                ended_at: new Date().toISOString()
            });

            return Response.json({ test_stopped: true });

        } else if (action === 'assign_variant') {
            const { test_id, user_id, session_id } = await req.json();

            if (!test_id) {
                return Response.json({ error: 'test_id required' }, { status: 400 });
            }

            const tests = await base44.asServiceRole.entities.ABTest.filter({
                organization_id,
                id: test_id
            });

            if (tests.length === 0) {
                return Response.json({ error: 'Test not found' }, { status: 404 });
            }

            const test = tests[0];

            if (test.status !== 'running') {
                return Response.json({ error: 'Test not running' }, { status: 400 });
            }

            // Select variant based on user hash
            const hash = user_id ? hashString(user_id) : Math.random() * 100;
            let selectedVariant = test.variants[0];
            
            let cumulativeWeight = 0;
            for (const variant of test.variants) {
                cumulativeWeight += variant.weight || (100 / test.variants.length);
                if (hash % 100 < cumulativeWeight) {
                    selectedVariant = variant;
                    break;
                }
            }

            const result = await base44.asServiceRole.entities.ABTestResult.create({
                organization_id,
                test_id,
                variant_name: selectedVariant.name,
                user_id: user_id || '',
                session_id: session_id || '',
                assigned_at: new Date().toISOString()
            });

            await base44.asServiceRole.entities.ABTest.update(test_id, {
                total_participants: (test.total_participants || 0) + 1
            });

            return Response.json({ variant: selectedVariant.name, result_id: result.id });

        } else if (action === 'record_conversion') {
            const { result_id, metric_value } = await req.json();

            if (!result_id) {
                return Response.json({ error: 'result_id required' }, { status: 400 });
            }

            const results = await base44.asServiceRole.entities.ABTestResult.filter({
                organization_id,
                id: result_id
            });

            if (results.length === 0) {
                return Response.json({ error: 'Result not found' }, { status: 404 });
            }

            const result = results[0];

            await base44.asServiceRole.entities.ABTestResult.update(result_id, {
                converted: true,
                converted_at: new Date().toISOString(),
                metric_value: metric_value || 1
            });

            const tests = await base44.asServiceRole.entities.ABTest.filter({
                organization_id,
                id: result.test_id
            });

            if (tests.length > 0) {
                const test = tests[0];
                await base44.asServiceRole.entities.ABTest.update(result.test_id, {
                    total_conversions: (test.total_conversions || 0) + 1
                });
            }

            return Response.json({ conversion_recorded: true });

        } else if (action === 'get_tests') {
            const { status } = await req.json();

            let filter = { organization_id };
            if (status) filter.status = status;

            const tests = await base44.asServiceRole.entities.ABTest.filter(filter, '-created_date');

            return Response.json({ tests });

        } else if (action === 'get_test_results') {
            const { test_id } = await req.json();

            if (!test_id) {
                return Response.json({ error: 'test_id required' }, { status: 400 });
            }

            const results = await base44.asServiceRole.entities.ABTestResult.filter({
                organization_id,
                test_id
            });

            return Response.json({ results });

        } else if (action === 'get_dashboard_data') {
            const [flags, tests, results] = await Promise.all([
                base44.asServiceRole.entities.FeatureFlag.filter({ organization_id }, '-created_date'),
                base44.asServiceRole.entities.ABTest.filter({ organization_id }, '-created_date', 50),
                base44.asServiceRole.entities.ABTestResult.filter({ organization_id }, '-assigned_at', 100)
            ]);

            const flagsByType = {};
            flags.forEach(f => {
                flagsByType[f.flag_type] = (flagsByType[f.flag_type] || 0) + 1;
            });

            const testsByStatus = {};
            tests.forEach(t => {
                testsByStatus[t.status] = (testsByStatus[t.status] || 0) + 1;
            });

            const stats = {
                total_flags: flags.length,
                enabled_flags: flags.filter(f => f.enabled).length,
                total_evaluations: flags.reduce((sum, f) => sum + (f.total_evaluations || 0), 0),
                total_tests: tests.length,
                running_tests: tests.filter(t => t.status === 'running').length,
                total_participants: tests.reduce((sum, t) => sum + (t.total_participants || 0), 0),
                total_conversions: tests.reduce((sum, t) => sum + (t.total_conversions || 0), 0)
            };

            const conversion_rate = stats.total_participants > 0
                ? Math.round((stats.total_conversions / stats.total_participants) * 100)
                : 0;

            return Response.json({
                flags,
                tests: tests.slice(0, 20),
                results: results.slice(0, 30),
                stats: { ...stats, conversion_rate },
                flags_by_type: flagsByType,
                tests_by_status: testsByStatus
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Feature flag engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

// Simple hash function for consistent user assignments
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}