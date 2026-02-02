import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

export default function useSupabaseProjectsAdvanced() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const subscriptionRef = useRef(null);
  const offlineCacheKey = 'projects_offline_cache';

  // Offline/Online Detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await base44.functions.invoke('supabaseProjectsCRUD', {
        action: 'list'
      });

      if (response.data?.success) {
        setProjects(response.data.data);
        // Cache für offline
        localStorage.setItem(offlineCacheKey, JSON.stringify(response.data.data));
      }
    } catch (err) {
      setError(err.message);
      // Fallback zu Cache
      const cached = localStorage.getItem(offlineCacheKey);
      if (cached) {
        setProjects(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('supabase_access_token');
    if (token) {
      fetchProjects();
    }
  }, []);

  // Real-time Subscriptions
  useEffect(() => {
    const supabaseUrl = localStorage.getItem('supabase_url');
    const token = localStorage.getItem('supabase_access_token');

    if (!supabaseUrl || !token) return;

    // WebSocket für Real-time Updates
    const setupSubscription = async () => {
      try {
        // Hier würde die echte Supabase-Subscription laufen
        // Aktuell nutzen wir Polling als Fallback
        const interval = setInterval(() => {
          if (isOnline) {
            fetchProjects();
          }
        }, 5000); // Alle 5 Sekunden checken

        subscriptionRef.current = interval;
      } catch (err) {
        console.error('Subscription error:', err);
      }
    };

    setupSubscription();

    return () => {
      if (subscriptionRef.current) {
        clearInterval(subscriptionRef.current);
      }
    };
  }, [isOnline]);

  // Optimistic Update Helper
  const optimisticUpdate = (id, updates) => {
    setProjects(projects.map(p =>
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  // CREATE with Optimistic Update
  const createProject = async (name, description) => {
    const optimisticId = 'temp_' + Date.now();
    const optimisticProject = {
      id: optimisticId,
      name,
      description,
      created_at: new Date().toISOString(),
      _optimistic: true
    };

    // Sofort anzeigen
    setProjects([optimisticProject, ...projects]);

    try {
      const response = await base44.functions.invoke('supabaseProjectsCRUD', {
        action: 'create',
        data: { name, description }
      });

      if (response.data?.success) {
        // Optimistic ID durch echte ID ersetzen
        setProjects(projects =>
          projects.map(p =>
            p.id === optimisticId ? response.data.data : p
          )
        );
        localStorage.setItem(offlineCacheKey, JSON.stringify(
          projects.map(p => p.id === optimisticId ? response.data.data : p)
        ));
        return { success: true, data: response.data.data };
      }

      throw new Error(response.data?.error);
    } catch (err) {
      // Bei Fehler: Optimistic Project entfernen
      setProjects(projects => projects.filter(p => p.id !== optimisticId));
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // UPDATE with Optimistic Update
  const updateProject = async (id, name, description) => {
    const oldProject = projects.find(p => p.id === id);
    optimisticUpdate(id, { name, description });

    try {
      const response = await base44.functions.invoke('supabaseProjectsCRUD', {
        action: 'update',
        id,
        data: { name, description }
      });

      if (response.data?.success) {
        localStorage.setItem(offlineCacheKey, JSON.stringify(
          projects.map(p => p.id === id ? response.data.data : p)
        ));
        return { success: true };
      }

      // Revert bei Fehler
      if (oldProject) optimisticUpdate(id, oldProject);
      throw new Error(response.data?.error);
    } catch (err) {
      if (oldProject) optimisticUpdate(id, oldProject);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // DELETE
  const deleteProject = async (id) => {
    const deletedProject = projects.find(p => p.id === id);
    setProjects(projects => projects.filter(p => p.id !== id));

    try {
      const response = await base44.functions.invoke('supabaseProjectsCRUD', {
        action: 'delete',
        id
      });

      if (response.data?.success) {
        localStorage.setItem(offlineCacheKey, JSON.stringify(
          projects.filter(p => p.id !== id)
        ));
        return { success: true };
      }

      // Revert bei Fehler
      if (deletedProject) {
        setProjects(projects => [...projects, deletedProject]);
      }
      throw new Error(response.data?.error);
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // BULK Operations
  const bulkCreate = async (projectsList) => {
    try {
      const response = await base44.functions.invoke('supabaseProjectsAdvanced', {
        action: 'bulk-create',
        projects: projectsList
      });

      if (response.data?.success) {
        setProjects([...response.data.data, ...projects]);
        localStorage.setItem(offlineCacheKey, JSON.stringify(
          [...response.data.data, ...projects]
        ));
        return { success: true };
      }

      throw new Error(response.data?.error);
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const bulkDelete = async (ids) => {
    const deleted = projects.filter(p => ids.includes(p.id));
    setProjects(projects => projects.filter(p => !ids.includes(p.id)));

    try {
      const response = await base44.functions.invoke('supabaseProjectsAdvanced', {
        action: 'bulk-delete',
        ids
      });

      if (response.data?.success) {
        localStorage.setItem(offlineCacheKey, JSON.stringify(
          projects.filter(p => !ids.includes(p.id))
        ));
        return { success: true };
      }

      // Revert
      setProjects(p => [...deleted, ...p]);
      throw new Error(response.data?.error);
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Audit Log
  const getAuditLog = async (projectId) => {
    try {
      const response = await base44.functions.invoke('supabaseProjectsAdvanced', {
        action: 'get-audit',
        projectId
      });

      if (response.data?.success) {
        return { success: true, data: response.data.data };
      }

      throw new Error(response.data?.error);
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    projects,
    loading,
    error,
    isOnline,
    createProject,
    updateProject,
    deleteProject,
    bulkCreate,
    bulkDelete,
    getAuditLog,
    refresh: fetchProjects
  };
}