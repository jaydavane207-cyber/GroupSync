import { supabase } from '../supabase/client';
import { withRetry } from '../withRetry';

export const authService = {
  async register(email, password, fullName) {
    return withRetry(async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) throw error;
      return data;
    });
  },

  async login(email, password) {
    return withRetry(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    });
  },

  async loginWithGoogle() {
    return withRetry(async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      return data;
    });
  },

  async logout() {
    return withRetry(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    });
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },
};

export default authService;

