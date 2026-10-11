import { supabase } from '../supabase/client';
import { withRetry } from '../withRetry';
import storage from '../utils/localStorage';

const isTableMissingError = (err) => {
  if (!err) return false;
  const msg = String(err.message || err.userMessage || '').toLowerCase();
  const code = String(err.code || '');
  return code === 'PGRST205' || msg.includes('schema cache') || msg.includes('friendships');
};

export const friendService = {
  async getFriends(userId) {
    if (!userId) return [];
    try {
      const { data, error } = await withRetry(() =>
        supabase
          .from('friendships')
          .select('*')
          .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      );
      if (error) {
        if (isTableMissingError(error)) {
          return storage.get(`groupsync_friendships_${userId}`, []);
        }
        throw error;
      }
      return data || [];
    } catch (err) {
      if (isTableMissingError(err)) {
        return storage.get(`groupsync_friendships_${userId}`, []);
      }
      throw err;
    }
  },

  async sendFriendRequest(userId, friendId) {
    try {
      const { data, error } = await withRetry(() =>
        supabase
          .from('friendships')
          .insert([{ requester_id: userId, addressee_id: friendId, status: 'pending' }])
          .select()
          .single()
      );
      if (error) {
        if (isTableMissingError(error)) {
          const list = storage.get(`groupsync_friendships_${userId}`, []);
          const newItem = {
            id: `local_${Date.now()}`,
            requester_id: userId,
            addressee_id: friendId,
            status: 'pending',
            created_at: new Date().toISOString(),
          };
          storage.set(`groupsync_friendships_${userId}`, [...list, newItem]);
          return newItem;
        }
        throw error;
      }
      return data;
    } catch (err) {
      if (isTableMissingError(err)) {
        const list = storage.get(`groupsync_friendships_${userId}`, []);
        const newItem = {
          id: `local_${Date.now()}`,
          requester_id: userId,
          addressee_id: friendId,
          status: 'pending',
          created_at: new Date().toISOString(),
        };
        storage.set(`groupsync_friendships_${userId}`, [...list, newItem]);
        return newItem;
      }
      throw err;
    }
  },

  async acceptFriendRequest(requestId, userId) {
    try {
      const { data, error } = await withRetry(() =>
        supabase
          .from('friendships')
          .update({ status: 'accepted' })
          .eq('id', requestId)
          .select()
          .single()
      );
      if (error) {
        if (isTableMissingError(error) || String(requestId).startsWith('local_')) {
          const list = storage.get(`groupsync_friendships_${userId}`, []);
          const updated = list.map(item => item.id === requestId ? { ...item, status: 'accepted' } : item);
          storage.set(`groupsync_friendships_${userId}`, updated);
          return { id: requestId, status: 'accepted' };
        }
        throw error;
      }
      return data;
    } catch (err) {
      if (isTableMissingError(err) || String(requestId).startsWith('local_')) {
        const list = storage.get(`groupsync_friendships_${userId}`, []);
        const updated = list.map(item => item.id === requestId ? { ...item, status: 'accepted' } : item);
        storage.set(`groupsync_friendships_${userId}`, updated);
        return { id: requestId, status: 'accepted' };
      }
      throw err;
    }
  },
};

export default friendService;
