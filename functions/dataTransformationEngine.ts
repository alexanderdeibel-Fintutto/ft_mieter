import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 75: Advanced Data Transformation & ETL System
 * Verwaltet Datenströme, Transformationen und ETL-Jobs
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

        if (action === 'create_data_stream') {
            const { stream_name, stream_type, source_type, destination_type, schema, partitioning_key, retention_hours } = await req.json();

            if (!stream_name || !stream_type) {
                return Response.json({ error: 'stream_name, stream_type required' }, { status: 400 });
            }

            const stream = await base44.asServiceRole.entities.DataStream.create({
                organization_id,
                stream_name,
                stream_type,
                source_type: source_type || 'api',
                destination_type: destination_type || 'database',
                schema: schema || {},
                partitioning_key: partitioning_key || '',
                retention_hours: retention_hours || 168,
                last_activity: new Date().toISOString()
            });

            return Response.json({ stream_created: true, stream_id: stream.id });

        } else if (action === 'create_transformation') {
            const { transformation_name, transformation_type, source_stream_id, target_stream_id, transformation_logic, field_mappings, filters, error_handling, max_retries } = await req.json();

            if (!transformation_name || !transformation_type) {
                return Response.json({ error: 'transformation_name, transformation_type required' }, { status: 400 });
            }

            const transformation = await base44.asServiceRole.entities.DataTransformation.create({
                organization_id,
                transformation_name,
                transformation_type,
                source_stream_id: source_stream_id || '',
                target_stream_id: target_stream_id || '',
                transformation_logic: transformation_logic || '',
                field_mappings: field_mappings || [],
                filters: filters || [],
                error_handling: error_handling || 'skip',
                max_retries: max_retries || 3
            });

            return Response.json({ transformation_created: true, transformation_id: transformation.id });

        } else if (action === 'execute_transformation') {
            const { transformation_id, input_data } = await req.json();

            if (!transformation_id || !input_data) {
                return Response.json({ error: 'transformation_id, input_data required' }, { status: 400 });
            }

            const transformations = await base44.asServiceRole.entities.DataTransformation.filter({
                organization_id,
                id: transformation_id
            });

            if (transformations.length === 0) {
                return Response.json({ error: 'Transformation not found' }, { status: 404 });
            }

            const transformation = transformations[0];
            const job_id = crypto.randomUUID();
            const start_time = Date.now();

            let input_records = Array.isArray(input_data) ? input_data.length : 1;
            let output_records = 0;
            let filtered_records = 0;
            let error_records = 0;
            const logs = [];

            try {
                // Simulate transformation execution
                const records = Array.isArray(input_data) ? input_data : [input_data];

                for (const record of records) {
                    try {
                        // Apply filters
                        let passes_filters = true;
                        for (const filter of transformation.filters || []) {
                            if (!evaluateFilter(record, filter)) {
                                passes_filters = false;
                                break;
                            }
                        }

                        if (!passes_filters) {
                            filtered_records++;
                            logs.push(`Record filtered: ${JSON.stringify(record).substring(0, 50)}`);
                            continue;
                        }

                        // Apply field mappings
                        const transformed = applyFieldMappings(record, transformation.field_mappings || []);
                        output_records++;

                    } catch (error) {
                        error_records++;
                        logs.push(`Error processing record: ${error.message}`);
                        
                        if (transformation.error_handling === 'fail') {
                            throw error;
                        }
                    }
                }

                const duration_seconds = Math.round((Date.now() - start_time) / 1000);
                const throughput = duration_seconds > 0 ? output_records / duration_seconds : 0;

                const job = await base44.asServiceRole.entities.TransformationJob.create({
                    organization_id,
                    job_id,
                    transformation_id,
                    job_type: 'triggered',
                    status: 'completed',
                    input_records,
                    output_records,
                    filtered_records,
                    error_records,
                    started_at: new Date(Date.now() - duration_seconds * 1000).toISOString(),
                    completed_at: new Date().toISOString(),
                    duration_seconds,
                    throughput_records_per_second: throughput,
                    logs
                });

                await base44.asServiceRole.entities.DataTransformation.update(transformation_id, {
                    execution_count: (transformation.execution_count || 0) + 1,
                    success_count: (transformation.success_count || 0) + 1
                });

                return Response.json({
                    transformation_executed: true,
                    job_id: job.id,
                    input_records,
                    output_records,
                    filtered_records,
                    error_records,
                    throughput
                });

            } catch (error) {
                logs.push(`Job failed: ${error.message}`);
                
                const job = await base44.asServiceRole.entities.TransformationJob.create({
                    organization_id,
                    job_id,
                    transformation_id,
                    job_type: 'triggered',
                    status: 'failed',
                    input_records,
                    output_records,
                    error_records,
                    error_message: error.message,
                    started_at: new Date(Date.now() - (Date.now() - start_time)).toISOString(),
                    logs
                });

                await base44.asServiceRole.entities.DataTransformation.update(transformation_id, {
                    execution_count: (transformation.execution_count || 0) + 1,
                    failure_count: (transformation.failure_count || 0) + 1
                });

                return Response.json({
                    transformation_executed: false,
                    error: error.message,
                    job_id: job.id
                }, { status: 500 });
            }

        } else if (action === 'create_mapping') {
            const { mapping_name, mapping_type, source_field, target_field, transformation_rule, default_value, is_required } = await req.json();

            if (!mapping_name || !mapping_type) {
                return Response.json({ error: 'mapping_name, mapping_type required' }, { status: 400 });
            }

            const mapping = await base44.asServiceRole.entities.DataMapping.create({
                organization_id,
                mapping_name,
                mapping_type,
                source_field: source_field || '',
                target_field: target_field || '',
                transformation_rule: transformation_rule || '',
                default_value: default_value || '',
                is_required: is_required !== undefined ? is_required : true
            });

            return Response.json({ mapping_created: true, mapping_id: mapping.id });

        } else if (action === 'get_dashboard_data') {
            const [streams, transformations, jobs, mappings] = await Promise.all([
                base44.asServiceRole.entities.DataStream.filter({ organization_id }, '-last_activity'),
                base44.asServiceRole.entities.DataTransformation.filter({ organization_id }, '-created_date'),
                base44.asServiceRole.entities.TransformationJob.filter({ organization_id }, '-started_at', 100),
                base44.asServiceRole.entities.DataMapping.filter({ organization_id }, '-created_date')
            ]);

            const streamStats = {
                total_streams: streams.length,
                active_streams: streams.filter(s => s.is_active).length,
                total_records_processed: streams.reduce((sum, s) => sum + (s.total_records_processed || 0), 0)
            };

            const transformationStats = {
                total_transformations: transformations.length,
                active_transformations: transformations.filter(t => t.is_active).length,
                total_executions: transformations.reduce((sum, t) => sum + (t.execution_count || 0), 0),
                success_rate: transformations.length > 0
                    ? Math.round((transformations.reduce((sum, t) => sum + (t.success_count || 0), 0) /
                        (transformations.reduce((sum, t) => sum + (t.execution_count || 0), 0) || 1)) * 100)
                    : 0
            };

            const jobStats = {
                total_jobs: jobs.length,
                completed_jobs: jobs.filter(j => j.status === 'completed').length,
                failed_jobs: jobs.filter(j => j.status === 'failed').length,
                avg_duration: jobs.length > 0
                    ? Math.round(jobs.reduce((sum, j) => sum + (j.duration_seconds || 0), 0) / jobs.length)
                    : 0,
                total_throughput: jobs.reduce((sum, j) => sum + (j.throughput_records_per_second || 0), 0)
            };

            const jobsByStatus = {};
            jobs.forEach(j => {
                jobsByStatus[j.status] = (jobsByStatus[j.status] || 0) + 1;
            });

            return Response.json({
                streams: streams.slice(0, 20),
                transformations: transformations.slice(0, 20),
                jobs: jobs.slice(0, 30),
                mappings: mappings.slice(0, 20),
                stream_stats: streamStats,
                transformation_stats: transformationStats,
                job_stats: jobStats,
                jobs_by_status: jobsByStatus
            });

        } else if (action === 'get_job_details') {
            const { job_id } = await req.json();

            if (!job_id) {
                return Response.json({ error: 'job_id required' }, { status: 400 });
            }

            const jobs = await base44.asServiceRole.entities.TransformationJob.filter({
                organization_id,
                job_id
            });

            if (jobs.length === 0) {
                return Response.json({ error: 'Job not found' }, { status: 404 });
            }

            return Response.json({ job: jobs[0] });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Data transformation engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function evaluateFilter(record, filter) {
    const { field, operator, value } = filter;
    const recordValue = record[field];

    switch (operator) {
        case 'eq':
            return recordValue === value;
        case 'ne':
            return recordValue !== value;
        case 'gt':
            return recordValue > value;
        case 'lt':
            return recordValue < value;
        case 'gte':
            return recordValue >= value;
        case 'lte':
            return recordValue <= value;
        case 'contains':
            return String(recordValue).includes(String(value));
        case 'in':
            return Array.isArray(value) && value.includes(recordValue);
        default:
            return true;
    }
}

function applyFieldMappings(record, mappings) {
    const result = { ...record };

    for (const mapping of mappings) {
        const sourceValue = result[mapping.source_field];
        let targetValue = sourceValue;

        if (mapping.transformation_rule) {
            targetValue = applyTransformationRule(sourceValue, mapping.transformation_rule);
        }

        if (targetValue === undefined || targetValue === null) {
            targetValue = mapping.default_value || sourceValue;
        }

        result[mapping.target_field] = targetValue;
    }

    return result;
}

function applyTransformationRule(value, rule) {
    if (!rule) return value;

    const rules = {
        'uppercase': (v) => String(v).toUpperCase(),
        'lowercase': (v) => String(v).toLowerCase(),
        'trim': (v) => String(v).trim(),
        'reverse': (v) => String(v).split('').reverse().join(''),
        'to_number': (v) => Number(v),
        'to_string': (v) => String(v),
        'to_boolean': (v) => Boolean(v),
        'date_format': (v) => new Date(v).toISOString()
    };

    return rules[rule] ? rules[rule](value) : value;
}