import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 17: Real-time Collaboration & Live Updates System
 * Verwaltet Live-Editing, Presence und Document Versioning
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,              // 'start_editing', 'end_editing', 'update_content', 'get_collaborators', 'save_version', 'get_versions'
            document_id,
            organization_id,
            content,
            cursor_position,
            selection_range,
            change_description
        } = await req.json();

        if (!action || !document_id || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'start_editing') {
            // Register user als Editor
            const color = generateUserColor(user.id);
            
            const collaboration = await base44.asServiceRole.entities.DocumentCollaboration.create({
                document_id: document_id,
                organization_id: organization_id,
                editor_id: user.id,
                started_at: new Date().toISOString(),
                last_activity: new Date().toISOString(),
                color: color
            });

            // Update Presence Indicator
            await base44.asServiceRole.entities.PresenceIndicator.create({
                user_id: user.id,
                organization_id: organization_id,
                entity_type: 'Document',
                entity_id: document_id,
                status: 'editing',
                last_heartbeat: new Date().toISOString(),
                user_metadata: {
                    name: user.full_name,
                    avatar_url: user.avatar_url,
                    color: color
                }
            });

            return Response.json({
                collaboration_id: collaboration.id,
                color: color,
                message: 'Editing started'
            });

        } else if (action === 'end_editing') {
            // Cleanup
            const collab = await base44.asServiceRole.entities.DocumentCollaboration.filter({
                document_id: document_id,
                editor_id: user.id
            });

            if (collab.length > 0) {
                await base44.asServiceRole.entities.DocumentCollaboration.delete(collab[0].id);
            }

            const presence = await base44.asServiceRole.entities.PresenceIndicator.filter({
                user_id: user.id,
                entity_id: document_id
            });

            if (presence.length > 0) {
                await base44.asServiceRole.entities.PresenceIndicator.delete(presence[0].id);
            }

            return Response.json({ ended: true });

        } else if (action === 'update_content') {
            // Update Cursor/Selection Position
            const collab = await base44.asServiceRole.entities.DocumentCollaboration.filter({
                document_id: document_id,
                editor_id: user.id
            });

            if (collab.length > 0) {
                const updates = {
                    last_activity: new Date().toISOString()
                };
                if (cursor_position !== undefined) updates.cursor_position = cursor_position;
                if (selection_range) updates.selection_range = selection_range;

                await base44.asServiceRole.entities.DocumentCollaboration.update(collab[0].id, updates);
            }

            // Update Presence Indicator Heartbeat
            const presence = await base44.asServiceRole.entities.PresenceIndicator.filter({
                user_id: user.id,
                entity_id: document_id
            });

            if (presence.length > 0) {
                await base44.asServiceRole.entities.PresenceIndicator.update(presence[0].id, {
                    last_heartbeat: new Date().toISOString()
                });
            }

            return Response.json({ updated: true });

        } else if (action === 'get_collaborators') {
            // Get all active collaborators on this document
            const collaborators = await base44.asServiceRole.entities.DocumentCollaboration.filter({
                document_id: document_id
            });

            return Response.json({
                collaborators: collaborators,
                count: collaborators.length
            });

        } else if (action === 'save_version') {
            // Create version snapshot
            if (!content) {
                return Response.json({ error: 'Content required for saving version' }, { status: 400 });
            }

            // Get latest version number
            const versions = await base44.asServiceRole.entities.DocumentVersion.filter({
                document_id: document_id
            });

            const nextVersionNumber = versions.length > 0
                ? Math.max(...versions.map(v => v.version_number)) + 1
                : 1;

            const version = await base44.asServiceRole.entities.DocumentVersion.create({
                document_id: document_id,
                version_number: nextVersionNumber,
                created_by: user.id,
                content_snapshot: content,
                change_description: change_description || 'Auto-save',
                created_at: new Date().toISOString(),
                file_size_bytes: new TextEncoder().encode(content).length
            });

            // Update Document's updated_date durch SDK
            const doc = await base44.asServiceRole.entities.Document.filter({
                id: document_id
            });

            if (doc.length > 0) {
                // Note: updated_date wird automatisch aktualisiert
                await base44.asServiceRole.entities.Document.update(document_id, {
                    metadata: {
                        ...doc[0].metadata,
                        last_version: nextVersionNumber,
                        last_editor: user.id
                    }
                });
            }

            return Response.json({
                version: version,
                version_number: nextVersionNumber
            });

        } else if (action === 'get_versions') {
            // Get document versions history
            const versions = await base44.asServiceRole.entities.DocumentVersion.filter({
                document_id: document_id
            }, '-version_number', 50);

            return Response.json({
                versions: versions,
                total: versions.length
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Collaboration error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function generateUserColor(userId) {
    // Deterministische Farbe basierend auf User ID
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A8E6CF'
    ];
    
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
}