import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSupabaseAuth from './useSupabaseAuth';
import { createPageUrl } from '@/utils';

export default function SupabaseAuthGuard({ children }) {
  const { isAuthenticated, loading } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(createPageUrl('Login'));
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}