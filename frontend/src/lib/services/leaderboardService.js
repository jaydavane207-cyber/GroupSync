import { supabase } from '../supabase/client';
import { withRetry } from '../withRetry';

export const leaderboardService = {
  async getLeaderboard(limit = 50) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, xp, credibility_score, college')
        .order('xp', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    });
  },
};

export default leaderboardService;

