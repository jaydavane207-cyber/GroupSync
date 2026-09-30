import { supabase } from './client';

export const signUpWithEmail = async (email, password, metadata = {}) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
};

export const signInWithEmail = async (email, password) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signInWithOAuth = async (provider) => {
  return await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.origin,
    },
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentSession = async () => {
  return await supabase.auth.getSession();
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export default {
  signUpWithEmail,
  signInWithEmail,
  signInWithOAuth,
  signOut,
  getCurrentSession,
  getCurrentUser,
};
