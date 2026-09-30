import { supabase } from './client';

export const fetchUserProfile = async (userId) => {
  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
};

export const fetchUserProjects = async (userId) => {
  return await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
};

export const fetchUserTeams = async (userId) => {
  return await supabase
    .from('team_members')
    .select('*, team:teams(*)')
    .eq('user_id', userId);
};

export const fetchAllTeams = async (filters = {}) => {
  let query = supabase.from('teams').select('*').order('created_at', { ascending: false });
  if (filters.status) query = query.eq('status', filters.status);
  return await query;
};

export default {
  fetchUserProfile,
  fetchUserProjects,
  fetchUserTeams,
  fetchAllTeams,
};
