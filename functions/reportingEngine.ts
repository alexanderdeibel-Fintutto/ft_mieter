import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 31: Advanced Reporting & Dashboard System
 * Verwaltet Report-Templates, Generierung und Scheduling
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,                    // 'create_template', 'get_templates', 'generate_report', 'get_report', 'schedule_report', 'get_schedules', 'get_analytics'
            organization_id,
            template_id,
            report_id,
            schedule_id,
            template_name,
            category,
            sections = [],
            data_sources = [],
            report_name,
            schedule_name,
            frequency,
            time_of_day,
            recipients = []
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'create_template') {
            // Create report template
            if (!template_name || !category) {
                return Response.json({ error: 'template_name, category required' }, { status: 400 });
            }

            const template = await base44.asServiceRole.entities.ReportTemplate.create({
                organization_id: organization_id,
                template_name: template_name,
                category: category,
                sections: sections,
                data_sources: data_sources,
                created_by: user.id
            });

            return Response.json({
                template_created: true,
                template_id: template.id
            });

        } else if (action === 'get_templates') {
            // Get all templates
            const templates = await base44.asServiceRole.entities.ReportTemplate.filter({
                organization_id: organization_id
            }, '-created_date', 100);

            const stats = {
                total: templates.length,
                by_category: {}
            };

            templates.forEach(t => {
                if (!stats.by_category[t.category]) {
                    stats.by_category[t.category] = 0;
                }
                stats.by_category[t.category]++;
            });

            return Response.json({
                templates: templates,
                stats: stats
            });

        } else if (action === 'generate_report') {
            // Generate report from template
            if (!template_id || !report_name) {
                return Response.json({ error: 'template_id, report_name required' }, { status: 400 });
            }

            const templates = await base44.asServiceRole.entities.ReportTemplate.filter({
                id: template_id
            });

            if (!templates || templates.length === 0) {
                return Response.json({ error: 'Template not found' }, { status: 404 });
            }

            const template = templates[0];
            const startTime = Date.now();

            // Simulate data aggregation
            const mockData = {
                sections: template.sections.map((s, idx) => ({
                    ...s,
                    data: generateMockData(s.section_type, 20 + idx * 5)
                })),
                summary: {
                    total_records: 150 + Math.random() * 100,
                    key_metrics: {
                        metric_1: Math.round(Math.random() * 1000),
                        metric_2: Math.round(Math.random() * 500),
                        metric_3: (Math.random() * 100).toFixed(2)
                    },
                    highlights: [
                        'Performance improved by 15%',
                        'Cost reduction achieved',
                        'User engagement +23%'
                    ]
                }
            };

            const report = await base44.asServiceRole.entities.GeneratedReport.create({
                organization_id: organization_id,
                template_id: template_id,
                report_name: report_name,
                status: 'generating',
                data: mockData,
                created_by: user.id,
                created_at: new Date().toISOString()
            });

            // Simulate report completion
            setTimeout(async () => {
                const generationTime = Date.now() - startTime;
                await base44.asServiceRole.entities.GeneratedReport.update(report.id, {
                    status: 'completed',
                    generation_time_ms: generationTime,
                    export_urls: {
                        pdf: `https://reports.example.com/${report.id}.pdf`,
                        excel: `https://reports.example.com/${report.id}.xlsx`,
                        csv: `https://reports.example.com/${report.id}.csv`,
                        json: `https://reports.example.com/${report.id}.json`
                    }
                });

                // Update template usage
                await base44.asServiceRole.entities.ReportTemplate.update(template_id, {
                    usage_count: (template.usage_count || 0) + 1
                });
            }, 500);

            return Response.json({
                report_generated: true,
                report_id: report.id,
                status: 'generating'
            });

        } else if (action === 'get_report') {
            // Get generated report
            if (!report_id) {
                return Response.json({ error: 'report_id required' }, { status: 400 });
            }

            const reports = await base44.asServiceRole.entities.GeneratedReport.filter({
                id: report_id
            });

            if (!reports || reports.length === 0) {
                return Response.json({ error: 'Report not found' }, { status: 404 });
            }

            return Response.json({
                report: reports[0]
            });

        } else if (action === 'schedule_report') {
            // Schedule regular report generation
            if (!template_id || !schedule_name || !frequency || !time_of_day) {
                return Response.json({ error: 'template_id, schedule_name, frequency, time_of_day required' }, { status: 400 });
            }

            const schedule = await base44.asServiceRole.entities.ScheduledReport.create({
                organization_id: organization_id,
                template_id: template_id,
                schedule_name: schedule_name,
                frequency: frequency,
                time_of_day: time_of_day,
                recipients: recipients,
                status: 'active',
                created_by: user.id,
                next_scheduled_at: calculateNextScheduleTime(frequency, time_of_day)
            });

            return Response.json({
                schedule_created: true,
                schedule_id: schedule.id,
                next_run: schedule.next_scheduled_at
            });

        } else if (action === 'get_schedules') {
            // Get all scheduled reports
            const schedules = await base44.asServiceRole.entities.ScheduledReport.filter({
                organization_id: organization_id
            }, '-next_scheduled_at', 100);

            const stats = {
                total: schedules.length,
                active: schedules.filter(s => s.status === 'active').length,
                successful_total: schedules.reduce((sum, s) => sum + s.successful_runs, 0),
                failed_total: schedules.reduce((sum, s) => sum + s.failed_runs, 0)
            };

            return Response.json({
                schedules: schedules,
                stats: stats
            });

        } else if (action === 'get_analytics') {
            // Get reporting analytics
            const templates = await base44.asServiceRole.entities.ReportTemplate.filter({
                organization_id: organization_id
            }, '-usage_count', 100);

            const reports = await base44.asServiceRole.entities.GeneratedReport.filter({
                organization_id: organization_id
            }, '-created_at', 100);

            const schedules = await base44.asServiceRole.entities.ScheduledReport.filter({
                organization_id: organization_id
            }, '-next_scheduled_at', 100);

            const analytics = {
                total_templates: templates.length,
                total_reports_generated: reports.length,
                total_schedules: schedules.length,
                most_used_templates: templates.slice(0, 5),
                recent_reports: reports.slice(0, 10),
                average_generation_time: calculateAverageGenerationTime(reports),
                schedule_success_rate: calculateSuccessRate(schedules)
            };

            return Response.json(analytics);
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Reporting engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function generateMockData(sectionType, count) {
    const data = [];
    for (let i = 0; i < count; i++) {
        if (sectionType === 'table') {
            data.push({
                id: i + 1,
                value: Math.random() * 1000,
                percentage: (Math.random() * 100).toFixed(2),
                status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)]
            });
        } else if (sectionType === 'chart') {
            data.push({
                name: `Item ${i + 1}`,
                value: Math.round(Math.random() * 500)
            });
        } else {
            data.push({
                timestamp: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
                metric: Math.round(Math.random() * 100)
            });
        }
    }
    return data;
}

function calculateNextScheduleTime(frequency, timeOfDay) {
    const now = new Date();
    const [hours, minutes] = timeOfDay.split(':').map(Number);
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

    if (frequency === 'daily') {
        if (next <= now) next.setDate(next.getDate() + 1);
    } else if (frequency === 'weekly') {
        next.setDate(next.getDate() + 7);
    } else if (frequency === 'monthly') {
        next.setMonth(next.getMonth() + 1);
    }

    return next.toISOString();
}

function calculateAverageGenerationTime(reports) {
    const withTime = reports.filter(r => r.generation_time_ms);
    if (withTime.length === 0) return 0;
    return Math.round(withTime.reduce((sum, r) => sum + r.generation_time_ms, 0) / withTime.length);
}

function calculateSuccessRate(schedules) {
    const withRuns = schedules.filter(s => s.successful_runs + s.failed_runs > 0);
    if (withRuns.length === 0) return 100;
    const totalSuccess = withRuns.reduce((sum, s) => sum + s.successful_runs, 0);
    const totalRuns = withRuns.reduce((sum, s) => sum + s.successful_runs + s.failed_runs, 0);
    return Math.round((totalSuccess / totalRuns) * 100);
}