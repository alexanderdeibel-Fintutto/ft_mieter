import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 85: Advanced Service Mesh & Distributed Tracing System
 * Verwaltet Service Mesh, verteilte Traces und APM-Metriken
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

        if (action === 'create_service_mesh') {
            const { mesh_name, mesh_type, namespace, version, mtls_enabled } = await req.json();

            if (!mesh_name || !mesh_type) {
                return Response.json({ error: 'mesh_name, mesh_type required' }, { status: 400 });
            }

            const mesh_id = crypto.randomUUID();

            const mesh = await base44.asServiceRole.entities.ServiceMesh.create({
                organization_id,
                mesh_id,
                mesh_name,
                mesh_type,
                namespace: namespace || 'default',
                version: version || '1.0',
                status: 'initializing',
                mtls_enabled: mtls_enabled !== false,
                observability_enabled: true,
                created_at: new Date().toISOString()
            });

            return Response.json({ mesh_created: true, mesh_id: mesh.id });

        } else if (action === 'record_trace') {
            const { root_span_id, service_name, operation_name, start_time, end_time, services_involved } = await req.json();

            if (!root_span_id || !service_name || !operation_name) {
                return Response.json({ error: 'root_span_id, service_name, operation_name required' }, { status: 400 });
            }

            const trace_id = crypto.randomUUID();
            const startDate = new Date(start_time);
            const endDate = new Date(end_time);
            const duration = endDate - startDate;

            const trace = await base44.asServiceRole.entities.DistributedTrace.create({
                organization_id,
                trace_id,
                root_span_id,
                service_name,
                operation_name,
                trace_status: 'success',
                start_time,
                end_time,
                duration_ms: duration,
                services_involved: services_involved || [],
                sampling_rate: 1.0
            });

            return Response.json({ trace_created: true, trace_id: trace.id });

        } else if (action === 'record_span') {
            const { trace_id, parent_span_id, service_name, operation_name, span_kind, start_time, end_time, attributes } = await req.json();

            if (!trace_id || !service_name || !operation_name) {
                return Response.json({ error: 'trace_id, service_name, operation_name required' }, { status: 400 });
            }

            const span_id = crypto.randomUUID();
            const startDate = new Date(start_time);
            const endDate = new Date(end_time);
            const duration = endDate - startDate;

            const span = await base44.asServiceRole.entities.TraceSpan.create({
                organization_id,
                span_id,
                trace_id,
                parent_span_id: parent_span_id || '',
                service_name,
                operation_name,
                span_kind: span_kind || 'internal',
                start_time,
                end_time,
                duration_ms: duration,
                status: 'ok',
                attributes: attributes || {}
            });

            return Response.json({ span_created: true, span_id: span.id });

        } else if (action === 'record_apm_metric') {
            const { service_name, metric_type, metric_name, value, unit, timestamp, percentile, dimension } = await req.json();

            if (!service_name || !metric_type || !metric_name || !value) {
                return Response.json({ error: 'service_name, metric_type, metric_name, value required' }, { status: 400 });
            }

            const metric_id = crypto.randomUUID();

            const metric = await base44.asServiceRole.entities.APMMetric.create({
                organization_id,
                metric_id,
                service_name,
                metric_type,
                metric_name,
                value,
                unit: unit || '',
                timestamp: timestamp || new Date().toISOString(),
                percentile: percentile || 'p50',
                dimension: dimension || {},
                anomaly_score: 0,
                is_anomaly: false
            });

            return Response.json({ metric_created: true, metric_id: metric.id });

        } else if (action === 'update_mesh_status') {
            const { mesh_id, status, healthy_services, unhealthy_services, avg_latency_ms, error_rate, throughput_rps } = await req.json();

            if (!mesh_id || !status) {
                return Response.json({ error: 'mesh_id, status required' }, { status: 400 });
            }

            const updateData = {
                status,
                healthy_services: healthy_services || 0,
                unhealthy_services: unhealthy_services || 0,
                avg_latency_ms: avg_latency_ms || 0,
                error_rate: error_rate || 0,
                throughput_rps: throughput_rps || 0
            };

            await base44.asServiceRole.entities.ServiceMesh.update(mesh_id, updateData);

            return Response.json({ mesh_updated: true });

        } else if (action === 'get_dashboard_data') {
            const [meshes, traces, spans, metrics] = await Promise.all([
                base44.asServiceRole.entities.ServiceMesh.filter({ organization_id }, '-created_at', 20),
                base44.asServiceRole.entities.DistributedTrace.filter({ organization_id }, '-start_time', 50),
                base44.asServiceRole.entities.TraceSpan.filter({ organization_id }, '-start_time', 100),
                base44.asServiceRole.entities.APMMetric.filter({ organization_id }, '-timestamp', 100)
            ]);

            const meshStats = {
                total_meshes: meshes.length,
                healthy_meshes: meshes.filter(m => m.status === 'healthy').length,
                degraded_meshes: meshes.filter(m => m.status === 'degraded').length,
                unhealthy_meshes: meshes.filter(m => m.status === 'unhealthy').length,
                mtls_enabled_count: meshes.filter(m => m.mtls_enabled).length,
                total_services: meshes.reduce((sum, m) => sum + (m.total_services || 0), 0),
                healthy_services: meshes.reduce((sum, m) => sum + (m.healthy_services || 0), 0)
            };

            const traceStats = {
                total_traces: traces.length,
                successful_traces: traces.filter(t => t.trace_status === 'success').length,
                error_traces: traces.filter(t => t.trace_status === 'error').length,
                timeout_traces: traces.filter(t => t.trace_status === 'timeout').length,
                avg_duration_ms: traces.length > 0
                    ? (traces.reduce((sum, t) => sum + (t.duration_ms || 0), 0) / traces.length).toFixed(2)
                    : 0
            };

            const spanStats = {
                total_spans: spans.length,
                ok_spans: spans.filter(s => s.status === 'ok').length,
                error_spans: spans.filter(s => s.status === 'error').length,
                by_kind: {}
            };

            spans.forEach(s => {
                spanStats.by_kind[s.span_kind] = (spanStats.by_kind[s.span_kind] || 0) + 1;
            });

            const metricsByType = {};
            const latencyMetrics = metrics.filter(m => m.metric_type === 'latency');
            const errorMetrics = metrics.filter(m => m.metric_type === 'error_rate');
            const throughputMetrics = metrics.filter(m => m.metric_type === 'throughput');

            metricsByType['latency'] = {
                count: latencyMetrics.length,
                avg: latencyMetrics.length > 0
                    ? (latencyMetrics.reduce((sum, m) => sum + m.value, 0) / latencyMetrics.length).toFixed(2)
                    : 0
            };

            metricsByType['error_rate'] = {
                count: errorMetrics.length,
                avg: errorMetrics.length > 0
                    ? (errorMetrics.reduce((sum, m) => sum + m.value, 0) / errorMetrics.length).toFixed(2)
                    : 0
            };

            metricsByType['throughput'] = {
                count: throughputMetrics.length,
                avg: throughputMetrics.length > 0
                    ? (throughputMetrics.reduce((sum, m) => sum + m.value, 0) / throughputMetrics.length).toFixed(2)
                    : 0
            };

            const anomalyMetrics = metrics.filter(m => m.is_anomaly);

            return Response.json({
                meshes: meshes.slice(0, 15),
                traces: traces.slice(0, 30),
                spans: spans.slice(0, 50),
                metrics: metrics.slice(0, 50),
                mesh_stats: meshStats,
                trace_stats: traceStats,
                span_stats: spanStats,
                metric_stats: metricsByType,
                anomaly_count: anomalyMetrics.length
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Service mesh tracing engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});