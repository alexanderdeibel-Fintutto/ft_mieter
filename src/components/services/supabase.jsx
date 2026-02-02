import { createClient } from '@supabase/supabase-js';

// PUBLIC Supabase Keys - sicher im Frontend
// (Row Level Security schützt die Daten)
const SUPABASE_URL = 'https://aaefocdqgdgexkcrjhks.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZWZvY2RxZ2RnZXhrY3JqaGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjA0NzAsImV4cCI6MjA4NDMzNjQ3MH0.qsLTEZo7shbafWY9w4Fo7is9GDW-1Af1wup_iCy2vVQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper: Aktuellen User holen
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}

// Helper: User-Profil holen
export async function getUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*, primary_org:organizations(*)')
    .eq('id', user.id)
    .single();
  
  return error ? null : data;
}

// Helper: Alle Orgs des Users
export async function getUserOrgs() {
  const user = await getCurrentUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('org_memberships')
    .select('role, status, organizations(*)')
    .eq('user_id', user.id)
    .eq('status', 'active');
  
  if (error) return [];
  return data.map(m => ({ ...m.organizations, role: m.role }));
}

// Alias for getUserOrgs (for compatibility)
export async function getUserOrganizations(userId) {
  const { data, error } = await supabase
    .from('org_memberships')
    .select('role, status, organizations(*)')
    .eq('user_id', userId)
    .eq('status', 'active');
  
  if (error) return [];
  return data.map(m => ({ ...m.organizations, role: m.role }));
}

// Helper: Primary Org des Users holen
export async function getPrimaryOrg() {
  const profile = await getUserProfile();
  return profile?.primary_org || null;
}

export default supabase;