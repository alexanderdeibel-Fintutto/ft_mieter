import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 90: Advanced Feature Flags & A/B Testing System
 * Verwaltet Feature Flags, Varianten und A/B Tests
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

        if (action === 'create_feature_flag') {
            const { flag_name, flag_key, description, flag_type, rollout_percentage } = await req.json();

            if (!flag_name || !flag_key) {
                return Response.json({ error: 'flag_name, flag_key required' }, { status: 400 });
            }

            const flag_id = crypto.randomUUID();

            const flag = await base44.asServiceRole.entities.FeatureFlag.create({
                organization_id,
                flag_id,
                flag_name,
                flag_key,
                description: description || '',
                flag_type: flag_type || 'boolean',
                status: 'draft',
                rollout_percentage: rollout_percentage || 0,
                owner_id: user.id,
                created_at: new Date().toISOString()
            });

            return Response.json({ flag_created: true, flag_id: flag.id });

        } else if (action === 'update_flag_status') {
            const { flag_id, status } = await req.json();

            if (!flag_id || !status) {
                return Response.json({ error: 'flag_id, status required' }, { status: 400 });
            }

            const updateData = { status };

            if (status === 'enabled') {
                updateData.enabled_at = new Date().toISOString();
            } else if (status === 'archived') {
                updateData.archived_at = new Date().toISOString();
            }

            await base44.asServiceRole.entities.FeatureFlag.update(flag_id, updateData);

            return Response.json({ flag_updated: true });

        } else if (action === 'enable_for_user') {
            const { flag_id, user_id } = await req.json();

            if (!flag_id || !user_id) {
                return Response.json({ error: 'flag_id, user_id required' }, { status: 400 });
            }

            const flags = await base44.asServiceRole.entities.FeatureFlag.filter({
                organization_id,
                id: flag_id
            });

            if (flags.length === 0) {
                return Response.json({ error: 'Flag not found' }, { status: 404 });
            }

            const flag = flags[0];
            const enabledFor = new Set(flag.enabled_for_users || []);
            const disabledFor = new Set(flag.disabled_for_users || []);

            enabledFor.add(user_id);
            disabledFor.delete(user_id);

            await base44.asServiceRole.entities.FeatureFlag.update(flag_id, {
                enabled_for_users: Array.from(enabledFor),
                disabled_for_users: Array.from(disabledFor)
            });

            return Response.json({ flag_enabled_for_user: true });

        } else if (action === 'create_ab_test') {
            const { test_name, description, hypothesis, primary_metric, test_type, minimum_runtime_days } = await req.json();

            if (!test_name || !primary_metric) {
                return Response.json({ error: 'test_name, primary_metric required' }, { status: 400 });
            }

            const test_id = crypto.randomUUID();

            const test = await base44.asServiceRole.entities.ABTest.create({
                organization_id,
                test_id,
                test_name,
                description: description || '',
                hypothesis: hypothesis || '',
                status: 'planning',
                test_type: test_type || 'control_vs_variant',
                primary_metric,
                minimum_runtime_days: minimum_runtime_days || 7,
                owner_id: user.id,
                created_at: new Date().toISOString()
            });

            return Response.json({ test_created: true, test_id: test.id });

        } else if (action === 'start_ab_test') {
            const { test_id } = await req.json();

            if (!test_id) {
                return Response.json({ error: 'test_id required' }, { status: 400 });
            }

            const now = new Date().toISOString();

            await base44.asServiceRole.entities.ABTest.update(test_id, {
                status: 'running',
                started_at: now
            });

            return Response.json({ test_started: true });

        } else if (action === 'record_test_result') {
            const { test_id, variant_key, participants, conversions, metric_values } = await req.json();

            if (!test_id || !variant_key || participants === undefined) {
                return Response.json({ error: 'test_id, variant_key, participants required' }, { status: 400 });
            }

            const result_id = crypto.randomUUID();
            const conversionRate = participants > 0 ? ((conversions || 0) / participants) * 100 : 0;

            const result = await base44.asServiceRole.entities.ABTestResult.create({
                organization_id,
                result_id,
                test_id,
                variant_key,
                total_participants: participants,
                conversions: conversions || 0,
                conversion_rate: parseFloat(conversionRate.toFixed(2)),
                metric_values: metric_values || {},
                timestamp: new Date().toISOString()
            });

            return Response.json({ result_created: true, result_id: result.id });

        } else if (action === 'complete_ab_test') {
            const { test_id, winning_variant } = await req.json();

            if (!test_id) {
                return Response.json({ error: 'test_id required' }, { status: 400 });
            }

            const now = new Date().toISOString();

            await base44.asServiceRole.entities.ABTest.update(test_id, {
                status: 'completed',
                completed_at: now
            });

            if (winning_variant) {
                const results = await base44.asServiceRole.entities.ABTestResult.filter({
                    organization_id,
                    test_id,
                    variant_key: winning_variant
                }, '-timestamp', 1);

                if (results.length > 0) {
                    const result = results[0];
                    const liftPercentage = result.lift_percentage || 0;

                    return Response.json({
                        test_completed: true,
                        winning_variant,
                        lift_percentage: liftPercentage
                    });
                }
            }

            return Response.json({ test_completed: true });

        } else if (action === 'get_dashboard_data') {
            const [flags, tests, results] = await Promise.all([
                base44.asServiceRole.entities.FeatureFlag.filter({ organization_id }, '-created_at', 50),
                base44.asServiceRole.entities.ABTest.filter({ organization_id }, '-created_at', 30),
                base44.asServiceRole.entities.ABTestResult.filter({ organization_id }, '-timestamp', 100)
            ]);

            const flagStats = {
                total_flags: flags.length,
                enabled_flags: flags.filter(f => f.status === 'enabled').length,
                disabled_flags: flags.filter(f => f.status === 'disabled').length,
                draft_flags: flags.filter(f => f.status === 'draft').length,
                archived_flags: flags.filter(f => f.status === 'archived').length,
                by_type: {}
            };

            flags.forEach(f => {
                flagStats.by_type[f.flag_type] = (flagStats.by_type[f.flag_type] || 0) + 1;
            });

            const testStats = {
                total_tests: tests.length,
                planning_tests: tests.filter(t => t.status === 'planning').length,
                running_tests: tests.filter(t => t.status === 'running').length,
                completed_tests: tests.filter(t => t.status === 'completed').length,
                paused_tests: tests.filter(t => t.status === 'paused').length,
                by_type: {}
            };

            tests.forEach(t => {
                testStats.by_type[t.test_type] = (testStats.by_type[t.test_type] || 0) + 1;
            });

            const resultStats = {
                total_results: results.length,
                significant_results: results.filter(r => r.is_significant).length,
                avg_conversion_rate: results.length > 0
                    ? (results.reduce((sum, r) => sum + (r.conversion_rate || 0), 0) / results.length).toFixed(2)
                    : 0,
                avg_participants: results.length > 0
                    ? Math.round(results.reduce((sum, r) => sum + (r.total_participants || 0), 0) / results.length)
                    : 0
            };

            return Response.json({
                flags: flags.slice(0, 30),
                tests: tests.slice(0, 20),
                results: results.slice(0, 50),
                flag_stats: flagStats,
                test_stats: testStats,
                result_stats: resultStats
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Feature flags engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});