import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Custom Hook für Real-time Collaboration Features
 */
export function useRealtimeCollaboration(documentId, organizationId) {
    const [collaborators, setCollaborators] = useState([]);
    const [userColor, setUserColor] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Start editing
    const startEditing = useCallback(async () => {
        try {
            const response = await base44.functions.invoke('collaborateOnDocument', {
                action: 'start_editing',
                document_id: documentId,
                organization_id: organizationId
            });

            setUserColor(response.data.color);
            setIsEditing(true);

            // Subscribe to collaboration changes
            const unsubscribe = base44.entities.DocumentCollaboration.subscribe((event) => {
                if (event.data?.document_id === documentId) {
                    loadCollaborators();
                }
            });

            return unsubscribe;
        } catch (error) {
            console.error('Start editing error:', error);
        }
    }, [documentId, organizationId]);

    // End editing
    const endEditing = useCallback(async () => {
        try {
            await base44.functions.invoke('collaborateOnDocument', {
                action: 'end_editing',
                document_id: documentId,
                organization_id: organizationId
            });

            setIsEditing(false);
        } catch (error) {
            console.error('End editing error:', error);
        }
    }, [documentId, organizationId]);

    // Update cursor position
    const updateCursorPosition = useCallback(async (position, selection) => {
        try {
            await base44.functions.invoke('collaborateOnDocument', {
                action: 'update_content',
                document_id: documentId,
                organization_id: organizationId,
                cursor_position: position,
                selection_range: selection
            });
        } catch (error) {
            console.error('Update cursor error:', error);
        }
    }, [documentId, organizationId]);

    // Save version
    const saveVersion = useCallback(async (content, description) => {
        try {
            const response = await base44.functions.invoke('collaborateOnDocument', {
                action: 'save_version',
                document_id: documentId,
                organization_id: organizationId,
                content: content,
                change_description: description
            });

            return response.data.version;
        } catch (error) {
            console.error('Save version error:', error);
            throw error;
        }
    }, [documentId, organizationId]);

    // Load collaborators
    const loadCollaborators = useCallback(async () => {
        try {
            const response = await base44.functions.invoke('collaborateOnDocument', {
                action: 'get_collaborators',
                document_id: documentId,
                organization_id: organizationId
            });

            setCollaborators(response.data.collaborators || []);
        } catch (error) {
            console.error('Load collaborators error:', error);
        }
    }, [documentId, organizationId]);

    // Setup and cleanup
    useEffect(() => {
        loadCollaborators();

        // Poll for collaborators changes
        const interval = setInterval(loadCollaborators, 3000);

        return () => {
            clearInterval(interval);
            if (isEditing) {
                endEditing();
            }
        };
    }, [documentId, organizationId, isEditing]);

    return {
        collaborators,
        userColor,
        isEditing,
        startEditing,
        endEditing,
        updateCursorPosition,
        saveVersion,
        loadCollaborators
    };
}