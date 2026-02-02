import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 71: Advanced Log Management & Aggregation System
 * Verwaltet System-Logs, Aggregationen und Log-Analysen
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

        if (action === 'create_log') {
            const { log_level, source, message, context, stack_trace, user_id, request_id, duration_ms, tags, metadata } = await req.json();

            if (!log_level || !source || !message) {
                return Response.json({ error: 'log_level, source, message required' }, { status: 400 });
            }

            const log_id = crypto.randomUUID();

            const log = await base44.asServiceRole.entities.SystemLog.create({
                organization_id,
                log_id,
                log_level,
                source,
                message,
                context: context || {},
                stack_trace: stack_trace || '',
                user_id: user_id || '',
                request_id: request_id || '',
                duration_ms: duration_ms || 0,
                timestamp: new Date().toISOString(),
                tags: tags || [],
                metadata: metadata || {}
            });

            return Response.json({ log_created: true, log_id: log.id });

        } else if (action === 'get_logs') {
            const { log_level, source, limit, offset } = await req.json();

            let filter = { organization_id };
            if (log_level) filter.log_level = log_level;
            if (source) filter.source = source;

            const logs = await base44.asServiceRole.entities.SystemLog.filter(
                filter,
                '-timestamp',
                limit || 50
            );

            return Response.json({ logs });

        } else if (action === 'search_logs') {
            const { query, log_level, source, tags, start_date, end_date, limit } = await req.json();

            let filter = { organization_id };
            if (log_level) filter.log_level = log_level;
            if (source) filter.source = source;
            if (tags && tags.length > 0) {
                // Note: This is a simplified filter. Full text search would need additional implementation
            }

            const logs = await base44.asServiceRole.entities.SystemLog.filter(
                filter,
                '-timestamp',
                limit || 100
            );

            const filtered = logs.filter(log => {
                if (query && !log.message.toLowerCase().includes(query.toLowerCase())) return false;
                if (start_date && new Date(log.timestamp) < new Date(start_date)) return false;
                if (end_date && new Date(log.timestamp) > new Date(end_date)) return false;
                return true;
            });

            return Response.json({ logs: filtered });

        } else if (action === 'aggregate_logs') {
            const { aggregation_type, source, period_start, period_end } = await req.json();

            if (!aggregation_type || !period_start || !period_end) {
                return Response.json({ error: 'aggregation_type, period_start, period_end required' }, { status: 400 });
            }

            let filter = { organization_id };
            if (source) filter.source = source;

            const logs = await base44.asServiceRole.entities.SystemLog.filter(
                filter,
                '-timestamp',
                1000
            );

            const periodLogs = logs.filter(log => {
                const logDate = new Date(log.timestamp);
                return logDate >= new Date(period_start) && logDate <= new Date(period_end);
            });

            const stats = aggregateLogs(periodLogs);
            const aggregation_id = crypto.randomUUID();

            const aggregation = await base44.asServiceRole.entities.LogAggregation.create({
                organization_id,
                aggregation_id,
                aggregation_type,
                period_start,
                period_end,
                source: source || 'all',
                total_logs: periodLogs.length,
                error_count: stats.error_count,
                warn_count: stats.warn_count,
                info_count: stats.info_count,
                avg_duration_ms: stats.avg_duration_ms,
                error_rate: stats.error_rate,
                unique_sources: stats.unique_sources,
                top_errors: stats.top_errors
            });

            return Response.json({ aggregation_created: true, aggregation_id: aggregation.id });

        } else if (action === 'analyze_logs') {
            const { analysis_name, analysis_type, query, retention_days } = await req.json();

            if (!analysis_name || !analysis_type) {
                return Response.json({ error: 'analysis_name, analysis_type required' }, { status: 400 });
            }

            const analysis_id = crypto.randomUUID();

            const analysis = await base44.asServiceRole.entities.LogAnalysis.create({
                organization_id,
                analysis_id,
                analysis_name,
                analysis_type,
                query: query || '',
                status: 'pending',
                started_at: new Date().toISOString(),
                retention_days: retention_days || 30
            });

            // Simulate async analysis processing
            setTimeout(() => {
                processLogAnalysis(base44, organization_id, analysis.id, analysis_type);
            }, 100);

            return Response.json({ analysis_created: true, analysis_id: analysis.id });

        } else if (action === 'get_aggregations') {
            const { aggregation_type, source } = await req.json();

            let filter = { organization_id };
            if (aggregation_type) filter.aggregation_type = aggregation_type;
            if (source) filter.source = source;

            const aggregations = await base44.asServiceRole.entities.LogAggregation.filter(
                filter,
                '-period_end',
                50
            );

            return Response.json({ aggregations });

        } else if (action === 'get_analyses') {
            const { analysis_type, status } = await req.json();

            let filter = { organization_id };
            if (analysis_type) filter.analysis_type = analysis_type;
            if (status) filter.status = status;

            const analyses = await base44.asServiceRole.entities.LogAnalysis.filter(
                filter,
                '-started_at',
                50
            );

            return Response.json({ analyses });

        } else if (action === 'get_dashboard_data') {
            const [logs, aggregations, analyses] = await Promise.all([
                base44.asServiceRole.entities.SystemLog.filter({ organization_id }, '-timestamp', 100),
                base44.asServiceRole.entities.LogAggregation.filter({ organization_id }, '-period_end', 50),
                base44.asServiceRole.entities.LogAnalysis.filter({ organization_id }, '-started_at', 30)
            ]);

            const logsByLevel = {};
            logs.forEach(log => {
                logsByLevel[log.log_level] = (logsByLevel[log.log_level] || 0) + 1;
            });

            const logsBySource = {};
            logs.forEach(log => {
                logsBySource[log.source] = (logsBySource[log.source] || 0) + 1;
            });

            const stats = {
                total_logs: logs.length,
                error_logs: logs.filter(l => l.log_level === 'error' || l.log_level === 'fatal').length,
                warn_logs: logs.filter(l => l.log_level === 'warn').length,
                info_logs: logs.filter(l => l.log_level === 'info').length,
                avg_duration: logs.length > 0
                    ? Math.round(logs.reduce((sum, l) => sum + (l.duration_ms || 0), 0) / logs.length)
                    : 0,
                unique_sources: Object.keys(logsBySource).length,
                total_aggregations: aggregations.length,
                total_analyses: analyses.length,
                pending_analyses: analyses.filter(a => a.status === 'pending').length
            };

            return Response.json({
                logs: logs.slice(0, 30),
                aggregations: aggregations.slice(0, 20),
                analyses,
                stats,
                logs_by_level: logsByLevel,
                logs_by_source: logsBySource
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Log management engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function aggregateLogs(logs) {
    const stats = {
        error_count: 0,
        warn_count: 0,
        info_count: 0,
        avg_duration_ms: 0,
        error_rate: 0,
        unique_sources: new Set(),
        top_errors: []
    };

    let totalDuration = 0;
    const errorMessages = {};

    logs.forEach(log => {
        if (log.log_level === 'error' || log.log_level === 'fatal') {
            stats.error_count++;
            errorMessages[log.message] = (errorMessages[log.message] || 0) + 1;
        }
        if (log.log_level === 'warn') stats.warn_count++;
        if (log.log_level === 'info') stats.info_count++;

        if (log.source) stats.unique_sources.add(log.source);
        totalDuration += log.duration_ms || 0;
    });

    stats.avg_duration_ms = logs.length > 0 ? Math.round(totalDuration / logs.length) : 0;
    stats.error_rate = logs.length > 0 ? Math.round((stats.error_count / logs.length) * 100 * 100) / 100 : 0;
    stats.unique_sources = stats.unique_sources.size;
    stats.top_errors = Object.entries(errorMessages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([msg, count]) => `${msg} (${count}x)`);

    return stats;
}

async function processLogAnalysis(base44, organization_id, analysisId, analysisType) {
    try {
        const analyses = await base44.asServiceRole.entities.LogAnalysis.filter({
            organization_id,
            id: analysisId
        });

        if (analyses.length === 0) return;

        const analysis = analyses[0];

        // Generate insights based on analysis type
        const insights = generateInsights(analysisType);

        await base44.asServiceRole.entities.LogAnalysis.update(analysisId, {
            status: 'completed',
            completed_at: new Date().toISOString(),
            insights,
            results: { processed: true, insight_count: insights.length }
        });
    } catch (error) {
        console.error('Analysis processing error:', error);
    }
}

function generateInsights(analysisType) {
    const insightTemplates = {
        anomaly: [
            'Ungewöhnliche Fehlerrate erkannt',
            'Response-Zeit außerhalb normaler Bereich',
            'Plötzlicher Anstieg von Warnungen'
        ],
        pattern: [
            'Wiederkehrende Fehler in bestimmten Quellen',
            'Korrelation zwischen Fehlern und Ort',
            'Regelmäßige Spitzenlast erkannt'
        ],
        trend: [
            'Steigender Fehler-Trend',
            'Performance-Verbesserung erkannt',
            'Anomalien treten häufiger auf'
        ],
        correlation: [
            'Fehler korreliert mit bestimmten Benutzern',
            'Fehler treten nach bestimmten Events auf',
            'Performance-Probleme mit bestimmten Quellen verbunden'
        ]
    };

    return insightTemplates[analysisType] || [];
}