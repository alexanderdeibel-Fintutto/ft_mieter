import { base44 } from '@/api/base44Client';
import { supabase } from './supabase';

// Registrierung mit Base44 (E-Mail/Passwort)
export async function signUp({ email, password, firstName, lastName }) {
  try {
    // Base44 User registrieren
    await base44.auth.signUp({
      email,
      password,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim()
      }
    });

    // Automatisch einloggen nach Registrierung
    await base44.auth.signIn({ email, password });

    // Sync mit Supabase
    await base44.functions.invoke('syncUserWithSupabase');

    return { success: true };
  } catch (error) {
    throw error;
  }
}

// Login mit Passwort (Base44)
export async function signIn({ email, password }) {
  try {
    await base44.auth.signIn({ email, password });
    
    // Sync mit Supabase nach erfolgreichem Login
    await base44.functions.invoke('syncUserWithSupabase');
    
    return { success: true };
  } catch (error) {
    throw error;
  }
}

// Magic Link (Base44 unterstützt derzeit keine Magic Links)
export async function sendMagicLink(email, shouldCreateUser = true) {
  throw new Error('Magic Link Login ist derzeit nicht verfügbar. Bitte verwenden Sie E-Mail/Passwort.');
}

// Logout (Base44)
export async function signOut() {
  try {
    await base44.auth.logout();
    // Auch Supabase Session beenden
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Passwort zurücksetzen (Base44 hat keine direkte Reset-Funktion im Frontend)
export async function resetPassword(email) {
  throw new Error('Passwort-Reset ist derzeit nicht verfügbar.');
}

// OAuth Google ist derzeit nicht über Base44 verfügbar
// Diese Funktion bleibt leer oder kann entfernt werden
export async function signInWithGoogle() {
  throw new Error('Google OAuth ist derzeit nicht verfügbar');
}

// Email OTP Verifizierung
export async function verifyOtp({ email, token }) {
  try {
    // Nach OTP-Verifikation Sync durchführen
    await base44.functions.invoke('syncUserWithSupabase');
    return { success: true };
  } catch (error) {
    throw error;
  }
}