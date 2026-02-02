import { useState, useEffect } from 'react';
import { supabase } from './services/supabase';

/**
 * Hook for real-time Supabase subscriptions
 * @param {string} tableName - The table to subscribe to
 * @param {object} filter - Filter conditions (e.g., { org_id: '123' })
 * @param {object} options - Additional options
 * @returns {object} { data, loading, error, refetch }
 */
export default function useRealtimeSubscription(tableName, filter = {}, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = supabase.from(tableName).select('*');

      // Apply filters
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data: fetchedData, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setData(fetchedData || []);
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${tableName}:`, err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Build filter string for subscription
    const filterConditions = Object.entries(filter)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}=eq.${value}`)
      .join(',');

    // Setup real-time subscription
    const channel = supabase
      .channel(`${tableName}_${JSON.stringify(filter)}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: filterConditions || undefined
        },
        (payload) => {
          console.log(`${tableName} change:`, payload);

          if (payload.eventType === 'INSERT') {
            // Check if new record matches filter
            const matchesFilter = Object.entries(filter).every(
              ([key, value]) => payload.new[key] === value
            );
            
            if (matchesFilter) {
              setData((current) => [payload.new, ...current]);
            }
          } else if (payload.eventType === 'UPDATE') {
            setData((current) =>
              current.map((item) =>
                item.id === payload.new.id ? payload.new : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setData((current) =>
              current.filter((item) => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, JSON.stringify(filter)]);

  return { data, loading, error, refetch: fetchData };
}