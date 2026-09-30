import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAppContext } from '@/context/AppContext';

export const useMessages = (channelId) => {
  const { user } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(
    async (content) => {
      if (!user?.id || !content.trim()) return;
      const { data, error } = await supabase.from('messages').insert([
        {
          channel_id: channelId,
          user_id: user.id,
          content,
        },
      ]);
      if (error) throw error;
      return data;
    },
    [channelId, user?.id]
  );

  return {
    messages,
    setMessages,
    sendMessage,
    loading,
  };
};

export default useMessages;

