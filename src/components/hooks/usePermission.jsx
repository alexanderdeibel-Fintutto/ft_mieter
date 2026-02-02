import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook für Permission-Checks in Frontend-Komponenten
 * Nutzt die zentrale checkPermission Funktion
 */
export function usePermission(appId, entityType, action = 'view', entityId = null) {
    const [permission, setPermission] = useState({
        hasPermission: false,
        loading: true,
        error: null,
        seatType: null
    });

    useEffect(() => {
        checkPermission();
    }, [appId, entityType, action, entityId]);

    const checkPermission = async () => {
        try {
            setPermission(prev => ({ ...prev, loading: true }));
            
            const response = await base44.functions.invoke('checkPermission', {
                app_id: appId,
                action: action,
                entity_type: entityType,
                entity_id: entityId
            });

            setPermission({
                hasPermission: response.data.has_permission,
                loading: false,
                error: response.data.reason,
                seatType: response.data.seat_type
            });
        } catch (err) {
            console.error('Permission check failed:', err);
            setPermission({
                hasPermission: false,
                loading: false,
                error: err.message,
                seatType: null
            });
        }
    };

    return permission;
}

/**
 * Hook für Permissions basierend auf Seat Type
 */
export function useSeatType(appId) {
    const [seatType, setSeatType] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSeatType();
    }, [appId]);

    const fetchSeatType = async () => {
        try {
            setLoading(true);
            const user = await base44.auth.me();
            if (!user) {
                setLoading(false);
                return;
            }

            const allocations = await base44.entities.SeatAllocation.filter({
                receiving_user_id: user.id,
                app_id: appId,
                is_active: true
            });

            setSeatType(allocations[0]?.seat_type || null);
        } catch (err) {
            console.error('Fetch seat type error:', err);
        } finally {
            setLoading(false);
        }
    };

    return { seatType, loading };
}