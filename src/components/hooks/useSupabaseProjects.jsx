import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function useSupabaseProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('supabase_access_token');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await base44.functions.invoke('supabaseProjectsCRUD', {
        action: 'list'
      });

      if (response.data?.success) {
        setProjects(response.data.data);
      } else {
        setError(response.data?.error || 'Fehler beim Laden');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token]);

  const createProject = async (name, description) => {
    try {
      setError(null);

      const response = await base44.functions.invoke('supabaseProjectsCRUD', {
        action: 'create',
        data: { name, description }
      });

      if (response.data?.success) {
        setProjects([response.data.data, ...projects]);
        return { success: true, data: response.data.data };
      }

      throw new Error(response.data?.error || 'Fehler beim Erstellen');
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateProject = async (id, name, description) => {
    try {
      setError(null);

      const response = await base44.functions.invoke('supabaseProjectsCRUD', {
        action: 'update',
        id,
        data: { name, description }
      });

      if (response.data?.success) {
        setProjects(
          projects.map(p => p.id === id ? response.data.data : p)
        );
        return { success: true, data: response.data.data };
      }

      throw new Error(response.data?.error || 'Fehler beim Aktualisieren');
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteProject = async (id) => {
    try {
      setError(null);

      const response = await base44.functions.invoke('supabaseProjectsCRUD', {
        action: 'delete',
        id
      });

      if (response.data?.success) {
        setProjects(projects.filter(p => p.id !== id));
        return { success: true };
      }

      throw new Error(response.data?.error || 'Fehler beim Löschen');
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: fetchProjects
  };
}