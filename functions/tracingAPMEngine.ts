import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 64: Advanced Distributed Tracing & APM System
 * Verwaltet Distributed Traces, Spans und APM-Metriken
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

        if (action === 'start_trace') {
            const { service_name, operation_name, tags } = await req.json();

            if (!service_name || !operation_name) {
                return Response.json({ error: 'service_name, operation_name required' }, { status: 400 });
            }

            const trace_id = crypto.randomUUID();

            const trace = await base44.asServiceRole.entities.DistributedTrace.create({
                organization_id,
                trace_id,
                service_name,
                operation_name,
                started_at: new Date().toISOString(),
                tags: tags || {}
            });

            return Response.json({ trace_started: true, trace_id: trace.id });

        } else if (action === 'complete_trace') {
            const { trace_id, status, error_count } = await req.json();

            if (!trace_id) {
                return Response.json({ error: 'trace_id required' }, { status: 400 });
            }

            const traces = await base44.asServiceRole.entities.DistributedTrace.filter({
                organization_id,
                id: trace_id
            });

            if (traces.length === 0) {
                return Response.json({ error: 'Trace not found' }, { status: 404 });
            }

            const trace = traces[0];
            const completed_at = new Date();
            const started_at = new Date(trace.started_at);
            const duration_ms = completed_at - started_at;

            await base44.asServiceRole.entities.DistributedTrace.update(trace_id, {
                completed_at: completed_at.toISOString(),
                duration_ms,
                trace_status: status || 'success',
                error_count: error_count || 0
            });

            return Response.json({ trace_completed: true });

        } else if (action === 'add_span') {
            const { trace_id, span_name, span_type, service_name, parent_span_id, attributes } = await req.json();

            if (!trace_id || !span_name || !service_name) {
                return Response.json({ error: 'trace_id, span_name, service_name required' }, { status: 400 });
            }

            const span_id = crypto.randomUUID();

            const span = await base44.asServiceRole.entities.TraceSpan.create({
                organization_id,
                trace_id,
                span_id,
                parent_span_id: parent_span_id || '',
                span_name,
                span_type: span_type || 'custom',
                service_name,
                started_at: new Date().toISOString(),
                attributes: attributes || {}
            });

            // Update trace span count
            const traces = await base44.asServiceRole.entities.DistributedTrace.filter({
                organization_id,
                id: trace_id
            });

            if (traces.length > 0) {
                const trace = traces[0];
                await base44.asServiceRole.entities.DistributedTrace.update(trace_id, {
                    span_count: (trace.span_count || 0) + 1
                });
            }

            return Response.json({ span_added: true, span_id: span.id });

        } else if (action === 'complete_span') {
            const { span_id, status, error_message } = await req.json();

            if (!span_id) {
                return Response.json({ error: 'span_id required' }, { status: 400 });
            }

            const spans = await base44.asServiceRole.entities.TraceSpan.filter({
                organization_id,
                id: span_id
            });

            if (spans.length === 0) {
                return Response.json({ error: 'Span not found' }, { status: 404 });
            }

            const span = spans[0];
            const completed_at = new Date();
            const started_at = new Date(span.started_at);
            const duration_ms = completed_at - started_at;

            await base44.asServiceRole.entities.TraceSpan.update(span_id, {
                completed_at: completed_at.toISOString(),
                duration_ms,
                status: status || 'ok',
                error_message: error_message || ''
            });

            return Response.json({ span_completed: true });

        } else if (action === 'record_metric') {
            const { service_name, metric_name, metric_type, value, unit, aggregation, interval_seconds, dimensions } = await req.json();

            if (!service_name || !metric_name || !metric_type || value === undefined) {
                return Response.json({ error: 'service_name, metric_name, metric_type, value required' }, { status: 400 });
            }

            const metric = await base44.asServiceRole.entities.APMMetric.create({
                organization_id,
                service_name,
                metric_name,
                metric_type,
                value,
                unit: unit || '',
                aggregation: aggregation || 'avg',
                interval_seconds: interval_seconds || 60,
                timestamp: new Date().toISOString(),
                dimensions: dimensions || {}
            });

            return Response.json({ metric_recorded: true, metric_id: metric.id });

        } else if (action === 'get_traces') {
            const { service_name, trace_status, limit } = await req.json();

            let filter = { organization_id };
            if (service_name) filter.service_name = service_name;
            if (trace_status) filter.trace_status = trace_status;

            const traces = await base44.asServiceRole.entities.DistributedTrace.filter(filter, '-started_at', limit || 50);

            return Response.json({ traces });

        } else if (action === 'get_spans') {
            const { trace_id } = await req.json();

            if (!trace_id) {
                return Response.json({ error: 'trace_id required' }, { status: 400 });
            }

            const spans = await base44.asServiceRole.entities.TraceSpan.filter({
                organization_id,
                trace_id
            }, 'started_at');

            return Response.json({ spans });

        } else if (action === 'get_metrics') {
            const { service_name, metric_type, limit } = await req.json();

            let filter = { organization_id };
            if (service_name) filter.service_name = service_name;
            if (metric_type) filter.metric_type = metric_type;

            const metrics = await base44.asServiceRole.entities.APMMetric.filter(filter, '-timestamp', limit || 100);

            return Response.json({ metrics });

        } else if (action === 'get_dashboard_data') {
            const [traces, spans, metrics] = await Promise.all([
                base44.asServiceRole.entities.DistributedTrace.filter({ organization_id }, '-started_at', 50),
                base44.asServiceRole.entities.TraceSpan.filter({ organization_id }, '-started_at', 100),
                base44.asServiceRole.entities.APMMetric.filter({ organization_id }, '-timestamp', 100)
            ]);

            const tracesByStatus = {};
            traces.forEach(t => {
                tracesByStatus[t.trace_status] = (tracesByStatus[t.trace_status] || 0) + 1;
            });

            const spansByType = {};
            spans.forEach(s => {
                spansByType[s.span_type] = (spansByType[s.span_type] || 0) + 1;
            });

            const metricsByType = {};
            metrics.forEach(m => {
                metricsByType[m.metric_type] = (metricsByType[m.metric_type] || 0) + 1;
            });

            const serviceMap = new Set();
            traces.forEach(t => serviceMap.add(t.service_name));
            spans.forEach(s => serviceMap.add(s.service_name));

            const avgDuration = traces.length > 0
                ? Math.round(traces.reduce((sum, t) => sum + (t.duration_ms || 0), 0) / traces.length)
                : 0;

            const errorRate = traces.length > 0
                ? Math.round((traces.filter(t => t.trace_status === 'error').length / traces.length) * 100)
                : 0;

            const stats = {
                total_traces: traces.length,
                total_spans: traces.reduce((sum, t) => sum + (t.span_count || 0), 0),
                total_services: serviceMap.size,
                avg_duration_ms: avgDuration,
                error_rate: errorRate,
                total_metrics: metrics.length
            };

            return Response.json({
                traces: traces.slice(0, 20),
                spans: spans.slice(0, 30),
                metrics: metrics.slice(0, 20),
                stats,
                traces_by_status: tracesByStatus,
                spans_by_type: spansByType,
                metrics_by_type: metricsByType
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Tracing APM engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});