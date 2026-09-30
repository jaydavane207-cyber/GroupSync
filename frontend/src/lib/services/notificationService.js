import { supabase } from '../supabase/client';
import { withRetry } from '../withRetry';

export const notificationService = {
  async getNotifications(userId) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    });
  },

  async markAsRead(notificationId) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  },

  async markAllAsRead(userId) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId);
      if (error) throw error;
      return data;
    });
  },
};

export default notificationService;

