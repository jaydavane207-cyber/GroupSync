import { useState, useEffect, useCallback } from 'react';
import { friendService } from '../lib/services/friendService';
import { useAppContext } from '@/context/AppContext';

export const useFriends = () => {
  const { user, showToast } = useAppContext();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFriends = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await friendService.getFriends(user.id);
      setFriends(data);
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.id, showToast]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const sendRequest = async (friendId) => {
    try {
      await friendService.sendFriendRequest(user.id, friendId);
      showToast?.('Friend request sent!', 'success');
      fetchFriends();
    } catch (err) {
      showToast?.(err.message, 'error');
    }
  };

  return {
    friends,
    loading,
    sendRequest,
    refreshFriends: fetchFriends,
  };
};

export default useFriends;

