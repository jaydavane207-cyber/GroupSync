import { supabase } from '../supabase/client';
import { withRetry } from '../withRetry';

export const skillService = {
  async getAvailableSkills() {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('name', { ascending: true });
      if (error) return [];
      return data || [];
    });
  },

  async getUserSkills(userId) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('user_skills')
        .select('*, skill:skills(*)')
        .eq('user_id', userId);
      if (error) return [];
      return data || [];
    });
  },
};

export default skillService;

