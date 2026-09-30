import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../lib/services/notificationService';
import { useAppContext } from '@/context/AppContext';

export const useNotifications = () => {
  const { user, unreadNotificationCount } = useAppContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return {
    notifications,
    unreadCount: unreadNotificationCount,
    loading,
    markAsRead,
    refreshNotifications: fetchNotifications,
  };
};

export default useNotifications;

