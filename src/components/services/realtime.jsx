import { supabase } from './supabase';
import { useEffect, useState } from 'react';

// Generischer Realtime Hook für jede Tabelle
export function useRealtimeTable(tableName, initialData = []) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Initiale Daten laden
    const fetchData = async () => {
      const { data: fetchedData, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && fetchedData) {
        setData(fetchedData);
      }
      setLoading(false);
    };

    fetchData();

    // Realtime-Subscription einrichten
    const channel = supabase
      .channel(`${tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName
        },
        (payload) => {
          console.log(`${tableName} change:`, payload);
          
          if (payload.eventType === 'INSERT') {
            setData((current) => [payload.new, ...current]);
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

    // Cleanup bei Unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName]);

  return { data, loading };
}

// Realtime Hook mit Filter
export function useRealtimeQuery(tableName, filterFn = null, initialData = []) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Initiale Daten laden
    const fetchData = async () => {
      let query = supabase.from(tableName).select('*');
      
      const { data: fetchedData, error } = await query.order('created_at', { ascending: false });
      
      if (!error && fetchedData) {
        const filtered = filterFn ? fetchedData.filter(filterFn) : fetchedData;
        setData(filtered);
      }
      setLoading(false);
    };

    fetchData();

    // Realtime-Subscription
    const channel = supabase
      .channel(`${tableName}_filtered_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            if (!filterFn || filterFn(payload.new)) {
              setData((current) => [payload.new, ...current]);
            }
          } else if (payload.eventType === 'UPDATE') {
            setData((current) => {
              const shouldInclude = !filterFn || filterFn(payload.new);
              const exists = current.some(item => item.id === payload.new.id);
              
              if (shouldInclude && exists) {
                return current.map((item) =>
                  item.id === payload.new.id ? payload.new : item
                );
              } else if (shouldInclude && !exists) {
                return [payload.new, ...current];
              } else if (!shouldInclude && exists) {
                return current.filter((item) => item.id !== payload.new.id);
              }
              return current;
            });
          } else if (payload.eventType === 'DELETE') {
            setData((current) =>
              current.filter((item) => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, filterFn]);

  return { data, loading, setData };
}

// Spezifische Hooks für häufige Use Cases

// Hook für Immobilien (Vermietify)
export function useRealtimeProperties(userId) {
  return useRealtimeQuery(
    'properties',
    (property) => property.user_id === userId
  );
}

// Hook für Mietzahlungen (Vermietify)
export function useRealtimeRentPayments(propertyId) {
  return useRealtimeQuery(
    'rent_payments',
    propertyId ? (payment) => payment.property_id === propertyId : null
  );
}

// Hook für Organisation Members
export function useRealtimeOrgMembers(orgId) {
  return useRealtimeQuery(
    'org_memberships',
    (member) => member.org_id === orgId && member.status === 'active'
  );
}

// Hook für User Profile
export function useRealtimeUserProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*, primary_org:organizations(*)')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();

    const channel = supabase
      .channel(`user_profile_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          setProfile((current) => ({ ...current, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { profile, loading, setProfile };
}

// Single Record Realtime Hook
export function useRealtimeRecord(tableName, recordId) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !recordId) {
      setLoading(false);
      return;
    }

    const fetchRecord = async () => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', recordId)
        .single();
      
      if (!error && data) {
        setRecord(data);
      }
      setLoading(false);
    };

    fetchRecord();

    const channel = supabase
      .channel(`${tableName}_${recordId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: `id=eq.${recordId}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setRecord(payload.new);
          } else if (payload.eventType === 'DELETE') {
            setRecord(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, recordId]);

  return { record, loading, setRecord };
}