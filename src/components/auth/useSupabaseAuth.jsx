import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function useSupabaseAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('supabase_access_token');

      if (token) {
        const response = await base44.functions.invoke('supabaseAuth', {
          action: 'verify-token'
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data?.success) {
          setUser(response.data.user);
        } else {
          localStorage.removeItem('supabase_access_token');
          localStorage.removeItem('supabase_refresh_token');
        }
      }
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await base44.functions.invoke('supabaseAuth', {
        action: 'login',
        email,
        password
      });

      if (response.data?.success) {
        const { user, session } = response.data;
        localStorage.setItem('supabase_access_token', session.access_token);
        localStorage.setItem('supabase_refresh_token', session.refresh_token);
        setUser(user);
        return { success: true, user };
      }

      throw new Error(response.data?.error || 'Login failed');
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const register = async (email, password) => {
    try {
      setError(null);
      const response = await base44.functions.invoke('supabaseAuth', {
        action: 'register',
        email,
        password
      });

      if (response.data?.success) {
        return { success: true, message: response.data.message };
      }

      throw new Error(response.data?.error || 'Registration failed');
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      setError(null);
      const response = await base44.functions.invoke('supabaseAuth', {
        action: 'logout'
      });

      if (response.data?.success) {
        localStorage.removeItem('supabase_access_token');
        localStorage.removeItem('supabase_refresh_token');
        setUser(null);
        return { success: true };
      }

      throw new Error(response.data?.error || 'Logout failed');
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      const response = await base44.functions.invoke('supabaseAuth', {
        action: 'reset-password',
        email
      });

      if (response.data?.success) {
        return { success: true, message: response.data.message };
      }

      throw new Error(response.data?.error || 'Reset failed');
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    isAuthenticated: !!user
  };
}