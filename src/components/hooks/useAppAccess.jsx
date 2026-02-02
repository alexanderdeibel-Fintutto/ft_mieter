import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export function useAppAccess(appId) {
    const [access, setAccess] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const checkAccess = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await base44.functions.invoke('getUserAppAccess', {
                p_app_id: appId
            });
            setAccess(response.data);
            return response.data;
        } catch (err) {
            setError(err.message);
            setAccess({ has_access: false });
        } finally {
            setLoading(false);
        }
    }, [appId]);

    useEffect(() => {
        checkAccess();
    }, [checkAccess]);

    return { access, loading, error, checkAccess };
}

export function useLimitCheck(appId, limitKey) {
    const [limit, setLimit] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const checkLimit = useCallback(async (currentCount) => {
        setLoading(true);
        setError(null);

        try {
            const response = await base44.functions.invoke('checkLimit', {
                p_app_id: appId,
                p_limit_key: limitKey,
                p_current_count: currentCount
            });
            setLimit(response.data);
            return response.data;
        } catch (err) {
            setError(err.message);
            return { allowed: false };
        } finally {
            setLoading(false);
        }
    }, [appId, limitKey]);

    return { limit, loading, error, checkLimit };
}