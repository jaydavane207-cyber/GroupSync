import { supabase } from './client';

export const subscribeToMessages = (channelId, onNewMessage) => {
  return supabase
    .channel(`messages:${channelId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`,
      },
      (payload) => onNewMessage(payload.new)
    )
    .subscribe();
};

export const subscribeToDirectMessages = (userId, onNewMessage) => {
  return supabase
    .channel(`dm:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => onNewMessage(payload.new)
    )
    .subscribe();
};

export const subscribeToNotifications = (userId, onNotification) => {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onNotification(payload.new)
    )
    .subscribe();
};

export default {
  subscribeToMessages,
  subscribeToDirectMessages,
  subscribeToNotifications,
};
