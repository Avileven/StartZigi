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
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) return null;

    // Get additional user data from user_profiles table if needed
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { 
      ...user, 
      email: user.email, 
      full_name: profile?.full_name || user.email, 
      role: profile?.role || 'user', 
      ...profile 
    };
  },

  updateMe: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('user_profiles')
      .upsert({ id: user.id, ...data });

    if (error) throw error;
  },

  logout: async (redirectUrl) => {
    await supabase.auth.signOut();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.location.reload();
    }
  },

  redirectToLogin: async (nextUrl) => {
    const url = nextUrl ? `/login?next=${encodeURIComponent(nextUrl)}` : '/login';
    window.location.href = url;
  },

  isAuthenticated: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  }
};