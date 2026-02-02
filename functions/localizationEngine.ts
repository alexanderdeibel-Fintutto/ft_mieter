import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 76: Advanced Localization & Internationalization System
 * Verwaltet Sprachen, Übersetzungen und Lokalisierungs-Jobs
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

        if (action === 'add_language') {
            const { language_code, language_name, locale, region_code, is_rtl, date_format, time_format, currency_code } = await req.json();

            if (!language_code || !language_name) {
                return Response.json({ error: 'language_code, language_name required' }, { status: 400 });
            }

            const language = await base44.asServiceRole.entities.LanguageConfig.create({
                organization_id,
                language_code,
                language_name,
                locale: locale || `${language_code.toLowerCase()}-${region_code?.toUpperCase() || language_code.toUpperCase()}`,
                region_code: region_code || '',
                is_rtl: is_rtl || false,
                date_format: date_format || 'dd.MM.yyyy',
                time_format: time_format || 'HH:mm:ss',
                currency_code: currency_code || 'EUR',
                last_update: new Date().toISOString()
            });

            return Response.json({ language_added: true, language_id: language.id });

        } else if (action === 'create_translation') {
            const { key, language_code, context, original_text, translated_text, plural_form, notes } = await req.json();

            if (!key || !language_code || !original_text) {
                return Response.json({ error: 'key, language_code, original_text required' }, { status: 400 });
            }

            const translation = await base44.asServiceRole.entities.Translation.create({
                organization_id,
                key,
                language_code,
                context: context || 'general',
                original_text,
                translated_text: translated_text || '',
                status: translated_text ? 'translated' : 'pending',
                plural_form: plural_form || '',
                notes: notes || '',
                created_at: new Date().toISOString(),
                translated_at: translated_text ? new Date().toISOString() : null
            });

            // Update language coverage
            await updateLanguageCoverage(organization_id, language_code, base44);

            return Response.json({ translation_created: true, translation_id: translation.id });

        } else if (action === 'approve_translation') {
            const { translation_id } = await req.json();

            if (!translation_id) {
                return Response.json({ error: 'translation_id required' }, { status: 400 });
            }

            const translations = await base44.asServiceRole.entities.Translation.filter({
                organization_id,
                id: translation_id
            });

            if (translations.length === 0) {
                return Response.json({ error: 'Translation not found' }, { status: 404 });
            }

            const translation = translations[0];

            await base44.asServiceRole.entities.Translation.update(translation_id, {
                status: 'approved',
                is_approved: true,
                reviewer_id: user.id,
                reviewed_at: new Date().toISOString()
            });

            // Update coverage
            await updateLanguageCoverage(organization_id, translation.language_code, base44);

            return Response.json({ translation_approved: true });

        } else if (action === 'create_job') {
            const { job_type, source_language, target_languages } = await req.json();

            if (!job_type) {
                return Response.json({ error: 'job_type required' }, { status: 400 });
            }

            const job_id = crypto.randomUUID();

            const job = await base44.asServiceRole.entities.LocalizationJob.create({
                organization_id,
                job_id,
                job_type,
                source_language: source_language || 'en',
                target_languages: target_languages || [],
                status: 'pending',
                started_at: new Date().toISOString(),
                created_by: user.id
            });

            // Simulate job execution
            setTimeout(() => executeLocalizationJob(job_id, organization_id, base44), 100);

            return Response.json({ job_created: true, job_id: job.id });

        } else if (action === 'get_dashboard_data') {
            const [languages, translations, jobs] = await Promise.all([
                base44.asServiceRole.entities.LanguageConfig.filter({ organization_id }, '-created_date'),
                base44.asServiceRole.entities.Translation.filter({ organization_id }, '-created_at', 100),
                base44.asServiceRole.entities.LocalizationJob.filter({ organization_id }, '-started_at', 50)
            ]);

            const languageStats = {
                total_languages: languages.length,
                active_languages: languages.filter(l => l.is_active).length,
                avg_coverage: languages.length > 0
                    ? Math.round(languages.reduce((sum, l) => sum + (l.translation_coverage || 0), 0) / languages.length)
                    : 0,
                total_translations: languages.reduce((sum, l) => sum + (l.translated_keys || 0), 0)
            };

            const translationStats = {
                total_keys: translations.filter(t => t.language_code === languages[0]?.language_code).length,
                pending: translations.filter(t => t.status === 'pending').length,
                translated: translations.filter(t => t.status === 'translated').length,
                approved: translations.filter(t => t.status === 'approved').length,
                reviewed: translations.filter(t => t.is_approved).length
            };

            const jobStats = {
                total_jobs: jobs.length,
                completed_jobs: jobs.filter(j => j.status === 'completed').length,
                failed_jobs: jobs.filter(j => j.status === 'failed').length,
                in_progress: jobs.filter(j => j.status === 'in_progress').length
            };

            const jobsByStatus = {};
            jobs.forEach(j => {
                jobsByStatus[j.status] = (jobsByStatus[j.status] || 0) + 1;
            });

            return Response.json({
                languages: languages.slice(0, 20),
                translations: translations.slice(0, 30),
                jobs: jobs.slice(0, 20),
                language_stats: languageStats,
                translation_stats: translationStats,
                job_stats: jobStats,
                jobs_by_status: jobsByStatus
            });

        } else if (action === 'get_translations') {
            const { language_code, status, context } = await req.json();

            let filter = { organization_id };
            if (language_code) filter.language_code = language_code;
            if (status) filter.status = status;
            if (context) filter.context = context;

            const translations = await base44.asServiceRole.entities.Translation.filter(
                filter,
                '-created_at',
                100
            );

            return Response.json({ translations });

        } else if (action === 'export_translations') {
            const { language_code, format } = await req.json();

            if (!language_code) {
                return Response.json({ error: 'language_code required' }, { status: 400 });
            }

            const translations = await base44.asServiceRole.entities.Translation.filter({
                organization_id,
                language_code
            }, '-created_at', 10000);

            const exported = {};
            translations.forEach(t => {
                if (!exported[t.context]) {
                    exported[t.context] = {};
                }
                exported[t.context][t.key] = t.translated_text || t.original_text;
            });

            return Response.json({
                export_created: true,
                language_code,
                format: format || 'json',
                total_keys: translations.length,
                data: exported
            });

        } else if (action === 'get_languages') {
            const { is_active } = await req.json();

            let filter = { organization_id };
            if (is_active !== undefined) filter.is_active = is_active;

            const languages = await base44.asServiceRole.entities.LanguageConfig.filter(filter, '-created_date');

            return Response.json({ languages });

        } else if (action === 'get_job_details') {
            const { job_id } = await req.json();

            if (!job_id) {
                return Response.json({ error: 'job_id required' }, { status: 400 });
            }

            const jobs = await base44.asServiceRole.entities.LocalizationJob.filter({
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
        console.error('Localization engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function updateLanguageCoverage(organizationId, languageCode, base44) {
    try {
        const languages = await base44.asServiceRole.entities.LanguageConfig.filter({
            organization_id: organizationId,
            language_code: languageCode
        });

        if (languages.length === 0) return;

        const lang = languages[0];
        const translations = await base44.asServiceRole.entities.Translation.filter({
            organization_id: organizationId,
            language_code: languageCode
        }, '-created_at', 10000);

        const approved = translations.filter(t => t.is_approved).length;
        const coverage = translations.length > 0 ? Math.round((approved / translations.length) * 100) : 0;

        await base44.asServiceRole.entities.LanguageConfig.update(languages[0].id, {
            total_keys: translations.length,
            translated_keys: approved,
            translation_coverage: coverage,
            last_update: new Date().toISOString()
        });
    } catch (error) {
        console.error('Coverage update error:', error);
    }
}

async function executeLocalizationJob(jobId, organizationId, base44) {
    try {
        const jobs = await base44.asServiceRole.entities.LocalizationJob.filter({
            organization_id: organizationId,
            job_id: jobId
        });

        if (jobs.length === 0) return;

        const job = jobs[0];
        const start = Date.now();

        // Update job status
        await base44.asServiceRole.entities.LocalizationJob.update(job.id, {
            status: 'in_progress'
        });

        // Simulate job processing
        const translations = await base44.asServiceRole.entities.Translation.filter({
            organization_id: organizationId
        }, '-created_at', 5000);

        const totalKeys = translations.length;
        let translatedKeys = translations.filter(t => t.is_approved).length;
        let failedKeys = 0;

        // Simulate some failures
        failedKeys = Math.random() < 0.05 ? Math.floor(totalKeys * 0.01) : 0;

        const duration = Math.round((Date.now() - start) / 1000);

        await base44.asServiceRole.entities.LocalizationJob.update(job.id, {
            status: 'completed',
            total_keys: totalKeys,
            processed_keys: totalKeys,
            translated_keys: translatedKeys,
            failed_keys: failedKeys,
            progress_percentage: 100,
            completed_at: new Date().toISOString(),
            duration_seconds: duration
        });
    } catch (error) {
        console.error('Job execution error:', error);

        try {
            const jobs = await base44.asServiceRole.entities.LocalizationJob.filter({
                organization_id: organizationId,
                job_id: jobId
            });

            if (jobs.length > 0) {
                await base44.asServiceRole.entities.LocalizationJob.update(jobs[0].id, {
                    status: 'failed',
                    error_message: error.message
                });
            }
        } catch (e) {
            console.error('Error updating job:', e);
        }
    }
}