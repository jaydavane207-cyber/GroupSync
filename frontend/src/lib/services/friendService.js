import { supabase } from '../supabase/client';
import { withRetry } from '../withRetry';

export const friendService = {
  async getFriends(userId) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('friends')
        .select('*, friend:profiles!friend_id(*)')
        .eq('user_id', userId);
      if (error) throw error;
      return data || [];
    });
  },

  async sendFriendRequest(userId, friendId) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('friends')
        .insert([{ user_id: userId, friend_id: friendId, status: 'pending' }])
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  },

  async acceptFriendRequest(requestId) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  },
};

export default friendService;

