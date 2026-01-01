// updated 1126
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

      // [2026-01-01] FIX: .single() causes 406 when 0 rows -> use maybeSingle()
      let profile = null;

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // ✅ instead of .single()

      // [2026-01-01] FIX: if profile row doesn't exist, create it (common after DB reset)
      // maybeSingle() returns { data: null, error: null } when no rows
      if (profileError) {
        // In practice, maybeSingle should not throw "0 rows" here, but keep safe:
        throw profileError;
      }

      if (!profileData) {
        const baseProfile = {
          id: user.id,
          // keep your existing columns safe; only set what exists
          accepted_tos_date: null,
          primary_venture_id: null,
          username: null,
        };

        const { data: inserted, error: insertErr } = await supabase
          .from('user_profiles')
          .insert([baseProfile])
          .select('*')
          .single();

        if (insertErr) throw insertErr;
        profile = inserted;
      } else {
        profile = profileData;
      }

      return {
        ...user,
        email: user.email,

        // Keep backwards compat fields used around the app
        full_name: profile?.full_name || user.email,
        role: profile?.role || 'user',

        // [2026-01-01] IMPORTANT: spread profile last so primary_venture_id / username are available
        ...profile,
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

    // [2026-01-01] NOTE: upsert is fine; it will create the row if missing
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


