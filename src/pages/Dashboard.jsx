import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, LogOut, User, Package } from 'lucide-react';
import useAuth from '../components/useAuth';
import { supabase } from '../components/services/supabase';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, supabaseProfile, isOnboardingComplete, loading } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/Register');
      } else if (!isOnboardingComplete) {
        navigate('/Billing');
      }
    }
  }, [user, isOnboardingComplete, loading, navigate]);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/Register');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Template Core</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {supabaseProfile?.first_name || 'Benutzer'}
              </p>
              <p className="text-xs text-gray-500">
                Plan: {supabaseProfile?.selected_plan || 'Free'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Ausloggen"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Willkommen{supabaseProfile?.first_name ? `, ${supabaseProfile.first_name}` : ''}! 🎉
          </h2>
          <p className="text-blue-100">
            Dein Konto ist eingerichtet und bereit. Dies ist ein Platzhalter-Dashboard, 
            das in der finalen App individuell gestaltet wird.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Profil</h3>
            <p className="text-sm text-gray-600 mb-3">
              {supabaseProfile?.email || user?.email}
            </p>
            <p className="text-xs text-gray-400">
              Anrede: {supabaseProfile?.salutation === 'Du' ? 'Du' : 'Sie'}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Aktueller Plan</h3>
            <p className="text-sm text-gray-600 mb-3 capitalize">
              {supabaseProfile?.selected_plan || 'Free'}
            </p>
            <button 
              onClick={() => navigate('/Billing')}
              className="text-xs text-blue-600 hover:underline"
            >
              Plan ändern
            </button>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Einstellungen</h3>
            <p className="text-sm text-gray-600 mb-3">
              Konto & Präferenzen
            </p>
            <button 
              onClick={() => navigate('/Profile')}
              className="text-xs text-blue-600 hover:underline"
            >
              Öffnen
            </button>
          </div>
          
        </div>
        
        <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Template Dashboard
            </h3>
            <p className="text-gray-500 text-sm">
              Dieser Bereich wird in der finalen App mit den spezifischen Funktionen 
              der jeweiligen Anwendung gefüllt.
            </p>
          </div>
        </div>
        
      </main>
      
    </div>
  );
}