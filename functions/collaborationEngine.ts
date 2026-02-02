import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 97: Advanced Real-time Collaboration & Presence System
 * Verwaltet Collaboration-Sessions, Presence und kollaborative Edits
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

        if (action === 'create_session') {
            const { resource_id, resource_type, session_name, max_participants } = await req.json();

            if (!resource_id || !resource_type) {
                return Response.json({ error: 'resource_id, resource_type required' }, { status: 400 });
            }

            const session_id = crypto.randomUUID();
            const now = new Date().toISOString();

            const session = await base44.asServiceRole.entities.CollaborationSession.create({
                organization_id,
                session_id,
                resource_id,
                resource_type,
                session_name: session_name || `Session ${resource_id.substring(0, 8)}`,
                status: 'active',
                owner_id: user.id,
                participants: [user.id],
                active_participants: 1,
                max_participants: max_participants || 50,
                started_at: now,
                last_activity_at: now
            });

            return Response.json({ session_created: true, session_id: session.id });

        } else if (action === 'join_session') {
            const { session_id, user_color, device_type } = await req.json();

            if (!session_id) {
                return Response.json({ error: 'session_id required' }, { status: 400 });
            }

            const sessions = await base44.asServiceRole.entities.CollaborationSession.filter({
                organization_id,
                id: session_id
            });

            if (sessions.length === 0) {
                return Response.json({ error: 'Session not found' }, { status: 404 });
            }

            const session = sessions[0];
            const participants = session.participants || [];
            
            if (!participants.includes(user.id)) {
                participants.push(user.id);
                await base44.asServiceRole.entities.CollaborationSession.update(session_id, {
                    participants,
                    active_participants: participants.length
                });
            }

            const presence_id = crypto.randomUUID();
            const now = new Date().toISOString();

            await base44.asServiceRole.entities.PresenceStatus.create({
                organization_id,
                presence_id,
                user_id: user.id,
                session_id,
                status: 'active',
                user_color: user_color || '#' + Math.floor(Math.random()*16777215).toString(16),
                device_type: device_type || 'desktop',
                joined_at: now,
                last_heartbeat_at: now
            });

            return Response.json({ joined: true });

        } else if (action === 'update_presence') {
            const { session_id, status, cursor_position, viewport, is_editing } = await req.json();

            if (!session_id) {
                return Response.json({ error: 'session_id required' }, { status: 400 });
            }

            const presences = await base44.asServiceRole.entities.PresenceStatus.filter({
                organization_id,
                session_id,
                user_id: user.id
            });

            if (presences.length === 0) {
                return Response.json({ error: 'Presence not found' }, { status: 404 });
            }

            const updateData = {
                last_heartbeat_at: new Date().toISOString()
            };

            if (status) updateData.status = status;
            if (cursor_position) updateData.cursor_position = cursor_position;
            if (viewport) updateData.viewport = viewport;
            if (is_editing !== undefined) updateData.is_editing = is_editing;

            await base44.asServiceRole.entities.PresenceStatus.update(presences[0].id, updateData);

            return Response.json({ presence_updated: true });

        } else if (action === 'record_edit') {
            const { session_id, edit_type, operation, position, content_before, content_after } = await req.json();

            if (!session_id || !edit_type) {
                return Response.json({ error: 'session_id, edit_type required' }, { status: 400 });
            }

            const sessions = await base44.asServiceRole.entities.CollaborationSession.filter({
                organization_id,
                id: session_id
            });

            if (sessions.length === 0) {
                return Response.json({ error: 'Session not found' }, { status: 404 });
            }

            const session = sessions[0];
            const edit_id = crypto.randomUUID();

            await base44.asServiceRole.entities.CollaborativeEdit.create({
                organization_id,
                edit_id,
                session_id,
                user_id: user.id,
                edit_type,
                operation: operation || {},
                position: position || {},
                content_before: content_before || '',
                content_after: content_after || '',
                sequence_number: session.edit_count + 1,
                timestamp: new Date().toISOString()
            });

            await base44.asServiceRole.entities.CollaborationSession.update(session_id, {
                edit_count: (session.edit_count || 0) + 1,
                last_activity_at: new Date().toISOString()
            });

            return Response.json({ edit_recorded: true });

        } else if (action === 'leave_session') {
            const { session_id } = await req.json();

            if (!session_id) {
                return Response.json({ error: 'session_id required' }, { status: 400 });
            }

            const presences = await base44.asServiceRole.entities.PresenceStatus.filter({
                organization_id,
                session_id,
                user_id: user.id
            });

            if (presences.length > 0) {
                await base44.asServiceRole.entities.PresenceStatus.update(presences[0].id, {
                    status: 'offline',
                    left_at: new Date().toISOString()
                });
            }

            const sessions = await base44.asServiceRole.entities.CollaborationSession.filter({
                organization_id,
                id: session_id
            });

            if (sessions.length > 0) {
                const session = sessions[0];
                const participants = (session.participants || []).filter(id => id !== user.id);
                
                await base44.asServiceRole.entities.CollaborationSession.update(session_id, {
                    participants,
                    active_participants: participants.length
                });
            }

            return Response.json({ left: true });

        } else if (action === 'get_dashboard_data') {
            const [sessions, presences, edits] = await Promise.all([
                base44.asServiceRole.entities.CollaborationSession.filter({ organization_id }, '-started_at', 50),
                base44.asServiceRole.entities.PresenceStatus.filter({ organization_id }, '-joined_at', 100),
                base44.asServiceRole.entities.CollaborativeEdit.filter({ organization_id }, '-timestamp', 100)
            ]);

            const sessionStats = {
                total_sessions: sessions.length,
                active_sessions: sessions.filter(s => s.status === 'active').length,
                idle_sessions: sessions.filter(s => s.status === 'idle').length,
                closed_sessions: sessions.filter(s => s.status === 'closed').length,
                total_participants: sessions.reduce((sum, s) => sum + (s.active_participants || 0), 0),
                total_edits: sessions.reduce((sum, s) => sum + (s.edit_count || 0), 0),
                by_resource_type: {}
            };

            sessions.forEach(s => {
                sessionStats.by_resource_type[s.resource_type] = (sessionStats.by_resource_type[s.resource_type] || 0) + 1;
            });

            const presenceStats = {
                total_presences: presences.length,
                online: presences.filter(p => p.status === 'online').length,
                active: presences.filter(p => p.status === 'active').length,
                idle: presences.filter(p => p.status === 'idle').length,
                away: presences.filter(p => p.status === 'away').length,
                offline: presences.filter(p => p.status === 'offline').length,
                editing_now: presences.filter(p => p.is_editing).length
            };

            const editStats = {
                total_edits: edits.length,
                insert: edits.filter(e => e.edit_type === 'insert').length,
                delete: edits.filter(e => e.edit_type === 'delete').length,
                update: edits.filter(e => e.edit_type === 'update').length,
                move: edits.filter(e => e.edit_type === 'move').length,
                format: edits.filter(e => e.edit_type === 'format').length,
                conflicts_detected: edits.filter(e => e.conflict_detected).length,
                conflicts_resolved: edits.filter(e => e.conflict_resolved).length
            };

            return Response.json({
                sessions: sessions.slice(0, 30),
                presences: presences.slice(0, 40),
                edits: edits.slice(0, 40),
                session_stats: sessionStats,
                presence_stats: presenceStats,
                edit_stats: editStats
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Collaboration engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});