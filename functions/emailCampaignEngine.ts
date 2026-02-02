import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 30: Advanced Email Campaign & Newsletter System
 * Verwaltet Email-Kampagnen, Subscriber und Analytics
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,                    // 'create_campaign', 'get_campaigns', 'send_campaign', 'pause_campaign', 'get_analytics', 'manage_subscriber', 'get_subscribers', 'import_subscribers', 'get_performance_report'
            organization_id,
            campaign_id,
            campaign_name,
            campaign_type,
            subject_line,
            email_template_id,
            sender_email,
            sender_name,
            total_recipients = 0,
            email,
            subscriber_action,
            subscribers = []
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'create_campaign') {
            // Create email campaign
            if (!campaign_name || !campaign_type || !subject_line) {
                return Response.json({ error: 'campaign_name, campaign_type, subject_line required' }, { status: 400 });
            }

            const campaign = await base44.asServiceRole.entities.EmailCampaign.create({
                organization_id: organization_id,
                campaign_name: campaign_name,
                campaign_type: campaign_type,
                subject_line: subject_line,
                email_template_id: email_template_id || null,
                sender_email: sender_email || 'noreply@example.com',
                sender_name: sender_name || organization_id,
                status: 'draft',
                created_by: user.id,
                created_at: new Date().toISOString(),
                total_recipients: total_recipients
            });

            return Response.json({
                campaign_created: true,
                campaign_id: campaign.id
            });

        } else if (action === 'get_campaigns') {
            // Get all campaigns
            const campaigns = await base44.asServiceRole.entities.EmailCampaign.filter({
                organization_id: organization_id
            }, '-created_at', 100);

            const stats = {
                total: campaigns.length,
                draft: campaigns.filter(c => c.status === 'draft').length,
                sent: campaigns.filter(c => c.status === 'completed').length,
                active: campaigns.filter(c => c.status === 'running').length,
                total_opens: campaigns.reduce((sum, c) => sum + (c.opens || 0), 0),
                total_clicks: campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0)
            };

            return Response.json({
                campaigns: campaigns,
                stats: stats
            });

        } else if (action === 'send_campaign') {
            // Send/launch campaign
            if (!campaign_id) {
                return Response.json({ error: 'campaign_id required' }, { status: 400 });
            }

            const campaigns = await base44.asServiceRole.entities.EmailCampaign.filter({
                id: campaign_id
            });

            if (!campaigns || campaigns.length === 0) {
                return Response.json({ error: 'Campaign not found' }, { status: 404 });
            }

            const campaign = campaigns[0];

            // Get subscribers
            const subscriberList = await base44.asServiceRole.entities.EmailSubscriber.filter({
                organization_id: organization_id,
                status: 'subscribed'
            }, '-subscription_date', 10000);

            const recipient_count = subscriberList.length;

            // Update campaign status
            await base44.asServiceRole.entities.EmailCampaign.update(campaign_id, {
                status: 'running',
                emails_sent: recipient_count,
                sent_at: new Date().toISOString(),
                total_recipients: recipient_count
            });

            // Simulate email sending
            setTimeout(() => {
                simulateCampaignDelivery(base44, campaign_id, organization_id, subscriber_count);
            }, 100);

            return Response.json({
                campaign_launched: true,
                recipient_count: recipient_count
            });

        } else if (action === 'pause_campaign') {
            // Pause/resume campaign
            if (!campaign_id) {
                return Response.json({ error: 'campaign_id required' }, { status: 400 });
            }

            const campaigns = await base44.asServiceRole.entities.EmailCampaign.filter({
                id: campaign_id
            });

            if (!campaigns || campaigns.length === 0) {
                return Response.json({ error: 'Campaign not found' }, { status: 404 });
            }

            const newStatus = campaigns[0].status === 'running' ? 'paused' : 'running';
            await base44.asServiceRole.entities.EmailCampaign.update(campaign_id, {
                status: newStatus
            });

            return Response.json({
                campaign_updated: true,
                status: newStatus
            });

        } else if (action === 'get_analytics') {
            // Get campaign analytics
            if (!campaign_id) {
                return Response.json({ error: 'campaign_id required' }, { status: 400 });
            }

            const analytics = await base44.asServiceRole.entities.EmailCampaignAnalytics.filter({
                campaign_id: campaign_id
            }, '-timestamp', 500);

            const campaigns = await base44.asServiceRole.entities.EmailCampaign.filter({
                id: campaign_id
            });

            const campaign = campaigns[0];

            const stats = {
                sent: campaign.emails_sent || 0,
                delivered: campaign.emails_sent - (campaign.emails_failed || 0),
                opens: campaign.opens || 0,
                clicks: campaign.clicks || 0,
                unsubscribes: campaign.unsubscribes || 0,
                conversions: campaign.conversions || 0,
                open_rate: campaign.emails_sent ? Math.round((campaign.opens / campaign.emails_sent) * 100) : 0,
                click_rate: campaign.opens ? Math.round((campaign.clicks / campaign.opens) * 100) : 0,
                conversion_rate: campaign.emails_sent ? Math.round((campaign.conversions / campaign.emails_sent) * 100) : 0,
                revenue: campaign.revenue_generated || 0
            };

            const overtime = {};
            analytics.forEach(a => {
                const date = new Date(a.timestamp).toISOString().split('T')[0];
                if (!overtime[date]) overtime[date] = { date, opens: 0, clicks: 0, conversions: 0 };
                if (a.metric_type === 'open') overtime[date].opens += a.count;
                if (a.metric_type === 'click') overtime[date].clicks += a.count;
                if (a.metric_type === 'conversion') overtime[date].conversions += a.count;
            });

            return Response.json({
                campaign: campaign,
                stats: stats,
                overtime: Object.values(overtime)
            });

        } else if (action === 'manage_subscriber') {
            // Add/update/remove subscriber
            if (!email || !subscriber_action) {
                return Response.json({ error: 'email, subscriber_action required' }, { status: 400 });
            }

            const existingSubscribers = await base44.asServiceRole.entities.EmailSubscriber.filter({
                organization_id: organization_id,
                email: email
            });

            if (subscriber_action === 'subscribe') {
                if (existingSubscribers.length === 0) {
                    await base44.asServiceRole.entities.EmailSubscriber.create({
                        organization_id: organization_id,
                        email: email,
                        status: 'subscribed',
                        subscription_date: new Date().toISOString(),
                        confirmed: true,
                        confirmed_at: new Date().toISOString()
                    });
                } else {
                    await base44.asServiceRole.entities.EmailSubscriber.update(existingSubscribers[0].id, {
                        status: 'subscribed',
                        subscription_date: new Date().toISOString()
                    });
                }
            } else if (subscriber_action === 'unsubscribe') {
                if (existingSubscribers.length > 0) {
                    await base44.asServiceRole.entities.EmailSubscriber.update(existingSubscribers[0].id, {
                        status: 'unsubscribed',
                        unsubscribe_date: new Date().toISOString()
                    });
                }
            }

            return Response.json({
                subscriber_updated: true,
                email: email,
                action: subscriber_action
            });

        } else if (action === 'get_subscribers') {
            // Get subscribers
            const subscribers = await base44.asServiceRole.entities.EmailSubscriber.filter({
                organization_id: organization_id
            }, '-subscription_date', 1000);

            const stats = {
                total: subscribers.length,
                subscribed: subscribers.filter(s => s.status === 'subscribed').length,
                unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
                bounced: subscribers.filter(s => s.status === 'bounced').length,
                average_engagement: calculateAverageEngagement(subscribers)
            };

            return Response.json({
                subscribers: subscribers,
                stats: stats
            });

        } else if (action === 'import_subscribers') {
            // Bulk import subscribers
            if (!Array.isArray(subscribers) || subscribers.length === 0) {
                return Response.json({ error: 'subscribers array required' }, { status: 400 });
            }

            const created = [];
            const updated = [];

            for (const sub of subscribers) {
                if (!sub.email) continue;

                const existing = await base44.asServiceRole.entities.EmailSubscriber.filter({
                    organization_id: organization_id,
                    email: sub.email
                });

                if (existing.length === 0) {
                    const newSub = await base44.asServiceRole.entities.EmailSubscriber.create({
                        organization_id: organization_id,
                        email: sub.email,
                        first_name: sub.first_name || '',
                        last_name: sub.last_name || '',
                        status: 'subscribed',
                        subscription_date: new Date().toISOString(),
                        custom_attributes: sub.custom_attributes || {}
                    });
                    created.push(newSub.id);
                } else {
                    updated.push(existing[0].id);
                }
            }

            return Response.json({
                import_completed: true,
                created_count: created.length,
                updated_count: updated.length,
                total_imported: created.length + updated.length
            });

        } else if (action === 'get_performance_report') {
            // Get performance report
            const campaigns = await base44.asServiceRole.entities.EmailCampaign.filter({
                organization_id: organization_id
            }, '-sent_at', 100);

            const report = {
                total_campaigns: campaigns.length,
                total_emails_sent: campaigns.reduce((sum, c) => sum + (c.emails_sent || 0), 0),
                average_open_rate: calculateAverageOpenRate(campaigns),
                average_click_rate: calculateAverageClickRate(campaigns),
                total_revenue: campaigns.reduce((sum, c) => sum + (c.revenue_generated || 0), 0),
                by_type: {},
                top_campaigns: campaigns.slice(0, 5)
            };

            campaigns.forEach(c => {
                if (!report.by_type[c.campaign_type]) {
                    report.by_type[c.campaign_type] = { count: 0, revenue: 0, opens: 0 };
                }
                report.by_type[c.campaign_type].count++;
                report.by_type[c.campaign_type].revenue += c.revenue_generated || 0;
                report.by_type[c.campaign_type].opens += c.opens || 0;
            });

            return Response.json(report);
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Email campaign error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function simulateCampaignDelivery(base44, campaignId, organizationId, recipientCount) {
    try {
        const openRate = Math.random() * 0.4 + 0.2; // 20-60%
        const clickRate = Math.random() * 0.3 + 0.05; // 5-35%
        const conversionRate = Math.random() * 0.1; // 0-10%

        const opens = Math.round(recipientCount * openRate);
        const clicks = Math.round(opens * (clickRate / (1 - clickRate)));
        const conversions = Math.round(recipientCount * conversionRate);

        setTimeout(async () => {
            await base44.asServiceRole.entities.EmailCampaign.update(campaignId, {
                status: 'completed',
                opens: opens,
                clicks: clicks,
                conversions: conversions,
                revenue_generated: conversions * (Math.random() * 100 + 50),
                completed_at: new Date().toISOString()
            });
        }, 2000);
    } catch (e) {
        console.log('Simulation error:', e.message);
    }
}

function calculateAverageEngagement(subscribers) {
    const withEngagement = subscribers.filter(s => s.engagement_score);
    if (withEngagement.length === 0) return 0;
    return Math.round(withEngagement.reduce((sum, s) => sum + s.engagement_score, 0) / withEngagement.length);
}

function calculateAverageOpenRate(campaigns) {
    const withOpens = campaigns.filter(c => c.emails_sent > 0);
    if (withOpens.length === 0) return 0;
    const totalRate = withOpens.reduce((sum, c) => sum + ((c.opens || 0) / c.emails_sent), 0);
    return Math.round((totalRate / withOpens.length) * 100);
}

function calculateAverageClickRate(campaigns) {
    const withClicks = campaigns.filter(c => c.opens > 0);
    if (withClicks.length === 0) return 0;
    const totalRate = withClicks.reduce((sum, c) => sum + ((c.clicks || 0) / c.opens), 0);
    return Math.round((totalRate / withClicks.length) * 100);
}