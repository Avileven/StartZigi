//supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth utilities
export const auth = {
  me: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      // Sometimes Supabase returns an error object instead of throwing
      if (error) {
        if (error?.name === 'AuthSessionMissingError') return null;
        throw error;
      }

      // No authenticated user
      if (!user) return null;

      // Get additional user data from user_profiles table if needed
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      return {
        ...user,
        email: user.email,
        full_name: profile?.full_name || user.email,
        role: profile?.role || 'user',
        ...profile
      };
    } catch (err) {
      // Supabase can throw when session is missing
      if (err?.name === 'AuthSessionMissingError') return null;
      throw err;
    }
  },

  updateMe: async (data) => {
    let user = null;

    try {
      const { data: { user: u }, error } = await supabase.auth.getUser();
      if (error) {
        if (error?.name === 'AuthSessionMissingError') user = null;
        else throw error;
      } else {
        user = u ?? null;
      }
    } catch (err) {
      if (err?.name === 'AuthSessionMissingError') user = null;
      else throw err;
    }

    if (!user) throw new Error('Not authenticated');

    const { error: upsertError } = await supabase
      .from('user_profiles')
      .upsert({ id: user.id, ...data });

    if (upsertError) throw upsertError;
  },

  logout: async (redirectUrl) => {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        window.location.reload();
      }
    }
  },

  redirectToLogin: async (nextUrl) => {
    if (typeof window !== 'undefined') {
      const url = nextUrl ? `/login?next=${encodeURIComponent(nextUrl)}` : '/login';
      window.location.href = url;
    }
  },

  isAuthenticated: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        if (error?.name === 'AuthSessionMissingError') return false;
        throw error;
      }

      return !!user;
    } catch (err) {
      if (err?.name === 'AuthSessionMissingError') return false;
      throw err;
    }
  }
};
