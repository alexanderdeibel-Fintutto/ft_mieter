import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getSupabaseProfile } from './services/userSync';

export default function useAuth() {
    const [user, setUser] = React.useState(null);
    const [supabaseProfile, setSupabaseProfile] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        initAuth();
    }, []);

    const initAuth = async () => {
        try {
            // Base44 User abrufen
            const isAuth = await base44.auth.isAuthenticated();
            
            if (isAuth) {
                const base44User = await base44.auth.me();
                setUser(base44User);
                
                // Sync mit Supabase durchführen
                try {
                    const syncResult = await base44.functions.invoke('syncUserWithSupabase');
                    
                    // Supabase Profil laden
                    if (syncResult.data?.supabase_user_id) {
                        await loadProfile(syncResult.data.supabase_user_id);
                    }
                } catch (syncError) {
                    // Sicheres Error-Logging ohne stack.match() Zugriff
                    const errorMessage = syncError?.message || 'Unknown error';
                    const errorStatus = syncError?.response?.status || syncError?.status;
                    const errorCode = syncError?.code;
                    
                    console.warn('User sync failed:', {
                        message: errorMessage,
                        status: errorStatus,
                        code: errorCode
                    });
                }
            }
        } catch (error) {
            console.error('Auth initialization failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadProfile = async (supabaseUserId) => {
        try {
            const profile = await getSupabaseProfile(supabaseUserId);
            setSupabaseProfile(profile);
        } catch (error) {
            console.warn('Failed to load profile:', error);
        }
    };

    const logout = async () => {
        try {
            await base44.auth.logout();
            setUser(null);
            setSupabaseProfile(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const refreshProfile = async () => {
        if (!user?.supabase_user_id) return;
        await loadProfile(user.supabase_user_id);
    };

    const isOnboardingComplete = supabaseProfile?.onboarding_completed === true;

    return {
        user,
        supabaseProfile,
        loading,
        logout,
        refreshProfile,
        isAuthenticated: !!user,
        isOnboardingComplete
    };
}