import { base44 } from '@/api/base44Client';
import { supabase } from './supabase';

/**
 * Synchronisiert Base44 User mit Supabase user_profiles Tabelle
 * @param {Object} base44User - Der Base44 User (von base44.auth.me())
 * @returns {Object} Das Supabase User-Profil
 */
export async function syncUserToSupabase(base44User) {
    if (!base44User) {
        throw new Error('Kein Base44 User vorhanden');
    }

    try {
        // Prüfen ob User bereits in Supabase existiert
        const { data: existingProfile, error: fetchError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('base44_user_id', base44User.id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
            console.error('Fehler beim Abrufen des User-Profils:', fetchError);
            throw fetchError;
        }

        const now = new Date().toISOString();

        if (!existingProfile) {
            // User existiert nicht in Supabase -> Neu anlegen
            const { data: newProfile, error: insertError } = await supabase
                .from('user_profiles')
                .insert({
                    base44_user_id: base44User.id,
                    email: base44User.email,
                    full_name: base44User.full_name || base44User.email,
                    role: base44User.role || 'user',
                    created_at: now,
                    last_login_at: now
                })
                .select()
                .single();

            if (insertError) {
                console.error('Fehler beim Erstellen des User-Profils:', insertError);
                throw insertError;
            }

            console.log('Neues User-Profil in Supabase erstellt:', newProfile);
            return newProfile;
        } else {
            // User existiert -> Last login aktualisieren
            const { data: updatedProfile, error: updateError } = await supabase
                .from('user_profiles')
                .update({
                    email: base44User.email,
                    full_name: base44User.full_name || base44User.email,
                    role: base44User.role || 'user',
                    last_login_at: now
                })
                .eq('base44_user_id', base44User.id)
                .select()
                .single();

            if (updateError) {
                console.error('Fehler beim Aktualisieren des User-Profils:', updateError);
                throw updateError;
            }

            console.log('User-Profil in Supabase aktualisiert:', updatedProfile);
            return updatedProfile;
        }
    } catch (error) {
        console.error('Fehler bei User-Synchronisierung:', error);
        throw error;
    }
}

/**
 * Synchronisiert Supabase User mit user_profiles Tabelle
 * @param {Object} supabaseUser - Der Supabase User
 * @returns {Object} Das Supabase User-Profil
 */
export async function syncUserProfile(supabaseUser) {
    if (!supabaseUser) {
        throw new Error('Kein Supabase User vorhanden');
    }

    try {
        // Prüfen ob User bereits in user_profiles existiert
        const { data: existingProfile, error: fetchError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Fehler beim Abrufen des User-Profils:', fetchError);
            throw fetchError;
        }

        const now = new Date().toISOString();

        if (!existingProfile) {
            // User existiert nicht -> Neu anlegen
            const { data: newProfile, error: insertError } = await supabase
                .from('user_profiles')
                .insert({
                    id: supabaseUser.id,
                    email: supabaseUser.email,
                    created_at: now,
                    last_login_at: now
                })
                .select()
                .single();

            if (insertError) {
                console.error('Fehler beim Erstellen des User-Profils:', insertError);
                throw insertError;
            }

            return newProfile;
        } else {
            // User existiert -> Last login aktualisieren
            const { data: updatedProfile, error: updateError } = await supabase
                .from('user_profiles')
                .update({
                    last_login_at: now
                })
                .eq('id', supabaseUser.id)
                .select()
                .single();

            if (updateError) {
                console.error('Fehler beim Aktualisieren des User-Profils:', updateError);
                throw updateError;
            }

            return updatedProfile;
        }
    } catch (error) {
        console.error('Fehler bei User-Synchronisierung:', error);
        throw error;
    }
}

/**
 * Ruft das Supabase-Profil für einen User ab
 * @param {string} userId - Die Supabase User ID
 * @returns {Object} Das Supabase User-Profil
 */
export async function getSupabaseProfile(userId) {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Fehler beim Abrufen des Supabase-Profils:', error);
        return null;
    }

    return data;
}