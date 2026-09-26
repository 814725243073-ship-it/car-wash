import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check for runtime override if env contains placeholder
function getActiveUrl(): string {
  if (envUrl && envUrl.startsWith('http') && !envUrl.includes('PASTE_YOUR_SUPABASE_URL_HERE')) {
    return envUrl;
  }
  const custom = typeof window !== 'undefined' ? localStorage.getItem('aura_custom_supabase_url') : null;
  if (custom && custom.startsWith('http')) {
    return custom;
  }
  return '';
}

function getActiveAnonKey(): string {
  if (envAnonKey && envAnonKey.length > 20 && !envAnonKey.includes('PASTE_YOUR_PUBLISHABLE_KEY_HERE')) {
    return envAnonKey;
  }
  const custom = typeof window !== 'undefined' ? localStorage.getItem('aura_custom_supabase_anon_key') : null;
  if (custom && custom.length > 20) {
    return custom;
  }
  return '';
}

const activeUrl = getActiveUrl();
const activeKey = getActiveAnonKey();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(activeUrl && activeKey && activeUrl.startsWith('http'));
};

// Safe fallback URL for client initialization if unconfigured
const fallbackUrl = 'https://placeholder-carwash.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? activeUrl : fallbackUrl,
  isSupabaseConfigured() ? activeKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export function setCustomSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('aura_custom_supabase_url', url.trim());
    localStorage.setItem('aura_custom_supabase_anon_key', key.trim());
    window.location.reload();
  }
}
