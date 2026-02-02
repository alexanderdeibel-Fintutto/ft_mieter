import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 68: Advanced Template Management & Dynamic Content System
 * Verwaltet Content-Templates, Versionen und Rendering
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

        if (action === 'create_template') {
            const { template_key, template_name, template_type, content, variables, locale, metadata } = await req.json();

            if (!template_key || !template_name || !content) {
                return Response.json({ error: 'template_key, template_name, content required' }, { status: 400 });
            }

            const template = await base44.asServiceRole.entities.ContentTemplate.create({
                organization_id,
                template_key,
                template_name,
                template_type: template_type || 'email',
                content,
                variables: variables || [],
                locale: locale || 'de',
                version: '1.0.0',
                metadata: metadata || {}
            });

            // Create initial version
            await base44.asServiceRole.entities.TemplateVersion.create({
                organization_id,
                template_id: template.id,
                version_number: '1.0.0',
                content,
                changelog: 'Initial version',
                created_by_user: user.id,
                is_published: true,
                published_at: new Date().toISOString()
            });

            return Response.json({ template_created: true, template_id: template.id });

        } else if (action === 'update_template') {
            const { template_id, content, version_number, changelog } = await req.json();

            if (!template_id || !content) {
                return Response.json({ error: 'template_id, content required' }, { status: 400 });
            }

            const templates = await base44.asServiceRole.entities.ContentTemplate.filter({
                organization_id,
                id: template_id
            });

            if (templates.length === 0) {
                return Response.json({ error: 'Template not found' }, { status: 404 });
            }

            const template = templates[0];
            const newVersion = version_number || incrementVersion(template.version);

            await base44.asServiceRole.entities.ContentTemplate.update(template_id, {
                content,
                version: newVersion
            });

            await base44.asServiceRole.entities.TemplateVersion.create({
                organization_id,
                template_id,
                version_number: newVersion,
                content,
                changelog: changelog || 'Updated content',
                created_by_user: user.id,
                is_published: true,
                published_at: new Date().toISOString()
            });

            return Response.json({ template_updated: true, version: newVersion });

        } else if (action === 'render_template') {
            const { template_key, variables, recipient_id, delivery_channel } = await req.json();

            if (!template_key || !variables) {
                return Response.json({ error: 'template_key, variables required' }, { status: 400 });
            }

            const templates = await base44.asServiceRole.entities.ContentTemplate.filter({
                organization_id,
                template_key
            });

            if (templates.length === 0) {
                return Response.json({ error: 'Template not found' }, { status: 404 });
            }

            const template = templates[0];

            if (!template.is_active) {
                return Response.json({ error: 'Template is not active' }, { status: 400 });
            }

            // Simple template rendering (replace {{variable}} with values)
            let rendered = template.content;
            for (const [key, value] of Object.entries(variables)) {
                const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
                rendered = rendered.replace(regex, value);
            }

            const render_id = crypto.randomUUID();

            const renderedContent = await base44.asServiceRole.entities.RenderedContent.create({
                organization_id,
                template_id: template.id,
                render_id,
                rendered_content: rendered,
                variables_used: variables,
                rendered_at: new Date().toISOString(),
                recipient_id: recipient_id || '',
                delivery_channel: delivery_channel || ''
            });

            await base44.asServiceRole.entities.ContentTemplate.update(template.id, {
                render_count: (template.render_count || 0) + 1
            });

            return Response.json({ 
                rendered: true, 
                content: rendered,
                render_id: renderedContent.id
            });

        } else if (action === 'update_render_status') {
            const { render_id, status, error_message } = await req.json();

            if (!render_id || !status) {
                return Response.json({ error: 'render_id, status required' }, { status: 400 });
            }

            const updates = { status };
            if (error_message) updates.error_message = error_message;

            await base44.asServiceRole.entities.RenderedContent.update(render_id, updates);

            return Response.json({ status_updated: true });

        } else if (action === 'get_templates') {
            const { template_type, locale, is_active } = await req.json();

            let filter = { organization_id };
            if (template_type) filter.template_type = template_type;
            if (locale) filter.locale = locale;
            if (is_active !== undefined) filter.is_active = is_active;

            const templates = await base44.asServiceRole.entities.ContentTemplate.filter(filter, '-created_date');

            return Response.json({ templates });

        } else if (action === 'get_template_versions') {
            const { template_id } = await req.json();

            if (!template_id) {
                return Response.json({ error: 'template_id required' }, { status: 400 });
            }

            const versions = await base44.asServiceRole.entities.TemplateVersion.filter({
                organization_id,
                template_id
            }, '-created_date');

            return Response.json({ versions });

        } else if (action === 'get_rendered_content') {
            const { template_id, recipient_id, status, limit } = await req.json();

            let filter = { organization_id };
            if (template_id) filter.template_id = template_id;
            if (recipient_id) filter.recipient_id = recipient_id;
            if (status) filter.status = status;

            const rendered = await base44.asServiceRole.entities.RenderedContent.filter(filter, '-rendered_at', limit || 50);

            return Response.json({ rendered });

        } else if (action === 'get_dashboard_data') {
            const [templates, versions, rendered] = await Promise.all([
                base44.asServiceRole.entities.ContentTemplate.filter({ organization_id }, '-created_date'),
                base44.asServiceRole.entities.TemplateVersion.filter({ organization_id }, '-created_date', 100),
                base44.asServiceRole.entities.RenderedContent.filter({ organization_id }, '-rendered_at', 100)
            ]);

            const templatesByType = {};
            templates.forEach(t => {
                templatesByType[t.template_type] = (templatesByType[t.template_type] || 0) + 1;
            });

            const renderedByStatus = {};
            rendered.forEach(r => {
                renderedByStatus[r.status] = (renderedByStatus[r.status] || 0) + 1;
            });

            const stats = {
                total_templates: templates.length,
                active_templates: templates.filter(t => t.is_active).length,
                total_versions: versions.length,
                published_versions: versions.filter(v => v.is_published).length,
                total_renders: templates.reduce((sum, t) => sum + (t.render_count || 0), 0),
                successful_deliveries: rendered.filter(r => r.status === 'delivered').length,
                failed_deliveries: rendered.filter(r => r.status === 'failed').length
            };

            const delivery_rate = rendered.length > 0
                ? Math.round((stats.successful_deliveries / rendered.length) * 100)
                : 0;

            return Response.json({
                templates,
                versions: versions.slice(0, 30),
                rendered: rendered.slice(0, 30),
                stats: { ...stats, delivery_rate },
                templates_by_type: templatesByType,
                rendered_by_status: renderedByStatus
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Template engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function incrementVersion(version) {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || 0) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
}