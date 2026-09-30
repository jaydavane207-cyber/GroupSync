import { supabase } from '../supabase/client';
import { withRetry } from '../withRetry';

export const projectService = {
  async getAllProjects() {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    });
  },

  async getProjectById(id) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    });
  },

  async createProject(projectData) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  },

  async updateProject(id, updates) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  },

  async deleteProject(id) {
    return withRetry(async () => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      return true;
    });
  },
};

export default projectService;

